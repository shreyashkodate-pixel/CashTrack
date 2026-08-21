const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      
      const errorMessage = errorData.message || response.statusText;
      throw new ApiError(errorMessage, response.status, errorData);
    }

    if (response.status === 204) {
      return null; // No content
    }

    return await response.json();
  } catch (error) {
    console.error(`API Fetch Error [${options.method || 'GET'} ${url}]:`, error);
    throw error;
  }
};

export const api = {
  get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
  post: (endpoint, body) => apiFetch(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => apiFetch(endpoint, { method: 'PUT', body }),
  delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' })
};
