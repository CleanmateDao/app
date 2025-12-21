import { GraphQLClient } from "graphql-request";
import {
  GET_USER_QUERY,
  GET_CLEANUP_QUERY,
  GET_CLEANUPS_QUERY,
  GET_CLEANUP_PARTICIPANTS_QUERY,
  GET_TRANSACTIONS_QUERY,
  GET_NOTIFICATIONS_QUERY,
  GET_TEAM_MEMBERSHIPS_QUERY,
  GET_STREAK_SUBMISSION_QUERY,
  GET_STREAK_SUBMISSIONS_QUERY,
  GET_USER_STREAK_STATS_QUERY,
  GET_CLEANUP_UPDATES_QUERY,
  type GetUserParams,
  type GetCleanupParams,
  type GetCleanupsParams,
  type GetCleanupParticipantsParams,
  type GetTransactionsParams,
  type GetNotificationsParams,
  type GetTeamMembershipsParams,
  type GetStreakSubmissionParams,
  type GetStreakSubmissionsParams,
  type GetUserStreakStatsParams,
  type GetCleanupUpdatesParams,
  type User,
  type Cleanup,
  type CleanupParticipant,
  type Transaction,
  type Notification,
  type TeamMembership,
  type StreakSubmission,
  type UserStreakStats,
  type CleanupUpdate,
  type Cleanup_filter,
  type CleanupParticipant_filter,
  type Transaction_filter,
  type Notification_filter,
  type TeamMembership_filter,
  type StreakSubmission_filter,
  type CleanupUpdate_filter,
} from "@cleanmate/cip-sdk";
import type {
  GetUserResponse,
  GetCleanupResponse,
  GetCleanupsResponse,
  GetTransactionsResponse,
  GetNotificationsResponse,
  GetUserCleanupsResponse,
  GetCleanupParticipantsResponse,
  GetTeamMembershipsResponse,
  GetStreakSubmissionResponse,
  GetStreakSubmissionsResponse,
  GetUserStreakStatsResponse,
  GetCleanupUpdatesResponse,
  GetCleanupsQueryParams,
  GetUserCleanupsQueryParams,
  GetTransactionsQueryParams,
  GetNotificationsQueryParams,
  GetTeamMembershipsQueryParams,
  GetStreakSubmissionsQueryParams,
  GetCleanupUpdatesQueryParams,
} from "./types";

const client = new GraphQLClient(import.meta.env.VITE_SUBGRAPH_URL);

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
    const response = await client.request<{ user: User | null }>(
      GET_USER_QUERY,
      {
        id: normalizeAddress(userAddress),
      } as GetUserParams
    );
    return { user: response.user };
  },

  async getCleanup(cleanupId: string): Promise<GetCleanupResponse> {
    const response = await client.request<{ cleanup: Cleanup | null }>(
      GET_CLEANUP_QUERY,
      {
        id: cleanupId,
      } as GetCleanupParams
    );
    return { cleanup: response.cleanup };
  },

  async getCleanups(
    params?: GetCleanupsQueryParams
  ): Promise<GetCleanupsResponse> {
    const variables: GetCleanupsParams = {
      first: params?.first ?? 100,
      skip: params?.skip ?? 0,
      orderBy: params?.orderBy,
      orderDirection: params?.orderDirection ?? "desc",
    };

    if (params?.where) {
      const where: Cleanup_filter = {};
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
    if (params?.userState) {
      if (!variables.where) {
        variables.where = {};
      }
      variables.where.location_contains = params.userState;
    }

    const response = await client.request<{ cleanups: Cleanup[] }>(
      GET_CLEANUPS_QUERY,
      variables
    );
    return { cleanups: response.cleanups };
  },

  async getUserCleanups(
    organizerAddress: string,
    params?: { first?: number; skip?: number }
  ): Promise<GetUserCleanupsResponse> {
    const variables: GetCleanupsParams = {
      first: params?.first ?? 100,
      skip: params?.skip ?? 0,
      where: {
        organizer: normalizeAddress(organizerAddress),
      },
      orderBy: "createdAt",
      orderDirection: "desc",
    };

    const response = await client.request<{ cleanups: Cleanup[] }>(
      GET_CLEANUPS_QUERY,
      variables
    );
    return { cleanups: response.cleanups };
  },

  async getCleanupParticipants(
    cleanupId: string,
    params?: { first?: number; skip?: number }
  ): Promise<GetCleanupParticipantsResponse> {
    const where: CleanupParticipant_filter = {
      cleanup: cleanupId,
    };
    const variables: GetCleanupParticipantsParams = {
      first: params?.first ?? 100,
      skip: params?.skip ?? 0,
      where,
      orderBy: "appliedAt",
      orderDirection: "desc",
    };

    const response = await client.request<{
      cleanupParticipants: CleanupParticipant[];
    }>(GET_CLEANUP_PARTICIPANTS_QUERY, variables);
    return { cleanupParticipants: response.cleanupParticipants };
  },

  async getTransactions(
    params?: GetTransactionsQueryParams
  ): Promise<GetTransactionsResponse> {
    const variables: GetTransactionsParams = {
      first: params?.first ?? 100,
      skip: params?.skip ?? 0,
      orderBy: params?.orderBy ?? "timestamp",
      orderDirection: params?.orderDirection ?? "desc",
    };

    if (params?.where) {
      const where: Transaction_filter = {};
      if (params.where.user) {
        where.user = normalizeAddress(params.where.user);
      }
      if (params.where.cleanupId) {
        where.cleanupId = params.where.cleanupId;
      }
      if (params.where.streakSubmissionId !== undefined) {
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

    const response = await client.request<{ transactions: Transaction[] }>(
      GET_TRANSACTIONS_QUERY,
      variables
    );
    return { transactions: response.transactions };
  },

  async getNotifications(
    userAddress: string,
    params?: GetNotificationsQueryParams
  ): Promise<GetNotificationsResponse> {
    const variables: GetNotificationsParams = {
      first: params?.first ?? 100,
      skip: params?.skip ?? 0,
      orderBy: params?.orderBy ?? "createdAt",
      orderDirection: params?.orderDirection ?? "desc",
    };

    const where: Notification_filter = {
      user: normalizeAddress(userAddress),
    };

    if (params?.where) {
      if (params.where.type) where.type = params.where.type;
      if (params.where.relatedEntity)
        where.relatedEntity = normalizeAddress(params.where.relatedEntity);
      if (params.where.relatedEntityType)
        where.relatedEntityType = params.where.relatedEntityType;
    }

    variables.where = where;

    const response = await client.request<{ notifications: Notification[] }>(
      GET_NOTIFICATIONS_QUERY,
      variables
    );
    return { notifications: response.notifications };
  },

  async getTeamMemberships(
    params?: GetTeamMembershipsQueryParams
  ): Promise<GetTeamMembershipsResponse> {
    const variables: GetTeamMembershipsParams = {
      first: params?.first ?? 100,
      skip: params?.skip ?? 0,
      orderBy: params?.orderBy ?? "addedAt",
      orderDirection: params?.orderDirection ?? "desc",
    };

    if (params?.where) {
      const where: TeamMembership_filter = {};
      if (params.where.organizer) {
        where.organizer = normalizeAddress(params.where.organizer);
      }
      if (params.where.member) {
        where.member = normalizeAddress(params.where.member);
      }
      variables.where = where;
    }

    const response = await client.request<{
      teamMemberships: TeamMembership[];
    }>(GET_TEAM_MEMBERSHIPS_QUERY, variables);
    return { teamMemberships: response.teamMemberships };
  },

  async getStreakSubmission(
    submissionId: string
  ): Promise<GetStreakSubmissionResponse> {
    const response = await client.request<{
      streakSubmission: StreakSubmission | null;
    }>(GET_STREAK_SUBMISSION_QUERY, {
      id: submissionId,
    } as GetStreakSubmissionParams);
    return { streakSubmission: response.streakSubmission };
  },

  async getStreakSubmissions(
    params?: GetStreakSubmissionsQueryParams
  ): Promise<GetStreakSubmissionsResponse> {
    const variables: GetStreakSubmissionsParams = {
      first: params?.first ?? 100,
      skip: params?.skip ?? 0,
      orderBy: params?.orderBy ?? "submittedAt",
      orderDirection: params?.orderDirection ?? "desc",
    };

    if (params?.where) {
      const where: StreakSubmission_filter = {};
      if (params.where.user) {
        where.user = normalizeAddress(params.where.user);
      }
      if (params.where.status !== undefined) {
        where.status = params.where.status;
      }
      variables.where = where;
    }

    const response = await client.request<{
      streakSubmissions: StreakSubmission[];
    }>(GET_STREAK_SUBMISSIONS_QUERY, variables);
    return { streakSubmissions: response.streakSubmissions };
  },

  async getUserStreakStats(
    userAddress: string
  ): Promise<GetUserStreakStatsResponse> {
    const response = await client.request<{
      userStreakStats: UserStreakStats | null;
    }>(GET_USER_STREAK_STATS_QUERY, {
      id: normalizeAddress(userAddress),
    } as GetUserStreakStatsParams);
    return { userStreakStats: response.userStreakStats };
  },

  async getCleanupUpdates(
    params?: GetCleanupUpdatesQueryParams
  ): Promise<GetCleanupUpdatesResponse> {
    const variables: GetCleanupUpdatesParams = {
      first: params?.first ?? 100,
      skip: params?.skip ?? 0,
      orderBy: params?.orderBy ?? "addedAt",
      orderDirection: params?.orderDirection ?? "desc",
    };

    if (params?.where) {
      const where: CleanupUpdate_filter = {};
      if (params.where.cleanup) {
        where.cleanup = params.where.cleanup;
      }
      if (params.where.organizer) {
        where.organizer = normalizeAddress(params.where.organizer);
      }
      variables.where = where;
    }

    const response = await client.request<{
      cleanupUpdates: CleanupUpdate[];
    }>(GET_CLEANUP_UPDATES_QUERY, variables);
    return { cleanupUpdates: response.cleanupUpdates };
  },
};
