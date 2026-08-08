const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', saleController.getSales);
router.post('/', saleController.createSale);

module.exports = router;
