import {
  useDAppKitWallet,
  useSendTransaction,
  useTransactionModal,
} from "@vechain/vechain-kit";
import { ABIContract, Address, Clause, VET } from "@vechain/sdk-core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CONTRACT_ADDRESSES } from "@/contracts/config";
import { UserRegistryABI } from "@/contracts/abis/UserRegistry.abi";
import { CleanupFactoryABI } from "@/contracts/abis/CleanupFactory.abi";
import { CleanupABI } from "@/contracts/abis/Cleanup.abi";
import { RewardsManagerABI } from "@/contracts/abis/RewardsManager.abi";
import { subgraphKeys } from "../subgraph/queries";

// Helper to create contract instance
function createContract(abi: readonly any[], address: string) {
  // ABIContract accepts Address or string
  try {
    // Try using Address.fromString if available, otherwise use string directly
    const addressObj =
      typeof Address.fromString === "function"
        ? Address.fromString(address)
        : address;
    return new ABIContract(abi as any, addressObj);
  } catch {
    // Fallback: use string directly if Address methods don't work
    return new ABIContract(abi as any, address as any);
  }
}

// UserRegistry Mutations
export function useRegisterUser() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { metadata: string; email: string }) => {
      if (!account) throw new Error("Wallet not connected");
      if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
        throw new Error("UserRegistry address not configured");
      }

      const contract = createContract(
        UserRegistryABI,
        CONTRACT_ADDRESSES.USER_REGISTRY
      );
      const clause = contract.function("registerUser", [params]);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
      toast.success("User registered successfully");
    },
    onError: (error: Error) => {
      toast.error(`Registration failed: ${error.message}`);
    },
  });
}

export function useRegisterWithReferral() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      metadata: string;
      email: string;
      referralCode: string;
    }) => {
      if (!account) throw new Error("Wallet not connected");
      if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
        throw new Error("UserRegistry address not configured");
      }

      const contract = createContract(
        UserRegistryABI,
        CONTRACT_ADDRESSES.USER_REGISTRY
      );
      const clause = contract.function("registerWithReferral", [params]);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
      toast.success("User registered with referral successfully");
    },
    onError: (error: Error) => {
      toast.error(`Registration failed: ${error.message}`);
    },
  });
}

export function useUpdateProfile() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metadata: string) => {
      if (!account) throw new Error("Wallet not connected");
      if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
        throw new Error("UserRegistry address not configured");
      }

      const contract = createContract(
        UserRegistryABI,
        CONTRACT_ADDRESSES.USER_REGISTRY
      );
      const clause = contract.function("updateProfile", [metadata]);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Profile update failed: ${error.message}`);
    },
  });
}

export function useUpdateEmail() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      if (!account) throw new Error("Wallet not connected");
      if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
        throw new Error("UserRegistry address not configured");
      }

      const contract = createContract(
        UserRegistryABI,
        CONTRACT_ADDRESSES.USER_REGISTRY
      );
      const clause = contract.function("updateEmail", [email]);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
      toast.success("Email updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Email update failed: ${error.message}`);
    },
  });
}

export function useSetOnboardingData() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ipfsHash: string) => {
      if (!account) throw new Error("Wallet not connected");
      if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
        throw new Error("UserRegistry address not configured");
      }

      const contract = createContract(
        UserRegistryABI,
        CONTRACT_ADDRESSES.USER_REGISTRY
      );
      const clause = contract.function("setOnboardingData", [{ ipfsHash }]);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
      toast.success("Onboarding data saved successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save onboarding data: ${error.message}`);
    },
  });
}

export function useSetReferralCode() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (referralCode: string) => {
      if (!account) throw new Error("Wallet not connected");
      if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
        throw new Error("UserRegistry address not configured");
      }

      const contract = createContract(
        UserRegistryABI,
        CONTRACT_ADDRESSES.USER_REGISTRY
      );
      const clause = contract.function("setReferralCode", [referralCode]);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
      toast.success("Referral code set successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to set referral code: ${error.message}`);
    },
  });
}

export function useAddTeamMember() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      member: string;
      canEditCleanups: boolean;
      canManageParticipants: boolean;
      canSubmitProof: boolean;
    }) => {
      if (!account) throw new Error("Wallet not connected");
      if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
        throw new Error("UserRegistry address not configured");
      }

      const contract = createContract(
        UserRegistryABI,
        CONTRACT_ADDRESSES.USER_REGISTRY
      );
      const clause = contract.function("addTeamMember", [params]);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
      toast.success("Team member added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add team member: ${error.message}`);
    },
  });
}

export function useRemoveTeamMember() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (member: string) => {
      if (!account) throw new Error("Wallet not connected");
      if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
        throw new Error("UserRegistry address not configured");
      }

      const contract = createContract(
        UserRegistryABI,
        CONTRACT_ADDRESSES.USER_REGISTRY
      );
      const clause = contract.function("removeTeamMember", [member]);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
      toast.success("Team member removed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove team member: ${error.message}`);
    },
  });
}

export function useMarkKYCPending() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!account) throw new Error("Wallet not connected");
      if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
        throw new Error("UserRegistry address not configured");
      }

      const contract = createContract(
        UserRegistryABI,
        CONTRACT_ADDRESSES.USER_REGISTRY
      );
      const clause = contract.function("markKYCPending", []);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
      toast.success("KYC status updated to pending");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update KYC status: ${error.message}`);
    },
  });
}

// CleanupFactory Mutations
export function useCreateCleanup() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      metadata: string;
      category: string;
      location: {
        address_: string;
        city: string;
        country: string;
        latitude: number;
        longitude: number;
      };
      date: number;
      startTime: number;
      endTime: number;
      maxParticipants: number;
    }) => {
      if (!account) throw new Error("Wallet not connected");
      if (!CONTRACT_ADDRESSES.CLEANUP_FACTORY) {
        throw new Error("CleanupFactory address not configured");
      }

      const contract = createContract(
        CleanupFactoryABI,
        CONTRACT_ADDRESSES.CLEANUP_FACTORY
      );
      const clause = contract.function("createCleanup", [params]);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.cleanups() });
      toast.success("Cleanup created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create cleanup: ${error.message}`);
    },
  });
}

// Cleanup Mutations (individual cleanup contract)
export function useApplyToCleanup() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cleanupAddress: string) => {
      if (!account) throw new Error("Wallet not connected");

      const contract = createContract(CleanupABI, cleanupAddress);
      const clause = contract.function("applyToCleanup", []);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: (_, cleanupAddress) => {
      queryClient.invalidateQueries({
        queryKey: subgraphKeys.cleanup(cleanupAddress),
      });
      queryClient.invalidateQueries({ queryKey: subgraphKeys.cleanups() });
      toast.success("Application submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to apply: ${error.message}`);
    },
  });
}

export function useAcceptParticipant() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cleanupAddress,
      participant,
    }: {
      cleanupAddress: string;
      participant: string;
    }) => {
      if (!account) throw new Error("Wallet not connected");

      const contract = createContract(CleanupABI, cleanupAddress);
      const clause = contract.function("acceptParticipant", [participant]);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: (_, { cleanupAddress }) => {
      queryClient.invalidateQueries({
        queryKey: subgraphKeys.cleanup(cleanupAddress),
      });
      toast.success("Participant accepted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to accept participant: ${error.message}`);
    },
  });
}

export function useRejectParticipant() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cleanupAddress,
      participant,
    }: {
      cleanupAddress: string;
      participant: string;
    }) => {
      if (!account) throw new Error("Wallet not connected");

      const contract = createContract(CleanupABI, cleanupAddress);
      const clause = contract.function("rejectParticipant", [participant]);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: (_, { cleanupAddress }) => {
      queryClient.invalidateQueries({
        queryKey: subgraphKeys.cleanup(cleanupAddress),
      });
      toast.success("Participant rejected");
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject participant: ${error.message}`);
    },
  });
}

export function useUpdateCleanupStatus() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cleanupAddress,
      newStatus,
    }: {
      cleanupAddress: string;
      newStatus: number; // 0=UNPUBLISHED, 1=OPEN, 2=IN_PROGRESS, 3=COMPLETED, 4=REWARDED
    }) => {
      if (!account) throw new Error("Wallet not connected");

      const contract = createContract(CleanupABI, cleanupAddress);
      const clause = contract.function("updateCleanupStatus", [newStatus]);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: (_, { cleanupAddress }) => {
      queryClient.invalidateQueries({
        queryKey: subgraphKeys.cleanup(cleanupAddress),
      });
      queryClient.invalidateQueries({ queryKey: subgraphKeys.cleanups() });
      toast.success("Cleanup status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}

export function usePublishCleanup() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cleanupAddress: string) => {
      if (!account) throw new Error("Wallet not connected");

      const contract = createContract(CleanupABI, cleanupAddress);
      const clause = contract.function("publishCleanup", []);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: (_, cleanupAddress) => {
      queryClient.invalidateQueries({
        queryKey: subgraphKeys.cleanup(cleanupAddress),
      });
      queryClient.invalidateQueries({ queryKey: subgraphKeys.cleanups() });
      toast.success("Cleanup published successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish cleanup: ${error.message}`);
    },
  });
}

export function useUnpublishCleanup() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cleanupAddress: string) => {
      if (!account) throw new Error("Wallet not connected");

      const contract = createContract(CleanupABI, cleanupAddress);
      const clause = contract.function("unpublishCleanup", []);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: (_, cleanupAddress) => {
      queryClient.invalidateQueries({
        queryKey: subgraphKeys.cleanup(cleanupAddress),
      });
      queryClient.invalidateQueries({ queryKey: subgraphKeys.cleanups() });
      toast.success("Cleanup unpublished successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to unpublish cleanup: ${error.message}`);
    },
  });
}

export function useSubmitProofOfWork() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cleanupAddress,
      ipfsHashes,
      mimetypes,
    }: {
      cleanupAddress: string;
      ipfsHashes: string[];
      mimetypes: string[];
    }) => {
      if (!account) throw new Error("Wallet not connected");
      if (ipfsHashes.length !== mimetypes.length) {
        throw new Error(
          "IPFS hashes and mimetypes arrays must have the same length"
        );
      }
      if (ipfsHashes.length < 10) {
        throw new Error("At least 10 proof media items are required");
      }

      const contract = createContract(CleanupABI, cleanupAddress);
      const clause = contract.function("submitProofOfWork", [
        { ipfsHashes, mimetypes },
      ]);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: (_, { cleanupAddress }) => {
      queryClient.invalidateQueries({
        queryKey: subgraphKeys.cleanup(cleanupAddress),
      });
      toast.success("Proof of work submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit proof: ${error.message}`);
    },
  });
}

export function useSetSettingsData() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ipfsHash: string) => {
      if (!account) throw new Error("Wallet not connected");
      if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
        throw new Error("UserRegistry address not configured");
      }

      const contract = createContract(
        UserRegistryABI,
        CONTRACT_ADDRESSES.USER_REGISTRY
      );
      const clause = contract.function("setSettingsData", [{ ipfsHash }]);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
      toast.success("Settings saved successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save settings: ${error.message}`);
    },
  });
}

// RewardsManager Mutations
export function useClaimRewards() {
  const { account } = useDAppKitWallet();
  const { sendTransaction } = useSendTransaction();
  const { openTransactionModal } = useTransactionModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
    }: {
      amount: string; // BigNumber string
    }) => {
      if (!account) throw new Error("Wallet not connected");
      if (!CONTRACT_ADDRESSES.REWARDS_MANAGER) {
        throw new Error("RewardsManager address not configured");
      }

      const contract = createContract(
        RewardsManagerABI,
        CONTRACT_ADDRESSES.REWARDS_MANAGER
      );
      const clause = contract.function("claimRewards", [{ amount }]);

      const txId = await sendTransaction([clause]);
      openTransactionModal(txId);

      return txId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.rewards() });
      toast.success("Rewards claimed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to claim rewards: ${error.message}`);
    },
  });
}
