// app.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db'); // Conexión a MySQL
const app = express();

// Para procesar JSON en el body
app.use(express.json());

// Clave secreta (idealmente usar variable de entorno)
const SECRET_KEY = 'mi_clave_super_secreta';

/* --------------------------------------------------------------------------
   Middlewares para JWT y rol admin
   -------------------------------------------------------------------------- */
// Verifica que el request traiga un token JWT válido
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token error' });
  }

  // Verificar token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    // Guardar datos en req para usarlos en la ruta
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
}

// Verifica que el rol del usuario sea 'admin'
function isAdmin(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Requiere rol admin' });
  }
  next();
}

/* --------------------------------------------------------------------------
   1) Endpoint: Crear Usuario Nuevo (Register)
   POST /auth/register
   -------------------------------------------------------------------------- */
app.post('/auth/register', (req, res) => {
  const { user_name, email, pwd, role } = req.body;

  // Validar datos
  if (!user_name || !email || !pwd) {
    return res.status(400).json({ error: 'Faltan datos para el registro' });
  }

  // Encriptar contraseña
  const hashedPwd = bcrypt.hashSync(pwd, 10);

  // Insertar en tabla "users"
  const sql = 'INSERT INTO users (user_name, email, pwd, role) VALUES (?, ?, ?, ?)';
  pool.execute(sql, [user_name, email, hashedPwd, role || 'client'], (err, result) => {
    if (err) {
      // Ej: email duplicado o error conexión
      return res.status(500).json({ error: err.message });
    }
    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      userId: result.insertId,
    });
  });
});

/* --------------------------------------------------------------------------
   2) Endpoint: Login
   POST /auth/login
   Retorna 200 con token o 401 si credenciales inválidas
   -------------------------------------------------------------------------- */
app.post('/auth/login', (req, res) => {
  const { email, pwd } = req.body;

  if (!email || !pwd) {
    return res.status(400).json({ error: 'Email y password requeridos' });
  }

  // Buscar usuario activo
  const sql = 'SELECT * FROM users WHERE email = ? AND status = 1';
  pool.execute(sql, [email], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const user = rows[0];
    if (!user) {
      // Usuario no existe o está inactivo
      return res.status(401).json({ error: 'Credenciales inválidas (user)' });
    }

    // Comparar contraseñas
    const match = bcrypt.compareSync(pwd, user.pwd);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas (pwd)' });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    // Respuesta 200 con token
    return res.json({
      message: 'Login exitoso',
      token,
    });
  });
});

/* --------------------------------------------------------------------------
   3) Crear Sala de Cine (Sólo admin)
   POST /cinema
   -------------------------------------------------------------------------- */
app.post('/cinema', verifyToken, isAdmin, (req, res) => {
  const { name, rows_num, columns_num, movie, img } = req.body;
  if (!name || !rows_num || !columns_num || !movie || !img) {
    return res.status(400).json({ error: 'Faltan datos de la sala' });
  }

  const sql = `
    INSERT INTO cinema (name, rows_num, columns_num, movie, img)
    VALUES (?, ?, ?, ?, ?)
  `;
  pool.execute(sql, [name, rows_num, columns_num, movie, img], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.status(201).json({ message: 'Sala creada', cinemaId: result.insertId });
  });
});

/* --------------------------------------------------------------------------
   Iniciar Servidor
   -------------------------------------------------------------------------- */
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
// 