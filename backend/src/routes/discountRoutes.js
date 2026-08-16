const express = require('express');
const { validateDiscount } = require('../controllers/discountController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
router.get('/:codigo', verifyToken, authorizeRoles('administrador', 'recepcionista'), validateDiscount);

module.exports = router;
