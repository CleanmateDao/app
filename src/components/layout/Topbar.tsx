import { Bell, Sparkles, Menu, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { WalletButton } from "@vechain/vechain-kit";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { useReadNotification } from "@/hooks/use-read-notification";
import { useNotifications as useSubgraphNotifications } from "@/services/subgraph/queries";
import { formatRelativeTime } from "@/lib/time";
import temiAvatar from "@/assets/temi.png";
import CleanMateLogoIcon from "../icons/logo-icon";

interface TopbarProps {
  onMenuClick?: () => void;
}

// Route to breadcrumb label mapping
const routeLabels: Record<string, string> = {
  "/dashboard": "Overview",
  "/cleanups": "Cleanups",
  "/organize": "Organize",
  "/rewards": "Rewards",
  "/ai-chat": "AI Chat",
  "/notifications": "Notifications",
  "/settings": "Settings",
  "/streaks": "Streaks",
  "/streaks/submit": "Submit Streak",
};

// Get breadcrumb segments from current path
const getBreadcrumbs = (
  pathname: string,
  params: Record<string, string | undefined>
) => {
  const segments: Array<{ label: string; path?: string }> = [];

  // Always start with Dashboard
  segments.push({ label: "Dashboard", path: "/dashboard" });

  // Handle specific routes
  if (pathname === "/dashboard") {
    segments.push({ label: "Overview" });
  } else if (pathname.startsWith("/cleanups")) {
    segments.push({ label: "Cleanups", path: "/cleanups" });

    if (params.id) {
      if (pathname.includes("/submit-proof")) {
        segments.push({ label: "Submit Proof" });
      } else {
        segments.push({ label: `Cleanup #${params.id}` });
      }
    }
  } else if (pathname.startsWith("/streaks")) {
    segments.push({ label: "Streaks", path: "/streaks" });

    if (pathname === "/streaks/submit") {
      segments.push({ label: "Submit Streak" });
    }
  } else {
    // For other routes, use the label from mapping or capitalize the route name
    const routeLabel = routeLabels[pathname];
    if (routeLabel) {
      segments.push({ label: routeLabel });
    } else {
      // Fallback: capitalize first letter of route name
      const routeName = pathname.slice(1).split("/")[0];
      segments.push({
        label: routeName.charAt(0).toUpperCase() + routeName.slice(1),
      });
    }
  }

  return segments;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { theme, setTheme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const walletAddress = useWalletAddress();
  const { isRead, markAsRead } = useReadNotification();
  const { data: notifications = [], isLoading } = useSubgraphNotifications(
    walletAddress,
    { first: 8 },
    { refetchInterval: 20_000 }
  );
  // Check if the last (most recent) notification is unread
  const hasUnreadLastNotification = useMemo(() => {
    if (notifications.length === 0) return false;
    const lastNotification = notifications[0]; // Most recent is first
    return !isRead(lastNotification);
  }, [notifications, isRead]);

  // Get breadcrumb segments for current route
  const breadcrumbs = useMemo(
    () => getBreadcrumbs(location.pathname, params),
    [location.pathname, params]
  );

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="h-14 lg:h-16 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/50 lg:border-0 lg:bg-transparent"
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button - hidden when bottom nav is visible */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Logo - Mobile Only */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity lg:hidden"
        >
          <CleanMateLogoIcon />
        </button>

        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-muted-foreground hidden md:inline">
                  /
                </span>
              )}
              {crumb.path ? (
                <button
                  onClick={() => navigate(crumb.path!)}
                  className="text-muted-foreground hidden md:inline hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span
                  className={`hidden md:inline ${
                    index === breadcrumbs.length - 1
                      ? "font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* AI Chat Button - Hidden on ai-chat page */}
        {location.pathname !== "/ai-chat" && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
            onClick={() => navigate("/ai-chat")}
          >
            <div className="relative">
              <Avatar className="h-5 w-5">
                <AvatarImage src={temiAvatar} alt="Temi AI Agent" />
                <AvatarFallback>
                  <Sparkles className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            </div>
            <span className="text-sm font-medium">Temi</span>
          </Button>
        )}

        <div className="w-px h-6 bg-border/60 mx-1" />

        {/* Wallet Connect Style Button */}
        <WalletButton mobileVariant="icon" desktopVariant="iconAndDomain" />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        {/* Notifications */}
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 hover:bg-secondary transition-colors"
            >
              <Bell className="w-4 h-4" />
              {hasUnreadLastNotification && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-0 bg-popover border border-border shadow-elevated z-50"
            align="end"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h4 className="font-semibold text-sm">Notifications</h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary h-auto p-0 hover:bg-transparent"
                onClick={() => markAsRead()}
                disabled={!hasUnreadLastNotification}
              >
                Mark all read
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {!walletAddress ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Connect your wallet to view notifications
                </div>
              ) : isLoading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => {
                  const notificationRead = isRead(notification);
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-border/50 last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer ${
                        !notificationRead ? "bg-primary/5" : ""
                      }`}
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate("/notifications");
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            !notificationRead ? "bg-primary" : "bg-muted"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setNotificationsOpen(false);
                  navigate("/notifications");
                }}
              >
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </motion.header>
  );
}
