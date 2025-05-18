//reservationController.js
const db = require('../config/db');

// Crear una nueva reservación
exports.createReservation = (req, res) => {
  const { user_id, schedule_id, seats } = req.body;

  if (!user_id || !schedule_id || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos para la reservación' });
  }

  // Validar existencia del usuario
  db.execute('SELECT id FROM users WHERE id = ?', [user_id], (err, userResult) => {
    if (err) return res.status(500).json({ error: err.message });
    if (userResult.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Validar existencia del horario
    db.execute('SELECT id FROM schedule WHERE id = ?', [schedule_id], (err, scheduleResult) => {
      if (err) return res.status(500).json({ error: err.message });
      if (scheduleResult.length === 0) return res.status(404).json({ error: 'Horario inválido' });

      // Validar disponibilidad de los asientos
      const placeholders = seats.map(() => '?').join(',');
      const validationQuery = `
        SELECT * FROM seats 
        WHERE id_schedule = ? AND full_name IN (${placeholders}) AND status = 'available'
      `;

      db.execute(validationQuery, [schedule_id, ...seats], (err, availableSeats) => {
        if (err) return res.status(500).json({ error: err.message });
        if (availableSeats.length !== seats.length) {
          return res.status(400).json({ error: 'Uno o más asientos ya están reservados' });
        }

        // Reservar los asientos
        const updateQuery = `
          UPDATE seats 
          SET status = 'reserved', id_user = ? 
          WHERE id_schedule = ? AND full_name IN (${placeholders})
        `;

        db.execute(updateQuery, [user_id, schedule_id, ...seats], (err) => {
          if (err) return res.status(500).json({ error: err.message });

          res.status(201).json({ message: 'Reservación confirmada' });
        });
      });
    });
  });
};
