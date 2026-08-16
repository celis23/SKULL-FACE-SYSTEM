const productModel = require('../models/productModel');

async function getProducts(req, res) {
  try {
    const productos = await productModel.getAllProducts();
    if (req.user?.rol === 'recepcionista') {
      return res.json(productos.map(({ costo, ...producto }) => producto));
    }
    return res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return res.status(500).json({ message: 'Error al obtener productos' });
  }
}

async function getProduct(req, res) {
  try {
    const producto = await productModel.getProductById(req.params.id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    if (req.user?.rol === 'recepcionista') {
      const { costo, ...safeProduct } = producto;
      return res.json(safeProduct);
    }
    return res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return res.status(500).json({ message: 'Error al obtener producto' });
  }
}

function validarProducto(body) {
  const { nombre, categoria, talla, color, precioVenta, costo, stock } = body;

  if (!nombre || !categoria || !talla || !color) {
    return 'Faltan campos obligatorios: nombre, categoria, talla, color';
  }

  if (!['Hoodie', 'Pants', 'Playera'].includes(categoria)) {
    return 'Categoría inválida. Debe ser Hoodie, Pants o Playera';
  }

  if (precioVenta === undefined || costo === undefined || stock === undefined) {
    return 'Faltan campos obligatorios: precioVenta, costo, stock';
  }

  if (Number(precioVenta) < 0 || Number(costo) < 0 || Number(stock) < 0) {
    return 'Los valores numéricos no pueden ser negativos';
  }

  return null;
}

async function createProduct(req, res) {
  try {
    const errorValidacion = validarProducto(req.body);
    if (errorValidacion) {
      return res.status(400).json({ message: errorValidacion });
    }

    const producto = await productModel.createProduct(req.body);
    return res.status(201).json(producto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    return res.status(500).json({ message: 'Error al crear producto' });
  }
}

async function updateProduct(req, res) {
  try {
    const existente = await productModel.getProductById(req.params.id);
    if (!existente) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const errorValidacion = validarProducto(req.body);
    if (errorValidacion) {
      return res.status(400).json({ message: errorValidacion });
    }

    const producto = await productModel.updateProduct(req.params.id, req.body);
    return res.json(producto);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return res.status(500).json({ message: 'Error al actualizar producto' });
  }
}

async function deleteProduct(req, res) {
  try {
    const existente = await productModel.getProductById(req.params.id);
    if (!existente) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await productModel.deleteProduct(req.params.id);
    return res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return res.status(500).json({ message: 'Error al eliminar producto' });
  }
}

async function getInventory(req, res) {
  try {
    const productos = await productModel.getAllProducts();
    return res.json(productos);
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    return res.status(500).json({ message: 'Error al obtener inventario' });
  }
}

async function getProductsForSale(req, res) {
  try {
    const productos = await productModel.getAllProducts();
    return res.json(productos.map(({ costo, ...producto }) => producto));
  } catch (error) {
    console.error('Error al obtener productos para venta:', error);
    return res.status(500).json({ message: 'Error al obtener productos para venta' });
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getInventory,
  getProductsForSale
};
