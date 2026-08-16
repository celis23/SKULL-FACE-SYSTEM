const pool = require('../config/db');
const { calcularEstado } = require('./productModel');

async function createOrder({ clienteId, items, notas }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    let total = 0;
    const details = [];
    for (const item of items) {
      const [rows] = await connection.query('SELECT id, nombre, precioVenta FROM productos WHERE id = ?', [item.productoId]);
      const product = rows[0];
      if (!product) throw new Error(`Producto con id ${item.productoId} no existe`);
      const price = Number(product.precioVenta);
      const subtotal = price * Number(item.cantidad);
      total += subtotal;
      details.push({ productoId: product.id, cantidad: Number(item.cantidad), precioUnitario: price, subtotal });
    }
    const [order] = await connection.query('INSERT INTO pedidos (clienteId, total, estado, notas) VALUES (?, ?, \'pendiente\', ?)', [clienteId, total, notas || null]);
    for (const detail of details) {
      await connection.query('INSERT INTO detalle_pedidos (pedidoId, productoId, cantidad, precioUnitario, subtotal) VALUES (?, ?, ?, ?, ?)', [order.insertId, detail.productoId, detail.cantidad, detail.precioUnitario, detail.subtotal]);
    }
    await connection.commit();
    return getOrderById(order.insertId);
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

async function getOrderById(id, clienteId = null) {
  const params = clienteId ? [id, clienteId] : [id];
  const where = clienteId ? 'p.id = ? AND p.clienteId = ?' : 'p.id = ?';
  const [orders] = await pool.query(`SELECT p.*, u.usuario AS clienteUsuario, u.nombreCompleto AS clienteNombre, u.email AS clienteEmail FROM pedidos p JOIN usuarios u ON u.id = p.clienteId WHERE ${where}`, params);
  if (!orders[0]) return null;
  const order = orders[0];
  const [details] = await pool.query('SELECT dp.*, p.nombre AS productoNombre, p.categoria, p.talla, p.color, p.imagen FROM detalle_pedidos dp JOIN productos p ON p.id = dp.productoId WHERE dp.pedidoId = ?', [id]);
  order.detalles = details;
  return order;
}

async function getOrders(clienteId = null) {
  const [rows] = await pool.query(`SELECT p.*, u.usuario AS clienteUsuario, u.nombreCompleto AS clienteNombre, u.email AS clienteEmail FROM pedidos p JOIN usuarios u ON u.id = p.clienteId ${clienteId ? 'WHERE p.clienteId = ?' : ''} ORDER BY p.fecha DESC`, clienteId ? [clienteId] : []);
  return Promise.all(rows.map((row) => getOrderById(row.id, clienteId)));
}

async function updateOrderStatus(id, estado) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [orders] = await connection.query('SELECT * FROM pedidos WHERE id = ? FOR UPDATE', [id]);
    const order = orders[0];
    if (!order) { const error = new Error('Pedido no encontrado'); error.status = 404; throw error; }
    if (order.estado === estado) { await connection.commit(); return getOrderById(id); }
    if (estado === 'confirmado') {
      const [details] = await connection.query('SELECT * FROM detalle_pedidos WHERE pedidoId = ?', [id]);
      for (const detail of details) {
        const [products] = await connection.query('SELECT id, stock FROM productos WHERE id = ? FOR UPDATE', [detail.productoId]);
        const product = products[0];
        if (!product || product.stock < detail.cantidad) { const error = new Error('No hay stock suficiente para confirmar este pedido.'); error.status = 400; throw error; }
        const stock = product.stock - detail.cantidad;
        await connection.query('UPDATE productos SET stock = ?, estado = ? WHERE id = ?', [stock, calcularEstado(stock), product.id]);
      }
    }
    await connection.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);
    await connection.commit();
    return getOrderById(id);
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus };
