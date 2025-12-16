import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  TrendingUp,
  Loader2,
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
  StreakSubmission,
  transformStreakSubmission,
  transformUserStreakStats,
} from "@/types/streak";
import type { SubgraphStreakSubmission } from "@/services/subgraph/types";
import { useIsMobile } from "@/hooks/use-mobile";
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
  parseISO,
  subWeeks,
} from "date-fns";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

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
      const submittedDate = parseISO(streak.submittedAt);
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

function StreakCard({ streak }: { streak: StreakSubmission }) {
  const statusConfig = {
    pending: {
      icon: Clock,
      label: "Pending",
      color: "text-status-pending",
      bg: "bg-status-pending/10",
      border: "border-status-pending/30",
    },
    approved: {
      icon: CheckCircle,
      label: "Approved",
      color: "text-status-approved",
      bg: "bg-status-approved/10",
      border: "border-status-approved/30",
    },
    rejected: {
      icon: XCircle,
      label: "Rejected",
      color: "text-status-rejected",
      bg: "bg-status-rejected/10",
      border: "border-status-rejected/30",
    },
  };

  const config = statusConfig[streak.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="relative"
    >
      <Card className={`border ${config.border} ${config.bg} overflow-hidden`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-3">
            {/* Video thumbnail placeholder */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg bg-muted overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="h-6 w-6 text-muted-foreground" />
              </div>
              {/* Duration badge */}
              <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-background/80 rounded text-[10px] font-medium">
                0:05
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <StatusIcon className={`h-4 w-4 ${config.color}`} />
                <Badge
                  variant="outline"
                  className={`${config.color} ${config.bg} border-0 text-xs`}
                >
                  {config.label}
                </Badge>
                {streak.status === "approved" && streak.amount && (
                  <Badge variant="secondary" className="text-xs">
                    +{streak.amount} B3TR
                  </Badge>
                )}
                {streak.status === "rejected" && streak.rejectionReason && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-status-rejected cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">{streak.rejectionReason}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              <p className="text-sm text-foreground line-clamp-2 mb-1">
                {streak.metadata}
              </p>

              <p className="text-xs text-muted-foreground">
                {format(parseISO(streak.submittedAt), "MMM d, yyyy · h:mm a")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Streaks() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const walletAddress = useWalletAddress();

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

  const groupedStreaks = useMemo(() => {
    return groupStreaksByWeek(submissions);
  }, [submissions]);

  const isLoading = isLoadingStats || isLoadingSubmissions;

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
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header with Stats */}
      <motion.div {...fadeIn}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Streaks</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Your sustainable action journey
            </p>
          </div>

          {isMobile === true && (
            <Button
              onClick={() => navigate("/streaks/submit")}
              className="w-full sm:w-auto gap-2"
            >
              <Plus className="h-4 w-4" />
              New Streak
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-border/50 bg-card/50">
                <CardContent className="p-3 sm:p-4">
                  <div className="h-16 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Total B3TR
                  </span>
                </div>
                <p className="text-xl font-bold">{stats.totalAmount}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-status-approved" />
                  <span className="text-xs text-muted-foreground">
                    Approved
                  </span>
                </div>
                <p className="text-xl font-bold">{stats.approvedSubmissions}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-status-pending" />
                  <span className="text-xs text-muted-foreground">Pending</span>
                </div>
                <p className="text-xl font-bold">{stats.pendingSubmissions}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Total</span>
                </div>
                <p className="text-xl font-bold">{stats.totalSubmissions}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Streaker Code */}
        <Card className="border-primary/30 bg-primary/5 mb-6">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Your Streaker Code
            </p>
            <p className="font-mono font-bold text-lg text-primary">
              {stats.streakerCode || "Not joined yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Show this code in your videos for validation
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Desktop message */}
      {isMobile === false && (
        <Card className="border-border/50 bg-muted/50">
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Switch to mobile to record and submit new streaks
            </p>
          </CardContent>
        </Card>
      )}

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

                <div className="space-y-3">
                  {group.streaks.map((streak) => (
                    <StreakCard key={streak.id} streak={streak} />
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
            {isMobile === true && (
              <Button onClick={() => navigate("/streaks/submit")}>
                Record Your First Streak
              </Button>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
