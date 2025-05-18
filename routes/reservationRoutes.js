const express = require('express');
const router = express.Router();
const db = require('../db');


router.post('/', (req, res) => {
  const { user_id, room_id, reservation_date, time, seats } = req.body;

  if (!user_id || !room_id || !reservation_date || !time || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const checkQuery = `
    SELECT seat_row, seat_column FROM reservations
    WHERE room_id = ? AND reservation_date = ? AND time = ? AND status = 'reserved'
  `;

  db.query(checkQuery, [room_id, reservation_date, time], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const ocupados = [];
    for (const seat of seats) {
      const yaReservado = rows.some(r => r.seat_row === seat.seat_row && r.seat_column === seat.seat_column);
      if (yaReservado) {
        ocupados.push(`${String.fromCharCode(65 + seat.seat_row)}${seat.seat_column + 1}`);
      }
    }

    if (ocupados.length > 0) {
      return res.status(409).json({ error: `Los siguientes asientos ya están reservados: ${ocupados.join(", ")}` });
    }

    // Si todos están disponibles, insertarlos
    const values = seats.map(seat => [
      user_id,
      room_id,
      reservation_date,
      seat.seat_row,
      seat.seat_column,
      'reserved',
      new Date()
    ]);

    const insertQuery = `
      INSERT INTO reservations 
      (user_id, room_id, reservation_date, seat_row, seat_column, status, created_at)
      VALUES ?
    `;

    db.query(insertQuery, [values], (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json({ message: 'Reservas creadas', insertId: result.insertId });
    });
  });
});

module.exports = router;
