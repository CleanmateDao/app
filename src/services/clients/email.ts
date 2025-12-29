import axios from "axios";

export const emailClient = axios.create({
  baseURL: import.meta.env.VITE_EMAIL_SERVICE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});
