// Params library types from contracts/libs/Params.sol

import { Location } from './cleanup';
import { KYCStatus, Permission } from './user-registry';

/**
 * RewardType enum from Params
 * Matches subgraph schema: 0=REFERRAL, 1=BONUS, 2=CLEANUP, 3=STREAK, 4=OTHERS
 */
export enum RewardType {
  REFERRAL = 0,
  BONUS = 1,
  CLEANUP = 2,
  STREAK = 3,
  OTHERS = 4,
}

// UserRegistry parameter structs

/**
 * RegisterUserParams from Params
 */
export interface RegisterUserParams {
  metadata: string;
  email: string;
}

/**
 * RegisterWithReferralParams from Params
 */
export interface RegisterWithReferralParams {
  metadata: string;
  email: string;
  referralCode: string;
}

/**
 * UpdateKYCStatusParams from Params
 */
export interface UpdateKYCStatusParams {
  user: string; // address
  status: KYCStatus;
}

/**
 * SetOrganizerStatusParams from Params
 */
export interface SetOrganizerStatusParams {
  user: string; // address
  isOrganizer: boolean;
}

/**
 * AddTeamMemberParams from Params
 */
export interface AddTeamMemberParams {
  member: string; // address
  canEditCleanups: boolean;
  canManageParticipants: boolean;
  canSubmitProof: boolean;
}

/**
 * UpdateTeamMemberPermissionsParams from Params
 */
export interface UpdateTeamMemberPermissionsParams {
  member: string; // address
  canEditCleanups: boolean;
  canManageParticipants: boolean;
  canSubmitProof: boolean;
}

/**
 * HasPermissionParams from Params
 */
export interface HasPermissionParams {
  organizer: string; // address
  member: string; // address
  permission: Permission;
}

/**
 * UpdateRewardsParams from Params
 */
export interface UpdateRewardsParams {
  user: string; // address
  earned: string; // uint256
  claimed: string; // uint256
}

// Cleanup parameter structs

/**
 * SubmitProofOfWorkParams from Params
 */
export interface SubmitProofOfWorkParams {
  ipfsHashes: string[];
  mimetypes: string[];
}

/**
 * CreateCleanupParams from Params
 */
export interface CreateCleanupParams {
  metadata: string;
  category: string;
  location: Location;
  date: string; // uint256 timestamp
  startTime: string; // uint256 timestamp
  endTime: string; // uint256 timestamp
  maxParticipants: string; // uint256
}

/**
 * AddCleanupUpdatesParams from Params
 */
export interface AddCleanupUpdatesParams {
  cleanupId: string; // uint256 - cleanup ID
  metadata: string; // JSON stringified CleanupUpdateMetadata
}

// RewardsManager parameter structs

/**
 * DistributeRewardsParams from Params
 */
export interface DistributeRewardsParams {
  cleanupId: string; // uint256 - cleanup ID
  participants: string[]; // address[]
  amounts: string[]; // uint256[]
}

/**
 * ClaimRewardsParams from Params
 */
export interface ClaimRewardsParams {
  amount: string; // uint256
}

/**
 * ClaimRewardsWithPermitParams from Params
 */
export interface ClaimRewardsWithPermitParams {
  user: string; // address
  amount: string; // uint256
}

/**
 * SendRewardParams from Params
 */
export interface SendRewardParams {
  recipient: string; // address
  amount: string; // uint256
  rewardType: RewardType;
  proof: string;
}

// Streak parameter structs

/**
 * SubmitStreakParams from Params
 */
export interface SubmitStreakParams {
  metadata: string;
  ipfsHashes: string[];
  mimetypes: string[];
}

