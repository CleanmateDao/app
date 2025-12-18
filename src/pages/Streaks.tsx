import { useMemo, useEffect, useRef, useCallback } from "react";
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
import africanPattern from "@/assets/african-pattern.jpg";

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

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="relative flex-shrink-0 w-32 sm:w-36"
    >
      {/* 2:3 aspect ratio video card */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted group cursor-pointer">
        {/* Full video background */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted-foreground/20 to-muted flex items-center justify-center">
          <Play className="h-8 w-8 text-white/60 group-hover:scale-110 transition-transform" />
        </div>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
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
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          {streak.status === "approved" && streak.amount && (
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm font-bold text-white">
                +{streak.amount}
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
            {format(parseISO(streak.submittedAt), "MMM d · h:mm a")}
          </p>
        </div>
      </div>
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
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header with African Pattern */}
      <div className="relative overflow-hidden rounded-xl mx-4 lg:mx-6">
        <div className="absolute inset-0">
          <img
            src={africanPattern}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        </div>
        <div className="relative p-5 sm:p-6">
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
        </div>
      </div>

      <div className="px-4 lg:px-6">
        {/* Gamified Stats Section */}
        <motion.div {...fadeIn}>
          {/* Main B3TR Card with glow effect */}
          {isLoading ? (
            <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent mb-4">
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
              <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent mb-4">
                {/* Animated glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />

                <CardContent className="relative p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">
                          Total Earned
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <motion.span
                          className="text-4xl sm:text-5xl font-bold text-primary"
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {stats.totalAmount.toLocaleString()}
                        </motion.span>
                        <span className="text-lg font-semibold text-primary/70">
                          B3TR
                        </span>
                      </div>
                    </div>

                    {/* Mini chart visualization */}
                    <div className="hidden sm:flex items-end gap-1 h-16">
                      {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                        <motion.div
                          key={i}
                          className="w-2 bg-primary/30 rounded-full"
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stat Pills */}
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-border/50 bg-card/50">
                  <CardContent className="p-3 sm:p-4">
                    <div className="h-20 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-status-approved/30 bg-status-approved/5 hover:bg-status-approved/10 transition-colors">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="w-8 h-8 rounded-full bg-status-approved/20 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-4 w-4 text-status-approved" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-status-approved">
                      {stats.approvedSubmissions}
                    </p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <Card className="border-status-pending/30 bg-status-pending/5 hover:bg-status-pending/10 transition-colors">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="w-8 h-8 rounded-full bg-status-pending/20 flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-4 w-4 text-status-pending" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-status-pending">
                      {stats.pendingSubmissions}
                    </p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                      <Flame className="h-4 w-4 text-foreground" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold">
                      {stats.totalSubmissions}
                    </p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Streaker Code Card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 to-transparent mb-6">
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-primary/10 to-transparent" />
            <CardContent className="relative p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                    Your Streaker Code
                  </p>
                  <p className="font-mono font-bold text-xl sm:text-2xl text-primary tracking-wider">
                    {stats.streakerCode || "Not joined yet"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Show this code in your videos
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">🏷️</span>
                </div>
              </div>
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

                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
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
    </div>
  );
}
