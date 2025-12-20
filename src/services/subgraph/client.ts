import { GraphQLClient } from "graphql-request";
import type {
  GetUserResponse,
  GetCleanupResponse,
  GetCleanupsResponse,
  GetTransactionsResponse,
  GetNotificationsResponse,
  GetUserCleanupsResponse,
  GetCleanupParticipantsResponse,
  GetTeamMembershipsResponse,
  GetTransactionsQueryParams,
  GetCleanupsQueryParams,
  GetTeamMembershipsQueryParams,
  GetNotificationsQueryParams,
  GetStreakSubmissionResponse,
  GetStreakSubmissionsResponse,
  GetUserStreakStatsResponse,
  GetStreakSubmissionsQueryParams,
} from "./types";

const client = new GraphQLClient(import.meta.env.VITE_SUBGRAPH_URL);

// GraphQL Queries
const GET_USER_QUERY = `
  query GetUser($id: Bytes!) {
    user(id: $id) {
      id
      metadata
      email
      emailVerified
      kycStatus
      referralCode
      referrer
      isOrganizer
      registeredAt
      emailVerifiedAt
      lastProfileUpdateAt
      totalRewardsEarned
      totalRewardsClaimed
      pendingRewards
    }
  }
`;

const GET_CLEANUP_QUERY = `
  query GetCleanup($id: String!) {
    cleanup(id: $id) {
      id
      organizer
      metadata
      category
      date
      startTime
      endTime
      maxParticipants
      status
      published
      publishedAt
      unpublishedAt
      createdAt
      updatedAt
      location
      city
      country
      latitude
      longitude
      rewardAmount
      rewardsDistributed
      rewardsTotalAmount
      rewardsParticipantCount
      rewardsDistributedAt
      proofOfWorkSubmitted
      proofOfWorkMediaCount
      proofOfWorkSubmittedAt
      participants {
        id
        participant
        user {
          id
          metadata
          email
          emailVerified
        }
        appliedAt
        status
        acceptedAt
        rejectedAt
        rewardEarned
        rewardEarnedAt
      }
      medias {
        id
        url
        mimeType
        createdAt
      }
      proofOfWorkMedia {
        id
        url
        mimeType
        uploadedAt
        submittedAt
      }
    }
  }
`;

const GET_CLEANUPS_QUERY = `
  query GetCleanups($first: Int, $skip: Int, $where: Cleanup_filter, $orderBy: Cleanup_orderBy, $orderDirection: OrderDirection) {
    cleanups(first: $first, skip: $skip, where: $where, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      organizer
      metadata
      category
      date
      startTime
      endTime
      maxParticipants
      status
      published
      publishedAt
      unpublishedAt
      createdAt
      updatedAt
      location
      city
      country
      latitude
      longitude
      rewardAmount
      rewardsDistributed
      rewardsTotalAmount
      rewardsParticipantCount
      rewardsDistributedAt
      proofOfWorkSubmitted
      proofOfWorkMediaCount
      proofOfWorkSubmittedAt
      participants {
        id
        participant
        user {
          id
          metadata
          email
          emailVerified
        }
        appliedAt
        status
        acceptedAt
        rejectedAt
        rewardEarned
        rewardEarnedAt
      }
      medias {
        id
        url
        mimeType
        createdAt
      }
      proofOfWorkMedia {
        id
        url
        mimeType
        uploadedAt
        submittedAt
      }
    }
  }
`;

const GET_USER_CLEANUPS_QUERY = `
  query GetUserCleanups($organizer: Bytes!, $first: Int, $skip: Int) {
    cleanups(
      first: $first
      skip: $skip
      where: { organizer: $organizer }
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      organizer
      metadata
      category
      date
      startTime
      endTime
      maxParticipants
      status
      published
      publishedAt
      unpublishedAt
      createdAt
      updatedAt
      location
      city
      country
      latitude
      longitude
      rewardAmount
      rewardsDistributed
      rewardsTotalAmount
      rewardsParticipantCount
      rewardsDistributedAt
      proofOfWorkSubmitted
      proofOfWorkMediaCount
      proofOfWorkSubmittedAt
      participants {
        id
        participant
        user {
          id
          metadata
          email
          emailVerified
        }
        appliedAt
        status
        acceptedAt
        rejectedAt
        rewardEarned
        rewardEarnedAt
      }
      medias {
        id
        url
        mimeType
        createdAt
      }
      proofOfWorkMedia {
        id
        url
        mimeType
        uploadedAt
        submittedAt
      }
    }
  }
`;

const GET_CLEANUP_PARTICIPANTS_QUERY = `
  query GetCleanupParticipants($cleanupId: String!, $first: Int, $skip: Int) {
    cleanupParticipants(
      first: $first
      skip: $skip
      where: { cleanup: $cleanupId }
      orderBy: appliedAt
      orderDirection: desc
    ) {
      id
      cleanup {
        id
      }
      participant
      user {
        id
        metadata
        email
        emailVerified
        kycStatus
        isOrganizer
      }
      appliedAt
      status
      acceptedAt
      rejectedAt
      rewardEarned
      rewardEarnedAt
    }
  }
`;

const GET_TRANSACTIONS_QUERY = `
  query GetTransactions($first: Int, $skip: Int, $where: Transaction_filter, $orderBy: Transaction_orderBy, $orderDirection: OrderDirection) {
    transactions(
      first: $first
      skip: $skip
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      user
      cleanupId
      streakSubmissionId
      amount
      transactionType
      rewardType
      timestamp
      blockNumber
      transactionHash
    }
  }
`;

const GET_NOTIFICATIONS_QUERY = `
  query GetNotifications($first: Int, $skip: Int, $where: Notification_filter, $orderBy: Notification_orderBy, $orderDirection: OrderDirection) {
    notifications(
      first: $first
      skip: $skip
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      user
      type
      title
      message
      relatedEntity
      relatedEntityType
      read
      createdAt
      blockNumber
      transactionHash
    }
  }
`;

const GET_TEAM_MEMBERSHIPS_QUERY = `
  query GetTeamMemberships($first: Int, $skip: Int, $where: TeamMembership_filter, $orderBy: TeamMembership_orderBy, $orderDirection: OrderDirection) {
    teamMemberships(
      first: $first
      skip: $skip
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      organizer
      member
      canEditCleanups
      canManageParticipants
      canSubmitProof
      addedAt
      lastUpdatedAt
    }
  }
`;

const GET_STREAK_SUBMISSION_QUERY = `
  query GetStreakSubmission($id: ID!) {
    streakSubmission(id: $id) {
      id
      user
      submissionId
      metadata
      status
      submittedAt
      reviewedAt
      amount
      rewardAmount
      rejectionReason
      ipfsHashes
      mimetypes
      blockNumber
      transactionHash
    }
  }
`;

const GET_STREAK_SUBMISSIONS_QUERY = `
  query GetStreakSubmissions($first: Int, $skip: Int, $where: StreakSubmission_filter, $orderBy: StreakSubmission_orderBy, $orderDirection: OrderDirection) {
    streakSubmissions(
      first: $first
      skip: $skip
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      user
      submissionId
      metadata
      status
      submittedAt
      reviewedAt
      amount
      rewardAmount
      rejectionReason
      ipfsHashes
      mimetypes
      blockNumber
      transactionHash
    }
  }
`;

const GET_USER_STREAK_STATS_QUERY = `
  query GetUserStreakStats($id: Bytes!) {
    userStreakStats(id: $id) {
      id
      user
      streakerCode
      totalSubmissions
      approvedSubmissions
      rejectedSubmissions
      pendingSubmissions
      totalAmount
      lastSubmissionAt
    }
  }
`;

// Helper function to normalize addresses
function normalizeAddress(address: string): string {
  let normalized = address.toLowerCase();
  if (!normalized.startsWith("0x")) {
    normalized = "0x" + normalized;
  }
  return normalized;
}

export const subgraphClient = {
  async getUser(userAddress: string): Promise<GetUserResponse> {
    return client.request<GetUserResponse>(GET_USER_QUERY, {
      id: normalizeAddress(userAddress),
    });
  },

  async getCleanup(cleanupId: string): Promise<GetCleanupResponse> {
    return client.request<GetCleanupResponse>(GET_CLEANUP_QUERY, {
      id: cleanupId, // cleanup ID is a string (uint256 as string), not an address
    });
  },

  async getCleanups(
    params?: GetCleanupsQueryParams
  ): Promise<GetCleanupsResponse> {
    const variables: Record<string, unknown> = {
      first: params?.first ?? 100,
      skip: params?.skip ?? 0,
      orderBy: params?.orderBy ?? "createdAt",
      orderDirection: params?.orderDirection ?? "desc",
    };

    if (params?.where) {
      const where: Record<string, unknown> = {};
      if (params.where.organizer) {
        where.organizer = normalizeAddress(params.where.organizer);
      }
      if (params.where.status !== undefined) {
        where.status = params.where.status;
      }
      if (params.where.published !== undefined) {
        where.published = params.where.published;
      }
      variables.where = where;
    }

    // If userState is provided, add it to where filter for state-based ordering
    // The subgraph will order by matching state in location/city fields
    if (params?.userState) {
      if (!variables.where) {
        variables.where = {};
      }
      // Filter by location containing the state (location field contains full address string)
      // This works if location field contains the state information
      (variables.where as Record<string, unknown>).location_contains =
        params.userState;
    }

    return client.request<GetCleanupsResponse>(GET_CLEANUPS_QUERY, variables);
  },

  async getUserCleanups(
    organizerAddress: string,
    params?: { first?: number; skip?: number }
  ): Promise<GetUserCleanupsResponse> {
    return client.request<GetUserCleanupsResponse>(GET_USER_CLEANUPS_QUERY, {
      organizer: normalizeAddress(organizerAddress),
      first: params?.first ?? 100,
      skip: params?.skip ?? 0,
    });
  },

  async getCleanupParticipants(
    cleanupId: string,
    params?: { first?: number; skip?: number }
  ): Promise<GetCleanupParticipantsResponse> {
    return client.request<GetCleanupParticipantsResponse>(
      GET_CLEANUP_PARTICIPANTS_QUERY,
      {
        cleanupId: cleanupId, // cleanup ID is a string (uint256 as string), not an address
        first: params?.first ?? 100,
        skip: params?.skip ?? 0,
      }
    );
  },

  async getTransactions(
    params?: GetTransactionsQueryParams
  ): Promise<GetTransactionsResponse> {
    const variables: Record<string, unknown> = {
      first: params?.first ?? 100,
      skip: params?.skip ?? 0,
      orderBy: params?.orderBy ?? "timestamp",
      orderDirection: params?.orderDirection ?? "desc",
    };

    if (params?.where) {
      const where: Record<string, unknown> = {};
      if (params.where.user) {
        where.user = normalizeAddress(params.where.user);
      }
      if (params.where.cleanupId) {
        where.cleanupId = params.where.cleanupId; // cleanup ID is a string (uint256 as string), not an address
      }
      if (params.where.streakSubmissionId !== undefined) {
        // Graph expects BigInt for this filter; graphql-request will serialize strings fine.
        where.streakSubmissionId = params.where.streakSubmissionId;
      }
      if (params.where.transactionType) {
        where.transactionType = params.where.transactionType;
      }
      if (params.where.rewardType !== undefined) {
        where.rewardType = params.where.rewardType;
      }
      variables.where = where;
    }

    return client.request<GetTransactionsResponse>(
      GET_TRANSACTIONS_QUERY,
      variables
    );
  },

  async getNotifications(
    userAddress: string,
    params?: GetNotificationsQueryParams
  ): Promise<GetNotificationsResponse> {
    const variables: Record<string, unknown> = {
      first: params?.first ?? 100,
      skip: params?.skip ?? 0,
      orderBy: params?.orderBy ?? "createdAt",
      orderDirection: params?.orderDirection ?? "desc",
    };

    const where: Record<string, unknown> = {
      user: normalizeAddress(userAddress),
    };

    if (params?.where) {
      if (params.where.type) where.type = params.where.type;
      if (params.where.read !== undefined) where.read = params.where.read;
      if (params.where.relatedEntity)
        where.relatedEntity = normalizeAddress(params.where.relatedEntity);
      if (params.where.relatedEntityType)
        where.relatedEntityType = params.where.relatedEntityType;
    }

    variables.where = where;

    return client.request<GetNotificationsResponse>(
      GET_NOTIFICATIONS_QUERY,
      variables
    );
  },

  async getTeamMemberships(
    params?: GetTeamMembershipsQueryParams
  ): Promise<GetTeamMembershipsResponse> {
    const variables: Record<string, unknown> = {
      first: params?.first ?? 100,
      skip: params?.skip ?? 0,
      orderBy: params?.orderBy ?? "addedAt",
      orderDirection: params?.orderDirection ?? "desc",
    };

    if (params?.where) {
      const where: Record<string, unknown> = {};
      if (params.where.organizer) {
        where.organizer = normalizeAddress(params.where.organizer);
      }
      if (params.where.member) {
        where.member = normalizeAddress(params.where.member);
      }
      variables.where = where;
    }

    return client.request<GetTeamMembershipsResponse>(
      GET_TEAM_MEMBERSHIPS_QUERY,
      variables
    );
  },

  async getStreakSubmission(
    submissionId: string
  ): Promise<GetStreakSubmissionResponse> {
    return client.request<GetStreakSubmissionResponse>(
      GET_STREAK_SUBMISSION_QUERY,
      {
        id: submissionId,
      }
    );
  },

  async getStreakSubmissions(
    params?: GetStreakSubmissionsQueryParams
  ): Promise<GetStreakSubmissionsResponse> {
    const variables: Record<string, unknown> = {
      first: params?.first ?? 100,
      skip: params?.skip ?? 0,
      orderBy: params?.orderBy ?? "submittedAt",
      orderDirection: params?.orderDirection ?? "desc",
    };

    if (params?.where) {
      const where: Record<string, unknown> = {};
      if (params.where.user) {
        where.user = normalizeAddress(params.where.user);
      }
      if (params.where.status !== undefined) {
        where.status = params.where.status;
      }
      variables.where = where;
    }

    return client.request<GetStreakSubmissionsResponse>(
      GET_STREAK_SUBMISSIONS_QUERY,
      variables
    );
  },

  async getUserStreakStats(
    userAddress: string
  ): Promise<GetUserStreakStatsResponse> {
    return client.request<GetUserStreakStatsResponse>(
      GET_USER_STREAK_STATS_QUERY,
      {
        id: normalizeAddress(userAddress),
      }
    );
  },
};
