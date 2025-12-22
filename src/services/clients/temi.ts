import axios from "axios";

export const temiClient = axios.create({
  baseURL: import.meta.env.VITE_TEMI_SERVICE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});
