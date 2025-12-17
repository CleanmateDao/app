import type {
  SubgraphUser,
  SubgraphCleanup,
  SubgraphCleanupParticipant,
  SubgraphTransaction,
  SubgraphProofOfWorkMedia,
} from "./types";
import type {
  Cleanup,
  CleanupParticipant,
  RewardTransaction,
} from "@/types/cleanup";
import type { UserProfile } from "@/types/user";
import {
  parseCleanupMetadata,
  parseUserMetadata,
  bigIntToNumber,
  bigIntToDate,
  mapCleanupStatus,
  mapParticipantStatus,
  mapKycStatus,
} from "./utils";

/**
 * Transform subgraph user to app user profile
 */
export function transformUserToProfile(
  user: SubgraphUser | null | undefined,
  userAddress?: string
): UserProfile | null {
  if (!user) return null;

  const metadata = parseUserMetadata(user.metadata);
  // Email is now stored separately in the subgraph, not in metadata
  const email = user.email || "";
  // Legacy metadata format stores location as a single string; we only parse the simplest cases.
  const location = metadata?.location?.trim();
  const countryFromLocation =
    location && !location.includes(",")
      ? location
      : location?.split(",").pop()?.trim();
  const cityFromLocation =
    location && location.includes(",")
      ? location.split(",")[0]?.trim()
      : undefined;

  return {
    id: user.id.toLowerCase(),
    name: metadata?.name || "Unknown User",
    email: email,
    walletAddress: userAddress || user.id.toLowerCase(),
    bio: metadata?.bio,
    country: countryFromLocation,
    city: cityFromLocation,
    interests: metadata?.interests,
    profileImage: metadata?.photo,
    totalRewards: bigIntToNumber(user.totalRewardsEarned),
    claimedRewards: bigIntToNumber(user.totalRewardsClaimed),
    pendingRewards: bigIntToNumber(user.pendingRewards),
    cleanupsOrganized: 0, // This needs to be fetched separately
    cleanupsParticipated: 0, // This needs to be fetched separately
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
  participant: SubgraphCleanupParticipant,
  userMetadata?: Record<string, { name?: string; email?: string }>
): CleanupParticipant {
  const userInfo = userMetadata?.[participant.participant.toLowerCase()];

  return {
    id: participant.id,
    name:
      userInfo?.name ||
      participant.participant.slice(0, 6) +
        "..." +
        participant.participant.slice(-4),
    email: userInfo?.email || "",
    status: mapParticipantStatus(participant.status),
    appliedAt: bigIntToDate(participant.appliedAt) || "",
    isKyced: false, // This needs to be fetched from user data
  };
}

/**
 * Transform subgraph proof of work media to app media
 */
export function transformProofMedia(media: SubgraphProofOfWorkMedia): {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
  size: string;
  uploadedAt: string;
} {
  const isVideo = media.mimeType.startsWith("video/");
  const fileName = media.url.split("/").pop() || "file";

  return {
    id: media.id,
    name: fileName,
    type: isVideo ? "video" : "image",
    url: media.url,
    size: "0", // Size is not available in subgraph
    uploadedAt:
      bigIntToDate(media.submittedAt) || bigIntToDate(media.uploadedAt) || "",
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
  const acceptedParticipants = cleanup.participants.filter(
    (p) => p.status.toLowerCase() === "accepted"
  );

  // Build participant list with metadata if available
  const participants: CleanupParticipant[] = cleanup.participants.map((p) =>
    transformParticipant(p, {
      [p.participant.toLowerCase()]: organizerMetadata,
    })
  );

  return {
    id: cleanup.id.toLowerCase(),
    title: metadata?.title || "Untitled Cleanup",
    description: metadata?.description || "",
    category: cleanup.category || "Other",
    status: mapCleanupStatus(cleanup.status),
    location: {
      address: cleanup.location || "",
      city: cleanup.city || "",
      country: cleanup.country || "",
      latitude: cleanup.latitude ? parseFloat(cleanup.latitude) : 0,
      longitude: cleanup.longitude ? parseFloat(cleanup.longitude) : 0,
    },
    date: bigIntToDate(cleanup.date) || "",
    startTime: cleanup.startTime
      ? new Date(Number(cleanup.startTime) * 1000).toTimeString().slice(0, 5)
      : "",
    endTime: cleanup.endTime
      ? new Date(Number(cleanup.endTime) * 1000).toTimeString().slice(0, 5)
      : "",
    maxParticipants: bigIntToNumber(cleanup.maxParticipants),
    createdAt: bigIntToDate(cleanup.createdAt) || "",
    updatedAt: bigIntToDate(cleanup.updatedAt) || "",
    organizer: {
      id: cleanup.organizer.toLowerCase(),
      name:
        organizerMetadata?.name ||
        cleanup.organizer.slice(0, 6) + "..." + cleanup.organizer.slice(-4),
      avatar: undefined,
    },
    participants,
    proofMedia: cleanup.proofOfWorkMedia.map(transformProofMedia),
    rewardAmount: cleanup.rewardAmount
      ? bigIntToNumber(cleanup.rewardAmount)
      : undefined,
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
    date: bigIntToDate(transaction.timestamp) || "",
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
