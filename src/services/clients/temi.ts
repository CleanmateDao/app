import axios from "axios";

export const temiClient = axios.create({
  baseURL: import.meta.env.VITE_TEMI_SERCIVE_API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_TEMI_SERCIVE_API_KEY,
  },
  timeout: 10000,
});
