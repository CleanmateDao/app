import { useQuery, useInfiniteQuery, UseQueryOptions, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { subgraphClient } from './client';
import type {
  SubgraphUser,
  SubgraphCleanup,
  SubgraphReward,
  SubgraphNotification,
} from './types';

// Query Keys
export const subgraphKeys = {
  all: ['subgraph'] as const,
  users: () => [...subgraphKeys.all, 'users'] as const,
  user: (address: string) => [...subgraphKeys.users(), address] as const,
  cleanups: () => [...subgraphKeys.all, 'cleanups'] as const,
  cleanup: (address: string) => [...subgraphKeys.cleanups(), address] as const,
  cleanupList: (filters?: Record<string, unknown>) => 
    [...subgraphKeys.cleanups(), 'list', filters] as const,
  userCleanups: (address: string) => [...subgraphKeys.cleanups(), 'user', address] as const,
  cleanupParticipants: (address: string) => 
    [...subgraphKeys.cleanups(), address, 'participants'] as const,
  rewards: () => [...subgraphKeys.all, 'rewards'] as const,
  userRewards: (address: string) => [...subgraphKeys.rewards(), 'user', address] as const,
  notifications: () => [...subgraphKeys.all, 'notifications'] as const,
  userNotifications: (address: string) => 
    [...subgraphKeys.notifications(), 'user', address] as const,
};

// User Queries
export function useUser(
  address: string | null | undefined,
  options?: Omit<UseQueryOptions<SubgraphUser | null>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: subgraphKeys.user(address || ''),
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
  options?: Omit<UseQueryOptions<SubgraphCleanup | null>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: subgraphKeys.cleanup(address || ''),
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
  filters?: {
    organizer?: string;
    status?: number;
    published?: boolean;
    city?: string;
    country?: string;
    first?: number;
    skip?: number;
  },
  options?: Omit<UseQueryOptions<SubgraphCleanup[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: subgraphKeys.cleanupList(filters),
    queryFn: async () => {
      const response = await subgraphClient.getCleanups({
        first: filters?.first,
        skip: filters?.skip,
        where: {
          organizer: filters?.organizer,
          status: filters?.status,
          published: filters?.published,
          city: filters?.city,
          country: filters?.country,
        },
      });
      return response.cleanups;
    },
    ...options,
  });
}

export function useUserCleanups(
  organizerAddress: string | null | undefined,
  params?: { first?: number; skip?: number },
  options?: Omit<UseQueryOptions<SubgraphCleanup[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: subgraphKeys.userCleanups(organizerAddress || ''),
    queryFn: async () => {
      if (!organizerAddress) return [];
      const response = await subgraphClient.getUserCleanups(organizerAddress, params);
      return response.cleanups;
    },
    enabled: !!organizerAddress,
    ...options,
  });
}

export function useInfiniteCleanups(
  filters?: {
    organizer?: string;
    status?: number;
    published?: boolean;
    city?: string;
    country?: string;
  },
  pageSize = 20,
  options?: Omit<UseInfiniteQueryOptions<SubgraphCleanup[]>, 'queryKey' | 'queryFn' | 'getNextPageParam'>
) {
  return useInfiniteQuery({
    queryKey: [...subgraphKeys.cleanupList(filters), 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await subgraphClient.getCleanups({
        first: pageSize,
        skip: pageParam,
        where: {
          organizer: filters?.organizer,
          status: filters?.status,
          published: filters?.published,
          city: filters?.city,
          country: filters?.country,
        },
      });
      return response.cleanups;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) return undefined;
      return allPages.length * pageSize;
    },
    initialPageParam: 0,
    ...options,
  });
}

// Rewards Queries
export function useRewards(
  userAddress: string | null | undefined,
  params?: { first?: number; skip?: number },
  options?: Omit<UseQueryOptions<SubgraphReward[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: subgraphKeys.userRewards(userAddress || ''),
    queryFn: async () => {
      if (!userAddress) return [];
      const response = await subgraphClient.getRewards(userAddress, params);
      return response.rewards;
    },
    enabled: !!userAddress,
    ...options,
  });
}

// Notifications Queries
export function useNotifications(
  userAddress: string | null | undefined,
  params?: { first?: number; skip?: number },
  options?: Omit<UseQueryOptions<SubgraphNotification[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: subgraphKeys.userNotifications(userAddress || ''),
    queryFn: async () => {
      if (!userAddress) return [];
      const response = await subgraphClient.getNotifications(userAddress, params);
      return response.notifications;
    },
    enabled: !!userAddress,
    ...options,
  });
}

