import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import SaleModal from '../components/SaleModal';
import { getSales, createSale } from '../services/saleService';
import { getProducts } from '../services/productService';

const money = (v) => `$${Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [salesData, productsData] = await Promise.all([getSales(), getProducts()]);
      setSales(salesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error al cargar ventas', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave(data) {
    await createSale(data);
    await loadData();
  }

  return (
    <div className="page">
      <Navbar title="Ventas" subtitle="Registro de ventas de SKULL FACE" />

      <div className="panel">
        <div className="panel-header">
          <h3>Historial de ventas</h3>
          <button className="btn-primary" onClick={() => setModalOpen(true)}>+ Nueva venta</button>
        </div>

        {loading ? (
          <div className="empty-state">Cargando ventas...</div>
        ) : sales.length === 0 ? (
          <div className="empty-state">Aún no hay ventas registradas.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Productos</th>
                  <th>Método de pago</th>
                  <th>Total</th>
                  <th>Ganancia</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td>{new Date(s.fecha).toLocaleString('es-MX')}</td>
                    <td>
                      {s.detalles.map((d) => (
                        <div key={d.id} className="sale-detail-line">
                          {d.productoNombre} x{d.cantidad}
                        </div>
                      ))}
                    </td>
                    <td>{s.metodoPago}</td>
                    <td>{money(s.total)}</td>
                    <td>{money(s.ganancia)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SaleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        products={products}
      />
    </div>
  );
}
