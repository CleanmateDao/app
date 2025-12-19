import axios from "axios";

export const kycClient = axios.create({
  baseURL: import.meta.env.VITE_KYC_SERVICE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 90000,
});
