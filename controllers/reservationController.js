const db = require('../db');

const reservationController = {
  createReservation: (req, res) => {
    const { room_id, reservation_date, time, seats } = req.body;
    const user_id = req.user?.id;

    if (!user_id || !room_id || !reservation_date || !time || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos obligatorios para la reserva',
        required: ['room_id', 'reservation_date', 'time', 'seats'],
        received: req.body
      });
    }

    const insertReservationQuery = `
      INSERT INTO reservations (user_id, room_id, reservation_date, time)
      VALUES (?, ?, ?, ?)
    `;

    db.execute(insertReservationQuery, [user_id, room_id, reservation_date, time], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al crear la reserva', error: err.message });
      }

      const reservationId = result.insertId;

      const seatInsertPromises = seats.map(seat => {
        return new Promise((resolve, reject) => {
          db.execute(
            'INSERT INTO seats (row_num, column_num, id_user, status) VALUES (?, ?, ?, ?)',
            [seat.row_num, seat.column_num, user_id, 'reserved'],
            err => (err ? reject(err) : resolve())
          );
        });
      });

      Promise.all(seatInsertPromises)
        .then(() => {
          res.status(201).json({
            success: true,
            message: 'Reserva creada exitosamente',
            reservation_id: reservationId
          });
        })
        .catch(error => {
          res.status(500).json({
            success: false,
            message: 'Reserva guardada pero falló en guardar asientos',
            error: error.message
          });
        });
    });
  },

  getUserReservations: (req, res) => {
    const user_id = req.user?.id;

    const query = `
      SELECT r.id AS reservation_id, r.reservation_date, r.time, ro.name AS room_name, ro.movie_name,
             GROUP_CONCAT(CONCAT(s.row_num, '-', s.column_num)) AS seats
      FROM reservations r
      JOIN rooms ro ON r.room_id = ro.id
      LEFT JOIN seats s ON s.id_user = r.user_id
      WHERE r.user_id = ?
      GROUP BY r.id
      ORDER BY r.reservation_date DESC
    `;

    db.execute(query, [user_id], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al obtener reservas', error: err.message });
      }

      res.status(200).json({ success: true, reservations: results });
    });
  },

  updateReservation: (req, res) => {
    const { id } = req.params;
    const { room_id, reservation_date, time, seats } = req.body;
    const user_id = req.user?.id;

    if (!user_id || !room_id || !reservation_date || !time || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos para actualizar la reserva',
        required: ['room_id', 'reservation_date', 'time', 'seats']
      });
    }

    const updateQuery = `
      UPDATE reservations
      SET room_id = ?, reservation_date = ?, time = ?
      WHERE id = ? AND user_id = ?
    `;

    db.execute(updateQuery, [room_id, reservation_date, time, id, user_id], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al actualizar reserva', error: err.message });
      }

      db.execute('DELETE FROM seats WHERE id_user = ? AND id = ?', [user_id, id], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Error al limpiar asientos', error: err.message });

        const insertSeats = seats.map(seat => {
          return new Promise((resolve, reject) => {
            db.execute(
              'INSERT INTO seats (row_num, column_num, id_user, status) VALUES (?, ?, ?, ?)',
              [seat.row_num, seat.column_num, user_id, 'reserved'],
              err => (err ? reject(err) : resolve())
            );
          });
        });

        Promise.all(insertSeats)
          .then(() => res.status(200).json({ success: true, message: 'Reserva actualizada correctamente' }))
          .catch(err => res.status(500).json({ success: false, message: 'Error al guardar los nuevos asientos', error: err.message }));
      });
    });
  },

  deleteReservation: (req, res) => {
    const { id } = req.params;
    const user_id = req.user?.id;

    const deleteSeatsQuery = 'DELETE FROM seats WHERE id = ? AND id_user = ?';
    const deleteReservationQuery = 'DELETE FROM reservations WHERE id = ? AND user_id = ?';

    db.execute(deleteSeatsQuery, [id, user_id], (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al eliminar los asientos', error: err.message });

      db.execute(deleteReservationQuery, [id, user_id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Error al eliminar la reserva', error: err.message });

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Reserva no encontrada o no autorizada' });
        }

        res.status(200).json({ success: true, message: 'Reserva cancelada exitosamente' });
      });
    });
  }
};

module.exports = reservationController;
