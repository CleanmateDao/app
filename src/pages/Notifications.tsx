import { useState, useMemo, useRef, useEffect } from 'react';
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

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  date: string;
  type: 'proposal' | 'vote' | 'funding' | 'system';
  unread: boolean;
}

const sampleNotifications: Notification[] = [
  { id: '1', title: 'Proposal Approved', message: 'Clean Water Initiative has been approved by the committee. You can now proceed with the next steps.', time: '2 min ago', date: 'Today', type: 'proposal', unread: true },
  { id: '2', title: 'New Vote Received', message: 'Your proposal "Solar Power for Schools" received 5 new votes in the last hour.', time: '1 hour ago', date: 'Today', type: 'vote', unread: true },
  { id: '3', title: 'Review Complete', message: 'The review for Solar Power project is complete. Check the feedback from reviewers.', time: '3 hours ago', date: 'Today', type: 'proposal', unread: false },
  { id: '4', title: 'Funding Received', message: 'You received a funding of $5,000 for the Agricultural Development project.', time: '5 hours ago', date: 'Today', type: 'funding', unread: false },
  { id: '5', title: 'Milestone Deadline', message: 'Reminder: Phase 1 milestone for Clean Water Initiative is due in 3 days.', time: '8 hours ago', date: 'Today', type: 'system', unread: true },
  { id: '6', title: 'Proposal Submitted', message: 'Your proposal "Youth Education Program" has been successfully submitted for review.', time: '1 day ago', date: 'Yesterday', type: 'proposal', unread: false },
  { id: '7', title: 'Vote Threshold Reached', message: 'Agricultural Development proposal has reached the required 51% approval threshold.', time: '1 day ago', date: 'Yesterday', type: 'vote', unread: false },
  { id: '8', title: 'New Comment', message: 'A reviewer left a comment on your Solar Power for Schools proposal.', time: '2 days ago', date: '2 days ago', type: 'proposal', unread: false },
  { id: '9', title: 'Wallet Connected', message: 'Your VeWorld wallet has been successfully connected to your account.', time: '3 days ago', date: '3 days ago', type: 'system', unread: false },
  { id: '10', title: 'Funding Disbursed', message: 'Phase 2 funding of $10,000 has been disbursed for Clean Water Initiative.', time: '5 days ago', date: '5 days ago', type: 'funding', unread: false },
  { id: '11', title: 'Proposal Draft Saved', message: 'Your proposal draft "Community Health Center" has been saved.', time: '6 days ago', date: '6 days ago', type: 'proposal', unread: false },
  { id: '12', title: 'New Collaborator', message: 'John Doe has been added as a collaborator on your project.', time: '1 week ago', date: '1 week ago', type: 'system', unread: false },
  { id: '13', title: 'Funding Milestone', message: 'You have reached 50% of your funding goal for Solar Power project.', time: '1 week ago', date: '1 week ago', type: 'funding', unread: false },
  { id: '14', title: 'Vote Reminder', message: 'Reminder: The voting period for Youth Education Program ends in 2 days.', time: '1 week ago', date: '1 week ago', type: 'vote', unread: false },
  { id: '15', title: 'System Maintenance', message: 'Scheduled maintenance completed successfully. All systems operational.', time: '2 weeks ago', date: '2 weeks ago', type: 'system', unread: false },
];

const typeColors: Record<Notification['type'], string> = {
  proposal: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  vote: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  funding: 'bg-green-500/10 text-green-500 border-green-500/20',
  system: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};


const ITEMS_PER_LOAD = 10;

export default function Notifications() {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_LOAD);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesFilter = filter === 'all' || 
        (filter === 'unread' && n.unread) || 
        n.type === filter;
      const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [notifications, filter, search]);

  // Infinite scroll: show more items
  const displayedNotifications = useMemo(() => {
    return filteredNotifications.slice(0, displayedCount);
  }, [filteredNotifications, displayedCount]);

  const hasMore = displayedCount < filteredNotifications.length;

  const groupedNotifications = useMemo(() => {
    return displayedNotifications.reduce((acc, notification) => {
      if (!acc[notification.date]) {
        acc[notification.date] = [];
      }
      acc[notification.date].push(notification);
      return acc;
    }, {} as Record<string, Notification[]>);
  }, [displayedNotifications]);

  // Infinite scroll sentinel ref
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          // Simulate loading delay
          setTimeout(() => {
            setDisplayedCount(prev => Math.min(prev + ITEMS_PER_LOAD, filteredNotifications.length));
            setIsLoadingMore(false);
          }, 300);
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
  }, [hasMore, isLoadingMore, filteredNotifications.length]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setDisplayedCount(ITEMS_PER_LOAD);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setDisplayedCount(ITEMS_PER_LOAD);
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
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="gap-2 text-destructive hover:text-destructive"
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
            <SelectItem value="proposal">Proposals</SelectItem>
            <SelectItem value="vote">Votes</SelectItem>
            <SelectItem value="funding">Funding</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifications List */}
      <div className="space-y-6">
        {Object.keys(groupedNotifications).length === 0 ? (
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
                                className={cn('text-[10px] px-1.5 py-0 capitalize', typeColors[notification.type])}
                              >
                                {notification.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-2">
                              {notification.time}
                            </p>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {notification.unread && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deleteNotification(notification.id)}
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
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading more notifications...</span>
            </div>
          )}
          {!hasMore && displayedNotifications.length > 0 && (
            <p className="text-sm text-muted-foreground">
              No more notifications to load
            </p>
          )}
        </div>
      )}
    </div>
  );
}
