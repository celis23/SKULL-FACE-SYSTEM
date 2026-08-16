const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

router.get('/products', authorizeRoles('administrador', 'recepcionista'), require('../controllers/productController').getProductsForSale);
router.get('/', authorizeRoles('administrador', 'recepcionista'), saleController.getSales);
router.post('/', authorizeRoles('administrador', 'recepcionista'), saleController.createSale);

module.exports = router;
