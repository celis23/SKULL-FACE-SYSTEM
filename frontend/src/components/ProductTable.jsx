const money = (v) => `$${Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const estadoClase = {
  'Disponible': 'badge-ok',
  'Stock bajo': 'badge-warn',
  'Agotado': 'badge-danger'
};

export default function ProductTable({ products, onEdit, onDelete }) {
  if (!products || products.length === 0) {
    return <div className="empty-state">No hay productos registrados.</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Talla</th>
            <th>Color</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.categoria}</td>
              <td>{p.talla}</td>
              <td>{p.color}</td>
              <td>{money(p.precioVenta)}</td>
              <td>{p.stock}</td>
              <td>
                <span className={`badge ${estadoClase[p.estado] || ''}`}>{p.estado}</span>
              </td>
              <td className="table-actions">
                <button className="btn-icon" onClick={() => onEdit(p)} title="Editar">
                  ✎
                </button>
                <button className="btn-icon btn-icon-danger" onClick={() => onDelete(p)} title="Eliminar">
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
