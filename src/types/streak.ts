import type { SubgraphStreakSubmission, SubgraphUserStreakStats } from "@/services/subgraph/types";
import { bigIntToNumber, bigIntToDate } from "@/services/subgraph/utils";

export interface StreakRule {
  id: string;
  title: string;
  description: string;
}

export const STREAK_RULES: StreakRule[] = [
  {
    id: "1",
    title: "Show your streaker code",
    description: "Write your unique streaker code on paper and show it clearly in the video",
  },
  {
    id: "2",
    title: "Record your action",
    description: "Film yourself performing a sustainable action (recycling, planting, cleaning, etc.)",
  },
  {
    id: "3",
    title: "Keep it short",
    description: "Record for up to 5 seconds - make it clear and concise",
  },
  {
    id: "4",
    title: "Be authentic",
    description: "Show real actions that contribute to environmental sustainability",
  },
];

export interface StreakSubmission {
  id: string;
  submissionId: string;
  metadata: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt: string | null;
  amount: number | null;
  rejectionReason: string | null;
  ipfsHashes: string[];
  mimetypes: string[];
}

export interface UserStreakStats {
  totalSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  pendingSubmissions: number;
  totalAmount: number;
  lastSubmissionAt: string | null;
  streakerCode: string | null;
}

/**
 * Transform subgraph streak submission to app streak submission
 */
export function transformStreakSubmission(
  submission: SubgraphStreakSubmission
): StreakSubmission {
  const statusMap: Record<number, "pending" | "approved" | "rejected"> = {
    0: "pending",
    1: "approved",
    2: "rejected",
  };

  return {
    id: submission.id,
    submissionId: submission.submissionId,
    metadata: submission.metadata,
    status: statusMap[submission.status] || "pending",
    submittedAt: bigIntToDate(submission.submittedAt) || "",
    reviewedAt: submission.reviewedAt ? bigIntToDate(submission.reviewedAt) || null : null,
    amount: submission.amount ? bigIntToNumber(submission.amount) : null,
    rejectionReason: submission.rejectionReason,
    ipfsHashes: submission.ipfsHashes,
    mimetypes: submission.mimetypes,
  };
}

/**
 * Transform subgraph user streak stats to app user streak stats
 */
export function transformUserStreakStats(
  stats: SubgraphUserStreakStats | null
): UserStreakStats | null {
  if (!stats) return null;

  return {
    totalSubmissions: bigIntToNumber(stats.totalSubmissions),
    approvedSubmissions: bigIntToNumber(stats.approvedSubmissions),
    rejectedSubmissions: bigIntToNumber(stats.rejectedSubmissions),
    pendingSubmissions: bigIntToNumber(stats.pendingSubmissions),
    totalAmount: bigIntToNumber(stats.totalAmount),
    lastSubmissionAt: stats.lastSubmissionAt ? bigIntToDate(stats.lastSubmissionAt) || null : null,
    streakerCode: stats.streakerCode || null,
  };
}

