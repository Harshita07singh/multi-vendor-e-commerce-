// utils/axiosInstance.js  ← Frontend mein ye file banao
// Ye automatically access token refresh kar dega bina user ko relogin karaye

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // cookies send karne ke liye (refreshToken cookie)
});

// ✅ Har request mein latest accessToken attach karo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ 401 aaye toh auto-refresh karo, ek baar retry karo
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response, // success → seedha return

  async (error) => {
    const originalRequest = error.config;
    const code = error.response?.data?.code;

    // Only retry on TOKEN_EXPIRED, not on wrong password etc.
    if (
      error.response?.status === 401 &&
      code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // Agar already refresh ho raha hai toh queue mein daal do
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
        // ✅ Refresh token se naya access token lo
        const { data } = await axios.post(
          "http://localhost:3000/api/users/refresh",
          {},
          { withCredentials: true },
        );

        const newToken = data.accessToken;
        localStorage.setItem("accessToken", newToken);

        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest); // ✅ Original request retry karo
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh bhi fail → ab sirf tab relogin
        localStorage.removeItem("accessToken");
        window.location.href = "/login"; // ya apna route
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
