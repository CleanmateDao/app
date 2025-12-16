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
 * @deprecated Email is now stored in the contract, not in metadata
 * This function is kept for backward compatibility but should not be used
 */
export function extractEmailFromMetadata(metadata: string | null): string | null {
  // Email is no longer stored in metadata, it's in the contract's UserProfile
  return null;
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

/**
 * Extract location information from user metadata
 */
export function extractUserLocation(metadata: UserMetadata | null): {
  city?: string;
  country?: string;
  state?: string;
  address?: string;
} | null {
  if (!metadata) return null;
  
  const location: { city?: string; country?: string; state?: string; address?: string } = {};
  
  if (metadata.city) location.city = metadata.city;
  if (metadata.country) location.country = metadata.country;
  // Extract state from metadata (if it exists)
  if ('state' in metadata && metadata.state) {
    location.state = metadata.state as string;
  }
  // Note: address is not in UserMetadata, but we check for it in case it's added later
  if ('address' in metadata && metadata.address) {
    location.address = metadata.address as string;
  }
  
  // Return null if no location data found
  if (!location.city && !location.country && !location.state && !location.address) {
    return null;
  }
  
  return location;
}

/**
 * Extract state from user location
 */
export function extractUserState(metadata: UserMetadata | null): string | null {
  if (!metadata) return null;
  
  // Check if state exists in metadata
  if ('state' in metadata && metadata.state) {
    return metadata.state as string;
  }
  
  return null;
}

/**
 * Calculate location match score for a cleanup
 * Higher score = better match
 * Returns 0 if no user location, or no match
 */
export function calculateLocationMatchScore(
  cleanup: { city?: string | null; country?: string | null; location?: string | null },
  userLocation: { city?: string; country?: string; address?: string } | null
): number {
  if (!userLocation) return 0;
  
  let score = 0;
  const cleanupCity = cleanup.city?.toLowerCase().trim() || '';
  const cleanupCountry = cleanup.country?.toLowerCase().trim() || '';
  const cleanupAddress = cleanup.location?.toLowerCase().trim() || '';
  
  const userCity = userLocation.city?.toLowerCase().trim() || '';
  const userCountry = userLocation.country?.toLowerCase().trim() || '';
  const userAddress = userLocation.address?.toLowerCase().trim() || '';
  
  // Exact city match: highest priority (score 100)
  if (userCity && cleanupCity === userCity) {
    score += 100;
  }
  
  // Exact country match: medium priority (score 50)
  if (userCountry && cleanupCountry === userCountry) {
    score += 50;
  }
  
  // Partial city match (contains): lower priority (score 30)
  if (userCity && cleanupCity.includes(userCity)) {
    score += 30;
  }
  if (userCity && userCity.includes(cleanupCity) && cleanupCity.length > 3) {
    score += 30;
  }
  
  // Address match: high priority if address exists (score 80)
  if (userAddress && cleanupAddress) {
    // Check if addresses are similar (contains or partial match)
    if (cleanupAddress.includes(userAddress) || userAddress.includes(cleanupAddress)) {
      score += 80;
    }
  }
  
  // Country match only: lower priority (score 20)
  if (userCountry && cleanupCountry === userCountry && !userCity) {
    score += 20;
  }
  
  return score;
}

/**
 * US State abbreviations mapping (common ones)
 */
const US_STATE_ABBREVIATIONS: Record<string, string[]> = {
  'california': ['ca', 'calif'],
  'texas': ['tx'],
  'florida': ['fl'],
  'new york': ['ny', 'n.y.'],
  'pennsylvania': ['pa', 'penna'],
  'illinois': ['il'],
  'ohio': ['oh'],
  'georgia': ['ga'],
  'north carolina': ['nc', 'n.c.'],
  'michigan': ['mi'],
  'new jersey': ['nj', 'n.j.'],
  'virginia': ['va'],
  'washington': ['wa', 'wash'],
  'arizona': ['az'],
  'massachusetts': ['ma', 'mass'],
  'tennessee': ['tn', 'tenn'],
  'indiana': ['in'],
  'missouri': ['mo'],
  'maryland': ['md'],
  'wisconsin': ['wi', 'wis'],
};

/**
 * Calculate state match score for a cleanup
 * Returns 1 if state matches, 0 otherwise
 */
export function calculateStateMatchScore(
  cleanup: { location?: string | null; city?: string | null; country?: string | null },
  userState: string | null
): number {
  if (!userState) return 0;
  
  const userStateLower = userState.toLowerCase().trim();
  const cleanupLocation = cleanup.location?.toLowerCase().trim() || '';
  const cleanupCity = cleanup.city?.toLowerCase().trim() || '';
  const cleanupText = `${cleanupLocation} ${cleanupCity}`.trim();
  
  // Exact match in location or city
  if (cleanupLocation.includes(userStateLower) || cleanupCity.includes(userStateLower)) {
    return 1;
  }
  
  // Check for state abbreviations
  const stateVariations = US_STATE_ABBREVIATIONS[userStateLower] || [];
  for (const abbrev of stateVariations) {
    if (cleanupText.includes(` ${abbrev} `) || cleanupText.includes(` ${abbrev},`) || cleanupText.endsWith(` ${abbrev}`)) {
      return 1;
    }
  }
  
  // Check if user state is an abbreviation and matches full state name
  for (const [fullName, abbrevs] of Object.entries(US_STATE_ABBREVIATIONS)) {
    if (abbrevs.includes(userStateLower) && cleanupText.includes(fullName)) {
      return 1;
    }
  }
  
  return 0;
}

/**
 * Sort cleanups by state match only, then by creation date
 */
export function sortCleanupsByState<T extends { location?: string | null; city?: string | null; country?: string | null; createdAt?: string | null }>(
  cleanups: T[],
  userState: string | null
): T[] {
  if (!userState) {
    // If no user state, sort by createdAt descending (newest first)
    return [...cleanups].sort((a, b) => {
      const aTime = a.createdAt ? Number(a.createdAt) : 0;
      const bTime = b.createdAt ? Number(b.createdAt) : 0;
      return bTime - aTime;
    });
  }
  
  // Sort by state match (matching states first), then by createdAt (descending)
  return [...cleanups].sort((a, b) => {
    const scoreA = calculateStateMatchScore(a, userState);
    const scoreB = calculateStateMatchScore(b, userState);
    
    // If scores are different, sort by score (matching states first)
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    
    // If scores are the same, sort by createdAt (newest first)
    const aTime = a.createdAt ? Number(a.createdAt) : 0;
    const bTime = b.createdAt ? Number(b.createdAt) : 0;
    return bTime - aTime;
  });
}

/**
 * Sort cleanups by location priority, then by creation date
 */
export function sortCleanupsByLocation<T extends { city?: string | null; country?: string | null; location?: string | null; createdAt?: string | null }>(
  cleanups: T[],
  userLocation: { city?: string; country?: string; state?: string; address?: string } | null
): T[] {
  if (!userLocation) {
    // If no user location, sort by createdAt descending (newest first)
    return [...cleanups].sort((a, b) => {
      const aTime = a.createdAt ? Number(a.createdAt) : 0;
      const bTime = b.createdAt ? Number(b.createdAt) : 0;
      return bTime - aTime;
    });
  }
  
  // Sort by location match score (descending), then by createdAt (descending)
  return [...cleanups].sort((a, b) => {
    const scoreA = calculateLocationMatchScore(a, userLocation);
    const scoreB = calculateLocationMatchScore(b, userLocation);
    
    // If scores are different, sort by score
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    
    // If scores are the same, sort by createdAt (newest first)
    const aTime = a.createdAt ? Number(a.createdAt) : 0;
    const bTime = b.createdAt ? Number(b.createdAt) : 0;
    return bTime - aTime;
  });
}

