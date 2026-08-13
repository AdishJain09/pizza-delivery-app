import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const userApi = axios.create({ baseURL: API_BASE_URL });
export const adminApi = axios.create({ baseURL: API_BASE_URL });

userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});