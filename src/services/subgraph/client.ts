import { GraphQLClient } from "graphql-request";
import type {
  GetUserResponse,
  GetCleanupResponse,
  GetCleanupsResponse,
  GetRewardsResponse,
  GetNotificationsResponse,
  GetUserCleanupsResponse,
  GetCleanupParticipantsResponse,
} from "./types";

const SUBGRAPH_URL =
  import.meta.env.VITE_SUBGRAPH_URL ||
  "http://localhost:8000/subgraphs/name/cleanmate";

const client = new GraphQLClient(SUBGRAPH_URL);

// GraphQL Queries
const GET_USER_QUERY = `
  query GetUser($id: Bytes!) {
    user(id: $id) {
      id
      metadata
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
  query GetCleanup($id: Bytes!) {
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
        appliedAt
        status
        acceptedAt
        rejectedAt
        rewardEarned
        rewardEarnedAt
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
  query GetCleanups($first: Int, $skip: Int, $where: Cleanup_filter) {
    cleanups(first: $first, skip: $skip, where: $where, orderBy: createdAt, orderDirection: desc) {
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
        appliedAt
        status
        acceptedAt
        rejectedAt
        rewardEarned
        rewardEarnedAt
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
        appliedAt
        status
        acceptedAt
        rejectedAt
        rewardEarned
        rewardEarnedAt
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
  query GetCleanupParticipants($cleanupId: Bytes!, $first: Int, $skip: Int) {
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
      appliedAt
      status
      acceptedAt
      rejectedAt
      rewardEarned
      rewardEarnedAt
    }
  }
`;

const GET_REWARDS_QUERY = `
  query GetRewards($user: Bytes!, $first: Int, $skip: Int) {
    rewards(
      first: $first
      skip: $skip
      where: { user: $user }
      orderBy: earnedAt
      orderDirection: desc
    ) {
      id
      user
      cleanupId
      amount
      earnedAt
    }
  }
`;

const GET_NOTIFICATIONS_QUERY = `
  query GetNotifications($user: Bytes!, $first: Int, $skip: Int) {
    notifications(
      first: $first
      skip: $skip
      where: { user: $user }
      orderBy: createdAt
      orderDirection: desc
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

  async getCleanup(cleanupAddress: string): Promise<GetCleanupResponse> {
    return client.request<GetCleanupResponse>(GET_CLEANUP_QUERY, {
      id: normalizeAddress(cleanupAddress),
    });
  },

  async getCleanups(params?: {
    first?: number;
    skip?: number;
    where?: {
      organizer?: string;
      status?: number;
      published?: boolean;
      city?: string;
      country?: string;
    };
  }): Promise<GetCleanupsResponse> {
    const variables: Record<string, unknown> = {
      first: params?.first ?? 100,
      skip: params?.skip ?? 0,
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
      if (params.where.city) {
        where.city = params.where.city;
      }
      if (params.where.country) {
        where.country = params.where.country;
      }
      variables.where = where;
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
    cleanupAddress: string,
    params?: { first?: number; skip?: number }
  ): Promise<GetCleanupParticipantsResponse> {
    return client.request<GetCleanupParticipantsResponse>(
      GET_CLEANUP_PARTICIPANTS_QUERY,
      {
        cleanupId: normalizeAddress(cleanupAddress),
        first: params?.first ?? 100,
        skip: params?.skip ?? 0,
      }
    );
  },

  async getRewards(
    userAddress: string,
    params?: { first?: number; skip?: number }
  ): Promise<GetRewardsResponse> {
    return client.request<GetRewardsResponse>(GET_REWARDS_QUERY, {
      user: normalizeAddress(userAddress),
      first: params?.first ?? 100,
      skip: params?.skip ?? 0,
    });
  },

  async getNotifications(
    userAddress: string,
    params?: { first?: number; skip?: number }
  ): Promise<GetNotificationsResponse> {
    return client.request<GetNotificationsResponse>(GET_NOTIFICATIONS_QUERY, {
      user: normalizeAddress(userAddress),
      first: params?.first ?? 100,
      skip: params?.skip ?? 0,
    });
  },
};
