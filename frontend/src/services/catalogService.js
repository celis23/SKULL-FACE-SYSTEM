import api from './api';
export const getCatalog = async () => (await api.get('/catalog')).data;
