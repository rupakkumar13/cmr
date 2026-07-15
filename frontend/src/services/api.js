import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true, // Crucial for sending and receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// We will inject the store dynamically to avoid circular dependencies
let store;
export const injectStore = (_store) => {
  store = _store;
};

// Request Interceptor: Attach Access Token from Redux state
api.interceptors.request.use(
  (config) => {
    if (store) {
      const state = store.getState();
      const token = state.auth?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token refresh on 401 (Unauthorized)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't retried this request yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If it's a login request that failed, don't try to refresh
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh-token')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue the request while waiting for token refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Send request to rotate refresh tokens (HTTP-only cookie sent automatically)
        const response = await axios.post(
          `${api.defaults.baseURL}/api/v1/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;

        if (store) {
          // Update Redux state with new access token
          store.dispatch({
            type: 'auth/refreshTokenSuccess',
            payload: accessToken,
          });
        }

        processQueue(null, accessToken);
        
        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        if (store) {
          // Log out user if refresh token is expired or invalid
          store.dispatch({ type: 'auth/logout' });
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
