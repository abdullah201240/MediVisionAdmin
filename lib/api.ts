import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for sending cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
};

// Users API
export const usersApi = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Medicines API
export const medicinesApi = {
  getAll: async () => {
    const response = await api.get('/medicines');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/medicines/${id}`);
    return response.data;
  },
  create: async (data: FormData) => {
    const response = await api.post('/medicines', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  update: async (id: string, data: FormData) => {
    const response = await api.patch(`/medicines/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/medicines/${id}`);
    return response.data;
  },
  deleteImage: async (id: string, imageName: string) => {
    const response = await api.delete(`/medicines/${id}/images/${imageName}`);
    return response.data;
  },
};

export default api;
