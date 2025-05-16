//roomRoutes.js

const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Ruta para crear una nueva sala
router.post('/', roomController.createRoom);

// Ruta para obtener todas las salas
router.get('/', roomController.getAllRooms);

// Ruta para obtener una sala por ID
router.get('/:id', roomController.getRoomById);

// Ruta para actualizar una sala
router.put('/:id', roomController.updateRoom);

// Ruta para eliminar una sala
router.delete('/:id', roomController.deleteRoom);

module.exports = router;