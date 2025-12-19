import axios from "axios";

export const emailClient = axios.create({
  baseURL: import.meta.env.VITE_EMAIL_SERCIVE_API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_EMAIL_SERCIVE_API_KEY,
  },
  timeout: 30000,
});
