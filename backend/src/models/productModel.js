const pool = require('../config/db');

const STOCK_BAJO_LIMITE = 5;

function calcularEstado(stock) {
  if (stock <= 0) return 'Agotado';
  if (stock <= STOCK_BAJO_LIMITE) return 'Stock bajo';
  return 'Disponible';
}

async function getAllProducts() {
  const [rows] = await pool.query('SELECT * FROM productos ORDER BY fechaCreacion DESC');
  return rows;
}

async function getProductById(id) {
  const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
  return rows[0];
}

async function createProduct(data) {
  const { nombre, categoria, talla, color, precioVenta, costo, stock, imagen } = data;
  const estado = calcularEstado(stock);

  const [result] = await pool.query(
    `INSERT INTO productos (nombre, categoria, talla, color, precioVenta, costo, stock, imagen, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, categoria, talla, color, precioVenta, costo, stock, imagen || null, estado]
  );

  return getProductById(result.insertId);
}

async function updateProduct(id, data) {
  const { nombre, categoria, talla, color, precioVenta, costo, stock, imagen } = data;
  const estado = calcularEstado(stock);

  await pool.query(
    `UPDATE productos
     SET nombre = ?, categoria = ?, talla = ?, color = ?, precioVenta = ?, costo = ?, stock = ?, imagen = ?, estado = ?
     WHERE id = ?`,
    [nombre, categoria, talla, color, precioVenta, costo, stock, imagen || null, estado, id]
  );

  return getProductById(id);
}

async function deleteProduct(id) {
  await pool.query('DELETE FROM productos WHERE id = ?', [id]);
  return true;
}

async function decreaseStock(id, cantidad, connection = pool) {
  const [rows] = await connection.query('SELECT stock FROM productos WHERE id = ? FOR UPDATE', [id]);
  const producto = rows[0];

  if (!producto) {
    throw new Error(`Producto ${id} no encontrado`);
  }

  if (producto.stock < cantidad) {
    throw new Error(`Stock insuficiente para el producto ${id}`);
  }

  const nuevoStock = producto.stock - cantidad;
  const estado = calcularEstado(nuevoStock);

  await connection.query(
    'UPDATE productos SET stock = ?, estado = ? WHERE id = ?',
    [nuevoStock, estado, id]
  );

  return nuevoStock;
}

module.exports = {
  calcularEstado,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  decreaseStock
};
