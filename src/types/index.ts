// Export all contract types

// ICleanup types
export {
  CleanupStatus,
  ParticipantStatus,
  Location,
  Participant,
  ProofMedia,
  CleanupData,
  // Extended UI types
  CleanupLocation,
  CleanupMedia,
  CleanupParticipant,
  Cleanup,
  RewardTransaction,
} from './cleanup';

// IUserRegistry types
export {
  KYCStatus,
  Permission,
  UserProfile,
  TeamMember,
} from './user-registry';

// IRewardsManager types
export { Reward } from './rewards-manager';

// Params types
export {
  RewardType,
  RegisterUserParams,
  RegisterWithReferralParams,
  UpdateKYCStatusParams,
  SetOrganizerStatusParams,
  AddTeamMemberParams,
  UpdateTeamMemberPermissionsParams,
  HasPermissionParams,
  UpdateRewardsParams,
  SubmitProofOfWorkParams,
  CreateCleanupParams,
  DistributeRewardsParams,
  ClaimRewardsParams,
  ClaimRewardsWithPermitParams,
  SendRewardParams,
} from './params';

