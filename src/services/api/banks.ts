import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { type SupportedCurrencyCode } from "@/constants/supported";
import { bankClient } from "../clients/bank";

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: SupportedCurrencyCode;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBankAccountRequest {
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: SupportedCurrencyCode;
  isDefault?: boolean;
}

export interface CreateBankAccountResponse {
  success: boolean;
  message?: string;
  data?: BankAccount;
}

export interface GetBanksResponse {
  success: boolean;
  data?: BankAccount[];
  message?: string;
}

export interface PaystackBank {
  id: number;
  name: string;
  code: string;
  currency: string;
  country: string;
}

export interface GetBanksListResponse {
  success: boolean;
  data?: PaystackBank[];
  message?: string;
}

export interface SetDefaultBankResponse {
  success: boolean;
  data?: BankAccount;
  message?: string;
}

export interface DeleteBankResponse {
  success: boolean;
  message?: string;
}

/**
 * Fetch all bank accounts for the current user
 */
async function getBanks(userId: string): Promise<BankAccount[]> {
  try {
    const response = await bankClient.get<GetBanksResponse>(
      `/banks?userId=${userId}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to fetch banks");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch bank accounts"
      );
    }
    throw error;
  }
}

/**
 * Fetch banks list by currency from Paystack (1 day cache)
 */
async function getBanksListByCurrency(
  currency: SupportedCurrencyCode
): Promise<PaystackBank[]> {
  try {
    const response = await bankClient.get<GetBanksListResponse>(
      `/banks/list/${currency}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to fetch banks list");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch banks list"
      );
    }
    throw error;
  }
}

/**
 * Create a new bank account
 */
async function createBankAccount(
  data: CreateBankAccountRequest & { userId: string }
): Promise<BankAccount> {
  try {
    const response = await bankClient.post<CreateBankAccountResponse>(
      `/banks`,
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to create bank account");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create bank account"
      );
    }
    throw error;
  }
}

/**
 * Delete a bank account
 */
async function deleteBankAccount(id: string, userId: string): Promise<void> {
  try {
    const response = await bankClient.delete<DeleteBankResponse>(
      `/banks/${id}?userId=${userId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete bank account");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete bank account"
      );
    }
    throw error;
  }
}

/**
 * Set a bank account as default
 */
async function setDefaultBankAccount(
  id: string,
  userId: string
): Promise<BankAccount> {
  try {
    const response = await bankClient.patch<SetDefaultBankResponse>(
      `/banks/${id}/default?userId=${userId}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(
      response.data.message || "Failed to set default bank account"
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to set default bank account"
      );
    }
    throw error;
  }
}

/**
 * React hook for fetching bank accounts
 */
export function useBanks(userId: string | undefined) {
  return useQuery({
    queryKey: ["banks", userId],
    queryFn: () => getBanks(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * React hook for fetching banks list by currency (1 day cache)
 */
export function useBanksListByCurrency(currency: SupportedCurrencyCode) {
  return useQuery({
    queryKey: ["banks-list", currency],
    queryFn: () => getBanksListByCurrency(currency),
    staleTime: 1000 * 60 * 60 * 24, // 1 day
    gcTime: 1000 * 60 * 60 * 24 * 2, // 2 days
  });
}

/**
 * React hook for creating a bank account
 */
export function useCreateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      toast.success("Bank account added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add bank account: ${error.message}`);
    },
  });
}

/**
 * React hook for deleting a bank account
 */
export function useDeleteBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      deleteBankAccount(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      toast.success("Bank account deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete bank account: ${error.message}`);
    },
  });
}

/**
 * React hook for setting default bank account
 */
export function useSetDefaultBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      setDefaultBankAccount(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      toast.success("Default bank account updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to set default bank account: ${error.message}`);
    },
  });
}
