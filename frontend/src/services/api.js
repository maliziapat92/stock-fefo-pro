import axios from "axios";

const api = axios.create({
  baseURL: "https://web-production-af7274.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
