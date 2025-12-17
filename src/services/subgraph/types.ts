// Types matching the subgraph schema.graphql

/**
 * User entity from subgraph schema
 */
export interface SubgraphUser {
  id: string; // Bytes - user address
  metadata: string | null;
  email: string | null; // Email address (immutable, set once during registration)
  emailVerified: boolean;
  kycStatus: number; // Int - 0=NOT_STARTED, 1=PENDING, 2=VERIFIED, 3=REJECTED
  referralCode: string | null;
  referrer: string | null; // Bytes - address of referrer
  isOrganizer: boolean;
  registeredAt: string; // BigInt
  emailVerifiedAt: string | null; // BigInt
  lastProfileUpdateAt: string | null; // BigInt
  totalRewardsEarned: string; // BigInt
  totalRewardsClaimed: string; // BigInt
  pendingRewards: string; // BigInt
}

/**
 * Cleanup entity from subgraph schema
 */
export interface SubgraphCleanup {
  id: string; // Bytes - cleanup address
  organizer: string; // Bytes - address
  metadata: string;
  category: string | null;
  date: string; // BigInt - uint256
  startTime: string | null; // BigInt
  endTime: string | null; // BigInt
  maxParticipants: string | null; // BigInt
  status: number; // Int - uint8
  published: boolean;
  publishedAt: string | null; // BigInt
  unpublishedAt: string | null; // BigInt
  createdAt: string; // BigInt
  updatedAt: string | null; // BigInt
  location: string | null; // String - address
  city: string | null;
  country: string | null;
  latitude: string | null; // BigDecimal
  longitude: string | null; // BigDecimal
  rewardAmount: string | null; // BigInt
  rewardsDistributed: boolean;
  rewardsTotalAmount: string | null; // BigInt
  rewardsParticipantCount: string | null; // BigInt
  rewardsDistributedAt: string | null; // BigInt
  proofOfWorkSubmitted: boolean;
  proofOfWorkMediaCount: string | null; // BigInt
  proofOfWorkSubmittedAt: string | null; // BigInt
  participants: SubgraphCleanupParticipant[];
  medias?: SubgraphCleanupMedia[]; // CleanupMedia entities
  proofOfWorkMedia: SubgraphProofOfWorkMedia[];
}

/**
 * CleanupParticipant entity from subgraph schema
 */
export interface SubgraphCleanupParticipant {
  id: string; // ID - cleanup address + participant address
  cleanup: SubgraphCleanup;
  participant: string; // Bytes - address
  appliedAt: string; // BigInt
  status: string; // String - "applied", "accepted", "rejected"
  acceptedAt: string | null; // BigInt
  rejectedAt: string | null; // BigInt
  rewardEarned: string; // BigInt
  rewardEarnedAt: string | null; // BigInt
}

/**
 * CleanupMedia entity from subgraph schema
 */
export interface SubgraphCleanupMedia {
  id: string; // ID - cleanup address + media index
  cleanup: SubgraphCleanup;
  url: string;
  mimeType: string;
  createdAt: string; // BigInt
}

/**
 * ProofOfWorkMedia entity from subgraph schema
 */
export interface SubgraphProofOfWorkMedia {
  id: string; // ID - cleanup address + media index
  cleanup: SubgraphCleanup;
  url: string; // IPFS hash or URL
  mimeType: string;
  uploadedAt: string; // BigInt
  submittedAt: string; // BigInt
}

/**
 * Transaction entity from subgraph schema (rewards tracking)
 */
export interface SubgraphTransaction {
  id: string; // ID - transaction hash + log index
  user: string; // Bytes - address
  cleanupId: string | null; // Bytes - address (null for non-cleanup rewards)
  streakSubmissionId: string | null; // BigInt (null for non-streak rewards)
  amount: string; // BigInt - uint256
  transactionType: string; // String - "CLAIM" or "RECEIVE"
  rewardType: number | null; // Int - rewardType from event (0=REFERRAL, 1=BONUS, 2=CLEANUP, 3=STREAK, 4=OTHERS) (null for CLAIM transactions)
  timestamp: string; // BigInt
  blockNumber: string; // BigInt
  transactionHash: string; // Bytes
}

/**
 * Notification entity from subgraph schema
 */
export interface SubgraphNotification {
  id: string; // ID
  user: string; // Bytes - address
  type: string; // String - notification type (e.g., "cleanup_created", "participant_accepted", "reward_earned")
  title: string;
  message: string;
  relatedEntity: string | null; // Bytes - address of related entity (cleanup, user, etc.)
  relatedEntityType: string | null; // String - type of related entity
  read: boolean;
  createdAt: string; // BigInt
  blockNumber: string; // BigInt
  transactionHash: string; // Bytes
}

/**
 * TeamMembership entity from subgraph schema
 */
export interface SubgraphTeamMembership {
  id: string; // ID - organizer address + member address
  organizer: string; // Bytes - address
  member: string; // Bytes - address
  canEditCleanups: boolean;
  canManageParticipants: boolean;
  canSubmitProof: boolean;
  addedAt: string; // BigInt
  lastUpdatedAt: string; // BigInt
}

/**
 * AddressUpdated entity from subgraph schema
 */
export interface SubgraphAddressUpdated {
  id: string; // ID
  key: string;
  oldAddress: string; // Bytes
  newAddress: string; // Bytes
  blockNumber: string; // BigInt
  blockTimestamp: string; // BigInt
  transactionHash: string; // Bytes
}

/**
 * AppIdUpdated entity from subgraph schema
 */
export interface SubgraphAppIdUpdated {
  id: string; // ID
  oldAppId: string; // Bytes
  newAppId: string; // Bytes
  blockNumber: string; // BigInt
  blockTimestamp: string; // BigInt
  transactionHash: string; // Bytes
}

/**
 * RewardsPoolUpdated entity from subgraph schema
 */
export interface SubgraphRewardsPoolUpdated {
  id: string; // ID
  oldPool: string; // Bytes
  newPool: string; // Bytes
  blockNumber: string; // BigInt
  blockTimestamp: string; // BigInt
  transactionHash: string; // Bytes
}

// GraphQL Response Types

/**
 * Response type for getUser query
 */
export interface GetUserResponse {
  user: SubgraphUser | null;
}

/**
 * Response type for getCleanup query
 */
export interface GetCleanupResponse {
  cleanup: SubgraphCleanup | null;
}

/**
 * Response type for getCleanups query
 */
export interface GetCleanupsResponse {
  cleanups: SubgraphCleanup[];
}

/**
 * Response type for getTransactions query
 */
export interface GetTransactionsResponse {
  transactions: SubgraphTransaction[];
}

/**
 * Response type for getNotifications query
 */
export interface GetNotificationsResponse {
  notifications: SubgraphNotification[];
}

/**
 * Response type for getUserCleanups query
 */
export interface GetUserCleanupsResponse {
  cleanups: SubgraphCleanup[];
}

/**
 * Response type for getCleanupParticipants query
 */
export interface GetCleanupParticipantsResponse {
  cleanupParticipants: SubgraphCleanupParticipant[];
}

/**
 * Response type for getTeamMemberships query
 */
export interface GetTeamMembershipsResponse {
  teamMemberships: SubgraphTeamMembership[];
}

// Query Parameter Types

/**
 * Parameters for getUser query
 */
export interface GetUserQueryParams {
  id: string; // Bytes - user address
}

/**
 * Parameters for getCleanup query
 */
export interface GetCleanupQueryParams {
  id: string; // Bytes - cleanup address
}

/**
 * Cleanup filter parameters for queries
 */
export interface CleanupFilter {
  organizer?: string; // Bytes - address
  status?: number; // Int
  published?: boolean;
}

/**
 * Parameters for getCleanups query
 */
export interface GetCleanupsQueryParams {
  first?: number;
  skip?: number;
  where?: CleanupFilter;
  orderBy?: "createdAt" | "date" | "updatedAt" | "city" | "country";
  orderDirection?: "asc" | "desc";
  userState?: string; // User's state for API-based ordering
}

/**
 * Parameters for getUserCleanups query
 */
export interface GetUserCleanupsQueryParams {
  organizer: string; // Bytes - address
  first?: number;
  skip?: number;
}

/**
 * Parameters for getCleanupParticipants query
 */
export interface GetCleanupParticipantsQueryParams {
  cleanupId: string; // Bytes - cleanup address
  first?: number;
  skip?: number;
}

/**
 * Transaction filter parameters
 */
export interface TransactionFilter {
  user?: string; // Bytes - address
  cleanupId?: string; // Bytes - address
  streakSubmissionId?: string; // BigInt (string)
  transactionType?: "CLAIM" | "RECEIVE";
  rewardType?: number; // Int - 0=REFERRAL, 1=BONUS, 2=CLEANUP, 3=STREAK, 4=OTHERS
}

/**
 * Parameters for getTransactions query
 */
export interface GetTransactionsQueryParams {
  first?: number;
  skip?: number;
  where?: TransactionFilter;
  orderBy?: "timestamp" | "blockNumber";
  orderDirection?: "asc" | "desc";
}

/**
 * Notification filter parameters
 */
export interface NotificationFilter {
  user: string; // Bytes - address
  type?: string;
  read?: boolean;
  relatedEntity?: string; // Bytes - address
  relatedEntityType?: string;
}

/**
 * Parameters for getNotifications query
 */
export interface GetNotificationsQueryParams {
  first?: number;
  skip?: number;
  where?: NotificationFilter;
  orderBy?: "createdAt" | "blockNumber";
  orderDirection?: "asc" | "desc";
}

/**
 * TeamMembership filter parameters
 */
export interface TeamMembershipFilter {
  organizer?: string; // Bytes - address
  member?: string; // Bytes - address
}

/**
 * Parameters for getTeamMemberships query
 */
export interface GetTeamMembershipsQueryParams {
  first?: number;
  skip?: number;
  where?: TeamMembershipFilter;
  orderBy?: "addedAt" | "lastUpdatedAt";
  orderDirection?: "asc" | "desc";
}

/**
 * StreakSubmissionMedia entity from subgraph schema
 */
export interface SubgraphStreakSubmissionMedia {
  id: string; // ID - submissionId + index
  submission: SubgraphStreakSubmission;
  ipfsHash: string;
  mimeType: string;
  index: string; // BigInt
}

/**
 * StreakSubmission entity from subgraph schema
 */
export interface SubgraphStreakSubmission {
  id: string; // ID - submissionId
  user: string; // Bytes - address
  submissionId: string; // BigInt
  metadata: string;
  status: number; // Int - 0=PENDING, 1=APPROVED, 2=REJECTED
  submittedAt: string; // BigInt
  reviewedAt: string | null; // BigInt
  amount: string | null; // BigInt - amount approved (null if not approved)
  rewardAmount?: string | null; // BigInt - preferred alias of amount (may be absent on older subgraphs)
  rejectionReason: string | null; // reason for rejection (null if not rejected)
  ipfsHashes: string[]; // IPFS hashes
  mimetypes: string[]; // MIME types
  media: SubgraphStreakSubmissionMedia[]; // Media entities
  blockNumber: string; // BigInt
  transactionHash: string; // Bytes
}

/**
 * UserStreakStats entity from subgraph schema
 */
export interface SubgraphUserStreakStats {
  id: string; // Bytes - user address
  user: string; // Bytes - address
  streakerCode: string | null; // unique streaker code (STREAKER_<codeSeeder>)
  totalSubmissions: string; // BigInt
  approvedSubmissions: string; // BigInt
  rejectedSubmissions: string; // BigInt
  pendingSubmissions: string; // BigInt
  totalAmount: string; // BigInt - total amount from approved submissions
  lastSubmissionAt: string | null; // BigInt
}

/**
 * Response type for getStreakSubmission query
 */
export interface GetStreakSubmissionResponse {
  streakSubmission: SubgraphStreakSubmission | null;
}

/**
 * Response type for getStreakSubmissions query
 */
export interface GetStreakSubmissionsResponse {
  streakSubmissions: SubgraphStreakSubmission[];
}

/**
 * Response type for getUserStreakStats query
 */
export interface GetUserStreakStatsResponse {
  userStreakStats: SubgraphUserStreakStats | null;
}

/**
 * StreakSubmission filter parameters
 */
export interface StreakSubmissionFilter {
  user?: string; // Bytes - address
  status?: number; // Int - 0=PENDING, 1=APPROVED, 2=REJECTED
}

/**
 * Parameters for getStreakSubmissions query
 */
export interface GetStreakSubmissionsQueryParams {
  first?: number;
  skip?: number;
  where?: StreakSubmissionFilter;
  orderBy?: "submittedAt" | "reviewedAt" | "submissionId";
  orderDirection?: "asc" | "desc";
}
