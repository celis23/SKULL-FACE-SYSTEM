const saleModel = require('../models/saleModel');

async function getSales(req, res) {
  try {
    const ventas = await saleModel.getAllSales();
    if (req.user.rol === 'recepcionista') {
      return res.json(ventas.map(({ ganancia, detalles, ...venta }) => ({
        ...venta,
        detalles: detalles.map(({ costoUnitario, ...detalle }) => detalle)
      })));
    }
    return res.json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    return res.status(500).json({ message: 'Error al obtener ventas' });
  }
}

async function createSale(req, res) {
  try {
    const { items, metodoPago } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Debe incluir al menos un producto en la venta' });
    }

    if (!metodoPago || !['Efectivo', 'Transferencia', 'Tarjeta', 'Otro'].includes(metodoPago)) {
      return res.status(400).json({ message: 'Método de pago inválido' });
    }

    for (const item of items) {
      if (!item.productoId || !item.cantidad || item.cantidad <= 0) {
        return res.status(400).json({ message: 'Cada producto debe tener productoId y cantidad válida' });
      }
    }

    const venta = await saleModel.createSale({
      items,
      metodoPago,
      usuarioId: req.user ? req.user.id : null
    });

    return res.status(201).json(venta);
  } catch (error) {
    console.error('Error al crear venta:', error);
    return res.status(400).json({ message: error.message || 'Error al registrar la venta' });
  }
}

module.exports = { getSales, createSale };
