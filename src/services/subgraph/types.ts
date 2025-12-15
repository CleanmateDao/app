// Types matching the subgraph schema
export interface SubgraphUser {
  id: string;
  metadata: string | null;
  emailVerified: boolean;
  kycStatus: number; // 0=NOT_STARTED, 1=PENDING, 2=VERIFIED, 3=REJECTED
  referralCode: string | null;
  referrer: string | null;
  isOrganizer: boolean;
  registeredAt: string;
  emailVerifiedAt: string | null;
  lastProfileUpdateAt: string | null;
  totalRewardsEarned: string;
  totalRewardsClaimed: string;
  pendingRewards: string;
}

export interface SubgraphCleanup {
  id: string;
  organizer: string;
  metadata: string;
  category: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  maxParticipants: string | null;
  status: number;
  published: boolean;
  publishedAt: string | null;
  unpublishedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  latitude: string | null;
  longitude: string | null;
  rewardAmount: string | null;
  rewardsDistributed: boolean;
  rewardsTotalAmount: string | null;
  rewardsParticipantCount: string | null;
  rewardsDistributedAt: string | null;
  proofOfWorkSubmitted: boolean;
  proofOfWorkMediaCount: string | null;
  proofOfWorkSubmittedAt: string | null;
  participants: SubgraphCleanupParticipant[];
  proofOfWorkMedia: SubgraphProofOfWorkMedia[];
}

export interface SubgraphCleanupParticipant {
  id: string;
  cleanup: SubgraphCleanup;
  participant: string;
  appliedAt: string;
  status: string; // "applied", "accepted", "rejected"
  acceptedAt: string | null;
  rejectedAt: string | null;
  rewardEarned: string;
  rewardEarnedAt: string | null;
}

export interface SubgraphProofOfWorkMedia {
  id: string;
  cleanup: SubgraphCleanup;
  url: string;
  mimeType: string;
  uploadedAt: string;
  submittedAt: string;
}

export interface SubgraphReward {
  id: string;
  user: string;
  cleanupId: string | null;
  amount: string;
  earnedAt: string | null;
}

export interface SubgraphNotification {
  id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  relatedEntity: string | null;
  relatedEntityType: string | null;
  read: boolean;
  createdAt: string;
  blockNumber: string;
  transactionHash: string;
}

export interface SubgraphTeamMembership {
  id: string;
  organizer: string;
  member: string;
  canEditCleanups: boolean;
  canManageParticipants: boolean;
  canSubmitProof: boolean;
  addedAt: string;
  lastUpdatedAt: string;
}

// GraphQL Response Types
export interface GetUserResponse {
  user: SubgraphUser | null;
}

export interface GetCleanupResponse {
  cleanup: SubgraphCleanup | null;
}

export interface GetCleanupsResponse {
  cleanups: SubgraphCleanup[];
}

export interface GetRewardsResponse {
  rewards: SubgraphReward[];
}

export interface GetNotificationsResponse {
  notifications: SubgraphNotification[];
}

export interface GetUserCleanupsResponse {
  cleanups: SubgraphCleanup[];
}

export interface GetCleanupParticipantsResponse {
  cleanupParticipants: SubgraphCleanupParticipant[];
}

// Metadata types (parsed from JSON strings)
export interface CleanupMetadata {
  title?: string;
  description?: string;
  // Add other metadata fields as needed
}

export interface UserMetadata {
  name?: string;
  email?: string;
  // Add other metadata fields as needed
}

