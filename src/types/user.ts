/**
 * Frontend (UI) user profile shape used across the app.
 * This is distinct from the on-chain `IUserRegistry.UserProfile` contract struct.
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  totalRewards: number;
  claimedRewards: number;
  pendingRewards: number;
  cleanupsOrganized: number;
  cleanupsParticipated: number;
  averageRating: number;
  isEmailVerified: boolean;
  kycStatus: "not_started" | "pending" | "verified" | "rejected";
  referralCode?: string;
  referredBy?: string;
  referralCount: number;
}



