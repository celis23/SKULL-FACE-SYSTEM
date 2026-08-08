const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, productController.getInventory);

module.exports = router;
