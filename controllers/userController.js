const User = require('../models/user');

module.exports = {
  createUser: async (req, res, next) => {
    try {
      const newUser = await User.create(req.body);
      res.status(201).json({
        success: true,
        data: newUser
      });
    } catch (error) {
      next(error);
    }
  },

  getAllUsers: async (req, res, next) => {
    try {
      const users = await User.getAll();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  },

  getUserById: async (req, res, next) => {
    try {
      const user = await User.getById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const updated = await User.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      res.json({
        success: true,
        message: 'Usuario actualizado'
      });
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const deleted = await User.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  updatePassword: async (req, res, next) => {
    try {
      const { username } = req.params;
      const { newPassword } = req.body;
      
      const updated = await User.updatePassword(username, newPassword);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      res.json({
        success: true,
        message: 'Contraseña actualizada'
      });
    } catch (error) {
      next(error);
    }
  }
};