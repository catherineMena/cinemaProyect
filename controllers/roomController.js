const roomModel = require('../models/room');

// Crear una nueva sala
const createRoom = (req, res) => {
  const { name, movie_name, movie_poster_url, num_rows, num_columns, price, duration, genre, hour } = req.body;

  // Validación de los campos
  if (!name || !movie_name || !num_rows || !num_columns || !price || !duration || !genre || !hour) {
    return res.status(400).json({ message: 'Todos los campos son requeridos.' });
  }

  const newRoom = { name, movie_name, movie_poster_url, num_rows, num_columns, price, duration, genre, hour };

  roomModel.createRoom(newRoom, (err, result) => {
    if (err) {
      console.error('Error al crear sala:', err);
      return res.status(500).json({ message: 'Error al crear sala.' });
    }
    res.status(201).json({ message: 'Sala creada exitosamente.' });
  });
};

// Obtener todas las salas
const getAllRooms = (req, res) => {
  roomModel.getAllRooms((err, result) => {
    if (err) {
      console.error('Error al obtener salas:', err);
      return res.status(500).json({ message: 'Error al obtener salas.' });
    }
    res.status(200).json(result);
  });
};

// Obtener una sala por ID
const getRoomById = (req, res) => {
  const { id } = req.params;

  roomModel.getRoomById(id, (err, result) => {
    if (err) {
      console.error('Error al obtener sala:', err);
      return res.status(500).json({ message: 'Error al obtener sala.' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Sala no encontrada.' });
    }
    res.status(200).json(result[0]);
  });
};

// Actualizar una sala
const updateRoom = (req, res) => {
  const { id } = req.params;
  const { name, movie_name, movie_poster_url, num_rows, num_columns, price, duration, genre, hour } = req.body;

  // Validación de los campos
  if (!name || !movie_name || !num_rows || !num_columns || !price || !duration || !genre || !hour) {
    return res.status(400).json({ message: 'Todos los campos son requeridos.' });
  }

  const updatedRoom = { name, movie_name, movie_poster_url, num_rows, num_columns, price, duration, genre, hour };

  roomModel.updateRoom(id, updatedRoom, (err, result) => {
    if (err) {
      console.error('Error al actualizar sala:', err);
      return res.status(500).json({ message: 'Error al actualizar sala.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Sala no encontrada.' });
    }
    res.status(200).json({ message: 'Sala actualizada exitosamente.' });
  });
};

// Eliminar una sala
const deleteRoom = (req, res) => {
  const { id } = req.params;

  roomModel.deleteRoom(id, (err, result) => {
    if (err) {
      console.error('Error al eliminar sala:', err);
      return res.status(500).json({ message: 'Error al eliminar sala.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Sala no encontrada.' });
    }
    res.status(200).json({ message: 'Sala eliminada exitosamente.' });
  });
};

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom
};