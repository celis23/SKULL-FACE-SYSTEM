import api from './api';
export const getOrders = async () => (await api.get('/orders')).data;
export const getMyOrders = async () => (await api.get('/orders/mine')).data;
export const createOrder = async (data) => (await api.post('/orders', data)).data;
export const updateOrderStatus = async (id, estado) => (await api.put(`/orders/${id}/status`, { estado })).data;
