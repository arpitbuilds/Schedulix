import axios from "axios";
import { getToken, clearAuth } from "../auth/storage.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const http = axios.create({
  baseURL: API_URL,
  timeout: 20000
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;

    // Token expired/invalid -> clear local auth
    if (status === 401) {
      clearAuth();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export function apiErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong"
  );
}
