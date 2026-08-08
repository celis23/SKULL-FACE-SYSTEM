import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ProductTable from '../components/ProductTable';
import ProductModal from '../components/ProductModal';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar productos', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

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
    await loadProducts();
  }

  async function handleDelete(product) {
    if (!window.confirm(`¿Eliminar "${product.nombre}"?`)) return;
    try {
      await deleteProduct(product.id);
      await loadProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar el producto');
    }
  }

  return (
    <div className="page">
      <Navbar title="Productos" subtitle="Catálogo de hoodies, pants y playeras" />

      <div className="panel">
        <div className="panel-header">
          <h3>Catálogo</h3>
          <button className="btn-primary" onClick={handleNew}>+ Nuevo producto</button>
        </div>

        {loading ? (
          <div className="empty-state">Cargando productos...</div>
        ) : (
          <ProductTable products={products} onEdit={handleEdit} onDelete={handleDelete} />
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
