const pool = require('../config/db');

async function findUserByUsername(usuario) {
  const [rows] = await pool.query(
    'SELECT * FROM usuarios WHERE usuario = ? LIMIT 1',
    [usuario]
  );
  return rows[0];
}

async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ? LIMIT 1', [email]);
  return rows[0];
}

async function getUsers() {
  const [rows] = await pool.query(
    'SELECT id, usuario, nombreCompleto, email, telefono, rol, fechaCreacion FROM usuarios ORDER BY fechaCreacion DESC'
  );
  return rows;
}

async function getUserById(id) {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ? LIMIT 1', [id]);
  return rows[0];
}

async function createUser({ usuario, password, nombreCompleto, email, telefono, rol }) {
  const [result] = await pool.query(
    'INSERT INTO usuarios (usuario, password, nombreCompleto, email, telefono, rol) VALUES (?, ?, ?, ?, ?, ?)',
    [usuario, password, nombreCompleto || null, email || null, telefono || null, rol]
  );
  return getUserById(result.insertId);
}

async function updateUser(id, { usuario, password, nombreCompleto, email, telefono, rol }) {
  const fields = ['usuario = ?', 'nombreCompleto = ?', 'email = ?', 'telefono = ?', 'rol = ?'];
  const values = [usuario, nombreCompleto || null, email || null, telefono || null, rol];
  if (password) {
    fields.push('password = ?');
    values.push(password);
  }
  values.push(id);
  await pool.query(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`, values);
  return getUserById(id);
}

async function deleteUser(id) {
  await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
}

module.exports = { findUserByUsername, findUserByEmail, getUsers, getUserById, createUser, updateUser, deleteUser };
