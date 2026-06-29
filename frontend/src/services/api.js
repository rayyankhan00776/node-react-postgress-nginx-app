import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Inject JWT Access Token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Capture 401s, Refresh token silently, and Retry original request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the server returns 401 Unauthorized and we haven't retried yet
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('Refresh token is missing from storage');
        }

        // Invoke refresh using direct axios instance to prevent loop
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';
        const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, {
          refreshToken
        });

        if (refreshResponse.data?.status === 'success') {
          const { accessToken, refreshToken: newRefreshToken, user } = refreshResponse.data.data;

          // Store new tokens
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          }

          // Update header and reissue request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        // Token refresh failed - wipe credentials and fire logout event
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth_logout'));
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
