import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor: Attach Access Token
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  if (user && user.accessToken) {
    config.headers.Authorization = `Bearer ${user.accessToken}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Silent Background Refresh Token Execution
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and not already retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const user = JSON.parse(localStorage.getItem('userInfo'));

      if (user && user.refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            token: user.refreshToken,
          });

          if (res.data.success) {
            user.accessToken = res.data.accessToken;
            localStorage.setItem('userInfo', JSON.stringify(user));
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
            return API(originalRequest); // Retry original request
          }
        } catch (refreshErr) {
          // Token refresh failed -> Clear session and redirect to login
          localStorage.removeItem('userInfo');
          window.location.href = '/auth';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
