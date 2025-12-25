import axios from "axios";

export const bankClient = axios.create({
  baseURL: import.meta.env.VITE_BANK_SERCIVE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 90000,
});
