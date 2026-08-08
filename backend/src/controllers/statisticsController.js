const statisticsModel = require('../models/statisticsModel');

async function getDaily(req, res) {
  try {
    const data = await statisticsModel.getDailyStats();
    return res.json(data);
  } catch (error) {
    console.error('Error al obtener estadísticas diarias:', error);
    return res.status(500).json({ message: 'Error al obtener estadísticas diarias' });
  }
}

async function getWeekly(req, res) {
  try {
    const data = await statisticsModel.getWeeklyStats();
    return res.json(data);
  } catch (error) {
    console.error('Error al obtener estadísticas semanales:', error);
    return res.status(500).json({ message: 'Error al obtener estadísticas semanales' });
  }
}

async function getMonthly(req, res) {
  try {
    const data = await statisticsModel.getMonthlyStats();
    return res.json(data);
  } catch (error) {
    console.error('Error al obtener estadísticas mensuales:', error);
    return res.status(500).json({ message: 'Error al obtener estadísticas mensuales' });
  }
}

async function getSummary(req, res) {
  try {
    const data = await statisticsModel.getSummary();
    return res.json(data);
  } catch (error) {
    console.error('Error al obtener resumen de estadísticas:', error);
    return res.status(500).json({ message: 'Error al obtener resumen de estadísticas' });
  }
}

module.exports = { getDaily, getWeekly, getMonthly, getSummary };
