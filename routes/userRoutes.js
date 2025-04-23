// models/user.js
const db = require('../db');

module.exports = {
  create: async (userData) => {
    const [result] = await db.promise().query('INSERT INTO users SET ?', userData);
    return { id: result.insertId, ...userData };
  },

  getAll: async () => {
    const [rows] = await db.promise().query('SELECT * FROM users');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.promise().query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  update: async (id, updates) => {
    const [result] = await db.promise().query('UPDATE users SET ? WHERE id = ?', [updates, id]);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.promise().query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  updatePassword: async (username, newPassword) => {
    const [result] = await db.promise().query(
      'UPDATE users SET password = ? WHERE username = ?',
      [newPassword, username]
    );
    return result.affectedRows > 0;
  }
};