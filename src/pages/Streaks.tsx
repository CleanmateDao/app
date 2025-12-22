import { useMemo, useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Flame,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Play,
  Calendar,
  Trophy,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MediaViewerDialog,
  type MediaItem,
} from "@/components/MediaViewerDialog";
import {
  StreakSubmission,
  transformStreakSubmission,
  transformUserStreakStats,
} from "@/types/streak";
import type { SubgraphStreakSubmission } from "@/services/subgraph/types";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import {
  useInfiniteStreakSubmissions,
  useUserStreakStats,
} from "@/services/subgraph/queries";
import {
  format,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  subWeeks,
} from "date-fns";
import africanPattern from "@/assets/african-pattern.jpg";
import { toReadableB3tr } from "@/lib/utils";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

/**
 * Formats seconds into a human-readable string
 */
function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "now";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) {
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  }
  return `${secs}s`;
}

// Group streaks by week
function groupStreaksByWeek(streaks: StreakSubmission[]) {
  const grouped: {
    weekLabel: string;
    weekStart: Date;
    streaks: StreakSubmission[];
  }[] = [];
  const now = new Date();

  // Create week buckets for last 8 weeks
  for (let i = 0; i < 8; i++) {
    const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });

    let weekLabel = "";
    if (i === 0) weekLabel = "This Week";
    else if (i === 1) weekLabel = "Last Week";
    else weekLabel = `Week of ${format(weekStart, "MMM d")}`;

    const weekStreaks = streaks.filter((streak) => {
      // submittedAt is in milliseconds (converted by transformer from seconds)
      const submittedDate = new Date(Number(streak.submittedAt));
      return isWithinInterval(submittedDate, {
        start: weekStart,
        end: weekEnd,
      });
    });

    if (weekStreaks.length > 0) {
      grouped.push({ weekLabel, weekStart, streaks: weekStreaks });
    }
  }

  return grouped;
}

function StreakCard({
  streak,
  onClick,
}: {
  streak: StreakSubmission;
  onClick: () => void;
}) {
  const statusConfig = {
    pending: {
      icon: Clock,
      label: "Pending",
      color: "text-status-pending",
      bg: "bg-status-pending/20",
    },
    approved: {
      icon: CheckCircle,
      label: "Approved",
      color: "text-status-approved",
      bg: "bg-status-approved/20",
    },
    rejected: {
      icon: XCircle,
      label: "Rejected",
      color: "text-status-rejected",
      bg: "bg-status-rejected/20",
    },
  };

  const config = statusConfig[streak.status];
  const StatusIcon = config.icon;

  // Get the first video URL for thumbnail
  const videoUrl =
    streak.ipfsHashes.find((_, index) =>
      streak.mimetypes[index]?.startsWith("video/")
    ) || streak.ipfsHashes[0];

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="relative flex-shrink-0 w-32 sm:w-36"
    >
      {/* 2:3 aspect ratio video card */}
      <div
        className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted group cursor-pointer"
        onClick={onClick}
      >
        {/* Video thumbnail */}
        {videoUrl ? (
          <video
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            preload="metadata"
            muted
            playsInline
            onLoadedMetadata={(e) => {
              // Seek to first frame for thumbnail
              const video = e.currentTarget;
              video.currentTime = 0.1;
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted-foreground/20 to-muted flex items-center justify-center">
            <Play className="h-8 w-8 text-white/60 group-hover:scale-110 transition-transform" />
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <Play className="h-6 w-6 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
          <Badge
            className={`${config.bg} ${config.color} border-0 text-[10px] px-1.5 py-0.5 backdrop-blur-sm`}
          >
            <StatusIcon className="h-3 w-3 mr-0.5" />
            {config.label}
          </Badge>
          <span className="text-[10px] text-white/80 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
            0:05
          </span>
        </div>

        {/* Bottom overlay info */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
          {streak.status === "approved" && streak.amount && (
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm font-bold text-white">
                +{toReadableB3tr(streak.amount)}
              </span>
              <span className="text-xs text-white/70">B3TR</span>
            </div>
          )}
          {streak.status === "rejected" && streak.rejectionReason && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 mb-1 cursor-help">
                  <Info className="h-3 w-3 text-status-rejected" />
                  <span className="text-xs text-white/70 truncate">
                    See reason
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{streak.rejectionReason}</p>
              </TooltipContent>
            </Tooltip>
          )}
          <p className="text-[10px] text-white/60">
            {format(new Date(Number(streak.submittedAt)), "MMM d · h:mm a")}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Streaks() {
  const navigate = useNavigate();
  const walletAddress = useWalletAddress();

  // Media viewer state
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [viewerMedia, setViewerMedia] = useState<MediaItem[]>([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  // Fetch streak stats
  const { data: streakStatsData, isLoading: isLoadingStats } =
    useUserStreakStats(walletAddress || undefined);
  const stats = useMemo(() => {
    const transformed = transformUserStreakStats(streakStatsData || null);
    return (
      transformed || {
        totalSubmissions: 0,
        approvedSubmissions: 0,
        rejectedSubmissions: 0,
        pendingSubmissions: 0,
        totalAmount: 0,
        lastSubmissionAt: null,
        streakerCode: null,
      }
    );
  }, [streakStatsData]);

  // Rate limit: 30 minutes from last submission
  const RATE_LIMIT_MINUTES = 30;
  const RATE_LIMIT_MS = useMemo(() => RATE_LIMIT_MINUTES * 60 * 1000, []);

  // Calculate time remaining until can submit
  const [timeUntilCanSubmit, setTimeUntilCanSubmit] = useState(0);

  // Calculate if user can submit based on last submission time
  const canSubmit = useMemo(() => {
    if (!stats.lastSubmissionAt) return true;
    // Use timeUntilCanSubmit to ensure button becomes clickable when countdown reaches zero
    return timeUntilCanSubmit === 0;
  }, [stats.lastSubmissionAt, timeUntilCanSubmit]);

  useEffect(() => {
    if (!stats.lastSubmissionAt) {
      setTimeUntilCanSubmit(0);
      return;
    }

    const updateCountdown = () => {
      const lastSubmissionTime = Number(stats.lastSubmissionAt);
      const now = Date.now();
      const elapsed = now - lastSubmissionTime;
      const remaining = Math.max(0, RATE_LIMIT_MS - elapsed);
      setTimeUntilCanSubmit(Math.floor(remaining / 1000)); // Convert to seconds
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [stats.lastSubmissionAt, RATE_LIMIT_MS]);

  // Fetch user streak submissions with infinite scroll
  const {
    data: submissionsData,
    isLoading: isLoadingSubmissions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteStreakSubmissions(
    {
      where: walletAddress ? { user: walletAddress } : undefined,
      orderBy: "submittedAt",
      orderDirection: "desc",
    },
    20 // pageSize
  );

  // Flatten all pages into a single array
  const submissions = useMemo(() => {
    if (!submissionsData || !("pages" in submissionsData)) return [];
    const pages = submissionsData.pages as SubgraphStreakSubmission[][];
    const allSubmissions = pages.flat();
    return allSubmissions.map(transformStreakSubmission);
  }, [submissionsData]);

  // Track which rejected streaks we've already notified about
  const notifiedRejectionsRef = useRef<Set<string>>(new Set());

  // Show toast notification when a streak is rejected
  useEffect(() => {
    if (isLoadingSubmissions || submissions.length === 0) return;

    submissions.forEach((streak) => {
      // Check if this is a rejected streak with a rejection reason
      if (
        streak.status === "rejected" &&
        streak.rejectionReason &&
        !notifiedRejectionsRef.current.has(streak.id)
      ) {
        // Mark this rejection as notified
        notifiedRejectionsRef.current.add(streak.id);

        // Show toast notification with rejection reason
        toast.error("Streak Rejected", {
          description: streak.rejectionReason,
          duration: 10000, // Show for 10 seconds to give user time to read
        });
      }
    });
  }, [submissions, isLoadingSubmissions]);

  const groupedStreaks = useMemo(() => {
    return groupStreaksByWeek(submissions);
  }, [submissions]);

  const isLoading = isLoadingStats || isLoadingSubmissions;

  // Convert streak IPFS hashes to MediaItem format
  const convertStreakToMediaItems = useCallback(
    (streak: StreakSubmission): MediaItem[] => {
      return streak.ipfsHashes.map((hash, index) => {
        const mimetype = streak.mimetypes[index] || "";
        const isVideo = mimetype.startsWith("video/");
        return {
          url: hash,
          type: isVideo ? "video" : "image",
          caption: `Streak submission from ${format(
            new Date(Number(streak.submittedAt)),
            "MMM d, yyyy"
          )}`,
        };
      });
    },
    []
  );

  // Handle opening media viewer
  const handleOpenMediaViewer = useCallback(
    (streak: StreakSubmission) => {
      const mediaItems = convertStreakToMediaItems(streak);
      if (mediaItems.length > 0) {
        setViewerMedia(mediaItems);
        setViewerInitialIndex(0);
        setMediaViewerOpen(true);
      }
    },
    [convertStreakToMediaItems]
  );

  // Intersection Observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [handleLoadMore]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header with African Pattern */}
      <div className="relative overflow-hidden rounded-xl mx-4 lg:mx-6 mt-4">
        <div className="absolute inset-0">
          <img
            src={africanPattern}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        </div>
        <div className="relative p-5 sm:p-6">
          {/* Back button */}
          <div className="mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="bg-background/50 hover:bg-background/80"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Streaks</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Your sustainable action journey
              </p>
            </div>

            <Button
              onClick={() => navigate("/streaks/submit")}
              className="w-full sm:w-auto gap-2"
              disabled={!canSubmit}
            >
              <Plus className="h-4 w-4" />
              {!canSubmit && timeUntilCanSubmit > 0
                ? `Wait ${formatTimeRemaining(timeUntilCanSubmit)}`
                : "New Streak"}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        {/* Gamified Stats Section */}
        <motion.div {...fadeIn}>
          {/* Main B3TR Card with glow effect */}
          {isLoading ? (
            <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent mb-6">
              <CardContent className="relative p-5 sm:p-6">
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent mb-6">
                {/* Animated glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />

                <CardContent className="relative p-5 sm:p-6 flex items-center justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">
                          Earned
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <motion.span
                          className="text-4xl sm:text-5xl font-bold text-primary"
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {toReadableB3tr(stats.totalAmount)}
                        </motion.span>
                        <span className="text-lg font-semibold text-primary/70">
                          B3TR
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-center gap-2 sm:gap-3 h-24">
                    {(() => {
                      const maxValue = Math.max(
                        stats.approvedSubmissions,
                        stats.pendingSubmissions,
                        stats.totalSubmissions,
                        1 // Prevent division by zero
                      );
                      const statBars = [
                        {
                          value: stats.approvedSubmissions,
                          label: "Approved",
                          color: "bg-status-approved",
                          icon: CheckCircle,
                        },
                        {
                          value: stats.pendingSubmissions,
                          label: "Pending",
                          color: "bg-status-pending",
                          icon: Clock,
                        },
                        {
                          value: stats.totalSubmissions,
                          label: "Total",
                          color: "bg-primary",
                          icon: Flame,
                        },
                      ];
                      return statBars.map((stat, i) => {
                        const heightPercent = (stat.value / maxValue) * 100;
                        const StatIcon = stat.icon;
                        return (
                          <motion.div
                            key={i}
                            className="flex flex-col items-center gap-2"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 + i * 0.05 }}
                          >
                            <p className="text-sm sm:text-base font-bold">
                              {stat.value}
                            </p>
                            <div className="w-6 sm:w-8 h-12 bg-muted/30 rounded-full relative overflow-hidden flex flex-col justify-end">
                              <motion.div
                                className={`w-full ${stat.color} rounded-full`}
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPercent}%` }}
                                transition={{
                                  delay: 0.2 + i * 0.05,
                                  duration: 0.4,
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <StatIcon className="h-3 w-3" />
                              <span className="text-xs">{stat.label}</span>
                            </div>
                          </motion.div>
                        );
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Grouped Streaks */}
        <AnimatePresence mode="wait">
          {groupedStreaks.length > 0 ? (
            <div className="space-y-6">
              {groupedStreaks.map((group) => (
                <motion.div
                  key={group.weekLabel}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-medium text-muted-foreground">
                      {group.weekLabel}
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      {group.streaks.length}
                    </Badge>
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    {group.streaks.map((streak) => (
                      <StreakCard
                        key={streak.id}
                        streak={streak}
                        onClick={() => handleOpenMediaViewer(streak)}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Infinite scroll trigger and loading indicator */}
              <div ref={loadMoreRef} className="py-4">
                {isFetchingNextPage && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Loading more streaks...</span>
                  </div>
                )}
                {!hasNextPage && submissions.length > 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      You've reached the end of your streaks
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : !isLoadingSubmissions ? (
            <motion.div {...fadeIn} className="text-center py-12">
              <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No streaks yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start your sustainable action journey today!
              </p>
              <Button onClick={() => navigate("/streaks/submit")}>
                Record Your First Streak
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Media Viewer Dialog */}
      <MediaViewerDialog
        open={mediaViewerOpen}
        onOpenChange={setMediaViewerOpen}
        media={viewerMedia}
        initialIndex={viewerInitialIndex}
      />
    </div>
  );
}
