import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { bankClient } from "../clients/bank";

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
    const response = await bankClient.post<ClaimWithPermitResponse>(
      `/banks/claim`,
      data
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
