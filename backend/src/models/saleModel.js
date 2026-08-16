const pool = require('../config/db');
const { decreaseStock } = require('./productModel');
const { getActiveDiscountByCode } = require('./discountModel');

const toCents = (value) => Math.round(Number(value) * 100);

async function createSale({ items, metodoPago, usuarioId, codigoDescuento }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let subtotalCents = 0;
    let costoTotalCents = 0;
    const detalles = [];

    for (const item of items) {
      const [productos] = await connection.query('SELECT * FROM productos WHERE id = ? FOR UPDATE', [item.productoId]);
      const producto = productos[0];

      if (!producto) {
        throw new Error(`Producto con id ${item.productoId} no existe`);
      }

      if (producto.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`);
      }

      const precioUnitario = toCents(producto.precioVenta);
      const costoUnitario = toCents(producto.costo);
      const subtotal = precioUnitario * item.cantidad;
      const costoLinea = costoUnitario * item.cantidad;

      subtotalCents += subtotal;
      costoTotalCents += costoLinea;

      detalles.push({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: precioUnitario / 100,
        costoUnitario: costoUnitario / 100,
        subtotal: subtotal / 100,
        subtotalCents: subtotal,
        costoLinea
      });
    }

    let descuentoCents = 0;
    let porcentajeDescuento = 0;
    let codigoAplicado = null;
    const codigoNormalizado = codigoDescuento ? String(codigoDescuento).trim().toUpperCase() : null;
    if (codigoNormalizado) {
      const discount = await getActiveDiscountByCode(codigoNormalizado);
      if (!discount) throw new Error('El código de descuento no es válido o está inactivo');
      codigoAplicado = discount.codigo;
      porcentajeDescuento = Number(discount.porcentaje);
      descuentoCents = Math.round(subtotalCents * porcentajeDescuento / 100);
    }

    const totalCents = subtotalCents - descuentoCents;
    let descuentoAsignado = 0;
    let gananciaTotalCents = 0;
    detalles.forEach((detalle, index) => {
      const descuentoLinea = index === detalles.length - 1
        ? descuentoCents - descuentoAsignado
        : Math.round(descuentoCents * detalle.subtotalCents / subtotalCents);
      descuentoAsignado += descuentoLinea;
      gananciaTotalCents += detalle.subtotalCents - descuentoLinea - detalle.costoLinea;
    });
    const total = totalCents / 100;
    const gananciaTotal = gananciaTotalCents / 100;

    const [ventaResult] = await connection.query(
      `INSERT INTO ventas (total, ganancia, metodoPago, usuarioId, codigoDescuento, porcentajeDescuento)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [total, gananciaTotal, metodoPago, usuarioId || null, codigoAplicado, porcentajeDescuento]
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

    return {
      id: ventaId, subtotal: subtotalCents / 100, descuento: descuentoCents / 100,
      total, ganancia: gananciaTotal, metodoPago, codigoDescuento: codigoAplicado, porcentajeDescuento
    };
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
