const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);
router.use(authorizeRoles('administrador'));

router.get('/daily', statisticsController.getDaily);
router.get('/weekly', statisticsController.getWeekly);
router.get('/monthly', statisticsController.getMonthly);
router.get('/summary', statisticsController.getSummary);

module.exports = router;
