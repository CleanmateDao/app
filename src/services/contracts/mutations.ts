import {
  useWallet,
  useSendTransaction,
  useTransactionModal,
} from "@vechain/vechain-kit";
import { ABIContract, Address, Clause } from "@vechain/sdk-core";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CONTRACT_ADDRESSES } from "@/contracts/config";
import { UserRegistryABI } from "@/contracts/abis/UserRegistry.abi";
import { CleanupFactoryABI } from "@/contracts/abis/CleanupFactory.abi";
import { CleanupABI } from "@/contracts/abis/Cleanup.abi";
import { RewardsManagerABI } from "@/contracts/abis/RewardsManager.abi";
import { StreakABI } from "@/contracts/abis/Streak.abi";
import { subgraphKeys } from "../subgraph/queries";
import type {
  RegisterUserParams,
  RegisterWithReferralParams,
  AddTeamMemberParams,
  CreateCleanupParams,
  SubmitProofOfWorkParams,
  ClaimRewardsParams,
  SubmitStreakParams,
} from "@/types/params";

// Helper to create a clause for a contract function call
function createClause(
  abi: readonly unknown[],
  address: string,
  functionName: string,
  params: unknown[]
) {
  return Clause.callFunction(
    Address.of(address),
    ABIContract.ofAbi(
      abi as Parameters<typeof ABIContract.ofAbi>[0]
    ).getFunction(functionName),
    params
  );
}

// UserRegistry Mutations
export function useRegisterUser() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const { open } = useTransactionModal();

  const {
    sendTransaction,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
      toast.success("User registered successfully");
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Registration failed: ${errorMessage}`);
    },
  });

  const execute = async (params: RegisterUserParams) => {
    if (!account) throw new Error("Wallet not connected");
    if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
      throw new Error("UserRegistry address not configured");
    }

    const clause = createClause(
      UserRegistryABI,
      CONTRACT_ADDRESSES.USER_REGISTRY,
      "registerUser",
      [params]
    );

    open();

    await sendTransaction([clause]);
  };

  return {
    sendTransaction: execute,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  };
}

export function useRegisterWithReferral() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const { open } = useTransactionModal();

  const {
    sendTransaction,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
      toast.success("User registered with referral successfully");
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Registration failed: ${errorMessage}`);
    },
  });

  const execute = async (params: RegisterWithReferralParams) => {
    if (!account) throw new Error("Wallet not connected");
    if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
      throw new Error("UserRegistry address not configured");
    }

    const clause = createClause(
      UserRegistryABI,
      CONTRACT_ADDRESSES.USER_REGISTRY,
      "registerWithReferral",
      [params]
    );

    open();

    await sendTransaction([clause]);
  };

  return {
    sendTransaction: execute,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  };
}

export function useUpdateProfile() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const { open } = useTransactionModal();

  const {
    sendTransaction,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
      toast.success("Profile updated successfully");
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Profile update failed: ${errorMessage}`);
    },
  });

  const execute = async (metadata: string) => {
    if (!account) throw new Error("Wallet not connected");
    if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
      throw new Error("UserRegistry address not configured");
    }

    const clause = createClause(
      UserRegistryABI,
      CONTRACT_ADDRESSES.USER_REGISTRY,
      "updateProfile",
      [metadata]
    );

    open();

    await sendTransaction([clause]);
  };

  return {
    sendTransaction: execute,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  };
}

export function useSetReferralCode() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const { open } = useTransactionModal();

  const {
    sendTransaction,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
      toast.success("Referral code set successfully");
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to set referral code: ${errorMessage}`);
    },
  });

  const execute = async (referralCode: string) => {
    if (!account) throw new Error("Wallet not connected");
    if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
      throw new Error("UserRegistry address not configured");
    }

    const clause = createClause(
      UserRegistryABI,
      CONTRACT_ADDRESSES.USER_REGISTRY,
      "setReferralCode",
      [referralCode]
    );

    open();

    await sendTransaction([clause]);
  };

  return {
    sendTransaction: execute,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  };
}

export function useAddTeamMember() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const { open } = useTransactionModal();

  const {
    sendTransaction,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
      toast.success("Team member added successfully");
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to add team member: ${errorMessage}`);
    },
  });

  const execute = async (params: AddTeamMemberParams) => {
    if (!account) throw new Error("Wallet not connected");
    if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
      throw new Error("UserRegistry address not configured");
    }

    const clause = createClause(
      UserRegistryABI,
      CONTRACT_ADDRESSES.USER_REGISTRY,
      "addTeamMember",
      [params]
    );

    open();

    await sendTransaction([clause]);
  };

  return {
    sendTransaction: execute,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  };
}

export function useRemoveTeamMember() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const { open } = useTransactionModal();

  const {
    sendTransaction,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
      toast.success("Team member removed successfully");
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to remove team member: ${errorMessage}`);
    },
  });

  const execute = async (member: string) => {
    if (!account) throw new Error("Wallet not connected");
    if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
      throw new Error("UserRegistry address not configured");
    }

    const clause = createClause(
      UserRegistryABI,
      CONTRACT_ADDRESSES.USER_REGISTRY,
      "removeTeamMember",
      [member]
    );

    open();

    await sendTransaction([clause]);
  };

  return {
    sendTransaction: execute,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  };
}

export function useMarkKYCPending() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const { open } = useTransactionModal();

  const {
    sendTransaction,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
      toast.success("KYC status updated to pending");
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to update KYC status: ${errorMessage}`);
    },
  });

  const execute = async () => {
    if (!account) throw new Error("Wallet not connected");
    if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
      throw new Error("UserRegistry address not configured");
    }

    const clause = createClause(
      UserRegistryABI,
      CONTRACT_ADDRESSES.USER_REGISTRY,
      "markKYCPending",
      []
    );

    open();

    await sendTransaction([clause]);
  };

  return {
    sendTransaction: execute,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  };
}

// CleanupFactory Mutations
export function useCreateCleanup() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const { open } = useTransactionModal();

  const {
    sendTransaction,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.cleanups() });
      toast.success("Cleanup created successfully");
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to create cleanup: ${errorMessage}`);
    },
  });

  const execute = async (params: CreateCleanupParams) => {
    if (!account) throw new Error("Wallet not connected");
    if (!CONTRACT_ADDRESSES.CLEANUP_FACTORY) {
      throw new Error("CleanupFactory address not configured");
    }

    // Convert string timestamps and maxParticipants to the format expected by the contract
    const contractParams: CreateCleanupParams = {
      metadata: params.metadata,
      category: params.category,
      location: params.location,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
      maxParticipants: params.maxParticipants,
    };

    const clause = createClause(
      CleanupFactoryABI,
      CONTRACT_ADDRESSES.CLEANUP_FACTORY,
      "createCleanup",
      [contractParams]
    );

    open();

    await sendTransaction([clause]);
  };

  return {
    sendTransaction: execute,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  };
}

// Cleanup Mutations (individual cleanup contract)
export function useApplyToCleanup() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const { open } = useTransactionModal();

  const {
    sendTransaction,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      // Note: cleanupAddress needs to be passed via closure or ref
      // This will be handled by the execute function
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to apply: ${errorMessage}`);
    },
  });

  const execute = async (cleanupAddress: string) => {
    if (!account) throw new Error("Wallet not connected");

    const clause = createClause(
      CleanupABI,
      cleanupAddress,
      "applyToCleanup",
      []
    );

    open();

    await sendTransaction([clause]);

    // Invalidate queries after successful transaction
    queryClient.invalidateQueries({
      queryKey: subgraphKeys.cleanup(cleanupAddress),
    });
    queryClient.invalidateQueries({ queryKey: subgraphKeys.cleanups() });
    toast.success("Application submitted successfully");
  };

  return {
    sendTransaction: execute,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  };
}

export function useAcceptParticipant() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const { open } = useTransactionModal();

  const {
    sendTransaction,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      // Handled in execute function
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to accept participant: ${errorMessage}`);
    },
  });

  const execute = async ({
    cleanupAddress,
    participant,
  }: {
    cleanupAddress: string;
    participant: string;
  }) => {
    if (!account) throw new Error("Wallet not connected");

    const clause = createClause(
      CleanupABI,
      cleanupAddress,
      "acceptParticipant",
      [participant]
    );

    open();

    await sendTransaction([clause]);

    queryClient.invalidateQueries({
      queryKey: subgraphKeys.cleanup(cleanupAddress),
    });
    toast.success("Participant accepted successfully");
  };

  return {
    sendTransaction: execute,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  };
}

export function useRejectParticipant() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const { open } = useTransactionModal();

  const {
    sendTransaction,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      // Handled in execute function
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to reject participant: ${errorMessage}`);
    },
  });

  const execute = async ({
    cleanupAddress,
    participant,
  }: {
    cleanupAddress: string;
    participant: string;
  }) => {
    if (!account) throw new Error("Wallet not connected");

    const clause = createClause(
      CleanupABI,
      cleanupAddress,
      "rejectParticipant",
      [participant]
    );

    open();

    await sendTransaction([clause]);

    queryClient.invalidateQueries({
      queryKey: subgraphKeys.cleanup(cleanupAddress),
    });
    toast.success("Participant rejected");
  };

  return {
    sendTransaction: execute,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  };
}

export function useUpdateCleanupStatus() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const { open } = useTransactionModal();

  const {
    sendTransaction,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      // Handled in execute function
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to update status: ${errorMessage}`);
    },
  });

  const execute = async ({
    cleanupAddress,
    newStatus,
  }: {
    cleanupAddress: string;
    newStatus: number; // 0=UNPUBLISHED, 1=OPEN, 2=IN_PROGRESS, 3=COMPLETED, 4=REWARDED
  }) => {
    if (!account) throw new Error("Wallet not connected");

    const clause = createClause(
      CleanupABI,
      cleanupAddress,
      "updateCleanupStatus",
      [newStatus]
    );

    open();

    await sendTransaction([clause]);

    queryClient.invalidateQueries({
      queryKey: subgraphKeys.cleanup(cleanupAddress),
    });
    queryClient.invalidateQueries({ queryKey: subgraphKeys.cleanups() });
    toast.success("Cleanup status updated successfully");
  };

  return {
    sendTransaction: execute,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  };
}

export function useSubmitProofOfWork() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const { open } = useTransactionModal();

  const {
    sendTransaction,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      // Handled in execute function
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to submit proof: ${errorMessage}`);
    },
  });

  const execute = async ({
    cleanupAddress,
    ...params
  }: {
    cleanupAddress: string;
  } & SubmitProofOfWorkParams) => {
    if (!account) throw new Error("Wallet not connected");
    if (params.ipfsHashes.length !== params.mimetypes.length) {
      throw new Error(
        "IPFS hashes and mimetypes arrays must have the same length"
      );
    }
    if (params.ipfsHashes.length < 10) {
      throw new Error("At least 10 proof media items are required");
    }

    const clause = createClause(
      CleanupABI,
      cleanupAddress,
      "submitProofOfWork",
      [params]
    );

    open();

    await sendTransaction([clause]);

    queryClient.invalidateQueries({
      queryKey: subgraphKeys.cleanup(cleanupAddress),
    });
    toast.success("Proof of work submitted successfully");
  };

  return {
    sendTransaction: execute,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  };
}

// RewardsManager Mutations
export function useClaimRewards() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const { open } = useTransactionModal();

  const {
    sendTransaction,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.rewards() });
      toast.success("Rewards claimed successfully");
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to claim rewards: ${errorMessage}`);
    },
  });

  const execute = async (params: ClaimRewardsParams) => {
    if (!account) throw new Error("Wallet not connected");
    if (!CONTRACT_ADDRESSES.REWARDS_MANAGER) {
      throw new Error("RewardsManager address not configured");
    }

    const clause = createClause(
      RewardsManagerABI,
      CONTRACT_ADDRESSES.REWARDS_MANAGER,
      "claimRewards",
      [params]
    );

    open();

    await sendTransaction([clause]);
  };

  return {
    sendTransaction: execute,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  };
}

// Streak Mutations
export function useJoinStreak() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const { open } = useTransactionModal();

  const {
    sendTransaction,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.streaks() });
      toast.success("Successfully joined the streak program!");
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to join streak: ${errorMessage}`);
    },
  });

  const execute = async () => {
    if (!account) throw new Error("Wallet not connected");
    if (!CONTRACT_ADDRESSES.STREAK) {
      throw new Error("Streak contract address not configured");
    }

    const clause = createClause(
      StreakABI,
      CONTRACT_ADDRESSES.STREAK,
      "joinStreak",
      []
    );

    open();

    await sendTransaction([clause]);
  };

  return {
    sendTransaction: execute,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  };
}

export function useSubmitStreak() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const { open } = useTransactionModal();

  const {
    sendTransaction,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: subgraphKeys.streaks() });
      toast.success("Streak submitted successfully!");
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to submit streak: ${errorMessage}`);
    },
  });

  const execute = async (params: SubmitStreakParams) => {
    if (!account) throw new Error("Wallet not connected");
    if (!CONTRACT_ADDRESSES.STREAK) {
      throw new Error("Streak contract address not configured");
    }
    if (params.ipfsHashes.length === 0) {
      throw new Error("At least one IPFS hash is required");
    }
    if (params.ipfsHashes.length !== params.mimetypes.length) {
      throw new Error(
        "IPFS hashes and mimetypes arrays must have the same length"
      );
    }

    const clause = createClause(
      StreakABI,
      CONTRACT_ADDRESSES.STREAK,
      "submit",
      [params]
    );

    open();

    await sendTransaction([clause]);
  };

  return {
    sendTransaction: execute,
    isTransactionPending,
    isWaitingForWalletConfirmation,
    txReceipt,
    status,
    resetStatus,
    error,
  };
}
