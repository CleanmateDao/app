import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const BANK_SERVICE_URL =
  import.meta.env.VITE_BANK_SERVICE_URL || "https://api.cleanmate.app";

export interface ClaimWithPermitRequest {
  userId: string;
  walletAddress: string;
  amount: string;
  bankId: string;
  permit: {
    deadline: number;
    v: number;
    r: string;
    s: string;
  };
}

export interface ClaimWithPermitResponse {
  success: boolean;
  data?: {
    transactionHash: string;
    transferReference: string;
    convertedAmount: number;
    currency: string;
  };
  message?: string;
}

/**
 * Claim rewards with permit signature via bank service
 */
async function claimWithPermit(
  data: ClaimWithPermitRequest
): Promise<ClaimWithPermitResponse["data"]> {
  try {
    const response = await axios.post<ClaimWithPermitResponse>(
      `${BANK_SERVICE_URL}/api/banks/claim`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to claim rewards");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to claim rewards"
      );
    }
    throw error;
  }
}

/**
 * React hook for claiming rewards with permit
 */
export function useClaimRewardsWithPermit() {
  return useMutation({
    mutationFn: claimWithPermit,
    onSuccess: (data) => {
      toast.success(
        `Successfully claimed rewards! ${data.convertedAmount} ${data.currency} sent to your bank account.`
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to claim rewards: ${error.message}`);
    },
  });
}
