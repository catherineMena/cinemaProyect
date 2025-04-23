const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// Ruta para crear una nueva reservación
router.post('/', reservationController.createReservation);

// Ruta para obtener todas las reservaciones
router.get('/', reservationController.getAllReservations);

// Ruta para obtener una reservación por ID
router.get('/:id', reservationController.getReservationById);

// Ruta para actualizar una reservación
router.put('/:id', reservationController.updateReservation);

// Ruta para eliminar una reservación
router.delete('/:id', reservationController.deleteReservation);

module.exports = router;