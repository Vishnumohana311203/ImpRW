import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // backend port
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

export default api;