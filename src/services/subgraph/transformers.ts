import type {
  SubgraphUser,
  SubgraphCleanup,
  SubgraphCleanupParticipant,
  SubgraphTransaction,
  SubgraphProofOfWork,
  SubgraphCleanupUpdate,
} from "./types";
import type {
  Cleanup,
  CleanupParticipant,
  RewardTransaction,
  CleanupUpdate,
  CleanupMedia,
} from "@/types/cleanup";
import type { UserProfile } from "@/types/user";
import type { SupportedCountryCode } from "@/constants/supported";
import {
  bigIntToNumber,
  mapCleanupStatus,
  mapParticipantStatus,
  mapKycStatus,
  numberToDate,
} from "./utils";
import {
  parseCleanupMetadata,
  parseCleanupUpdateMetadata,
  parseUserProfileMetadata,
} from "@cleanmate/cip-sdk";

/**
 * Transform subgraph user to app user profile
 */
export function transformUserToProfile(
  user: SubgraphUser | null | undefined,
  userAddress?: string
): UserProfile | null {
  if (!user) return null;

  const metadata = parseUserProfileMetadata<SupportedCountryCode>(
    user.metadata
  );

  const location =
    metadata?.location &&
    typeof metadata.location === "object" &&
    metadata.location !== null
      ? (metadata.location as {
          country?: SupportedCountryCode;
          state?: string;
        })
      : null;

  return {
    id: user.id.toLowerCase(),
    name: metadata?.name || "Unknown User",
    email: user.email,
    walletAddress: userAddress || user.id.toLowerCase(),
    bio: metadata?.bio,
    country: location?.country,
    state: location?.state,
    interests: metadata?.interests,
    profileImage: metadata?.photo,
    totalRewards: bigIntToNumber(user.totalRewardsEarned),
    claimedRewards: bigIntToNumber(user.totalRewardsClaimed),
    pendingRewards: bigIntToNumber(user.pendingRewards),
    isEmailVerified: user.emailVerified,
    kycStatus: mapKycStatus(user.kycStatus),
    referralCode: user.referralCode || undefined,
    referredBy: user.referrer || undefined,
  };
}

/**
 * Transform subgraph cleanup participant to app participant
 */
export function transformParticipant(
  participant: SubgraphCleanupParticipant
): CleanupParticipant {
  const userMetadataParsed = parseUserProfileMetadata<SupportedCountryCode>(
    participant.user.metadata
  );

  const location =
    userMetadataParsed?.location &&
    typeof userMetadataParsed.location === "object" &&
    userMetadataParsed.location !== null
      ? (userMetadataParsed.location as {
          country?: SupportedCountryCode;
          state?: string;
        })
      : null;

  // Use user metadata for name, fallback to userInfo, then to address
  const name =
    userMetadataParsed?.name ||
    participant.participant.slice(0, 6) +
      "..." +
      participant.participant.slice(-4);

  return {
    id: participant.id,
    name,
    email: participant.user.email,
    avatar: userMetadataParsed?.photo,
    status: mapParticipantStatus(participant.status),
    appliedAt: numberToDate(participant.appliedAt * 1000),
    isKyced: participant.user.kycStatus === 2, // KYC status 2 = VERIFIED
    emailVerified: participant.user.emailVerified || false,
    isOrganizer: participant.user.isOrganizer || false,
    country: location?.country,
    state: location?.state,
  };
}

/**
 * Transform subgraph cleanup to app cleanup
 */
export function transformCleanup(
  cleanup: SubgraphCleanup,
  organizerMetadata?: { name?: string; email?: string }
): Cleanup {
  const metadata = parseCleanupMetadata(cleanup.metadata);

  // Build participant list with metadata if available
  const participants: CleanupParticipant[] = (cleanup.participants || []).map(
    (p) => transformParticipant(p)
  );

  const proofMedia: CleanupMedia[] = [];
  cleanup.proofOfWork?.ipfsHashes.forEach((hash, index) => {
    proofMedia.push({
      id: `proof-${index}`,
      name: `Proof of work ${index + 1}`,
      type: "image",
      url: hash,
      uploadedAt: numberToDate(cleanup.proofOfWork.submittedAt * 1000),
    });
  });

  return {
    id: cleanup.id.toLowerCase(),
    title: metadata?.title || "Untitled Cleanup",
    description: metadata?.description || "",
    category: metadata?.category || cleanup.category || "Other",
    status: mapCleanupStatus(cleanup.status),
    location: {
      address: cleanup.location || "",
      city: cleanup.city || "",
      country: cleanup.country || "",
      latitude: cleanup.latitude ? parseFloat(cleanup.latitude) : 0,
      longitude: cleanup.longitude ? parseFloat(cleanup.longitude) : 0,
    },
    date: numberToDate(cleanup.date * 1000) || "",
    startTime: cleanup.startTime ? numberToDate(cleanup.startTime * 1000) : "",
    endTime: cleanup.endTime ? numberToDate(cleanup.endTime * 1000) : "",
    maxParticipants: cleanup.maxParticipants,
    createdAt: numberToDate(cleanup.createdAt) || "",
    updatedAt: numberToDate(cleanup.updatedAt) || "",
    organizer: {
      id: cleanup.organizer.toLowerCase(),
      name:
        organizerMetadata?.name ||
        cleanup.organizer.slice(0, 6) + "..." + cleanup.organizer.slice(-4),
      avatar: undefined,
    },
    participants,
    proofMedia,
    // Media from metadata (initial images/videos from cleanup creation)
    metadataMedia: metadata.media.map((item, index) => ({
      id: `metadata-${cleanup.id}-${index}`,
      name: item.name || "Media",
      type: item.type === "video" ? "video" : "image",
      url: item.ipfsHash,
      uploadedAt: numberToDate(cleanup.createdAt * 1000),
    })),
    rewardAmount: cleanup.rewardAmount
      ? bigIntToNumber(cleanup.rewardAmount)
      : undefined,
    updates:
      cleanup.updates?.map((update) => transformCleanupUpdate(update)) || [],
  };
}

/**
 * Transform subgraph transaction to app reward transaction
 */
export function transformTransaction(
  transaction: SubgraphTransaction,
  cleanupMetadata?: { title?: string }
): RewardTransaction {
  // Map transactionType to type: "RECEIVE" -> "earned", "CLAIM" -> "claimed"
  const type: "earned" | "claimed" =
    transaction.transactionType === "CLAIM" ? "claimed" : "earned";

  // Status is "completed" if there's a transaction hash, otherwise "pending"
  const status: "pending" | "completed" = transaction.transactionHash
    ? "completed"
    : "pending";

  const fallbackTitle = (() => {
    // Prefer cleanup title if we have a cleanupId
    if (transaction.cleanupId)
      return cleanupMetadata?.title || "Cleanup reward";
    // Streak rewards
    if (transaction.streakSubmissionId) {
      return `Streak reward #${transaction.streakSubmissionId}`;
    }
    // Other rewards: infer from rewardType when available
    switch (transaction.rewardType) {
      case 0:
        return "Referral reward";
      case 1:
        return "Bonus reward";
      case 2:
        return "Cleanup reward";
      case 3:
        return "Streak reward";
      case 4:
        return "Other reward";
      default:
        return "Reward";
    }
  })();

  return {
    id: transaction.id,
    type,
    amount: bigIntToNumber(transaction.amount),
    cleanupId: transaction.cleanupId?.toLowerCase() || null,
    streakSubmissionId: transaction.streakSubmissionId ?? null,
    rewardType: transaction.rewardType ?? null,
    title: fallbackTitle,
    date: numberToDate(transaction.timestamp) || "",
    status,
    txHash: transaction.transactionHash || undefined,
  };
}

/**
 * Calculate insights data from cleanups and rewards
 * @param userCleanups - Cleanups the user organized or participated in
 * @param rewards - User's reward transactions
 * @param userProfile - User profile data
 * @param nearbyCleanups - Optional: nearby active cleanups (for "Nearby Events" metric)
 */
export function calculateInsights(
  userCleanups: Cleanup[],
  rewards: RewardTransaction[],
  userProfile: UserProfile | null,
  nearbyCleanups?: Cleanup[]
) {
  // User's completed cleanups (organized or participated)
  const completedCleanups = userCleanups.filter(
    (c) => c.status === "completed" || c.status === "rewarded"
  );

  // Nearby active cleanups (use provided nearbyCleanups or filter from userCleanups)
  const activeCleanups =
    nearbyCleanups ||
    userCleanups.filter(
      (c) => c.status === "open" || c.status === "in_progress"
    );

  // Calculate category distribution from user's cleanups
  const categoryCounts: Record<string, number> = {};
  userCleanups.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  const totalCleanups = userCleanups.length;
  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    value: totalCleanups > 0 ? Math.round((count / totalCleanups) * 100) : 0,
    fill: `hsl(var(--chart-${
      (Object.keys(categoryCounts).indexOf(name) % 5) + 1
    }))`,
  }));

  // Calculate monthly data (last 6 months) from user's cleanups and rewards
  const monthlyData: Array<{
    month: string;
    cleanups: number;
    rewards: number;
  }> = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthCleanups = completedCleanups.filter((c) => {
      const cleanupDate = new Date(c.date);
      return cleanupDate >= monthStart && cleanupDate <= monthEnd;
    }).length;

    const monthRewards = rewards
      .filter((r) => {
        const rewardDate = new Date(r.date);
        return (
          rewardDate >= monthStart &&
          rewardDate <= monthEnd &&
          r.type === "earned"
        );
      })
      .reduce((sum, r) => sum + r.amount, 0);

    monthlyData.push({ month, cleanups: monthCleanups, rewards: monthRewards });
  }

  // Calculate total participants helped (only in cleanups user organized, not participated)
  // Filter to only count cleanups where user is the organizer
  const organizedCleanups = userCleanups.filter((c) => {
    const userAddress = userProfile?.walletAddress?.toLowerCase();
    return userAddress && c.organizer.id.toLowerCase() === userAddress;
  });

  const participantsHelped = organizedCleanups.reduce((sum, c) => {
    // Count accepted participants (excluding the organizer themselves)
    return sum + c.participants.filter((p) => p.status === "accepted").length;
  }, 0);

  return {
    totalRewards: userProfile?.totalRewards || 0,
    cleanupsCompleted: completedCleanups.length,
    activeCleanupsNearby: activeCleanups.length,
    participantsHelped,
    monthlyData,
    categoryData,
  };
}

/**
 * Transform subgraph cleanup update to app cleanup update
 */
export function transformCleanupUpdate(
  update: SubgraphCleanupUpdate
): CleanupUpdate {
  // Parse cleanup update metadata (same format as cleanup metadata)
  const metadata = parseCleanupUpdateMetadata(update.metadata);

  // Transform media if present
  const media = metadata.media?.map((item, index) => ({
    id: `update-${update.id}-${index}`,
    name: item.name || "Media",
    type: (item.type === "video" ? "video" : "image") as "image" | "video",
    url: item.ipfsHash,
    uploadedAt: numberToDate(update.addedAt * 1000),
  }));

  return {
    id: update.id,
    cleanupId: update.cleanup.id,
    organizer: update.organizer,
    description: metadata?.description,
    media,
    addedAt: numberToDate(update.addedAt * 1000),
    blockNumber: update.blockNumber,
    transactionHash: update.transactionHash,
  };
}
