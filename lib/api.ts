import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for sending cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[ADMIN API] Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
      params: config.params
    });
    return config;
  },
  (error) => {
    console.error('[ADMIN API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`[ADMIN API] Response: ${response.status} ${response.statusText}`, {
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('[ADMIN API] Response error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('[ADMIN API] Login error:', error);
      throw error;
    }
  },
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('[ADMIN API] Logout error:', error);
      throw error;
    }
  },
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('[ADMIN API] Get profile error:', error);
      throw error;
    }
  },
  updateProfile: async (data: any) => {
    try {
      const response = await api.put('/users/profile', data);
      return response.data;
    } catch (error) {
      console.error('[ADMIN API] Update profile error:', error);
      throw error;
    }
  },
  updateProfileImage: async (formData: FormData) => {
    try {
      const response = await api.put('/users/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('[ADMIN API] Update profile image error:', error);
      throw error;
    }
  },
  removeProfileImage: async () => {
    try {
      const response = await api.delete('/users/profile/image');
      return response.data;
    } catch (error) {
      console.error('[ADMIN API] Remove profile image error:', error);
      throw error;
    }
  },
  updateProfileCover: async (formData: FormData) => {
    try {
      const response = await api.put('/users/profile/cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('[ADMIN API] Update profile cover error:', error);
      throw error;
    }
  },
  removeCoverPhoto: async () => {
    try {
      const response = await api.delete('/users/profile/cover');
      return response.data;
    } catch (error) {
      console.error('[ADMIN API] Remove cover photo error:', error);
      throw error;
    }
  },
};

// Users API
export const usersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    role?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params?.role) queryParams.append('role', params.role);
      
      const url = params ? `/users?${queryParams.toString()}` : '/users';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('[ADMIN API] Get all users error:', error);
      throw error;
    }
  },
  getById: async (id: string) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[ADMIN API] Get user by ID ${id} error:`, error);
      throw error;
    }
  },
  update: async (id: string, data: any) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`[ADMIN API] Update user ${id} error:`, error);
      throw error;
    }
  },
  updateRole: async (id: string, role: string) => {
    try {
      const response = await api.put(`/users/${id}/role`, { role });
      return response.data;
    } catch (error) {
      console.error(`[ADMIN API] Update user ${id} role error:`, error);
      throw error;
    }
  },
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[ADMIN API] Delete user ${id} error:`, error);
      throw error;
    }
  },
};

// Medicines API
export const medicinesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const url = params ? `/medicines?${queryParams.toString()}` : '/medicines';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('[ADMIN API] Get all medicines error:', error);
      throw error;
    }
  },
  getById: async (id: string) => {
    try {
      const response = await api.get(`/medicines/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[ADMIN API] Get medicine by ID ${id} error:`, error);
      throw error;
    }
  },
  create: async (data: FormData) => {
    try {
      const response = await api.post('/medicines', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('[ADMIN API] Create medicine error:', error);
      throw error;
    }
  },
  update: async (id: string, data: FormData) => {
    try {
      const response = await api.patch(`/medicines/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`[ADMIN API] Update medicine ${id} error:`, error);
      throw error;
    }
  },
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/medicines/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[ADMIN API] Delete medicine ${id} error:`, error);
      throw error;
    }
  },
  deleteImage: async (id: string, imageName: string) => {
    try {
      const response = await api.delete(`/medicines/${id}/images/${imageName}`);
      return response.data;
    } catch (error) {
      console.error(`[ADMIN API] Delete medicine ${id} image ${imageName} error:`, error);
      throw error;
    }
  },
  searchByImage: async (formData: FormData) => {
    try {
      const response = await api.post('/medicines/search-by-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('[ADMIN API] Search by image error:', error);
      throw error;
    }
  },
};

export default api;