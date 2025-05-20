const RoomModel = require('../models/room');

const roomController = {
  // Obtener todas las salas
  getAllRooms: (req, res) => {
    RoomModel.getAllRooms((err, results) => {
      if (err) {
        console.error('Error al obtener salas:', err);
        return res.status(500).json({ error: 'Error al obtener las salas' });
      }
      res.json({ success: true, data: results });
    });
  },

  // Obtener sala por ID
  getRoomById: (req, res) => {
    const id = req.params.id;
    RoomModel.getRoomById(id, (err, results) => {
      if (err) {
        console.error('Error al obtener sala por ID:', err);
        return res.status(500).json({ error: 'Error al obtener la sala' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Sala no encontrada' });
      }
      res.json({ success: true, data: results[0] });
    });
  },

  // Crear una nueva sala
  createRoom: (req, res) => {
    const newRoom = req.body;
    RoomModel.createRoom(newRoom, (err, result) => {
      if (err) {
        console.error('Error al crear la sala:', err);
        return res.status(500).json({ error: 'Error al crear la sala' });
      }
      res.status(201).json({ success: true, insertedId: result.insertId });
    });
  },

  // Actualizar una sala
  updateRoom: (req, res) => {
    const id = req.params.id;
    const updatedRoom = req.body;
    RoomModel.updateRoom(id, updatedRoom, (err, result) => {
      if (err) {
        console.error('Error al actualizar la sala:', err);
        return res.status(500).json({ error: 'Error al actualizar la sala' });
      }
      res.json({ success: true, message: 'Sala actualizada' });
    });
  },

  // Eliminar una sala
  deleteRoom: (req, res) => {
    const id = req.params.id;
    RoomModel.deleteRoom(id, (err, result) => {
      if (err) {
        console.error('Error al eliminar la sala:', err);
        return res.status(500).json({ error: 'Error al eliminar la sala' });
      }
      res.json({ success: true, message: 'Sala eliminada' });
    });
  },

  // Obtener asientos simulados
  getSeats: (req, res) => {
    const roomId = req.params.id;
    RoomModel.getRoomById(roomId, (err, room) => {
      if (err) {
        console.error('Error al buscar sala:', err);
        return res.status(500).json({ success: false, error: 'Error interno' });
      }

      if (!room || room.length === 0) {
        return res.status(404).json({ success: false, error: 'Sala no encontrada' });
      }

      const numRows = room[0].num_rows;
      const numCols = room[0].num_columns;
      const seats = [];

      for (let row = 1; row <= numRows; row++) {
        for (let col = 1; col <= numCols; col++) {
          seats.push({
            id: `${roomId}-${row}-${col}`,
            row: row,
            column: col,
            status: 'disponible',
            price: room[0].price
          });
        }
      }

      res.json({
        success: true,
        data: seats,
        roomInfo: {
          name: room[0].name,
          movie: room[0].movie_name,
          poster: room[0].movie_poster_url,
          price: room[0].price
        }
      });
    });
  },

  // Placeholder para reservar asiento
  reserveSeat: (req, res) => {
    res.status(501).json({ success: false, message: 'Funcionalidad no implementada' });
  }
};

module.exports = roomController;
