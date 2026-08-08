import api from './api';

export async function loginRequest(usuario, password) {
  const response = await api.post('/auth/login', { usuario, password });
  return response.data;
}
