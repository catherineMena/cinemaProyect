const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Rutas para salas
router.get('/', roomController.getAllRooms);
router.post('/', roomController.createRoom);
router.get('/:id', roomController.getRoomById);
router.put('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);

// Ruta para obtener los asientos de la sala
router.get('/:id/seats', roomController.getSeats);

// Ruta para reservar un asiento
router.put('/:roomId/seats/:seatId/reserve', roomController.reserveSeat);

module.exports = router;
