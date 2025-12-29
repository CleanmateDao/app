import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { bankClient } from "../clients/bank";

export interface NonceResponse {
  success: boolean;
  data?: {
    nonce: string;
  };
  message?: string;
}

/**
 * Get nonce for a wallet address for permit signature
 */
export async function getNonce(walletAddress: string): Promise<string> {
  try {
    const response = await bankClient.get<NonceResponse>(`/api/banks/nonce`, {
      params: { walletAddress },
    });

    if (response.data.success && response.data.data) {
      return response.data.data.nonce;
    }

    throw new Error(response.data.message || "Failed to get nonce");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to get nonce"
      );
    }
    throw error;
  }
}

/**
 * React hook for getting nonce
 */
export function useNonce(walletAddress: string | undefined) {
  return useQuery({
    queryKey: ["nonce", walletAddress],
    queryFn: () => getNonce(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 0, // Always fetch fresh nonce to prevent replay attacks
  });
}

