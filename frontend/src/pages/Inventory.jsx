import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import ProductTable from '../components/ProductTable';
import ProductModal from '../components/ProductModal';
import { getInventory, createProduct, updateProduct, deleteProduct } from '../services/productService';

const CATEGORIAS = ['Todas', 'Hoodie', 'Pants', 'Playera'];
const ESTADOS = ['Todos', 'Disponible', 'Stock bajo', 'Agotado'];

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [estado, setEstado] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  async function loadInventory() {
    setLoading(true);
    try {
      const data = await getInventory();
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar inventario', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
      const matchCategoria = categoria === 'Todas' || p.categoria === categoria;
      const matchEstado = estado === 'Todos' || p.estado === estado;
      return matchSearch && matchCategoria && matchEstado;
    });
  }, [products, search, categoria, estado]);

  function handleNew() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  function handleEdit(product) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  async function handleSave(data) {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
    } else {
      await createProduct(data);
    }
    await loadInventory();
  }

  async function handleDelete(product) {
    if (!window.confirm(`¿Eliminar "${product.nombre}"?`)) return;
    try {
      await deleteProduct(product.id);
      await loadInventory();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar el producto');
    }
  }

  return (
    <div className="page">
      <Navbar title="Inventario" subtitle="Stock actual de la marca" />

      <div className="panel">
        <div className="panel-header">
          <h3>Existencias</h3>
          <button className="btn-primary" onClick={handleNew}>+ Agregar producto</button>
        </div>

        <div className="filters-bar">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-search"
          />

          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="empty-state">Cargando inventario...</div>
        ) : (
          <ProductTable products={filtered} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        product={editingProduct}
      />
    </div>
  );
}
