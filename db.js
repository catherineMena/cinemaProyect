// db.js
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

// Verificación de variables de entorno
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'cath123',
  database: process.env.DB_NAME || 'cine_db'
});

db.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.stack);
    process.exit(1);
  }
  console.log('✅ Conexión a MySQL establecida');
});

module.exports = db;