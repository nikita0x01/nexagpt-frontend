export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiFetch = (path, options = {}) => {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  return fetch(url, options);
};
