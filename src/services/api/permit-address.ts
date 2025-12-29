import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { bankClient } from "../clients/bank";

export interface PermitAddressResponse {
  success: boolean;
  data?: {
    rewardsManagerAddress: string;
    spenderAddress: string;
    chainId?: string;
  };
  message?: string;
}

/**
 * Fetch permit address information from the API
 * Returns the address that should be used as the spender in permit signatures
 */
async function getPermitAddress(): Promise<PermitAddressResponse["data"]> {
  try {
    const response = await bankClient.get<PermitAddressResponse>(
      `/api/banks/permit-address`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to fetch permit address");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch permit address"
      );
    }
    throw error;
  }
}

/**
 * React hook for fetching permit address information
 */
export function usePermitAddress() {
  return useQuery({
    queryKey: ["permit-address"],
    queryFn: getPermitAddress,
    staleTime: 1000 * 60 * 60, // 1 hour (addresses don't change frequently)
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
