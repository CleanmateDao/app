import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { emailClient } from "../clients/email";
import axios from "axios";

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
    const response = await emailClient.post<RequestVerificationCodeResponse>(
      `/email-verification/request`,
      data
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
    const response = await emailClient.post<VerifyCodeResponse>(
      `/email-verification/verify`,
      data
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
    const response = await emailClient.post<RequestVerificationCodeResponse>(
      `/email-verification/regenerate`,
      data
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
