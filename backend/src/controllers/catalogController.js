const pool = require('../config/db');
async function getCatalog(req, res) {
  try {
    const [products] = await pool.query('SELECT id, nombre, categoria, talla, color, precioVenta, stock, imagen, estado FROM productos WHERE stock > 0 ORDER BY fechaCreacion DESC');
    return res.json(products);
  } catch (error) { console.error('Error al obtener catálogo:', error); return res.status(500).json({ message: 'Error al obtener catálogo' }); }
}
module.exports = { getCatalog };
