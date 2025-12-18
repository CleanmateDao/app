import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { kycClient } from "../clients/kyc";

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country: string;
  zipCode?: string;
}

export interface KYCSubmissionData {
  userId: string;
  walletAddress?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
  documentType: "passport" | "national_id" | "drivers_license" | "other";
  documentNumber?: string;
  address?: Address;
  metadata?: Record<string, unknown>;
  files?: File[];
}

export interface KYCSubmissionResponse {
  submissionId: string;
  userId: string;
  mediaUrls: string[];
  submittedAt: string;
}

/**
 * Submit KYC data to KYC service with file uploads
 */
async function submitKYCToAPI(
  data: KYCSubmissionData
): Promise<KYCSubmissionResponse> {
  try {
    const formData = new FormData();

    // Append all text fields
    formData.append("userId", data.userId);
    if (data.walletAddress) {
      formData.append("walletAddress", data.walletAddress);
    }
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    if (data.phoneNumber) {
      formData.append("phoneNumber", data.phoneNumber);
    }
    if (data.dateOfBirth) {
      formData.append("dateOfBirth", data.dateOfBirth);
    }
    if (data.nationality) {
      formData.append("nationality", data.nationality);
    }
    formData.append("documentType", data.documentType);
    if (data.documentNumber) {
      formData.append("documentNumber", data.documentNumber);
    }

    // Append address if provided (using bracket notation for nested objects)
    if (data.address) {
      formData.append("address[country]", data.address.country);
      if (data.address.street) {
        formData.append("address[street]", data.address.street);
      }
      if (data.address.city) {
        formData.append("address[city]", data.address.city);
      }
      if (data.address.state) {
        formData.append("address[state]", data.address.state);
      }
      if (data.address.zipCode) {
        formData.append("address[zipCode]", data.address.zipCode);
      }
    }

    // Append metadata if provided
    if (data.metadata) {
      formData.append("metadata", JSON.stringify(data.metadata));
    }

    // Append files
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await kycClient.post<KYCSubmissionResponse>(
      `/kyc/submit`,
      formData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to submit KYC data"
      );
    }
    throw error;
  }
}

/**
 * React hook for submitting KYC data to KYC service
 */
export function useSubmitKYCToAPI() {
  return useMutation({
    mutationFn: submitKYCToAPI,
    onError: (error: Error) => {
      toast.error(`KYC submission failed: ${error.message}`);
    },
  });
}
