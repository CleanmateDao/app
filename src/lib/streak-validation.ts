/**
 * Validation utilities for streak submission
 */

export interface StreakStats {
  lastSubmissionAt?: string | number;
  streakerCode?: string;
}

export interface RateLimitConfig {
  rateLimitMinutes: number;
}

const DEFAULT_RATE_LIMIT_MINUTES = 30;

/**
 * Check if user can submit based on rate limit
 */
export function canSubmit(
  streakStats: StreakStats | null | undefined,
  rateLimitMinutes: number = DEFAULT_RATE_LIMIT_MINUTES
): boolean {
  if (!streakStats?.lastSubmissionAt) return true;
  const lastSubmissionTime = Number(streakStats.lastSubmissionAt);
  const now = Date.now();
  const rateLimitMs = rateLimitMinutes * 60 * 1000;
  return now - lastSubmissionTime >= rateLimitMs;
}

/**
 * Calculate time remaining until user can submit again
 */
export function getTimeUntilCanSubmit(
  streakStats: StreakStats | null | undefined,
  rateLimitMinutes: number = DEFAULT_RATE_LIMIT_MINUTES
): number {
  if (!streakStats?.lastSubmissionAt) return 0;
  const lastSubmissionTime = Number(streakStats.lastSubmissionAt);
  const now = Date.now();
  const rateLimitMs = rateLimitMinutes * 60 * 1000;
  const elapsed = now - lastSubmissionTime;
  const remaining = Math.max(0, rateLimitMs - elapsed);
  return Math.floor(remaining / 1000); // Return in seconds
}

/**
 * Check if user has joined streak program
 */
export function hasJoinedStreak(
  streakStats: StreakStats | null | undefined
): boolean {
  return !!streakStats?.streakerCode;
}

/**
 * Format seconds into a human-readable string
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "now";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) {
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  }
  return `${secs}s`;
}

