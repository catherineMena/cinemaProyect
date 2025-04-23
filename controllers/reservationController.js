const reservationModel = require('../models/reservation');
const roomModel = require('../models/room');

// Crear nueva reservación
const createReservation = (req, res) => {
  const { user_id, room_id, seat_row, seat_column, reservation_date } = req.body;

  if (!user_id || !room_id || !seat_row || !seat_column || !reservation_date) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
  }

  roomModel.getRoomById(room_id, (err, roomResults) => {
      if (err) return res.status(500).json({ message: 'Error al verificar sala.' });
      if (roomResults.length === 0) return res.status(404).json({ message: 'Sala no encontrada.' });

      const { num_rows, num_columns } = roomResults[0];

      if (seat_row > num_rows || seat_column > num_columns) {
          return res.status(400).json({ 
              message: `Asiento inválido. Límites: ${num_rows} filas × ${num_columns} columnas.` 
          });
      }

      const currentDate = new Date();
      const reservationDate = new Date(reservation_date);
      const maxDate = new Date(currentDate);
      maxDate.setDate(currentDate.getDate() + 8);
      
      if (reservationDate > maxDate) {
          return res.status(400).json({ 
              message: 'Solo puedes reservar hasta 8 días en adelante.' 
          });
      }

      reservationModel.checkSeatAvailability(room_id, seat_row, seat_column, reservation_date, (err, reservationResults) => {
          if (err) return res.status(500).json({ message: 'Error al verificar disponibilidad.' });
          if (reservationResults.length > 0) {
              return res.status(400).json({ 
                  message: 'Este asiento ya está reservado para este horario.' 
              });
          }

          const newReservation = { 
              user_id, 
              room_id, 
              seat_row, 
              seat_column, 
              reservation_date, 
              status: 'reserved' 
          };
          
          reservationModel.createReservation(newReservation, (err, result) => {
              if (err) {
                  console.error('Error DB:', err);
                  if (err.code === 'ER_DUP_ENTRY') {
                      return res.status(400).json({ 
                          message: 'El asiento ya está reservado.' 
                      });
                  }
                  return res.status(500).json({ message: 'Error al crear reserva.' });
              }

              res.status(201).json({ 
                  message: 'Reserva creada exitosamente.',
                  reservation_id: result.insertId,
                  datetime: `${reservation_date} ${roomResults[0].hour}`
              });
          });
      });
  });
};

// Obtener reservaciones con filtros
const getAllReservations = (req, res) => {
  const { room_id, date } = req.query;

  if (!room_id && !date) {
    reservationModel.getAllReservations((err, result) => {
      if (err) {
        console.error('Error al obtener reservaciones:', err);
        return res.status(500).json({ message: 'Error al obtener reservaciones.' });
      }
      res.status(200).json(result);
    });
    return;
  }

  if (room_id && !date) {
    reservationModel.getReservationsByRoom(room_id, (err, results) => {
      if (err) {
        console.error('Error al obtener reservaciones:', err);
        return res.status(500).json({ message: 'Error al obtener reservaciones.' });
      }
      res.status(200).json(results);
    });
    return;
  }

  if (room_id && date) {
    reservationModel.getReservationsByRoomAndDate(room_id, date, (err, results) => {
      if (err) {
        console.error('Error al obtener reservaciones:', err);
        return res.status(500).json({ message: 'Error al obtener reservaciones.' });
      }
      res.status(200).json(results);
    });
    return;
  }

  res.status(400).json({ message: 'Debe proporcionar room_id para filtrar por fecha.' });
};

// Obtener reserva por ID
const getReservationById = (req, res) => {
  const { id } = req.params;

  reservationModel.getReservationById(id, (err, result) => {
    if (err) {
      console.error('Error al obtener reservación:', err);
      return res.status(500).json({ message: 'Error al obtener reservación.' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Reservación no encontrada.' });
    }
    res.status(200).json(result[0]);
  });
};

// Actualizar reserva
const updateReservation = (req, res) => {
  const { id } = req.params;
  const { user_id, room_id, seat_row, seat_column, reservation_date, status } = req.body;

  if (!user_id || !room_id || !seat_row || !seat_column || !reservation_date || !status) {
    return res.status(400).json({ message: 'Todos los campos son requeridos.' });
  }

  const updatedReservation = { user_id, room_id, seat_row, seat_column, reservation_date, status };

  reservationModel.updateReservation(id, updatedReservation, (err, result) => {
    if (err) {
      console.error('Error al actualizar reservación:', err);
      
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Conflicto: El asiento ya está reservado para este horario.' });
      }
      
      return res.status(500).json({ message: 'Error al actualizar reservación.' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reservación no encontrada.' });
    }
    
    res.status(200).json({ 
      message: 'Reservación actualizada exitosamente.',
      changes: result.affectedRows
    });
  });
};

// Eliminar reserva
const deleteReservation = (req, res) => {
  const { id } = req.params;

  reservationModel.deleteReservation(id, (err, result) => {
    if (err) {
      console.error('Error al eliminar reservación:', err);
      return res.status(500).json({ message: 'Error al eliminar reservación.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reservación no encontrada.' });
    }
    res.status(200).json({ message: 'Reservación eliminada exitosamente.' });
  });
};

module.exports = {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation
};