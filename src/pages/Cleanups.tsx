import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  Download,
  MapPin,
  Calendar,
  Users,
  Map,
  List,
  Loader2,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Cleanup, CleanupStatusUI } from "@/types/cleanup";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CleanupMap } from "@/components/cleanup/CleanupMap";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  useInfiniteCleanups,
  useUserCleanups,
  useCleanups,
} from "@/services/subgraph/queries";
import { transformCleanup } from "@/services/subgraph/transformers";
import { mapAppStatusToSubgraph } from "@/services/subgraph/utils";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

const statusTabs: {
  label: string;
  value: CleanupStatusUI | "all" | "created";
}[] = [
  { label: "All", value: "all" }, // OPEN, IN_PROGRESS, COMPLETED, REWARDED
  { label: "Created", value: "created" }, // by user, UNPUBLISHED, OPEN, IN_PROGRESS, COMPLETED, REWARDED
  { label: "Open", value: "open" }, // OPEN
  { label: "In Progress", value: "in_progress" }, // IN_PROGRESS
  { label: "Completed", value: "completed" }, // COMPLETED
  { label: "Rewarded", value: "rewarded" }, // REWARDED
];

const statusConfig: Record<
  CleanupStatusUI,
  { label: string; className: string }
> = {
  unpublished: {
    label: "Unpublished",
    className: "bg-muted/10 text-muted-foreground border-muted/20",
  },
  open: {
    label: "Open",
    className:
      "bg-status-approved/10 text-status-approved border-status-approved/20",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  completed: {
    label: "Completed",
    className: "bg-accent/10 text-accent border-accent/20",
  },
  rewarded: {
    label: "Rewarded",
    className: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  },
};

export default function Cleanups() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const walletAddress = useWalletAddress();

  // Initialize activeTab from URL query parameter or default to "all"
  const tabFromUrl = searchParams.get("tab");
  const isValidTab = (
    tab: string | null
  ): tab is CleanupStatusUI | "all" | "created" => {
    if (!tab) return false;
    return statusTabs.some((t) => t.value === tab);
  };

  const [activeTab, setActiveTab] = useState<
    CleanupStatusUI | "all" | "created"
  >(isValidTab(tabFromUrl) ? tabFromUrl : "all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cleanupToDelete, setCleanupToDelete] = useState<Cleanup | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">(() => {
    const saved = localStorage.getItem("cleanups-view-mode");
    return saved === "list" || saved === "map" ? saved : "map";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Update activeTab when URL query parameter changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (isValidTab(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Determine which query to use based on active tab
  const isCreatedTab = activeTab === "created";
  const statusFilter = useMemo(() => {
    if (activeTab === "all" || isCreatedTab) return undefined;
    return mapAppStatusToSubgraph(activeTab);
  }, [activeTab, isCreatedTab]);

  // Fetch all cleanups with infinite scroll (for list view)
  const {
    data: infiniteCleanupsData,
    isLoading: isLoadingAll,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCleanups(
    {
      where: {
        ...(statusFilter !== undefined ? { status: statusFilter } : {}),
        published: true,
      },
      userAddress: walletAddress || undefined,
    },
    20,
    { enabled: !isCreatedTab && viewMode === "list" }
  );

  // Fetch all cleanups with 1000 limit (for map view)
  const { data: mapCleanupsData, isLoading: isLoadingMap } = useCleanups(
    {
      where: {
        ...(statusFilter !== undefined ? { status: statusFilter } : {}),
        published: true,
      },
      first: 1000,
      userAddress: walletAddress || undefined,
    },
    { enabled: !isCreatedTab && viewMode === "map" }
  );

  // For created tab, fetch user's cleanups without published filter to include unpublished
  const { data: userCleanupsData, isLoading: isLoadingUser } = useUserCleanups(
    walletAddress || undefined,
    { first: 1000 },
    { enabled: isCreatedTab && !!walletAddress }
  );

  // Transform and flatten infinite query data (for list view)
  const allCleanupsList = useMemo(() => {
    if (!infiniteCleanupsData?.pages) return [];
    return infiniteCleanupsData.pages.flatMap((page) =>
      page.map((cleanup) => transformCleanup(cleanup))
    );
  }, [infiniteCleanupsData]);

  // Transform map query data (for map view)
  const allCleanupsMap = useMemo(() => {
    if (!mapCleanupsData) return [];
    return mapCleanupsData.map((cleanup) => transformCleanup(cleanup));
  }, [mapCleanupsData]);

  const userCleanups = useMemo(() => {
    if (!userCleanupsData) return [];
    return userCleanupsData.map((cleanup) => transformCleanup(cleanup));
  }, [userCleanupsData]);

  const cleanups = isCreatedTab
    ? userCleanups
    : viewMode === "map"
    ? allCleanupsMap
    : allCleanupsList;
  const isLoading = isCreatedTab
    ? isLoadingUser
    : viewMode === "map"
    ? isLoadingMap
    : isLoadingAll;

  // Infinite scroll hook
  const sentinelRef = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage: isFetchingNextPage ?? false,
    fetchNextPage,
  });

  // Persist view mode and notify DashboardLayout
  useEffect(() => {
    localStorage.setItem("cleanups-view-mode", viewMode);
    // Dispatch custom event to notify DashboardLayout of view mode change
    window.dispatchEvent(new Event("cleanups-view-mode-changed"));
  }, [viewMode]);

  const handleDeleteCleanup = () => {
    // Note: This would need to call a contract function to delete
    // For now, we'll just show a toast
    toast.success("Cleanup deletion requires contract interaction");
    setDeleteDialogOpen(false);
    setCleanupToDelete(null);
  };

  // Full screen map mode
  if (viewMode === "map") {
    return (
      <>
        <div className="fixed inset-0 z-40 pb-16 lg:pb-0">
          {/* Floating header */}
          <div className="absolute top-4 left-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Hamburger Menu Button - Hidden on mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex h-10 w-10 bg-card/95 backdrop-blur-sm border border-border shadow-lg pointer-events-auto"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div className="bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border pointer-events-auto">
                  <h1 className="text-lg font-semibold">Cleanups</h1>
                  <p className="text-muted-foreground text-xs">
                    Browse cleanup events near you
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pointer-events-auto">
                {/* View Toggle */}
                <div className="flex items-center bg-card/95 backdrop-blur-sm border border-border rounded-lg p-1 shadow-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setViewMode("map")}
                  >
                    <Map className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={() => navigate("/organize")}
                  size="sm"
                  className="shadow-lg"
                >
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Organize</span>
                </Button>
              </div>
            </div>

            {/* Filters for map view */}
            <div className="pointer-events-auto">
              {/* Mobile: Dropdown */}
              <div className="lg:hidden w-fit min-w-20">
                <Select
                  value={activeTab}
                  onValueChange={(value) =>
                    setActiveTab(value as CleanupStatusUI | "all" | "created")
                  }
                >
                  <SelectTrigger className="w-full bg-card/95 backdrop-blur-sm border border-border shadow-lg">
                    <SelectValue>
                      {statusTabs.find((tab) => tab.value === activeTab)
                        ?.label || "All"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statusTabs.map((tab) => (
                      <SelectItem key={tab.value} value={tab.value}>
                        {tab.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop: Tabs */}
              <div className="hidden lg:block overflow-x-auto w-fit">
                <div className="flex gap-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-1 shadow-lg w-fit">
                  {statusTabs.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium transition-colors rounded-md whitespace-nowrap",
                        activeTab === tab.value
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-card"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Full screen map */}
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <CleanupMap cleanups={cleanups} className="h-full w-full" />
          )}
        </div>

        {/* Sidebar Sheet for Navigation */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="left"
            className="p-0 w-72 bg-transparent border-0 shadow-none"
            overlayClassName="bg-transparent"
          >
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-xl lg:text-2xl font-semibold">Cleanups</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Browse and join cleanup events near you
          </p>
        </motion.div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Toggle */}
          <div className="flex items-center border border-border rounded-lg p-1">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 px-3"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3"
              onClick={() => setViewMode("map")}
            >
              <Map className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={() => navigate("/organize")} size="sm">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Organize Cleanup</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        {/* Status Tabs */}
        <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 rounded-md">
          <div className="flex gap-1 p-1 bg-secondary min-w-max">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                  activeTab === tab.value
                    ? "bg-card text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cleanup</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Location
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : (
                  cleanups.map((cleanup) => (
                    <TableRow
                      key={cleanup.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/cleanups/${cleanup.id}`)}
                    >
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium truncate hover:text-primary transition-colors">
                            {cleanup.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {cleanup.category}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <div className="flex flex-col">
                            {cleanup.location.address && (
                              <span className="font-medium text-xs truncate max-w-[200px]">
                                {cleanup.location.address}
                              </span>
                            )}
                            <span className="text-muted-foreground text-xs">
                              {[cleanup.location.city, cleanup.location.country]
                                .filter(Boolean)
                                .join(", ") || "Location not specified"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={statusConfig[cleanup.status].className}
                        >
                          {statusConfig[cleanup.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{cleanup.date}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span>
                            {
                              cleanup.participants.filter(
                                (p) => p.status === "accepted"
                              ).length
                            }
                            /{cleanup.maxParticipants}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/cleanups/${cleanup.id}`)
                              }
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {!isLoading && cleanups.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <p className="text-muted-foreground">No cleanups found</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => navigate("/organize")}
                      >
                        Organize your first cleanup
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Infinite Scroll Sentinel */}
          {!isCreatedTab && (
            <div
              ref={sentinelRef}
              className="h-4 flex items-center justify-center py-4"
            >
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading more cleanups...</span>
                </div>
              )}
              {!hasNextPage && cleanups.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  No more cleanups to load
                </p>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
