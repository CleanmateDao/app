import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const EMAIL_SERVICE_URL = import.meta.env.VITE_EMAIL_SERVICE_URL || "http://localhost:3000";

export interface RequestVerificationCodeRequest {
  email: string;
  walletAddress: string;
}

export interface RequestVerificationCodeResponse {
  success: boolean;
  message: string;
  expiresAt: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
  walletAddress: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  message: string;
  transactionHash?: string;
}

/**
 * Request email verification code
 */
async function requestVerificationCode(
  data: RequestVerificationCodeRequest
): Promise<RequestVerificationCodeResponse> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const response = await axios.post<RequestVerificationCodeResponse>(
      `${EMAIL_SERVICE_URL}/email-verification/request`,
      data,
      { headers }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        "Failed to request verification code"
      );
    }
    throw error;
  }
}

/**
 * Verify email verification code
 */
async function verifyCode(
  data: VerifyCodeRequest
): Promise<VerifyCodeResponse> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const response = await axios.post<VerifyCodeResponse>(
      `${EMAIL_SERVICE_URL}/email-verification/verify`,
      data,
      { headers }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        "Failed to verify code"
      );
    }
    throw error;
  }
}

/**
 * Regenerate email verification code
 */
async function regenerateCode(
  data: RequestVerificationCodeRequest
): Promise<RequestVerificationCodeResponse> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const response = await axios.post<RequestVerificationCodeResponse>(
      `${EMAIL_SERVICE_URL}/email-verification/regenerate`,
      data,
      { headers }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        "Failed to regenerate verification code"
      );
    }
    throw error;
  }
}

/**
 * React hook for requesting email verification code
 */
export function useRequestVerificationCode() {
  return useMutation({
    mutationFn: requestVerificationCode,
    onSuccess: () => {
      toast.success("Verification code sent to your email");
    },
    onError: (error: Error) => {
      toast.error(`Failed to send verification code: ${error.message}`);
    },
  });
}

/**
 * React hook for verifying email code
 */
export function useVerifyEmailCode() {
  return useMutation({
    mutationFn: verifyCode,
    onSuccess: () => {
      toast.success("Email verified successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to verify email: ${error.message}`);
    },
  });
}

/**
 * React hook for regenerating email verification code
 */
export function useRegenerateVerificationCode() {
  return useMutation({
    mutationFn: regenerateCode,
    onSuccess: () => {
      toast.success("New verification code sent to your email");
    },
    onError: (error: Error) => {
      toast.error(`Failed to regenerate verification code: ${error.message}`);
    },
  });
}

