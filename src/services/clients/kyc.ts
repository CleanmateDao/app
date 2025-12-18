import axios from "axios";

export const kycClient = axios.create({
  baseURL: import.meta.env.VITE_KYC_SERCIVE_API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_KYC_SERCIVE_API_KEY,
  },
  timeout: 10000,
});
