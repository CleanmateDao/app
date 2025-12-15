import type { CleanupMetadata, UserMetadata } from './types';

/**
 * Parse cleanup metadata from JSON string
 */
export function parseCleanupMetadata(metadata: string | null): CleanupMetadata | null {
  if (!metadata) return null;
  try {
    return JSON.parse(metadata) as CleanupMetadata;
  } catch (error) {
    console.error('Failed to parse cleanup metadata:', error);
    return null;
  }
}

/**
 * Parse user metadata from JSON string
 */
export function parseUserMetadata(metadata: string | null): UserMetadata | null {
  if (!metadata) return null;
  try {
    return JSON.parse(metadata) as UserMetadata;
  } catch (error) {
    console.error('Failed to parse user metadata:', error);
    return null;
  }
}

/**
 * Extract email from user metadata
 */
export function extractEmailFromMetadata(metadata: string | null): string | null {
  const parsed = parseUserMetadata(metadata);
  return parsed?.email || null;
}

/**
 * Convert BigInt string to number
 */
export function bigIntToNumber(value: string | null | undefined): number {
  if (!value) return 0;
  try {
    return Number(value);
  } catch {
    return 0;
  }
}

/**
 * Convert BigInt string to date string
 */
export function bigIntToDate(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const timestamp = Number(value);
    if (isNaN(timestamp)) return null;
    return new Date(timestamp * 1000).toISOString().split('T')[0];
  } catch {
    return null;
  }
}

/**
 * Map subgraph cleanup status to app status
 */
export function mapCleanupStatus(status: number): 'open' | 'in_progress' | 'completed' | 'rewarded' {
  // Based on contract: 0=CREATED, 1=IN_PROGRESS, 2=COMPLETED, 3=REWARDED
  switch (status) {
    case 0:
      return 'open';
    case 1:
      return 'in_progress';
    case 2:
      return 'completed';
    case 3:
      return 'rewarded';
    default:
      return 'open';
  }
}

/**
 * Map app status to subgraph cleanup status
 */
export function mapAppStatusToSubgraph(status: 'open' | 'in_progress' | 'completed' | 'rewarded'): number {
  switch (status) {
    case 'open':
      return 0;
    case 'in_progress':
      return 1;
    case 'completed':
      return 2;
    case 'rewarded':
      return 3;
  }
}

/**
 * Map subgraph participant status to app status
 */
export function mapParticipantStatus(status: string): 'pending' | 'accepted' | 'rejected' {
  switch (status.toLowerCase()) {
    case 'applied':
      return 'pending';
    case 'accepted':
      return 'accepted';
    case 'rejected':
      return 'rejected';
    default:
      return 'pending';
  }
}

/**
 * Map subgraph KYC status to app status
 */
export function mapKycStatus(kycStatus: number): 'not_started' | 'pending' | 'verified' | 'rejected' {
  switch (kycStatus) {
    case 0:
      return 'not_started';
    case 1:
      return 'pending';
    case 2:
      return 'verified';
    case 3:
      return 'rejected';
    default:
      return 'not_started';
  }
}

