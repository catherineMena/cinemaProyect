// server.js
require('dotenv').config();
const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const mysql   = require('mysql2');

const app = express();
app.use(express.json());

// ————— Conexión a MySQL —————
const db = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ————— Middleware de Autenticación —————
const SECRET = process.env.JWT_SECRET;
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(403).json({ error: 'No token provided' });
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// ————— 1) Registro — POST /api/auth/register —————
app.post('/api/auth/register', (req, res) => {
  const { user_name, email, pwd } = req.body;
  if (!user_name || !email || !pwd) 
    return res.status(400).json({ error: 'Faltan datos' });

  const hash = bcrypt.hashSync(pwd, 10);
  const sql  = 'INSERT INTO users (user_name,email,pwd) VALUES (?,?,?)';
  db.execute(sql, [user_name, email, hash], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Registrado', userId: result.insertId });
  });
});

// ————— 2) Login — POST /api/auth/login —————
app.post('/api/auth/login', (req, res) => {
  const { email, pwd } = req.body;
  if (!email || !pwd) 
    return res.status(400).json({ error: 'Faltan datos' });

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.execute(sql, [email], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const user = rows[0];
    if (!user || !bcrypt.compareSync(pwd, user.pwd))
      return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '2h' });
    res.json({ message: 'Login exitoso', token });
  });
});

// ————— 3) Salas de cine — GET/POST /api/rooms —————
app.get('/api/rooms', auth, (req, res) => {
  db.execute('SELECT * FROM cinema', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/api/rooms', auth, (req, res) => {
  const { name, rows_num, columns_num, movie, img } = req.body;
  if (!name||!rows_num||!columns_num||!movie||!img)
    return res.status(400).json({ error: 'Faltan datos de sala' });

  const sql = 'INSERT INTO cinema (name,rows_num,columns_num,movie,img) VALUES (?,?,?,?,?)';
  db.execute(sql, [name,rows_num,columns_num,movie,img], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Sala creada', cinemaId: result.insertId });
  });
});

// ————— 4) Usuarios — GET /api/users —————
app.get('/api/users', auth, (req, res) => {
  db.execute('SELECT id,user_name,email,role,status FROM users', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ————— 5) Reservaciones — GET/POST /api/reservations —————
app.get('/api/reservations', auth, (req, res) => {
  db.execute('SELECT * FROM reservations', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/api/reservations', auth, (req, res) => {
  const { id_user, id_cinema, id_schedule, seats } = req.body;
  if (!id_user||!id_cinema||!id_schedule||!seats)
    return res.status(400).json({ error: 'Faltan datos' });

  const sql = 'INSERT INTO reservations (id_user,id_cinema,id_schedule,seats) VALUES (?,?,?,?)';
  db.execute(sql, [id_user,id_cinema,id_schedule,JSON.stringify(seats)], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Reservación creada', reservationId: result.insertId });
  });
});

// ————— Ruta de prueba protegida — GET /api/protegida —————
app.get('/api/protegida', auth, (req, res) => {
  res.json({ message: 'Ruta protegida OK', user: req.user });
});

// ————— Arrancar Servidor —————
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});
