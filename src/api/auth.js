import axios from "axios";

// Konfigurasi global
const api = axios.create({
  baseURL: "http://localhost:8000",
  // baseURL: "https://test.rsudjatisampurna.com",
  withCredentials: true, // wajib untuk Sanctum
});

export default api;
