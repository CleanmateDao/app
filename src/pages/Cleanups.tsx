import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Users,
  Map,
  List,
  Loader2,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CleanupStatus, Cleanup } from "@/types/cleanup";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CleanupMap } from "@/components/cleanup/CleanupMap";
import { BottomNav } from "@/components/layout/BottomNav";
import { useCleanups, useUserCleanups } from "@/services/subgraph/queries";
import { transformCleanup } from "@/services/subgraph/transformers";
import { mapAppStatusToSubgraph } from "@/services/subgraph/utils";
import { useWalletAddress } from "@/hooks/use-wallet-address";

const statusTabs: {
  label: string;
  value: CleanupStatus | "all" | "created";
}[] = [
  { label: "All", value: "all" },
  { label: "Created", value: "created" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Rewarded", value: "rewarded" },
];

const statusConfig: Record<
  CleanupStatus,
  { label: string; className: string }
> = {
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

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export default function Cleanups() {
  const navigate = useNavigate();
  const walletAddress = useWalletAddress();
  const [activeTab, setActiveTab] = useState<CleanupStatus | "all" | "created">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cleanupToDelete, setCleanupToDelete] = useState<Cleanup | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">(() => {
    const saved = localStorage.getItem("cleanups-view-mode");
    return saved === "list" || saved === "map" ? saved : "map";
  });

  // Determine which query to use based on active tab
  const isCreatedTab = activeTab === "created";
  const statusFilter =
    activeTab !== "all" && !isCreatedTab
      ? mapAppStatusToSubgraph(activeTab)
      : undefined;

  // Fetch all cleanups or user's cleanups
  const { data: allCleanupsData, isLoading: isLoadingAll } = useCleanups(
    {
      status: statusFilter,
      published: true,
      first: 1000,
    },
    { enabled: !isCreatedTab }
  );

  // For created tab, fetch user's cleanups without published filter to include unpublished
  const { data: userCleanupsData, isLoading: isLoadingUser } = useUserCleanups(
    walletAddress || undefined,
    { first: 1000 },
    { enabled: isCreatedTab && !!walletAddress }
  );

  // Transform subgraph data to app format
  const allCleanups = useMemo(() => {
    if (!allCleanupsData) return [];
    return allCleanupsData.map((cleanup) => transformCleanup(cleanup));
  }, [allCleanupsData]);

  const userCleanups = useMemo(() => {
    if (!userCleanupsData) return [];
    return userCleanupsData.map((cleanup) => transformCleanup(cleanup));
  }, [userCleanupsData]);

  const cleanups = isCreatedTab ? userCleanups : allCleanups;
  const isLoading = isCreatedTab ? isLoadingUser : isLoadingAll;

  // Persist view mode
  useEffect(() => {
    localStorage.setItem("cleanups-view-mode", viewMode);
  }, [viewMode]);

  const handleDeleteCleanup = () => {
    // Note: This would need to call a contract function to delete
    // For now, we'll just show a toast
    toast.success("Cleanup deletion requires contract interaction");
    setDeleteDialogOpen(false);
    setCleanupToDelete(null);
  };

  const filteredCleanups = useMemo(() => {
    return cleanups.filter((cleanup) => {
      const matchesSearch =
        cleanup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cleanup.location.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [cleanups, searchQuery]);

  const totalPages = Math.ceil(filteredCleanups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCleanups = filteredCleanups.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const exportToCSV = () => {
    const headers = [
      "Title",
      "Category",
      "Status",
      "Location",
      "Date",
      "Participants",
    ];
    const rows = filteredCleanups.map((c) => [
      c.title,
      c.category,
      c.status,
      `${c.location.city}, ${c.location.country}`,
      c.date,
      c.participants.filter((p) => p.status === "accepted").length,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleanups.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Cleanups exported successfully");
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(filteredCleanups, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleanups.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Cleanups exported successfully");
  };

  // Full screen map mode
  if (viewMode === "map") {
    return (
      <>
        <div className="fixed inset-0 z-40 pb-16 lg:pb-0">
          {/* Floating header */}
          <div className="absolute top-4 left-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
            <div className="flex items-center justify-between">
              <div className="bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border pointer-events-auto">
                <h1 className="text-lg font-semibold">Cleanups</h1>
                <p className="text-muted-foreground text-xs">
                  Browse cleanup events near you
                </p>
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
            <div className="overflow-x-auto w-fit pointer-events-auto">
              <div className="flex gap-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-1 shadow-lg w-fit">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setActiveTab(tab.value);
                      setCurrentPage(1);
                    }}
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

          {/* Full screen map */}
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <CleanupMap cleanups={filteredCleanups} className="h-full w-full" />
          )}
        </div>

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
        <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="flex gap-1 p-1 bg-secondary min-w-max">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap",
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

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search cleanups..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 pl-10 pr-4 bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
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
                  paginatedCleanups.map((cleanup) => (
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
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{cleanup.location.city}</span>
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
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCleanupToDelete(cleanup);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {!isLoading && paginatedCleanups.length === 0 && (
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

          {/* Pagination */}
          {filteredCleanups.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Show</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option.toString()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="hidden sm:inline">entries</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {startIndex + 1}-
                  {Math.min(startIndex + itemsPerPage, filteredCleanups.length)}{" "}
                  of {filteredCleanups.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete cleanup?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{cleanupToDelete?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCleanup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
