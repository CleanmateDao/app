import { Bell, Sparkles, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@vechain/vechain-kit";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { useNotifications as useSubgraphNotifications } from "@/services/subgraph/queries";
import type { SubgraphNotification } from "@/services/subgraph/types";

interface TopbarProps {
  onMenuClick?: () => void;
}

function toMs(bigIntString: string): number {
  // subgraph BigInt timestamps are typically seconds; convert to ms for JS Date
  const n = Number(bigIntString);
  if (!Number.isFinite(n)) return Date.now();
  return n > 1e12 ? n : n * 1000;
}

function formatRelativeTime(createdAt: string): string {
  const createdAtMs = toMs(createdAt);
  const diffMs = Date.now() - createdAtMs;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function unreadCountOf(list: SubgraphNotification[]) {
  return list.reduce((acc, n) => acc + (n.read ? 0 : 1), 0);
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const walletAddress = useWalletAddress();
  const { data: notifications = [], isLoading } = useSubgraphNotifications(
    walletAddress,
    { first: 8 },
    { refetchInterval: 20_000 }
  );
  const unreadCount = unreadCountOf(notifications);

  return (
    <header className="h-14 lg:h-16 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/50 lg:border-0 lg:bg-transparent">
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

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground hidden md:inline">
            Dashboard
          </span>
          <span className="text-muted-foreground hidden md:inline">/</span>
          <span className="font-medium hidden md:inline">Overview</span>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* AI Chat Button */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
          onClick={() => navigate("/ai-chat")}
        >
          <div className="relative">
            <Sparkles className="w-4 h-4" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          </div>
          <span className="hidden sm:inline text-sm font-medium">Temi</span>
        </Button>

        <div className="w-px h-6 bg-border/60 mx-1" />

        {/* Wallet Connect Style Button */}
        <WalletButton
          mobileVariant="iconAndDomain"
          desktopVariant="iconAndDomain"
        />

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
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount}
                </span>
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
                disabled
                title="Read status is sourced from the subgraph"
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
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-border/50 last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate("/notifications");
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          !notification.read ? "bg-primary" : "bg-muted"
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
                ))
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
    </header>
  );
}
