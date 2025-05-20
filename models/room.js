const db = require('../db');

const createRoom = (room, callback) => {
  const { name, movie_name, movie_poster_url, num_rows, num_columns, price, duration, hour } = room;
  const query = `
    INSERT INTO rooms 
    (name, movie_name, movie_poster_url, num_rows, num_columns, price, duration, hour) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.execute(query, [
    name,
    movie_name,
    movie_poster_url,
    num_rows,
    num_columns,
    price,
    duration,
    hour
  ], callback);
};

const updateRoom = (id, room, callback) => {
  const { name, movie_name, movie_poster_url, num_rows, num_columns, price, duration, hour } = room;
  const query = `
    UPDATE rooms 
    SET name = ?, movie_name = ?, movie_poster_url = ?, 
        num_rows = ?, num_columns = ?, price = ?, 
        duration = ?, hour = ? 
    WHERE id = ?
  `;
  
  db.execute(query, [
    name,
    movie_name,
    movie_poster_url,
    num_rows,
    num_columns,
    price,
    duration,
    hour,
    id
  ], callback);
};

const getAllRooms = (callback) => {
  const query = 'SELECT * FROM rooms ORDER BY name ASC';
  db.execute(query, callback);
};

const getRoomById = (id, callback) => {
  const query = 'SELECT * FROM rooms WHERE id = ?';
  db.execute(query, [id], callback);
};

const deleteRoom = (id, callback) => {
  const query = 'DELETE FROM rooms WHERE id = ?';
  db.execute(query, [id], callback);
};

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom
};