const express = require('express');
const { getCatalog } = require('../controllers/catalogController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();
router.get('/', verifyToken, authorizeRoles('cliente'), getCatalog);
module.exports = router;
