const bcrypt = require('bcryptjs');
const pool = require('./config/db');

// Crea las cuentas internas a partir del entorno, en lugar de dejar sus hashes en los .sql
// versionados. Si la cuenta ya existe no se toca, para no revertir un cambio de contraseña
// hecho desde la aplicación.
async function ensureUser({ usuario, password, nombreCompleto, rol }) {
  if (!usuario || !password) return null;

  const [rows] = await pool.query('SELECT id FROM usuarios WHERE usuario = ? LIMIT 1', [usuario]);
  if (rows.length) return null;

  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO usuarios (usuario, password, nombreCompleto, rol) VALUES (?, ?, ?, ?)',
    [usuario, hash, nombreCompleto, rol]
  );
  return usuario;
}

async function seedAdmin() {
  const cuentas = [
    {
      usuario: process.env.ADMIN_USER,
      password: process.env.ADMIN_PASSWORD,
      nombreCompleto: 'Administrador SKULL FACE',
      rol: 'administrador'
    },
    {
      usuario: process.env.RECEPCION_USER,
      password: process.env.RECEPCION_PASSWORD,
      nombreCompleto: 'Recepción SKULL FACE',
      rol: 'recepcionista'
    }
  ];

  const creadas = [];
  for (const cuenta of cuentas) {
    const creada = await ensureUser(cuenta);
    if (creada) creadas.push(creada);
  }

  if (creadas.length) {
    console.log(`Cuentas iniciales creadas: ${creadas.join(', ')}`);
  }

  const [admins] = await pool.query(
    "SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'administrador'"
  );
  if (!admins[0].total) {
    console.warn(
      'AVISO: no hay ningún usuario administrador. Define ADMIN_USER y ADMIN_PASSWORD en el entorno y reinicia la API.'
    );
  }
}

module.exports = { seedAdmin };
