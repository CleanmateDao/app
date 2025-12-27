/**
 * Media management utilities for streak submission
 */

import type { MediaItem } from "./streak-recording";

// Re-export MediaItem from streak-recording for consistency
export type { MediaItem } from "./streak-recording";

/**
 * Clean up media items by revoking object URLs
 */
export function cleanupMediaItems(items: MediaItem[]): void {
  items.forEach((item) => {
    URL.revokeObjectURL(item.url);
  });
}

/**
 * Remove a media item and clean up its URL
 */
export function removeMediaItem(
  items: MediaItem[],
  mediaId: string
): MediaItem[] {
  const itemToRemove = items.find((item) => item.id === mediaId);
  if (itemToRemove) {
    URL.revokeObjectURL(itemToRemove.url);
  }
  return items.filter((item) => item.id !== mediaId);
}

/**
 * Calculate total size of media items
 */
export function calculateTotalSize(items: MediaItem[]): number {
  return items.reduce((sum, item) => sum + item.blob.size, 0);
}

/**
 * Calculate total duration of media items
 */
export function calculateTotalDuration(items: MediaItem[]): number {
  return items.reduce((sum, item) => sum + (item.duration || 0), 0);
}

