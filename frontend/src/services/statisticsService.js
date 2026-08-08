import api from './api';

export async function getDailyStats() {
  const response = await api.get('/statistics/daily');
  return response.data;
}

export async function getWeeklyStats() {
  const response = await api.get('/statistics/weekly');
  return response.data;
}

export async function getMonthlyStats() {
  const response = await api.get('/statistics/monthly');
  return response.data;
}

export async function getSummary() {
  const response = await api.get('/statistics/summary');
  return response.data;
}
