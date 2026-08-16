import api from './api';

export async function loginRequest(usuario, password) {
  const response = await api.post('/auth/login', { usuario, password });
  return response.data;
}

export async function registerRequest(data) {
  const response = await api.post('/auth/register', data);
  return response.data;
}
