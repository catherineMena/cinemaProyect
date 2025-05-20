const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplica middleware
router.use(authMiddleware);

// Crear una reserva
router.post('/', reservationController.createReservation);

// Obtener reservas del usuario autenticado
router.get('/', reservationController.getUserReservations);

// Actualizar una reserva
router.put('/:id', reservationController.updateReservation);

// Eliminar una reserva
router.delete('/:id', reservationController.deleteReservation);

module.exports = router;
