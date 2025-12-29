import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { kycClient } from "../clients/kyc";

export interface KYCSubmissionData {
  userId: string;
  walletAddress?: string;
  documentType: "national_id_card" | "voters_card" | "drivers_license" | "passport";
  documentNumber?: string;
  metadata?: Record<string, unknown>;
  files?: File[];
}

export interface KYCSubmissionResponse {
  submissionId: string;
  userId: string;
  mediaUrls: string[];
  submittedAt: string;
}

export interface KYCSubmissionDetails {
  submissionId: string;
  userId: string;
  walletAddress?: string;
  documentType: string;
  documentNumber?: string;
  status: string;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
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
    formData.append("documentType", data.documentType);
    if (data.documentNumber) {
      formData.append("documentNumber", data.documentNumber);
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

    // When sending FormData, we need to let axios automatically set Content-Type to multipart/form-data with boundary
    // The default application/json header from kycClient would interfere, so we create a custom config
    const response = await kycClient.post<KYCSubmissionResponse>(
      `/kyc/submit`,
      formData,
      {
        transformRequest: [
          (data, headers) => {
            // Remove Content-Type header to let axios set it automatically with boundary for FormData
            delete headers['Content-Type'];
            return data;
          },
        ],
      }
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

/**
 * Get KYC submission details by userId
 */
async function getKYCSubmissionByUserId(
  userId: string
): Promise<KYCSubmissionDetails | null> {
  try {
    const response = await kycClient.get<KYCSubmissionDetails | null>(
      `/kyc/submission/${userId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch KYC submission"
      );
    }
    throw error;
  }
}

/**
 * React hook for fetching KYC submission details by userId
 */
export function useKYCSubmission(userId: string | null) {
  return useQuery({
    queryKey: ["kyc-submission", userId],
    queryFn: () => (userId ? getKYCSubmissionByUserId(userId) : null),
    enabled: !!userId,
  });
}
