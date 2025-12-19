import { useMemo, useRef, useEffect, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { useInfiniteNotifications } from "@/services/subgraph/queries";
import type { SubgraphNotification } from "@/services/subgraph/types";
import {
  formatDateBucketFromBigInt,
  formatRelativeTimeFromBigInt,
} from "@/lib/time";

function labelForType(type: string): string {
  return type.replace("_", " ");
}

function typeClass(type: string): string {
  // Simple deterministic color mapping
  const t = type.toLowerCase();
  if (t.includes("reward"))
    return "bg-green-500/10 text-green-500 border-green-500/20";
  if (t.includes("cleanup"))
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  if (t.includes("participant"))
    return "bg-purple-500/10 text-purple-500 border-purple-500/20";
  return "bg-orange-500/10 text-orange-500 border-orange-500/20";
}

const ITEMS_PER_LOAD = 10;

export default function Notifications() {
  const walletAddress = useWalletAddress();

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteNotifications(
      walletAddress,
      ITEMS_PER_LOAD,
      {},
      {
        refetchInterval: 20_000,
      }
    );

  const notifications = useMemo<SubgraphNotification[]>(
    () => (data?.pages ?? []).flat(),
    [data]
  );

  const unreadCount = useMemo(
    () => notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0),
    [notifications]
  );

  const groupedNotifications = useMemo(() => {
    return notifications.reduce((acc, notification) => {
      const bucket = formatDateBucketFromBigInt(notification.createdAt);
      if (!acc[bucket]) {
        acc[bucket] = [];
      }
      acc[bucket].push(notification);
      return acc;
    }, {} as Record<string, SubgraphNotification[]>);
  }, [notifications]);

  // Infinite scroll sentinel ref
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="space-y-6 px-4 lg:px-6 py-4 lg:py-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold">Notifications</h1>
            <p className="text-xs lg:text-sm text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread notifications`
                : "All caught up!"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="gap-2"
            title="Read status is sourced from the subgraph"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-6">
        {!walletAddress ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-muted-foreground">
              Connect wallet
            </h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Connect your wallet to load notifications from the subgraph.
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground/70 mb-3" />
            <p className="text-sm text-muted-foreground">
              Loading notifications...
            </p>
          </div>
        ) : Object.keys(groupedNotifications).length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-muted-foreground">
              No notifications
            </h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              You're all caught up!
            </p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([date, items]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground px-1">
                {date}
              </h3>
              <AnimatePresence mode="popLayout">
                {items.map((notification) => (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={cn(
                      "group relative p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-all",
                      notification.read && "bg-muted/5 border-muted/20"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Read indicator */}
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mt-2 shrink-0 transition-colors",
                          notification.read ? "bg-muted" : "bg-primary"
                        )}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">
                                {notification.title}
                              </h4>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-1.5 py-0 capitalize",
                                  typeClass(notification.type)
                                )}
                              >
                                {labelForType(notification.type)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-2">
                              {formatRelativeTimeFromBigInt(
                                notification.createdAt
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* Infinite Scroll Sentinel */}
      {notifications.length > 0 && (
        <div
          ref={sentinelRef}
          className="h-4 flex items-center justify-center py-4"
        >
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading more notifications...</span>
            </div>
          )}
          {!hasNextPage && notifications.length > 0 && (
            <p className="text-sm text-muted-foreground">
              No more notifications to load
            </p>
          )}
        </div>
      )}
    </div>
  );
}
