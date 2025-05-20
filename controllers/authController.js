const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authController = {
  register: async (req, res) => {
    const { email, user_name, pwd } = req.body;

    if (!email || !user_name || !pwd) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
      const [existing] = await db.promise().query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ error: 'El correo ya está registrado' });
      }

      const hashedPwd = await bcrypt.hash(pwd, 10);
      const role = 'client';
      const status = 1;

      await db.promise().query(
        'INSERT INTO users (email, user_name, pwd, role, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [email, user_name, hashedPwd, role, status]
      );

      return res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  login: async (req, res) => {
    const { email, pwd } = req.body;

    if (!email || !pwd) {
      return res.status(400).json({ error: 'Faltan campos' });
    }

    try {
      const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
      const user = users[0];

      if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
      if (user.status !== 1) return res.status(403).json({ error: 'Usuario inactivo' });

      const match = await bcrypt.compare(pwd, user.pwd);
      if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        process.env.JWT_SECRET || 'secreto123',
        { expiresIn: '1d' }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          user_name: user.user_name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({ error: 'Error del servidor' });
    }
  }
};

module.exports = authController;
