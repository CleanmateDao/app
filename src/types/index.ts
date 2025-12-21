// Export all contract types

// ICleanup types
export { CleanupStatus, ParticipantStatus } from "./cleanup";

export type {
  Location,
  Participant,
  ProofMedia,
  CleanupData,
  CleanupDataMetadata,
  CleanupStatusUI,
  ParticipantStatusUI,
  // Extended UI types
  CleanupLocation,
  CleanupMedia,
  CleanupParticipant,
  Cleanup,
  RewardTransaction,
} from "./cleanup";

// IUserRegistry types
export { KYCStatus, Permission } from "./user-registry";

export type {
  UserProfile as UserRegistryProfile,
  TeamMember,
} from "./user-registry";

// IRewardsManager types
export type { Reward } from "./rewards-manager";

// Params types
export { RewardType } from "./params";

export type {
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
} from "./params";
