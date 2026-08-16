const pool = require('../config/db');

async function getActiveDiscountByCode(codigo) {
  const [rows] = await pool.query(
    'SELECT codigo, porcentaje FROM codigos_descuento WHERE codigo = ? AND activo = TRUE LIMIT 1',
    [codigo]
  );
  return rows[0] || null;
}

module.exports = { getActiveDiscountByCode };
