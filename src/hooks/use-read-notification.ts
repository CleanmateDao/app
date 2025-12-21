import { useState, useEffect, useCallback } from "react";
import { useWalletAddress } from "./use-wallet-address";
import type { SubgraphNotification } from "@/services/subgraph/types";

const STORAGE_KEY_PREFIX = "cleanmate:lastReadNotification:";

/**
 * Hook to manage notification read state using localStorage.
 * Stores the last read notification timestamp per wallet address.
 */
export function useReadNotification() {
  const walletAddress = useWalletAddress();
  const [lastReadTime, setLastReadTime] = useState<number | null>(null);

  // Get the storage key for the current wallet
  const getStorageKey = useCallback(() => {
    if (!walletAddress) return null;
    return `${STORAGE_KEY_PREFIX}${walletAddress.toLowerCase()}`;
  }, [walletAddress]);

  // Load last read time from localStorage on mount and when wallet changes
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      setLastReadTime(null);
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const timestamp = parseInt(stored, 10);
        if (!isNaN(timestamp)) {
          setLastReadTime(timestamp);
        }
      } else {
        setLastReadTime(null);
      }
    } catch (error) {
      console.error("Failed to read last read notification time:", error);
      setLastReadTime(null);
    }
  }, [getStorageKey]);

  /**
   * Mark notifications as read by updating the last read timestamp.
   * If no timestamp is provided, uses the current time.
   */
  const markAsRead = useCallback(
    (timestamp?: number) => {
      const storageKey = getStorageKey();
      if (!storageKey) return;

      const readTime = timestamp ?? Date.now();

      try {
        localStorage.setItem(storageKey, readTime.toString());
        setLastReadTime(readTime);
      } catch (error) {
        console.error("Failed to save last read notification time:", error);
      }
    },
    [getStorageKey]
  );

  /**
   * Check if a notification is read based on its createdAt timestamp.
   * A notification is considered read if its createdAt is <= lastReadTime.
   */
  const isRead = useCallback(
    (notification: SubgraphNotification | { createdAt: number }): boolean => {
      if (!lastReadTime) return false;
      // createdAt is a BigInt in the subgraph, but stored as number
      // Convert to number if needed and compare
      const notificationTime =
        typeof notification.createdAt === "number"
          ? notification.createdAt
          : Number(notification.createdAt);

      return notificationTime <= lastReadTime;
    },
    [lastReadTime]
  );

  /**
   * Check if a notification is read by its createdAt timestamp.
   * Convenience method that accepts just the timestamp.
   */
  const isReadByTime = useCallback(
    (createdAt: number): boolean => {
      if (!lastReadTime) return false;
      const notificationTime =
        typeof createdAt === "number" ? createdAt : Number(createdAt);
      return notificationTime <= lastReadTime;
    },
    [lastReadTime]
  );

  /**
   * Clear the read state for the current wallet.
   */
  const clearReadState = useCallback(() => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      localStorage.removeItem(storageKey);
      setLastReadTime(null);
    } catch (error) {
      console.error("Failed to clear read notification state:", error);
    }
  }, [getStorageKey]);

  return {
    lastReadTime,
    markAsRead,
    isRead,
    isReadByTime,
    clearReadState,
  };
}
