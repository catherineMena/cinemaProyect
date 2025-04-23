const db = require('../db');

// Función para crear una nueva sala
const createRoom = (room, callback) => {
  const { name, movie_name, movie_poster_url, num_rows, num_columns, price, duration, genre, hour } = room;
  const query = 'INSERT INTO rooms (name, movie_name, movie_poster_url, num_rows, num_columns, price, duration, genre, hour) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.execute(query, [
    name,
    movie_name,
    movie_poster_url,
    num_rows,
    num_columns,
    price,
    duration,
    genre,
    hour
  ], callback);
};

// Función para actualizar una sala
const updateRoom = (id, room, callback) => {
  const { name, movie_name, movie_poster_url, num_rows, num_columns, price, duration, genre, hour } = room;
  const query = 'UPDATE rooms SET name = ?, movie_name = ?, movie_poster_url = ?, num_rows = ?, num_columns = ?, price = ?, duration = ?, genre = ?, hour = ? WHERE id = ?';
  db.execute(query, [
    name,
    movie_name,
    movie_poster_url,
    num_rows,
    num_columns,
    price,
    duration,
    genre,
    hour,
    id
  ], callback);
};

// Las demás funciones permanecen igual
const getAllRooms = (callback) => {
  const query = 'SELECT * FROM rooms';
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