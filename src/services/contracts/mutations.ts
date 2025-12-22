import {
  useWallet,
  useSendTransaction,
  useTransactionModal,
} from "@vechain/vechain-kit";
import { ABIContract, Address, Clause } from "@vechain/sdk-core";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CONTRACT_ADDRESSES } from "@/contracts/config";
import {
  UserRegistryABI,
  CleanupABI,
  RewardsManagerABI,
  StreakABI,
} from "@cleanmate/cip-sdk";
import { subgraphKeys } from "../subgraph/queries";
import type {
  RegisterUserParams,
  RegisterWithReferralParams,
  AddTeamMemberParams,
  UpdateTeamMemberPermissionsParams,
  CreateCleanupParams,
  SubmitProofOfWorkParams,
  AddCleanupUpdatesParams,
  ClaimRewardsParams,
  SubmitStreakParams,
} from "@/types/params";

const SUBGRAPH_REFRESH_DELAY = 2_000;

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
export function useRegisterUser(onTxConfirmedCallback?: () => void) {
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
      setTimeout(() => {
        toast.success("User registered successfully");
        onTxConfirmedCallback?.();
        queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
        queryClient.invalidateQueries({
          queryKey: subgraphKeys.user(account?.address),
        });
      }, SUBGRAPH_REFRESH_DELAY);
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Registration failed: ${errorMessage}`);
    },
  });

  const execute = async (params: RegisterUserParams) => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
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

export function useRegisterWithReferral(onTxConfirmedCallback?: () => void) {
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
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
        queryClient.invalidateQueries({
          queryKey: subgraphKeys.user(account?.address),
        });
        toast.success("User registered with referral successfully");
        onTxConfirmedCallback?.();
      }, SUBGRAPH_REFRESH_DELAY);
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Registration failed: ${errorMessage}`);
    },
  });

  const execute = async (params: RegisterWithReferralParams) => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
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

export function useUpdateProfile(onTxConfirmedCallback?: () => void) {
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
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
        queryClient.invalidateQueries({
          queryKey: subgraphKeys.user(account?.address),
        });
        toast.success("Profile updated successfully");
        onTxConfirmedCallback?.();
      }, SUBGRAPH_REFRESH_DELAY);
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Profile update failed: ${errorMessage}`);
    },
  });

  const execute = async (metadata: string) => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
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

/**
 * Generate a random 8-character referral code with mixed lowercase and uppercase alphabets
 */
function generateRandomReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function useSetReferralCode(onTxConfirmedCallback?: () => void) {
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
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
        queryClient.invalidateQueries({
          queryKey: subgraphKeys.user(account?.address),
        });
        toast.success("Referral code set successfully");
        onTxConfirmedCallback?.();
      }, SUBGRAPH_REFRESH_DELAY);
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to set referral code: ${errorMessage}`);
    },
  });

  const execute = async (referralCode?: string) => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
    if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
      throw new Error("UserRegistry address not configured");
    }

    // Generate random code if none provided or empty
    const codeToUse = referralCode?.trim() || generateRandomReferralCode();

    const clause = createClause(
      UserRegistryABI,
      CONTRACT_ADDRESSES.USER_REGISTRY,
      "setReferralCode",
      [codeToUse]
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

export function useAddTeamMember(onTxConfirmedCallback?: () => void) {
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
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
        queryClient.invalidateQueries({
          queryKey: subgraphKeys.user(account?.address),
        });
        queryClient.invalidateQueries({
          queryKey: subgraphKeys.teamMemberships(),
        });
        toast.success("Team member added successfully");
        onTxConfirmedCallback?.();
      }, SUBGRAPH_REFRESH_DELAY);
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to add team member: ${errorMessage}`);
    },
  });

  const execute = async (params: AddTeamMemberParams) => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
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

export function useRemoveTeamMember(onTxConfirmedCallback?: () => void) {
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
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
        queryClient.invalidateQueries({
          queryKey: subgraphKeys.user(account?.address),
        });
        queryClient.invalidateQueries({
          queryKey: subgraphKeys.teamMemberships(),
        });
        toast.success("Team member removed successfully");
        onTxConfirmedCallback?.();
      }, SUBGRAPH_REFRESH_DELAY);
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to remove team member: ${errorMessage}`);
    },
  });

  const execute = async (member: string) => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
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

export function useUpdateTeamMemberPermissions(
  onTxConfirmedCallback?: () => void
) {
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
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
        queryClient.invalidateQueries({
          queryKey: subgraphKeys.user(account?.address),
        });
        queryClient.invalidateQueries({
          queryKey: subgraphKeys.teamMemberships(),
        });
        toast.success("Team member permissions updated successfully");
        onTxConfirmedCallback?.();
      }, SUBGRAPH_REFRESH_DELAY);
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to update team member permissions: ${errorMessage}`);
    },
  });

  const execute = async (params: UpdateTeamMemberPermissionsParams) => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
    if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
      throw new Error("UserRegistry address not configured");
    }

    const clause = createClause(
      UserRegistryABI,
      CONTRACT_ADDRESSES.USER_REGISTRY,
      "updateTeamMemberPermissions",
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

export function useMarkKYCPending(onTxConfirmedCallback?: () => void) {
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
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: subgraphKeys.users() });
        queryClient.invalidateQueries({
          queryKey: subgraphKeys.user(account?.address),
        });
        toast.success("KYC status updated to pending");
        onTxConfirmedCallback?.();
      }, SUBGRAPH_REFRESH_DELAY);
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to update KYC status: ${errorMessage}`);
    },
  });

  const execute = async () => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
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

// Cleanup Mutations (unified Cleanup contract)
export function useCreateCleanup(onTxConfirmedCallback?: () => void) {
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
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: subgraphKeys.cleanups() });
        toast.success("Cleanup created successfully");
        onTxConfirmedCallback?.();
      }, SUBGRAPH_REFRESH_DELAY);
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to create cleanup: ${errorMessage}`);
    },
  });

  const execute = async (params: CreateCleanupParams) => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
    if (!CONTRACT_ADDRESSES.CLEANUP) {
      throw new Error("Cleanup contract address not configured");
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
      CleanupABI,
      CONTRACT_ADDRESSES.CLEANUP,
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

export function useApplyToCleanup(onTxConfirmedCallback?: () => void) {
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
      // Note: cleanupId needs to be passed via closure or ref
      // This will be handled by the execute function
      onTxConfirmedCallback?.();
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to apply: ${errorMessage}`);
    },
  });

  const execute = async (cleanupId: string) => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
    if (!CONTRACT_ADDRESSES.CLEANUP) {
      throw new Error("Cleanup contract address not configured");
    }

    const clause = createClause(
      CleanupABI,
      CONTRACT_ADDRESSES.CLEANUP,
      "applyToCleanup",
      [cleanupId] // uint256 cleanupId
    );

    open();

    await sendTransaction([clause]);

    // Invalidate queries after successful transaction
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: subgraphKeys.cleanup(cleanupId),
      });
      queryClient.invalidateQueries({ queryKey: subgraphKeys.cleanups() });
      toast.success("Application submitted successfully");
    }, SUBGRAPH_REFRESH_DELAY);
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

export function useAcceptParticipant(onTxConfirmedCallback?: () => void) {
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
      onTxConfirmedCallback?.();
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to accept participant: ${errorMessage}`);
    },
  });

  const execute = async ({
    cleanupId,
    participant,
  }: {
    cleanupId: string; // uint256 cleanup ID
    participant: string; // address
  }) => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
    if (!CONTRACT_ADDRESSES.CLEANUP) {
      throw new Error("Cleanup contract address not configured");
    }

    const clause = createClause(
      CleanupABI,
      CONTRACT_ADDRESSES.CLEANUP,
      "acceptParticipant",
      [cleanupId, participant] // uint256 cleanupId, address participant
    );

    open();

    await sendTransaction([clause]);

    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: subgraphKeys.cleanup(cleanupId),
      });
      toast.success("Participant accepted successfully");
    }, SUBGRAPH_REFRESH_DELAY);
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

export function useRejectParticipant(onTxConfirmedCallback?: () => void) {
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
      onTxConfirmedCallback?.();
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to reject participant: ${errorMessage}`);
    },
  });

  const execute = async ({
    cleanupId,
    participant,
  }: {
    cleanupId: string; // uint256 cleanup ID
    participant: string; // address
  }) => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
    if (!CONTRACT_ADDRESSES.CLEANUP) {
      throw new Error("Cleanup contract address not configured");
    }

    const clause = createClause(
      CleanupABI,
      CONTRACT_ADDRESSES.CLEANUP,
      "rejectParticipant",
      [cleanupId, participant] // uint256 cleanupId, address participant
    );

    open();

    await sendTransaction([clause]);

    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: subgraphKeys.cleanup(cleanupId),
      });
      toast.success("Participant rejected");
    }, SUBGRAPH_REFRESH_DELAY);
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

export function useUpdateCleanupStatus(onTxConfirmedCallback?: () => void) {
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
      onTxConfirmedCallback?.();
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to update status: ${errorMessage}`);
    },
  });

  const execute = async ({
    cleanupId,
    newStatus,
  }: {
    cleanupId: string; // uint256 cleanup ID
    newStatus: number; // 0=UNPUBLISHED, 1=OPEN, 2=IN_PROGRESS, 3=COMPLETED, 4=REWARDED
  }) => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
    if (!CONTRACT_ADDRESSES.CLEANUP) {
      throw new Error("Cleanup contract address not configured");
    }

    const clause = createClause(
      CleanupABI,
      CONTRACT_ADDRESSES.CLEANUP,
      "updateCleanupStatus",
      [cleanupId, newStatus] // uint256 cleanupId, CleanupStatus newStatus
    );

    open();

    await sendTransaction([clause]);

    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: subgraphKeys.cleanup(cleanupId),
      });
      queryClient.invalidateQueries({ queryKey: subgraphKeys.cleanups() });
      toast.success("Cleanup status updated successfully");
    }, SUBGRAPH_REFRESH_DELAY);
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

export function useSubmitProofOfWork(onTxConfirmedCallback?: () => void) {
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
      onTxConfirmedCallback?.();
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to submit proof: ${errorMessage}`);
    },
  });

  const execute = async ({
    cleanupId,
    ...params
  }: {
    cleanupId: string; // uint256 cleanup ID
  } & SubmitProofOfWorkParams) => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
    if (!CONTRACT_ADDRESSES.CLEANUP) {
      throw new Error("Cleanup contract address not configured");
    }
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
      CONTRACT_ADDRESSES.CLEANUP,
      "submitProofOfWork",
      [cleanupId, params] // uint256 cleanupId, SubmitProofOfWorkParams params
    );

    open();

    await sendTransaction([clause]);

    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: subgraphKeys.cleanup(cleanupId),
      });
      toast.success("Proof of work submitted successfully");
    }, SUBGRAPH_REFRESH_DELAY);
    // Note: onTxConfirmedCallback is called in onTxConfirmed above
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

export function useAddCleanupUpdate(onTxConfirmedCallback?: () => void) {
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
      onTxConfirmedCallback?.();
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to add update: ${errorMessage}`);
    },
  });

  const execute = async (params: AddCleanupUpdatesParams) => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
    if (!CONTRACT_ADDRESSES.CLEANUP) {
      throw new Error("Cleanup contract address not configured");
    }
    if (!params.metadata || params.metadata.trim().length === 0) {
      throw new Error("Update description is required");
    }

    const clause = createClause(
      CleanupABI,
      CONTRACT_ADDRESSES.CLEANUP,
      "addCleanupUpdates",
      [params] // AddCleanupUpdatesParams params
    );

    open();

    await sendTransaction([clause]);

    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: subgraphKeys.cleanup(params.cleanupId),
      });
      queryClient.invalidateQueries({
        queryKey: [...subgraphKeys.cleanups(), params.cleanupId, "updates"],
      });
      toast.success("Update added successfully");
    }, SUBGRAPH_REFRESH_DELAY);
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
export function useClaimRewards(onTxConfirmedCallback?: () => void) {
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
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: subgraphKeys.rewards() });
        toast.success("Rewards claimed successfully");
        onTxConfirmedCallback?.();
      }, SUBGRAPH_REFRESH_DELAY);
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to claim rewards: ${errorMessage}`);
    },
  });

  const execute = async (params: ClaimRewardsParams) => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
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
export function useJoinStreak(onTxConfirmedCallback?: () => void) {
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
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: subgraphKeys.streaks() });
        toast.success("Successfully joined the streak program!");
        onTxConfirmedCallback?.();
      }, SUBGRAPH_REFRESH_DELAY);
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to join streak: ${errorMessage}`);
    },
  });

  const execute = async () => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
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

export function useSubmitStreak(onTxConfirmedCallback?: () => void) {
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
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: subgraphKeys.streaks() });
        toast.success("Streak submitted successfully!");
        onTxConfirmedCallback?.();
      }, SUBGRAPH_REFRESH_DELAY);
    },
    onTxFailedOrCancelled: (error?: Error | string) => {
      const errorMessage =
        error instanceof Error ? error.message : error ?? "Unknown error";
      toast.error(`Failed to submit streak: ${errorMessage}`);
    },
  });

  const execute = async (params: SubmitStreakParams) => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
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
