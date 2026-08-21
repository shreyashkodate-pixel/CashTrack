import { api } from './api';

export const expenseService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    
    const queryString = params.toString();
    return api.get(`/expenses${queryString ? `?${queryString}` : ''}`);
  },
  
  getSummary: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    
    const queryString = params.toString();
    return api.get(`/expenses/summary${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`)
};
