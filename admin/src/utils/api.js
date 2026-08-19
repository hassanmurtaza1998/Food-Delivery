import axios from "axios";
import { toast } from "react-toastify";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const api = axios.create({ baseURL: BACKEND_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.token = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      toast.error("Session expired, please login again");
      window.location.href = "/";
    } else if (!error.response) {
      toast.error("Network error, please try again");
    }
    return Promise.reject(error);
  }
);

export default api;
