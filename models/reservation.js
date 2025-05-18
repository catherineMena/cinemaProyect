//reservation.js
const db = require('../db');

// Verificar disponibilidad de asiento
const checkSeatAvailability = (room_id, seat_row, seat_column, reservation_date, callback) => {
  const getHourQuery = 'SELECT hour FROM rooms WHERE id = ?';
  db.execute(getHourQuery, [room_id], (err, roomResults) => {
      if (err) return callback(err);
      if (roomResults.length === 0) return callback(new Error('Sala no encontrada'));

      const fullDateTime = `${reservation_date} ${roomResults[0].hour}`;

      const checkQuery = `
          SELECT * FROM reservations 
          WHERE room_id = ? 
          AND seat_row = ? 
          AND seat_column = ? 
          AND reservation_date = ?
          AND status = "reserved"
      `;
      db.execute(checkQuery, [room_id, seat_row, seat_column, fullDateTime], callback);
  });
};

// Crear reserva
const createReservation = (reservation, callback) => {
  const { user_id, room_id, seat_row, seat_column, reservation_date } = reservation;
  
  const getHourQuery = 'SELECT hour FROM rooms WHERE id = ?';
  db.execute(getHourQuery, [room_id], (err, roomResults) => {
      if (err) return callback(err);
      if (roomResults.length === 0) return callback(new Error('Sala no encontrada'));

      const fullDateTime = `${reservation_date} ${roomResults[0].hour}`;

      const insertQuery = `
          INSERT INTO reservations 
          (user_id, room_id, seat_row, seat_column, reservation_date, status) 
          VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.execute(insertQuery, 
          [user_id, room_id, seat_row, seat_column, fullDateTime, 'reserved'], 
          callback
      );
  });
};

// Obtener todas las reservaciones
const getAllReservations = (callback) => {
    const query = 'SELECT * FROM reservations';
    db.execute(query, callback);
};

// Obtener reserva por ID
const getReservationById = (id, callback) => {
    const query = 'SELECT * FROM reservations WHERE id = ?';
    db.execute(query, [id], callback);
};

// Actualizar reserva
const updateReservation = (id, reservation, callback) => {
    const { user_id, room_id, seat_row, seat_column, reservation_date, status } = reservation;
    
    const getHourQuery = 'SELECT hour FROM rooms WHERE id = ?';
    db.execute(getHourQuery, [room_id], (err, roomResults) => {
        if (err) return callback(err);
        if (roomResults.length === 0) return callback(new Error('Sala no encontrada'));

        const fullDateTime = `${reservation_date} ${roomResults[0].hour}`;

        const updateQuery = `
            UPDATE reservations 
            SET user_id = ?, room_id = ?, seat_row = ?, seat_column = ?, 
                reservation_date = ?, status = ? 
            WHERE id = ?
        `;
        db.execute(updateQuery, 
            [user_id, room_id, seat_row, seat_column, fullDateTime, status, id], 
            callback
        );
    });
};

// Eliminar reserva
const deleteReservation = (id, callback) => {
    const query = 'DELETE FROM reservations WHERE id = ?';
    db.execute(query, [id], callback);
};

// Obtener reservas por sala
const getReservationsByRoom = (room_id, callback) => {
    const query = 'SELECT * FROM reservations WHERE room_id = ?';
    db.execute(query, [room_id], callback);
};

// Obtener reservas por sala y fecha
const getReservationsByRoomAndDate = (room_id, date, callback) => {
  const getHourQuery = 'SELECT hour FROM rooms WHERE id = ?';
  db.execute(getHourQuery, [room_id], (err, roomResults) => {
      if (err) return callback(err);
      if (roomResults.length === 0) return callback(new Error('Sala no encontrada'));

      const roomHour = roomResults[0].hour;
      
      const query = `
          SELECT 
              id,
              user_id,
              room_id,
              seat_row,
              seat_column,
              DATE_FORMAT(reservation_date, '%Y-%m-%d %H:%i:%s') as reservation_date,
              status,
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
          FROM reservations 
          WHERE room_id = ? 
          AND DATE(reservation_date) = ?
          AND TIME(reservation_date) = ?
          AND status = 'reserved'
      `;
      
      db.execute(query, [room_id, date, roomHour], (err, results) => {
          if (err) return callback(err);
          
          const formattedResults = results.map(reservation => ({
              ...reservation,
              reservation_date: `${reservation.reservation_date}`,
              created_at: `${reservation.created_at}`
          }));
          
          callback(null, formattedResults);
      });
  });
};

module.exports = {
    createReservation,
    getAllReservations,
    getReservationById,
    updateReservation,
    deleteReservation,
    checkSeatAvailability,
    getReservationsByRoom,
    getReservationsByRoomAndDate
};
