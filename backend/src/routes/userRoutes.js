const express = require('express');
const controller = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken, authorizeRoles('administrador'));
router.get('/', controller.getUsers);
router.post('/', controller.createUser);
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);
module.exports = router;
