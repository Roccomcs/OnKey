
// ===============================
// POOL DE CONEXIONES MYSQL (MODERNO, COMPATIBLE ESM/COMMONJS)
// ===============================
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  timezone: 'Z',
});

// Test de conexión al iniciar
pool.getConnection()
  .then(conn => { console.log('Conectado a MySQL (pool) ✅'); conn.release(); })
  .catch(err => { console.error('Error al conectar (pool):', err); process.exit(1); });

// Exporta el pool para ser usado en otros scripts
module.exports = { pool };