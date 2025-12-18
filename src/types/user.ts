import { SupportedCountryCode } from "@/constants/supported";

/**
 * Frontend (UI) user profile shape used across the app.
 * This is distinct from the on-chain `IUserRegistry.UserProfile` contract struct.
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  bio?: string;
  country: SupportedCountryCode;
  state?: string;
  interests?: string[];
  profileImage?: string;
  totalRewards: number;
  claimedRewards: number;
  pendingRewards: number;
  cleanupsOrganized: number;
  cleanupsParticipated: number;
  isEmailVerified: boolean;
  kycStatus: "not_started" | "pending" | "verified" | "rejected";
  referralCode?: string;
  referredBy?: string;
}

// Legacy UI metadata shapes still used in a few places in the app.
// (Do not confuse with the subgraph `UserMetadata` type.)
export interface UserProfileMetadata<T extends boolean = false> {
  name: string;
  bio?: string;
  photo?: string;
  location?: T extends true ? UserProfileMetadataLocation : string;
  interests?: string[];
}

export interface UserProfileMetadataLocation {
  state?: string;
  country?: SupportedCountryCode;
}
