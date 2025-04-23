// controllers/userController.js
const User = require('../models/user'); // Asegúrate de tener este modelo

module.exports = {
  // 1. Función para crear usuario
  createUser: async (req, res) => {
    try {
      const newUser = await User.create(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 2. Función para obtener todos los usuarios
  getAllUsers: async (req, res) => {
    try {
      const users = await User.getAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 3. Función para obtener usuario por ID
  getUserById: async (req, res) => {
    try {
      const user = await User.getById(req.params.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 4. Función para actualizar usuario
  updateUser: async (req, res) => {
    try {
      const updated = await User.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json({ message: 'Usuario actualizado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 5. Función para eliminar usuario
  deleteUser: async (req, res) => {
    try {
      const deleted = await User.delete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 6. Función para actualizar contraseña
  updateUserPassword: async (req, res) => {
    try {
      const { username } = req.params;
      const { newPassword } = req.body;
      
      // Aquí iría tu lógica para actualizar la contraseña
      const updated = await User.updatePassword(username, newPassword);
      
      if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json({ message: 'Contraseña actualizada' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};