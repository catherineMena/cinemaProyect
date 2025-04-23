// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

exports.register = (req, res) => {
  const { user_name, email, pwd, role } = req.body;
  if (!user_name || !email || !pwd) return res.status(400).json({ error: 'Faltan datos para el registro' });
  const hashedPwd = bcrypt.hashSync(pwd, 10);
  const sql = 'INSERT INTO users (user_name, email, pwd, role, status) VALUES (?, ?, ?, ?, ?)';
  pool.execute(sql, [user_name, email, hashedPwd, role || 'client', 1], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.insertId });
  });
};

exports.login = (req, res) => {
  const { email, pwd } = req.body;
  if (!email || !pwd) return res.status(400).json({ error: 'Email y password requeridos' });
  const sql = 'SELECT * FROM users WHERE email = ? AND status = 1';
  pool.execute(sql, [email], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const user = rows[0];
    if (!user || !bcrypt.compareSync(pwd, user.pwd)) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    return res.json({ message: 'Login exitoso', token });
  });
};
