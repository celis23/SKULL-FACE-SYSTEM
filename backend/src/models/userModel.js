const pool = require('../config/db');

async function findUserByUsername(usuario) {
  const [rows] = await pool.query(
    'SELECT * FROM usuarios WHERE usuario = ? LIMIT 1',
    [usuario]
  );
  return rows[0];
}

module.exports = { findUserByUsername };
