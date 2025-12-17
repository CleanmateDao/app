import {
  useQuery,
  useInfiniteQuery,
  UseQueryOptions,
  UseInfiniteQueryOptions,
  type InfiniteData,
} from "@tanstack/react-query";
import { subgraphClient } from "./client";
import type {
  SubgraphUser,
  SubgraphCleanup,
  SubgraphTransaction,
  SubgraphNotification,
  SubgraphTeamMembership,
  SubgraphStreakSubmission,
  SubgraphUserStreakStats,
  GetCleanupsQueryParams,
  GetUserCleanupsQueryParams,
  GetCleanupParticipantsQueryParams,
  GetTransactionsQueryParams,
  GetNotificationsQueryParams,
  GetTeamMembershipsQueryParams,
  GetStreakSubmissionsQueryParams,
  NotificationFilter,
  StreakSubmissionFilter,
} from "./types";
import { parseUserMetadata, extractUserState } from "./utils";

// Query Keys
export const subgraphKeys = {
  all: ["subgraph"] as const,
  users: () => [...subgraphKeys.all, "users"] as const,
  user: (address: string) => [...subgraphKeys.users(), address] as const,
  cleanups: () => [...subgraphKeys.all, "cleanups"] as const,
  cleanup: (address: string) => [...subgraphKeys.cleanups(), address] as const,
  cleanupList: (filters?: Record<string, unknown>) =>
    [...subgraphKeys.cleanups(), "list", filters] as const,
  userCleanups: (address: string) =>
    [...subgraphKeys.cleanups(), "user", address] as const,
  cleanupParticipants: (address: string) =>
    [...subgraphKeys.cleanups(), address, "participants"] as const,
  rewards: () => [...subgraphKeys.all, "rewards"] as const,
  notifications: () => [...subgraphKeys.all, "notifications"] as const,
  userNotifications: (address: string) =>
    [...subgraphKeys.notifications(), "user", address] as const,
  teamMemberships: () => [...subgraphKeys.all, "teamMemberships"] as const,
  teamMembership: (organizer: string, member: string) =>
    [...subgraphKeys.teamMemberships(), organizer, member] as const,
  streaks: () => [...subgraphKeys.all, "streaks"] as const,
  streakSubmissions: () => [...subgraphKeys.streaks(), "submissions"] as const,
  streakSubmission: (id: string) =>
    [...subgraphKeys.streakSubmissions(), id] as const,
  userStreakSubmissions: (address: string) =>
    [...subgraphKeys.streakSubmissions(), "user", address] as const,
  userStreakStats: (address: string) =>
    [...subgraphKeys.streaks(), "stats", address] as const,
};

// User Queries
export function useUser(
  address: string | null | undefined,
  options?: Omit<UseQueryOptions<SubgraphUser | null>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: subgraphKeys.user(address || ""),
    queryFn: async () => {
      if (!address) return null;
      const response = await subgraphClient.getUser(address);
      return response.user;
    },
    enabled: !!address,
    ...options,
  });
}

// Cleanup Queries
export function useCleanup(
  address: string | null | undefined,
  options?: Omit<
    UseQueryOptions<SubgraphCleanup | null>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: subgraphKeys.cleanup(address || ""),
    queryFn: async () => {
      if (!address) return null;
      const response = await subgraphClient.getCleanup(address);
      return response.cleanup;
    },
    enabled: !!address,
    ...options,
  });
}

export function useCleanups(
  params?: GetCleanupsQueryParams & { userAddress?: string | null },
  options?: Omit<UseQueryOptions<SubgraphCleanup[]>, "queryKey" | "queryFn">
) {
  // Fetch user data if userAddress is provided
  const { data: userData, isLoading: isLoadingUser } = useUser(
    params?.userAddress || null,
    { enabled: !!params?.userAddress }
  );

  // Extract user state from metadata
  const userMetadata = userData?.metadata
    ? parseUserMetadata(userData.metadata)
    : null;
  const userState = extractUserState(userMetadata);

  return useQuery({
    queryKey: [
      ...subgraphKeys.cleanupList(params?.where as Record<string, unknown>),
      params?.userAddress || "no-user",
      userState || "no-state",
      params?.orderBy,
      params?.orderDirection,
    ],
    queryFn: async () => {
      const queryParams: GetCleanupsQueryParams = {
        first: params?.first,
        skip: params?.skip,
        where: params?.where,
        orderBy: userState ? "city" : params?.orderBy, // Use city for state-based ordering if userState exists
        orderDirection: params?.orderDirection,
        userState: userState || undefined, // Pass user state to API for ordering
      };
      const response = await subgraphClient.getCleanups(queryParams);

      return response.cleanups;
    },
    enabled: !params?.userAddress || !isLoadingUser,
    ...options,
  });
}

export function useUserCleanups(
  organizerAddress: string | null | undefined,
  params?: Omit<GetUserCleanupsQueryParams, "organizer">,
  options?: Omit<UseQueryOptions<SubgraphCleanup[]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: subgraphKeys.userCleanups(organizerAddress || ""),
    queryFn: async () => {
      if (!organizerAddress) return [];
      const response = await subgraphClient.getUserCleanups(
        organizerAddress,
        params
      );
      return response.cleanups;
    },
    enabled: !!organizerAddress,
    ...options,
  });
}

export function useInfiniteCleanups(
  params?: Omit<GetCleanupsQueryParams, "first" | "skip"> & {
    userAddress?: string | null;
  },
  pageSize = 20,
  options?: Omit<
    UseInfiniteQueryOptions<
      SubgraphCleanup[],
      Error,
      InfiniteData<SubgraphCleanup[]>
    >,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >
) {
  // Fetch user data if userAddress is provided
  const { data: userData, isLoading: isLoadingUser } = useUser(
    params?.userAddress || null,
    { enabled: !!params?.userAddress }
  );

  // Extract user state from metadata
  const userMetadata = userData?.metadata
    ? parseUserMetadata(userData.metadata)
    : null;
  const userState = extractUserState(userMetadata);

  return useInfiniteQuery<
    SubgraphCleanup[],
    Error,
    InfiniteData<SubgraphCleanup[]>
  >({
    queryKey: [
      ...subgraphKeys.cleanupList(params?.where as Record<string, unknown>),
      "infinite",
      params?.userAddress || "no-user",
      userState || "no-state",
      params?.orderBy,
      params?.orderDirection,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const queryParams: GetCleanupsQueryParams = {
        first: pageSize,
        skip: pageParam as number,
        where: params?.where,
        orderBy: userState ? "city" : params?.orderBy, // Use city for state-based ordering if userState exists
        orderDirection: params?.orderDirection,
        userState: userState || undefined, // Pass user state to API for ordering
      };
      const response = await subgraphClient.getCleanups(queryParams);

      return response.cleanups;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) return undefined;
      return allPages.length * pageSize;
    },
    initialPageParam: 0,
    enabled: !params?.userAddress || !isLoadingUser,
    ...options,
  });
}

// Transaction Queries (replaces rewards)
export function useTransactions(
  params?: GetTransactionsQueryParams,
  options?: Omit<UseQueryOptions<SubgraphTransaction[]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [...subgraphKeys.rewards(), "transactions", params],
    queryFn: async () => {
      const response = await subgraphClient.getTransactions(params);
      return response.transactions;
    },
    ...options,
  });
}

// Transaction Infinite Queries
export function useInfiniteTransactions(
  params?: Omit<GetTransactionsQueryParams, "first" | "skip">,
  pageSize = 20,
  options?: Omit<
    UseInfiniteQueryOptions<SubgraphTransaction[]>,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >
) {
  return useInfiniteQuery({
    queryKey: [...subgraphKeys.rewards(), "transactions", "infinite", params],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await subgraphClient.getTransactions({
        first: pageSize,
        skip: pageParam as number,
        where: params?.where,
        orderBy: params?.orderBy,
        orderDirection: params?.orderDirection,
      });
      return response.transactions;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) return undefined;
      return allPages.length * pageSize;
    },
    initialPageParam: 0,
    ...options,
  });
}

// Notifications Queries
export function useNotifications(
  userAddress: string | null | undefined,
  params?: Omit<GetNotificationsQueryParams, "where"> & {
    where?: Omit<NotificationFilter, "user">;
  },
  options?: Omit<
    UseQueryOptions<SubgraphNotification[]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: [...subgraphKeys.userNotifications(userAddress || ""), params],
    queryFn: async () => {
      if (!userAddress) return [];
      const response = await subgraphClient.getNotifications(userAddress, {
        first: params?.first,
        skip: params?.skip,
        orderBy: params?.orderBy,
        orderDirection: params?.orderDirection,
        where: params?.where
          ? ({ user: userAddress, ...params.where } as NotificationFilter)
          : ({ user: userAddress } as NotificationFilter),
      });
      return response.notifications;
    },
    enabled: !!userAddress,
    ...options,
  });
}

// Notifications Infinite Queries
export function useInfiniteNotifications(
  userAddress: string | null | undefined,
  pageSize = 20,
  params?: Omit<GetNotificationsQueryParams, "first" | "skip" | "where"> & {
    where?: Omit<NotificationFilter, "user">;
  },
  options?: Omit<
    UseInfiniteQueryOptions<SubgraphNotification[]>,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >
) {
  return useInfiniteQuery({
    queryKey: [
      ...subgraphKeys.userNotifications(userAddress || ""),
      "infinite",
      params,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userAddress) return [];
      const response = await subgraphClient.getNotifications(userAddress, {
        first: pageSize,
        skip: pageParam as number,
        orderBy: params?.orderBy,
        orderDirection: params?.orderDirection,
        where: params?.where
          ? ({ user: userAddress, ...params.where } as NotificationFilter)
          : ({ user: userAddress } as NotificationFilter),
      });
      return response.notifications;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) return undefined;
      return allPages.length * pageSize;
    },
    initialPageParam: 0,
    enabled: !!userAddress,
    ...options,
  });
}

// Team Membership Queries
export function useTeamMember(
  organizerAddress: string | null | undefined,
  memberAddress: string | null | undefined,
  options?: Omit<
    UseQueryOptions<SubgraphTeamMembership | null>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: subgraphKeys.teamMembership(
      organizerAddress || "",
      memberAddress || ""
    ),
    queryFn: async () => {
      if (!organizerAddress || !memberAddress) return null;
      const response = await subgraphClient.getTeamMemberships({
        first: 1,
        where: {
          organizer: organizerAddress,
          member: memberAddress,
        },
      });
      return response.teamMemberships[0] || null;
    },
    enabled: !!organizerAddress && !!memberAddress,
    ...options,
  });
}

export function useTeamMemberPermission(
  organizerAddress: string | null | undefined,
  memberAddress: string | null | undefined,
  permission: "canEditCleanups" | "canManageParticipants" | "canSubmitProof"
) {
  const { data: teamMember } = useTeamMember(organizerAddress, memberAddress);

  return teamMember ? teamMember[permission] : false;
}

// Streak Queries
export function useStreakSubmission(
  submissionId: string | null | undefined,
  options?: Omit<
    UseQueryOptions<SubgraphStreakSubmission | null>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: subgraphKeys.streakSubmission(submissionId || ""),
    queryFn: async () => {
      if (!submissionId) return null;
      const response = await subgraphClient.getStreakSubmission(submissionId);
      return response.streakSubmission;
    },
    enabled: !!submissionId,
    ...options,
  });
}

export function useStreakSubmissions(
  params?: GetStreakSubmissionsQueryParams,
  options?: Omit<
    UseQueryOptions<SubgraphStreakSubmission[]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: [
      ...subgraphKeys.streakSubmissions(),
      params?.where,
      params?.orderBy,
      params?.orderDirection,
      params?.first,
      params?.skip,
    ],
    queryFn: async () => {
      const response = await subgraphClient.getStreakSubmissions(params);
      return response.streakSubmissions;
    },
    ...options,
  });
}

export function useUserStreakSubmissions(
  userAddress: string | null | undefined,
  params?: Omit<GetStreakSubmissionsQueryParams, "where"> & {
    where?: Omit<StreakSubmissionFilter, "user">;
  },
  options?: Omit<
    UseQueryOptions<SubgraphStreakSubmission[]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: subgraphKeys.userStreakSubmissions(userAddress || ""),
    queryFn: async () => {
      if (!userAddress) return [];
      const response = await subgraphClient.getStreakSubmissions({
        ...params,
        where: {
          user: userAddress,
          ...params?.where,
        },
      });
      return response.streakSubmissions;
    },
    enabled: !!userAddress,
    ...options,
  });
}

export function useInfiniteStreakSubmissions(
  params?: Omit<GetStreakSubmissionsQueryParams, "first" | "skip">,
  pageSize = 20,
  options?: Omit<
    UseInfiniteQueryOptions<SubgraphStreakSubmission[]>,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >
) {
  return useInfiniteQuery({
    queryKey: [
      ...subgraphKeys.streakSubmissions(),
      "infinite",
      params?.where,
      params?.orderBy,
      params?.orderDirection,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await subgraphClient.getStreakSubmissions({
        first: pageSize,
        skip: pageParam as number,
        where: params?.where,
        orderBy: params?.orderBy,
        orderDirection: params?.orderDirection,
      });
      return response.streakSubmissions;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) return undefined;
      return allPages.length * pageSize;
    },
    initialPageParam: 0,
    ...options,
  });
}

export function useUserStreakStats(
  userAddress: string | null | undefined,
  options?: Omit<
    UseQueryOptions<SubgraphUserStreakStats | null>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: subgraphKeys.userStreakStats(userAddress || ""),
    queryFn: async () => {
      if (!userAddress) return null;
      const response = await subgraphClient.getUserStreakStats(userAddress);
      return response.userStreakStats;
    },
    enabled: !!userAddress,
    ...options,
  });
}
