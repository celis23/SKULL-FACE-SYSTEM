const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

router.use(authorizeRoles('administrador'));
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.post('/', authorizeRoles('administrador'), productController.createProduct);
router.put('/:id', authorizeRoles('administrador'), productController.updateProduct);
router.delete('/:id', authorizeRoles('administrador'), productController.deleteProduct);

module.exports = router;
