import { useState, useEffect } from 'react';

const CATEGORIAS = ['Hoodie', 'Pants', 'Playera'];

const emptyForm = {
  nombre: '',
  categoria: 'Hoodie',
  talla: '',
  color: '',
  precioVenta: '',
  costo: '',
  stock: ''
};

export default function ProductModal({ isOpen, onClose, onSave, product }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        nombre: product.nombre,
        categoria: product.categoria,
        talla: product.talla,
        color: product.color,
        precioVenta: product.precioVenta,
        costo: product.costo,
        stock: product.stock
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.nombre || !form.talla || !form.color || form.precioVenta === '' || form.costo === '' || form.stock === '') {
      setError('Completa todos los campos');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...form,
        precioVenta: parseFloat(form.precioVenta),
        costo: parseFloat(form.costo),
        stock: parseInt(form.stock, 10)
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{product ? 'Editar producto' : 'Nuevo producto'}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Nombre
            <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Hoodie Skull" />
          </label>

          <label>
            Categoría
            <select name="categoria" value={form.categoria} onChange={handleChange}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <div className="modal-form-row">
            <label>
              Talla
              <input name="talla" value={form.talla} onChange={handleChange} placeholder="M" />
            </label>
            <label>
              Color
              <input name="color" value={form.color} onChange={handleChange} placeholder="Negro" />
            </label>
          </div>

          <div className="modal-form-row">
            <label>
              Precio de venta
              <input type="number" step="0.01" name="precioVenta" value={form.precioVenta} onChange={handleChange} placeholder="650" />
            </label>
            <label>
              Costo
              <input type="number" step="0.01" name="costo" value={form.costo} onChange={handleChange} placeholder="350" />
            </label>
          </div>

          <label>
            Stock
            <input type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="10" />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
