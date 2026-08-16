const { getActiveDiscountByCode } = require('../models/discountModel');

async function validateDiscount(req, res) {
  try {
    const codigo = String(req.params.codigo || '').trim().toUpperCase();
    const discount = await getActiveDiscountByCode(codigo);
    if (!discount) {
      return res.status(404).json({ message: 'El código de descuento no es válido o está inactivo' });
    }
    return res.json({ codigo: discount.codigo, porcentaje: Number(discount.porcentaje) });
  } catch (error) {
    console.error('Error al validar descuento:', error);
    return res.status(500).json({ message: 'No se pudo validar el código de descuento' });
  }
}

module.exports = { validateDiscount };
