export type CleanupStatus = 'open' | 'in_progress' | 'completed' | 'rewarded';

export type ParticipantStatus = 'pending' | 'accepted' | 'rejected';

export interface CleanupLocation {
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface CleanupMedia {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  size: string;
  uploadedAt: string;
}

export interface CleanupParticipant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: ParticipantStatus;
  appliedAt: string;
  rating?: number; // 1-5 stars given by organizer
  isKyced?: boolean; // KYC verification status
}

export interface Cleanup {
  id: string;
  title: string;
  description: string;
  category: string;
  status: CleanupStatus;
  location: CleanupLocation;
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  createdAt: string;
  updatedAt: string;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  participants: CleanupParticipant[];
  proofMedia: CleanupMedia[];
  rewardAmount?: number; // B3TR tokens
}

export interface RewardTransaction {
  id: string;
  type: 'earned' | 'claimed';
  amount: number;
  cleanupId: string;
  cleanupTitle: string;
  date: string;
  txHash?: string;
  status: 'pending' | 'completed';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  walletAddress: string;
  totalRewards: number;
  claimedRewards: number;
  pendingRewards: number;
  cleanupsOrganized: number;
  cleanupsParticipated: number;
  averageRating: number;
  isEmailVerified: boolean;
  kycStatus: 'not_started' | 'pending' | 'verified' | 'rejected';
  referralCode?: string;
  referredBy?: string;
  referralCount: number;
}
