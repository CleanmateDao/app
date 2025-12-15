import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cleanmate.app";

export interface KYCSubmissionData {
  idType: "national_id" | "passport";
  idNumber: string;
  dateOfBirth: string; // ISO date string
  address: string;
  city: string;
  postalCode: string;
  country: string;
  walletAddress: string;
}

export interface KYCSubmissionResponse {
  success: boolean;
  message?: string;
  submissionId?: string;
}

/**
 * Submit KYC data to backend API
 */
async function submitKYCToAPI(data: KYCSubmissionData): Promise<KYCSubmissionResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/kyc/submit`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        "Failed to submit KYC data"
      );
    }
    throw error;
  }
}

/**
 * React hook for submitting KYC data to backend API
 */
export function useSubmitKYCToAPI() {
  return useMutation({
    mutationFn: submitKYCToAPI,
    onError: (error: Error) => {
      toast.error(`KYC submission failed: ${error.message}`);
    },
  });
}

