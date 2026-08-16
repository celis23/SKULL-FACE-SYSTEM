const orderModel = require('../models/orderModel');
const ESTADOS = ['pendiente', 'confirmado', 'en_preparacion', 'entregado', 'cancelado'];

async function getOrders(req, res) { try { return res.json(await orderModel.getOrders()); } catch (e) { console.error(e); return res.status(500).json({ message: 'Error al obtener pedidos' }); } }
async function getMyOrders(req, res) { try { return res.json(await orderModel.getOrders(req.user.id)); } catch (e) { console.error(e); return res.status(500).json({ message: 'Error al obtener pedidos' }); } }
async function createOrder(req, res) {
  try {
    const { items, notas } = req.body;
    if (!Array.isArray(items) || !items.length || items.some((i) => !i.productoId || !Number.isInteger(Number(i.cantidad)) || Number(i.cantidad) <= 0)) return res.status(400).json({ message: 'Incluye productos y cantidades válidas' });
    return res.status(201).json(await orderModel.createOrder({ clienteId: req.user.id, items, notas }));
  } catch (e) { console.error(e); return res.status(400).json({ message: e.message || 'No se pudo crear el pedido' }); }
}
async function updateStatus(req, res) {
  try {
    if (!ESTADOS.includes(req.body.estado)) return res.status(400).json({ message: 'Estado de pedido inválido' });
    return res.json(await orderModel.updateOrderStatus(req.params.id, req.body.estado));
  } catch (e) { console.error(e); return res.status(e.status || 400).json({ message: e.message || 'No se pudo actualizar el pedido' }); }
}
module.exports = { getOrders, getMyOrders, createOrder, updateStatus };
