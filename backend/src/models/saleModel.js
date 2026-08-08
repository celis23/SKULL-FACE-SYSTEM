const pool = require('../config/db');
const { getProductById, decreaseStock } = require('./productModel');

async function createSale({ items, metodoPago, usuarioId }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let total = 0;
    let gananciaTotal = 0;
    const detalles = [];

    for (const item of items) {
      const producto = await getProductById(item.productoId);

      if (!producto) {
        throw new Error(`Producto con id ${item.productoId} no existe`);
      }

      if (producto.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`);
      }

      const precioUnitario = parseFloat(producto.precioVenta);
      const costoUnitario = parseFloat(producto.costo);
      const subtotal = precioUnitario * item.cantidad;
      const ganancia = (precioUnitario - costoUnitario) * item.cantidad;

      total += subtotal;
      gananciaTotal += ganancia;

      detalles.push({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario,
        costoUnitario,
        subtotal
      });
    }

    const [ventaResult] = await connection.query(
      'INSERT INTO ventas (total, ganancia, metodoPago, usuarioId) VALUES (?, ?, ?, ?)',
      [total, gananciaTotal, metodoPago, usuarioId || null]
    );

    const ventaId = ventaResult.insertId;

    for (const detalle of detalles) {
      await connection.query(
        `INSERT INTO detalle_ventas (ventaId, productoId, cantidad, precioUnitario, costoUnitario, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ventaId, detalle.productoId, detalle.cantidad, detalle.precioUnitario, detalle.costoUnitario, detalle.subtotal]
      );

      await decreaseStock(detalle.productoId, detalle.cantidad, connection);
    }

    await connection.commit();

    return { id: ventaId, total, ganancia: gananciaTotal, metodoPago };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getAllSales() {
  const [ventas] = await pool.query(
    'SELECT * FROM ventas ORDER BY fecha DESC'
  );

  for (const venta of ventas) {
    const [detalles] = await pool.query(
      `SELECT dv.*, p.nombre AS productoNombre, p.categoria
       FROM detalle_ventas dv
       JOIN productos p ON dv.productoId = p.id
       WHERE dv.ventaId = ?`,
      [venta.id]
    );
    venta.detalles = detalles;
  }

  return ventas;
}

module.exports = { createSale, getAllSales };
