// IUserRegistry contract types

export enum KYCStatus {
  NOT_STARTED = 0,
  PENDING = 1,
  VERIFIED = 2,
  REJECTED = 3,
}

export enum Permission {
  EDIT_CLEANUPS = 0,
  MANAGE_PARTICIPANTS = 1,
  SUBMIT_PROOF = 2,
}

/**
 * UserProfile struct from IUserRegistry
 * Note: email is stored separately in userEmail mapping and is immutable
 */
export interface UserProfile {
  metadata: string;
  isEmailVerified: boolean;
  kycStatus: KYCStatus;
  referralCode: string;
  referredBy: string; // address
}

/**
 * TeamMember struct from IUserRegistry
 */
export interface TeamMember {
  memberAddress: string; // address
  canEditCleanups: boolean;
  canManageParticipants: boolean;
  canSubmitProof: boolean;
  addedAt: string; // uint256 timestamp
}

