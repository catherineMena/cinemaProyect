require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const cors = require('cors');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.use(express.json());

// ——— Conexión a MySQL ———
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ——— Crear tabla reservations si no existe ———
db.execute(`
  CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    room_id INT,
    reservation_date DATE,
    time TIME,
    seat_row INT,
    seat_column INT,
    status VARCHAR(20),
    created_at DATETIME
  )
`, (err) => {
  if (err) {
    console.error('❌ Error al crear tabla reservations:', err);
  } else {
    console.log('✅ Tabla reservations lista.');
  }
});

// ——— CORS ———
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ——— AUTH ———
app.post('/api/auth/register', (req, res) => {
  const { user_name, email, pwd } = req.body;
  if (!user_name || !email || !pwd)
    return res.status(400).json({ error: 'Faltan datos' });

  const hash = bcrypt.hashSync(pwd, 10);
  db.execute('INSERT INTO users (user_name, email, pwd) VALUES (?, ?, ?)', [user_name, email, hash], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Registrado', userId: result.insertId });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, pwd } = req.body;
  if (!email || !pwd)
    return res.status(400).json({ error: 'Faltan datos' });

  db.execute('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const user = rows[0];
    if (!user || !bcrypt.compareSync(pwd, user.pwd))
      return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        user_name: user.user_name,
        email: user.email,
        role: user.role
      }
    });
  });
});

// ——— Rooms ———
app.get('/api/rooms', authMiddleware, (req, res) => {
  db.execute('SELECT * FROM cinema', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/rooms', authMiddleware, (req, res) => {
  const { name, rows_num, columns_num, movie, img } = req.body;
  if (!name || !rows_num || !columns_num || !movie || !img)
    return res.status(400).json({ error: 'Faltan datos de sala' });

  db.execute('INSERT INTO cinema (name, rows_num, columns_num, movie, img) VALUES (?, ?, ?, ?, ?)',
    [name, rows_num, columns_num, movie, img],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Sala creada', cinemaId: result.insertId });
    });
});

// ——— Schedules ———
app.get('/api/schedules', authMiddleware, (req, res) => {
  db.execute('SELECT * FROM schedule', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/schedules/:id', authMiddleware, (req, res) => {
  const scheduleId = req.params.id;
  db.execute('SELECT * FROM schedule WHERE id = ?', [scheduleId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: 'Horario no encontrado' });
    res.json(rows[0]);
  });
});

app.post('/api/schedules', authMiddleware, (req, res) => {
  const { id_cinema, date, time } = req.body;
  if (!id_cinema || !date || !time)
    return res.status(400).json({ error: 'Faltan datos del horario' });

  db.execute('SELECT id FROM cinema WHERE id = ?', [id_cinema], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: 'Cine no encontrado' });

    db.execute('INSERT INTO schedule (id_cinema, date, time) VALUES (?, ?, ?)',
      [id_cinema, date, time],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Horario creado', scheduleId: result.insertId });
      });
  });
});

// ——— Seats by Schedule ———
app.get('/api/seats/:scheduleId', authMiddleware, (req, res) => {
  const scheduleId = req.params.scheduleId;

  db.execute('SELECT * FROM schedule WHERE id = ?', [scheduleId], (err, scheduleResult) => {
    if (err) return res.status(500).json({ error: err.message });
    if (scheduleResult.length === 0) return res.status(404).json({ error: 'Horario no encontrado' });

    const { id_cinema, date, time } = scheduleResult[0];

    db.execute('SELECT * FROM cinema WHERE id = ?', [id_cinema], (err, cinemaResult) => {
      if (err) return res.status(500).json({ error: err.message });
      if (cinemaResult.length === 0) return res.status(404).json({ error: 'Sala no encontrada' });

      const room = cinemaResult[0];
      const totalSeats = [];

      for (let row = 0; row < room.rows_num; row++) {
        for (let col = 0; col < room.columns_num; col++) {
          const full_name = `${String.fromCharCode(65 + row)}${col + 1}`;
          totalSeats.push({ seat_row: row, seat_column: col, full_name, status: 'available' });
        }
      }

      db.execute(
        'SELECT seat_row, seat_column FROM reservations WHERE room_id = ? AND reservation_date = ? AND time = ?',
        [id_cinema, date, time],
        (err, reservedResult) => {
          if (err) return res.status(500).json({ error: err.message });

          reservedResult.forEach(seat => {
            const full_name = `${String.fromCharCode(65 + seat.seat_row)}${seat.seat_column + 1}`;
            const s = totalSeats.find(x => x.full_name === full_name);
            if (s) s.status = 'reserved';
          });

          res.json(totalSeats);
        }
      );
    });
  });
});

// ——— Reservas (archivo externo protegido) ———
const reservationRoutes = require('./routes/reservationRoutes');
app.use('/api/reservations', authMiddleware, reservationRoutes);

// ——— Iniciar servidor ———
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
