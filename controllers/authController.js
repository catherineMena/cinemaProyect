// controllers/authController.js

const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.login = (req, res) => {
  const { email, pwd } = req.body;

  if (!email || !pwd) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  db.execute('SELECT * FROM users WHERE email = ? AND pwd = ?', [email, pwd], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor' });

    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = results[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '2h'
    });

    // 👇 Aquí es donde nos aseguramos de enviar el ID
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '', // si tienes nombre en BD
      }
    });
  });
};
