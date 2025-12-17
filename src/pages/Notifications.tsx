import { useMemo, useRef, useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Trash2, Filter, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { useInfiniteNotifications } from "@/services/subgraph/queries";
import type { SubgraphNotification } from "@/services/subgraph/types";

function toMs(bigIntString: string): number {
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

function formatDateBucket(createdAt: string): string {
  const d = new Date(toMs(createdAt));
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const startOfThatDay = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  ).getTime();
  const diffDays = Math.floor(
    (startOfToday - startOfThatDay) / (24 * 60 * 60 * 1000)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function labelForType(type: string): string {
  return type.replaceAll("_", " ");
}

function typeClass(type: string): string {
  // Simple deterministic color mapping
  const t = type.toLowerCase();
  if (t.includes("reward")) return "bg-green-500/10 text-green-500 border-green-500/20";
  if (t.includes("cleanup")) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  if (t.includes("participant")) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
  return "bg-orange-500/10 text-orange-500 border-orange-500/20";
}


const ITEMS_PER_LOAD = 10;

export default function Notifications() {
  const walletAddress = useWalletAddress();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteNotifications(walletAddress, ITEMS_PER_LOAD, {
    enabled: !!walletAddress,
    refetchInterval: 20_000,
  });

  const notifications = useMemo<SubgraphNotification[]>(
    () => (data?.pages ?? []).flat(),
    [data]
  );

  const unreadCount = useMemo(
    () => notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0),
    [notifications]
  );

  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    for (const n of notifications) set.add(n.type);
    return Array.from(set).sort();
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesFilter = filter === 'all' || 
        (filter === 'unread' && !n.read) || 
        n.type === filter;
      const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [notifications, filter, search]);

  const groupedNotifications = useMemo(() => {
    return filteredNotifications.reduce((acc, notification) => {
      const bucket = formatDateBucket(notification.createdAt);
      if (!acc[bucket]) {
        acc[bucket] = [];
      }
      acc[bucket].push(notification);
      return acc;
    }, {} as Record<string, SubgraphNotification[]>);
  }, [filteredNotifications]);

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
        rootMargin: '100px',
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFilterChange = (value: string) => {
    setFilter(value);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

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
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
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
          <Button 
            variant="outline" 
            size="sm" 
            disabled
            className="gap-2 text-destructive hover:text-destructive"
            title="Notifications are sourced from the subgraph"
          >
            <Trash2 className="w-4 h-4" />
            Clear all
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            {availableTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {labelForType(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notifications List */}
      <div className="space-y-6">
        {!walletAddress ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-muted-foreground">Connect wallet</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Connect your wallet to load notifications from the subgraph.
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground/70 mb-3" />
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </div>
        ) : Object.keys(groupedNotifications).length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-muted-foreground">No notifications</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {search || filter !== 'all' ? 'Try adjusting your filters' : "You're all caught up!"}
            </p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([date, items]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground px-1">{date}</h3>
              <AnimatePresence mode="popLayout">
                {items.map((notification) => (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={cn(
                      'group relative p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-all',
                      notification.unread && 'bg-primary/5 border-primary/20'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Unread indicator */}
                      <div className={cn(
                        'w-2 h-2 rounded-full mt-2 shrink-0 transition-colors',
                        notification.unread ? 'bg-primary' : 'bg-muted'
                      )} />
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <Badge 
                                variant="outline" 
                                className={cn('text-[10px] px-1.5 py-0 capitalize', typeClass(notification.type))}
                              >
                                {labelForType(notification.type)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-2">
                              {formatRelativeTime(notification.createdAt)}
                            </p>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              disabled
                              title="Notifications are sourced from the subgraph"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
      {filteredNotifications.length > 0 && (
        <div ref={sentinelRef} className="h-4 flex items-center justify-center py-4">
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
