import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  Leaf,
  MapPin,
  Users,
  Gift,
  MoreHorizontal,
  Loader2,
  Flame,
  ChevronRight,
} from "lucide-react";
import africanPattern from "@/assets/african-pattern.jpg";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCleanups,
  useUserCleanups,
  useRewards,
  useUser,
  useUserStreakStats,
} from "@/services/subgraph/queries";
import {
  transformCleanup,
  transformTransaction,
  transformUserToProfile,
  calculateInsights,
} from "@/services/subgraph/transformers";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { transformUserStreakStats } from "@/types/streak";
import { JoinStreakDrawer } from "@/components/JoinStreakDrawer";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Insights() {
  const [query, setQuery] = useState("");
  const [joinStreakOpen, setJoinStreakOpen] = useState(false);
  const navigate = useNavigate();
  const walletAddress = useWalletAddress();

  // Fetch user data
  const { data: userData } = useUser(walletAddress);
  const userProfile = useMemo(
    () =>
      userData
        ? transformUserToProfile(userData, walletAddress || undefined)
        : null,
    [userData, walletAddress]
  );

  // Fetch user's organized cleanups
  const { data: organizedCleanupsData, isLoading: isLoadingOrganizedCleanups } =
    useUserCleanups(walletAddress || undefined, { first: 1000 });

  // Fetch all cleanups to find ones where user participated
  const { data: allCleanupsData, isLoading: isLoadingAllCleanups } =
    useCleanups({
      where: { published: true },
      first: 1000,
      userAddress: walletAddress || undefined,
    });

  // Combine user's cleanups (organized + participated)
  const userCleanups = useMemo(() => {
    if (!walletAddress) return [];

    const organized = organizedCleanupsData || [];
    const allCleanups = allCleanupsData || [];

    // Find cleanups where user is a participant (but not organizer)
    const participatedCleanups = allCleanups.filter((cleanup) => {
      const isOrganizer =
        cleanup.organizer.toLowerCase() === walletAddress.toLowerCase();
      if (isOrganizer) return false; // Already in organized list

      return cleanup.participants.some(
        (p) =>
          p.participant.toLowerCase() === walletAddress.toLowerCase() &&
          p.status.toLowerCase() === "accepted"
      );
    });

    // Combine and remove duplicates
    const allUserCleanups = [...organized, ...participatedCleanups];
    const uniqueCleanups = Array.from(
      new Map(allUserCleanups.map((c) => [c.id.toLowerCase(), c])).values()
    );

    return uniqueCleanups.map((c) => transformCleanup(c));
  }, [organizedCleanupsData, allCleanupsData, walletAddress]);

  // For nearby events, use all published cleanups
  const nearbyCleanups = useMemo(() => {
    if (!allCleanupsData) return [];
    return allCleanupsData
      .filter((c) => c.status === 1 || c.status === 2) // OPEN or IN_PROGRESS
      .map((c) => transformCleanup(c));
  }, [allCleanupsData]);

  const isLoadingCleanups = isLoadingOrganizedCleanups || isLoadingAllCleanups;

  // Fetch rewards (transactions)
  const { data: rewardsData, isLoading: isLoadingRewards } = useRewards(
    walletAddress || undefined,
    { first: 1000 }
  );
  const rewards = useMemo(() => {
    if (!rewardsData) return [];
    return rewardsData.map((r) => transformTransaction(r));
  }, [rewardsData]);

  // Fetch streak stats
  const { data: streakStatsData } = useUserStreakStats(
    walletAddress || undefined
  );
  const streakStats = useMemo(() => {
    return transformUserStreakStats(streakStatsData || null);
  }, [streakStatsData]);

  // Calculate insights (user-specific)
  const insightsData = useMemo(() => {
    return calculateInsights(
      userCleanups,
      rewards,
      userProfile,
      nearbyCleanups
    );
  }, [userCleanups, rewards, userProfile, nearbyCleanups]);

  const isLoading = isLoadingCleanups || isLoadingRewards;

  // Default insights data to prevent undefined access
  const safeInsightsData = insightsData || {
    totalRewards: 0,
    cleanupsCompleted: 0,
    activeCleanupsNearby: 0,
    participantsHelped: 0,
    monthlyData: [],
    categoryData: [],
  };

  const quickActions = [
    "Show me nearby cleanups",
    "What's my reward balance?",
    "Summarize my activity",
  ];

  const handleAskQuestion = (question: string) => {
    if (question.trim()) {
      navigate("/ai-chat", { state: { initialQuery: question } });
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 lg:space-y-8 max-w-5xl mx-auto">
      {/* AI Chat Hero with African Pattern */}
      <motion.div
        {...fadeIn}
        className="relative text-center py-8 lg:py-12 px-4 lg:px-6 rounded-2xl overflow-hidden"
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `url(${africanPattern})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4 lg:mb-6">
            <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
            <span className="text-xs lg:text-sm font-medium text-primary">
              Ask Temi
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 lg:mb-8 tracking-tight">
            Ask about <span className="text-primary">cleanups & rewards</span>
          </h1>

          <div className="flex gap-2 lg:gap-3 max-w-xl mx-auto mb-4 lg:mb-6">
            <Input
              placeholder="Ask anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskQuestion(query)}
              className="flex-1 h-10 lg:h-12 text-sm lg:text-base bg-background/80 backdrop-blur-sm"
            />
            <Button
              size="default"
              className="h-10 lg:h-12 px-4 lg:px-6 gap-2"
              onClick={() => handleAskQuestion(query)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleAskQuestion(action)}
                className="px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm rounded-full border border-border/50 bg-background/60 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Streaks CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card
          className="border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent cursor-pointer hover:border-primary/50 transition-colors overflow-hidden group"
          onClick={() => {
            if (!streakStats?.streakerCode) {
              setJoinStreakOpen(true);
            } else {
              navigate("/streaks");
            }
          }}
        >
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                    Streaks
                    <span className="text-xs font-normal text-muted-foreground hidden sm:inline">
                      Individual sustainable actions
                    </span>
                  </h3>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                    {streakStats ? (
                      <>
                        <span>{streakStats.approvedSubmissions} approved</span>
                        <span className="text-primary font-medium">
                          +{streakStats.totalAmount} B3TR
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        Join to start earning
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Metrics Row */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <motion.div key={i} variants={fadeIn}>
                <Card className="border-border/50 bg-card/50 relative overflow-hidden h-full">
                  <CardContent className="p-3 sm:p-4 lg:p-5 relative z-10 h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              </motion.div>
            ))
          : [
              {
                label: "Total Rewards",
                value: `${safeInsightsData.totalRewards} B3TR`,
                change: "",
                up: null,
                icon: Gift,
              },
              {
                label: "Cleanups Done",
                value: safeInsightsData.cleanupsCompleted,
                change: "",
                up: null,
                icon: Leaf,
              },
              {
                label: "Nearby Events",
                value: safeInsightsData.activeCleanupsNearby,
                change: "Active",
                up: null,
                icon: MapPin,
              },
              {
                label: "People Helped",
                value: safeInsightsData.participantsHelped,
                change: "",
                up: null,
                icon: Users,
              },
            ].map((metric, i) => {
              const ringColors = [
                "border-primary",
                "border-status-approved",
                "border-accent",
                "border-chart-4",
              ];
              const ringColor = ringColors[i];
              const Icon = metric.icon;

              return (
                <motion.div key={i} variants={fadeIn}>
                  <Card className="border-border/50 bg-card/50 relative overflow-hidden h-full">
                    {/* Semi-circle rings decoration */}
                    <div
                      className={`absolute -bottom-12 -right-12 w-24 h-24 rounded-full border-[3px] ${ringColor}/10`}
                    />
                    <div
                      className={`absolute -bottom-8 -right-8 w-16 h-16 rounded-full border-[3px] ${ringColor}/15`}
                    />
                    <div
                      className={`absolute -bottom-4 -right-4 w-8 h-8 rounded-full border-[3px] ${ringColor}/20`}
                    />

                    <CardContent className="p-3 sm:p-4 lg:p-5 relative z-10 h-full flex flex-col">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {metric.label}
                        </p>
                      </div>
                      <div className="flex items-end justify-between mt-auto">
                        <span className="text-lg sm:text-xl lg:text-2xl font-semibold">
                          {metric.value}
                        </span>
                        {metric.up !== null && (
                          <span
                            className={`flex items-center text-[10px] sm:text-xs ${
                              metric.up
                                ? "text-status-approved"
                                : "text-status-rejected"
                            }`}
                          >
                            {metric.up ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            {metric.change}
                          </span>
                        )}
                        {metric.up === null && (
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {metric.change}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
      </motion.div>

      {/* Minimal Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-border/50 bg-card/50 overflow-hidden">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 lg:mb-6">
              <div>
                <h3 className="font-medium text-sm lg:text-base">
                  Activity Trend
                </h3>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  Cleanups & Rewards over time
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs lg:text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Rewards (B3TR)
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  Cleanups
                </span>
              </div>
            </div>

            <div className="h-40 lg:h-48">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={safeInsightsData.monthlyData}>
                    <defs>
                      <linearGradient
                        id="rewardsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="100%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                      dy={10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        fontSize: 12,
                        boxShadow: "var(--shadow-card)",
                      }}
                      formatter={(value: number, name: string) => [
                        name === "rewards" ? `${value} B3TR` : value,
                        name === "rewards" ? "Rewards" : "Cleanups",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="cleanups"
                      stroke="hsl(var(--muted-foreground) / 0.3)"
                      strokeWidth={1.5}
                      fill="transparent"
                      strokeDasharray="4 4"
                    />
                    <Area
                      type="monotone"
                      dataKey="rewards"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#rewardsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-border/50 bg-card/50 relative overflow-hidden">
          {/* Decorative rings */}
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full border-[3px] border-primary/5" />
          <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full border-[3px] border-primary/10" />
          <div className="absolute -bottom-12 -right-12 w-24 h-24 rounded-full border-[3px] border-primary/15" />

          <CardContent className="p-4 lg:p-6 relative z-10">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="font-medium text-sm lg:text-base">
                Cleanups by Category
              </h3>
              <span className="text-xs text-muted-foreground">
                Distribution
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                safeInsightsData.categoryData.map((item, index) => {
                  const icons = [Leaf, MapPin, Leaf, Leaf, MoreHorizontal];
                  const Icon = icons[index] || MoreHorizontal;

                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                      className="group relative p-3 lg:p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background hover:border-border transition-all cursor-default"
                    >
                      {/* Background glow on hover */}
                      <div
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          background: `radial-gradient(circle at center, ${item.fill.replace(
                            ")",
                            " / 0.1)"
                          )}, transparent 70%)`,
                        }}
                      />

                      <div className="relative z-10">
                        {/* Icon and percentage */}
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                              backgroundColor: item.fill.replace(
                                ")",
                                " / 0.15)"
                              ),
                            }}
                          >
                            <Icon
                              className="w-5 h-5"
                              style={{ color: item.fill }}
                            />
                          </div>
                          <span className="text-2xl font-semibold">
                            {item.value}%
                          </span>
                        </div>

                        {/* Category name */}
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.name}
                        </p>

                        {/* Progress bar */}
                        <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.fill }}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{
                              duration: 0.8,
                              delay: 0.6 + index * 0.1,
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Join Streak Drawer */}
      <JoinStreakDrawer
        open={joinStreakOpen}
        onOpenChange={setJoinStreakOpen}
      />
    </div>
  );
}
