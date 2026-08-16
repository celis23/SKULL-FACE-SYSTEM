import { useState, useMemo } from 'react';
import { validateDiscount } from '../services/saleService';

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Tarjeta', 'Otro'];
const money = (v) => `$${Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SaleModal({ isOpen, onClose, onSave, products }) {
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [items, setItems] = useState([]);
  const [codigoDescuento, setCodigoDescuento] = useState('');
  const [porcentajeDescuento, setPorcentajeDescuento] = useState(0);
  const [discountMessage, setDiscountMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const productosDisponibles = useMemo(
    () => products.filter((p) => p.stock > 0),
    [products]
  );

  if (!isOpen) return null;

  function resetForm() {
    setProductoId('');
    setCantidad(1);
    setMetodoPago('Efectivo');
    setItems([]);
    setCodigoDescuento('');
    setPorcentajeDescuento(0);
    setDiscountMessage('');
    setError('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleAddItem() {
    setError('');
    const producto = products.find((p) => p.id === Number(productoId));

    if (!producto) {
      setError('Selecciona un producto');
      return;
    }

    const cantidadNum = parseInt(cantidad, 10);

    if (!cantidadNum || cantidadNum <= 0) {
      setError('Cantidad inválida');
      return;
    }

    const yaEnCarrito = items.find((i) => i.productoId === producto.id)?.cantidad || 0;

    if (cantidadNum + yaEnCarrito > producto.stock) {
      setError(`Stock insuficiente. Disponible: ${producto.stock}`);
      return;
    }

    setItems((prev) => {
      const existente = prev.find((i) => i.productoId === producto.id);
      if (existente) {
        return prev.map((i) =>
          i.productoId === producto.id ? { ...i, cantidad: i.cantidad + cantidadNum } : i
        );
      }
      return [
        ...prev,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          precioVenta: producto.precioVenta,
          cantidad: cantidadNum
        }
      ];
    });

    setProductoId('');
    setCantidad(1);
  }

  function handleRemoveItem(id) {
    setItems((prev) => prev.filter((i) => i.productoId !== id));
  }

  function handleDiscountChange(value) {
    setCodigoDescuento(value);
    setPorcentajeDescuento(0);
    setDiscountMessage('');
  }

  async function handleApplyDiscount() {
    const codigo = codigoDescuento.trim();
    if (!codigo) {
      setPorcentajeDescuento(0);
      setDiscountMessage('');
      return;
    }
    try {
      const discount = await validateDiscount(codigo);
      setCodigoDescuento(discount.codigo);
      setPorcentajeDescuento(Number(discount.porcentaje));
      setDiscountMessage(`${discount.codigo} aplicado`);
    } catch (err) {
      setPorcentajeDescuento(0);
      setDiscountMessage(err.response?.data?.message || 'Código de descuento inválido');
    }
  }

  const subtotal = items.reduce((acc, i) => acc + Number(i.precioVenta) * i.cantidad, 0);
  const montoDescuento = subtotal * porcentajeDescuento / 100;
  const total = subtotal - montoDescuento;

  async function handleSubmit() {
    setError('');

    if (items.length === 0) {
      setError('Agrega al menos un producto a la venta');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        items: items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
        metodoPago,
        codigoDescuento: porcentajeDescuento > 0 ? codigoDescuento : null
      });
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar la venta');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nueva venta</h3>
          <button className="btn-icon" onClick={handleClose}>✕</button>
        </div>

        <div className="modal-form">
          <div className="modal-form-row">
            <label>
              Producto
              <select value={productoId} onChange={(e) => setProductoId(e.target.value)}>
                <option value="">Selecciona un producto</option>
                {productosDisponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — {p.talla} — {money(p.precioVenta)} (stock: {p.stock})
                  </option>
                ))}
              </select>
            </label>
            <label className="modal-form-qty">
              Cantidad
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </label>
          </div>

          <button type="button" className="btn-secondary" onClick={handleAddItem}>
            + Agregar a la venta
          </button>

          {items.length > 0 && (
            <div className="sale-items">
              {items.map((i) => (
                <div key={i.productoId} className="sale-item-row">
                  <span>{i.nombre}</span>
                  <span>x{i.cantidad}</span>
                  <span>{money(i.precioVenta * i.cantidad)}</span>
                  <button className="btn-icon btn-icon-danger" onClick={() => handleRemoveItem(i.productoId)}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="discount-box">
            <label>
              Código de descuento
              <div className="discount-input-row">
                <input value={codigoDescuento} onChange={(e) => handleDiscountChange(e.target.value)} placeholder="YATZ10" />
                <button type="button" className="btn-secondary" onClick={handleApplyDiscount}>Aplicar</button>
              </div>
            </label>
            {discountMessage && <p className={porcentajeDescuento ? 'discount-success' : 'form-error'}>{discountMessage}</p>}
          </div>

          <label>
            Método de pago
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
              {METODOS_PAGO.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>

          <div className="sale-total">
            <span>SUBTOTAL</span>
            <span>{money(subtotal)}</span>
          </div>
          {porcentajeDescuento > 0 && <>
            <div className="sale-total sale-discount"><span>DESCUENTO ({porcentajeDescuento}%)</span><span>-{money(montoDescuento)}</span></div>
            <div className="sale-total"><span>TOTAL</span><span>{money(total)}</span></div>
          </>}
          {porcentajeDescuento === 0 && <div className="sale-total"><span>TOTAL</span><span>{money(total)}</span></div>}

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleClose}>Cancelar</button>
            <button type="button" className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Guardando...' : 'Confirmar venta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
