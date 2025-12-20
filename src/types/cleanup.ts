// ICleanup contract types

export enum CleanupStatus {
  UNPUBLISHED = 0,
  OPEN = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
  REWARDED = 4,
}

export enum ParticipantStatus {
  PENDING = 0,
  ACCEPTED = 1,
  REJECTED = 2,
}

// UI-friendly status unions (used by the frontend views & transformers)
export type CleanupStatusUI = "unpublished" | "open" | "in_progress" | "completed" | "rewarded";
export type ParticipantStatusUI = "pending" | "accepted" | "rejected";

/**
 * Location struct from ICleanup
 * Note: address_ is used in Solidity to avoid conflict with address type
 */
export interface Location {
  address_: string;
  city: string;
  country: string;
  latitude: string; // int256 in Solidity, use string for big numbers
  longitude: string; // int256 in Solidity, use string for big numbers
}

/**
 * Participant struct from ICleanup
 */
export interface Participant {
  participantAddress: string;
  status: ParticipantStatus;
  appliedAt: string; // uint256 timestamp
}

/**
 * ProofMedia struct from ICleanup
 */
export interface ProofMedia {
  ipfsHash: string;
  mimetype: string;
  uploadedAt: string; // uint256 timestamp
}

/**
 * CleanupData struct from ICleanup
 */
export interface CleanupData {
  id: string; // address - cleanup contract address
  metadata: string;
  category: string;
  status: CleanupStatus;
  location: Location;
  date: string; // uint256 timestamp
  startTime: string; // uint256 timestamp
  endTime: string; // uint256 timestamp
  maxParticipants: string; // uint256
  organizer: string; // address
  createdAt: string; // uint256 timestamp
  updatedAt: string; // uint256 timestamp
  rewardAmount: string; // uint256
  proofSubmitted: boolean;
  proofSubmittedAt: string; // uint256 timestamp
}

export interface CleanupDataMetadata {
  title: string;
  description: string;
  category?: string;
  media?: Array<{
    ipfsHash: string;
    type: "image" | "video";
    name: string;
  }>;
}
// Extended types for UI (not in contract but useful for frontend)
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
  type: "image" | "video";
  url: string;
  size: string;
  uploadedAt: string;
}

export interface CleanupParticipant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: ParticipantStatusUI;
  appliedAt: string;
  rating?: number; // 1-5 stars given by organizer
  isKyced?: boolean; // KYC verification status
  emailVerified?: boolean; // Email verification status
  isOrganizer?: boolean; // Whether user is an organizer
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface Cleanup {
  id: string;
  title: string;
  description: string;
  category: string;
  status: CleanupStatusUI;
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
  metadataMedia?: CleanupMedia[]; // Media from metadata (initial images/videos)
  rewardAmount?: number; // B3TR tokens
}

export interface RewardTransaction {
  id: string;
  type: "earned" | "claimed";
  amount: number;
  cleanupId: string | null;
  streakSubmissionId?: string | null;
  rewardType?: number | null;
  title: string;
  date: string;
  txHash?: string;
  status: "pending" | "completed";
}
