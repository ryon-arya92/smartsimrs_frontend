import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "http://localhost:8000",
  // baseURL: "https://test.rsudjatisampurna.com",
  // baseURL: "http://103.24.149.108",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("XSRF-TOKEN");
  if (token) {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
  }
  return config;
});

export default api;
