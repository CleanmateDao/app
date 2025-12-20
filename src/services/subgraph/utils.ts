/**
 * Convert BigInt string to number
 */
export function bigIntToNumber(
  value: string | bigint | null | undefined
): number {
  if (!value) return 0;
  try {
    return Number(value);
  } catch {
    return 0;
  }
}

/**
 * Convert number to date string
 */
export function numberToDate(
  value: number | bigint | null | undefined
): string | null {
  if (!value) return null;
  try {
    return new Date(Number(value) * 1000).toISOString().split("T")[0];
  } catch {
    return null;
  }
}

/**
 * Convert BigInt string to date string
 */
export function bigIntToDate(
  value: string | bigint | null | undefined
): string | null {
  if (!value) return null;
  try {
    return new Date(Number(value) * 1000).toISOString().split("T")[0];
  } catch {
    return null;
  }
}

/**
 * Map subgraph cleanup status to app status
 */
export function mapCleanupStatus(
  status: number
): "unpublished" | "open" | "in_progress" | "completed" | "rewarded" {
  // Based on contract: 0=UNPUBLISHED, 1=OPEN, 2=IN_PROGRESS, 3=COMPLETED, 4=REWARDED
  switch (status) {
    case 0:
      return "unpublished";
    case 1:
      return "open";
    case 2:
      return "in_progress";
    case 3:
      return "completed";
    case 4:
      return "rewarded";
    default:
      return "unpublished";
  }
}

/**
 * Map app status to subgraph cleanup status
 */
export function mapAppStatusToSubgraph(
  status: "unpublished" | "open" | "in_progress" | "completed" | "rewarded"
): number {
  switch (status) {
    case "unpublished":
      return 0;
    case "open":
      return 1;
    case "in_progress":
      return 2;
    case "completed":
      return 3;
    case "rewarded":
      return 4;
  }
}

/**
 * Map subgraph participant status to app status
 */
export function mapParticipantStatus(
  status: string
): "pending" | "accepted" | "rejected" {
  switch (status.toLowerCase()) {
    case "applied":
      return "pending";
    case "accepted":
      return "accepted";
    case "rejected":
      return "rejected";
    default:
      return "pending";
  }
}

/**
 * Map subgraph KYC status to app status
 */
export function mapKycStatus(
  kycStatus: number
): "not_started" | "pending" | "verified" | "rejected" {
  switch (kycStatus) {
    case 0:
      return "not_started";
    case 1:
      return "pending";
    case 2:
      return "verified";
    case 3:
      return "rejected";
    default:
      return "not_started";
  }
}
