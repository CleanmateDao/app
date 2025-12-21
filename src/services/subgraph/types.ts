// Re-export types from SDK subgraph with Subgraph* prefix for compatibility
// This file provides backward compatibility with existing app code

import type {
  User,
  Cleanup,
  CleanupParticipant,
  Transaction,
  Notification,
  TeamMembership,
  StreakSubmission,
  UserStreakStats,
  CleanupUpdate,
  AddressUpdated,
  AppIdUpdated,
  RewardsPoolUpdated,
  ProofOfWork,
  User_orderBy,
  Cleanup_orderBy,
  CleanupParticipant_orderBy,
  Transaction_orderBy,
  Notification_orderBy,
  TeamMembership_orderBy,
  StreakSubmission_orderBy,
  CleanupUpdate_orderBy,
  OrderDirection,
} from "@cleanmate/cip-sdk";

export type {
  User as SubgraphUser,
  Cleanup as SubgraphCleanup,
  CleanupParticipant as SubgraphCleanupParticipant,
  Transaction as SubgraphTransaction,
  Notification as SubgraphNotification,
  TeamMembership as SubgraphTeamMembership,
  StreakSubmission as SubgraphStreakSubmission,
  UserStreakStats as SubgraphUserStreakStats,
  CleanupUpdate as SubgraphCleanupUpdate,
  AddressUpdated as SubgraphAddressUpdated,
  AppIdUpdated as SubgraphAppIdUpdated,
  RewardsPoolUpdated as SubgraphRewardsPoolUpdated,
  ProofOfWork as SubgraphProofOfWork,
  User_orderBy,
  Cleanup_orderBy,
  CleanupParticipant_orderBy,
  Transaction_orderBy,
  Notification_orderBy,
  TeamMembership_orderBy,
  StreakSubmission_orderBy,
  CleanupUpdate_orderBy,
  OrderDirection,
};

// Type alias for cleanup with media (for backward compatibility)
export type SubgraphCleanupWithMedia = Cleanup;

// GraphQL Response Types (for backward compatibility with existing code)
export interface GetUserResponse {
  user: User | null;
}

export interface GetCleanupResponse {
  cleanup: Cleanup | null;
}

export interface GetCleanupsResponse {
  cleanups: Cleanup[];
}

export interface GetTransactionsResponse {
  transactions: Transaction[];
}

export interface GetNotificationsResponse {
  notifications: Notification[];
}

export interface GetUserCleanupsResponse {
  cleanups: Cleanup[];
}

export interface GetCleanupParticipantsResponse {
  cleanupParticipants: CleanupParticipant[];
}

export interface GetTeamMembershipsResponse {
  teamMemberships: TeamMembership[];
}

export interface GetStreakSubmissionResponse {
  streakSubmission: StreakSubmission | null;
}

export interface GetStreakSubmissionsResponse {
  streakSubmissions: StreakSubmission[];
}

export interface GetUserStreakStatsResponse {
  userStreakStats: UserStreakStats | null;
}

export interface GetCleanupUpdatesResponse {
  cleanupUpdates: CleanupUpdate[];
}

// Query Parameter Types (for backward compatibility)
export interface GetUserQueryParams {
  id: string; // Bytes - user address
}

export interface GetCleanupQueryParams {
  id: string; // String - cleanup ID (uint256 as string)
}

export interface CleanupFilter {
  organizer?: string; // Bytes - address
  status?: number; // Int
  published?: boolean;
}

export interface GetCleanupsQueryParams {
  first?: number;
  skip?: number;
  where?: CleanupFilter;
  orderBy?: Cleanup_orderBy;
  orderDirection?: OrderDirection;
  userState?: string; // User's state for API-based ordering
}

export interface GetUserCleanupsQueryParams {
  organizer: string; // Bytes - address
  first?: number;
  skip?: number;
}

export interface GetCleanupParticipantsQueryParams {
  cleanupId: string; // String - cleanup ID (uint256 as string)
  first?: number;
  skip?: number;
}

export interface TransactionFilter {
  user?: string; // Bytes - address
  cleanupId?: string; // BigInt - cleanup ID (uint256 as string)
  streakSubmissionId?: string; // BigInt - streak submission id (string)
  transactionType?: "CLAIM" | "RECEIVE";
  rewardType?: number; // Int - 0=REFERRAL, 1=BONUS, 2=CLEANUP, 3=STREAK, 4=OTHERS
}

export interface GetTransactionsQueryParams {
  first?: number;
  skip?: number;
  where?: TransactionFilter;
  orderBy?: Transaction_orderBy;
  orderDirection?: OrderDirection;
}

export interface NotificationFilter {
  user: string; // Bytes - address
  type?: string;
  relatedEntity?: string; // String - ID of related entity
  relatedEntityType?: string;
}

export interface GetNotificationsQueryParams {
  first?: number;
  skip?: number;
  where?: NotificationFilter;
  orderBy?: Notification_orderBy;
  orderDirection?: OrderDirection;
}

export interface TeamMembershipFilter {
  organizer?: string; // Bytes - address
  member?: string; // Bytes - address
}

export interface GetTeamMembershipsQueryParams {
  first?: number;
  skip?: number;
  where?: TeamMembershipFilter;
  orderBy?: TeamMembership_orderBy;
  orderDirection?: OrderDirection;
}

export interface StreakSubmissionFilter {
  user?: string; // Bytes - address
  status?: number; // Int - 0=PENDING, 1=APPROVED, 2=REJECTED
}

export interface GetStreakSubmissionsQueryParams {
  first?: number;
  skip?: number;
  where?: StreakSubmissionFilter;
  orderBy?: StreakSubmission_orderBy;
  orderDirection?: OrderDirection;
}

export interface CleanupUpdateFilter {
  cleanup?: string; // String - cleanup ID
  organizer?: string; // Bytes - address
}

export interface GetCleanupUpdatesQueryParams {
  first?: number;
  skip?: number;
  where?: CleanupUpdateFilter;
  orderBy?: CleanupUpdate_orderBy;
  orderDirection?: OrderDirection;
}
