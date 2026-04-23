import axios from "axios";

// Konfigurasi global
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  // baseURL: "https://test.rsudjatisampurna.com/api",
  withCredentials: true, // wajib untuk Sanctum
});

export default api;