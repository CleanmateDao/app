import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, UserPlus, Search, Mail, Wallet } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { subgraphClient } from "@/services/subgraph/client";
import type { User } from "@cleanmate/cip-sdk";
import { cn } from "@/lib/utils";

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (params: {
    member: string;
    canEditCleanups: boolean;
    canManageParticipants: boolean;
    canSubmitProof: boolean;
  }) => void;
  isPending: boolean;
}

// Helper to check if string is an email
function isEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

// Helper to check if string is an address
function isAddress(str: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(str);
}

export function AddTeamMemberDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: AddTeamMemberDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [canEditCleanups, setCanEditCleanups] = useState(false);
  const [canManageParticipants, setCanManageParticipants] = useState(false);
  const [canSubmitProof, setCanSubmitProof] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Search for users when query changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedUser(null);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const query = searchQuery.trim().toLowerCase();
        let where: any = {};

        if (isEmail(query)) {
          // Search by email
          where.email_contains = query;
        } else if (isAddress(query)) {
          // Search by address
          where.id = query;
        } else if (query.startsWith("0x")) {
          // Partial address search
          where.id_contains = query;
        } else {
          // Email-like search
          where.email_contains = query;
        }

        const response = await subgraphClient.getUsers({
          first: 5,
          where,
        });

        setSuggestions(response.users);
        setShowSuggestions(response.users.length > 0);
      } catch (error) {
        console.error("Error searching users:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce 300ms

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchQuery(user.email || user.id);
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    if (!selectedUser) {
      // If no user selected but search query looks like an address, use it directly
      if (isAddress(searchQuery.trim())) {
        onSubmit({
          member: searchQuery.trim(),
          canEditCleanups,
          canManageParticipants,
          canSubmitProof,
        });
        handleReset();
        return;
      }
      return;
    }

    onSubmit({
      member: selectedUser.id,
      canEditCleanups,
      canManageParticipants,
      canSubmitProof,
    });
    handleReset();
  };

  const handleReset = () => {
    setSearchQuery("");
    setSuggestions([]);
    setSelectedUser(null);
    setCanEditCleanups(false);
    setCanManageParticipants(false);
    setCanSubmitProof(false);
    setShowSuggestions(false);
  };

  const handleClose = (open: boolean) => {
    if (!open && !isPending) {
      handleReset();
    }
    onOpenChange(open);
  };

  const memberAddress = selectedUser?.id || (isAddress(searchQuery.trim()) ? searchQuery.trim() : "");
  const canSubmit = selectedUser || isAddress(searchQuery.trim());

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:w-[90%] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Team Member
          </DialogTitle>
          <DialogDescription>
            Search for a team member by email or wallet address.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2 relative" ref={suggestionsRef}>
            <Label htmlFor="memberSearch">Email or Wallet Address *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="memberSearch"
                placeholder="Search by email or 0x..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedUser(null);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                disabled={isPending}
                className="pl-9"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                {suggestions.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors",
                      selectedUser?.id === user.id && "bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {user.email ? (
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <Wallet className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        {user.email && (
                          <p className="text-sm font-medium truncate">
                            {user.email}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {user.id.slice(0, 6)}...{user.id.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {selectedUser && (
              <div className="mt-2 p-2 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedUser.email || selectedUser.id}
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Enter email or wallet address to search for users
            </p>
          </div>
          <div className="space-y-3">
            <Label>Permissions</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Edit Cleanups</p>
                  <p className="text-xs text-muted-foreground">
                    Can edit cleanup details and status
                  </p>
                </div>
                <Switch
                  checked={canEditCleanups}
                  onCheckedChange={setCanEditCleanups}
                  disabled={isPending}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Manage Participants</p>
                  <p className="text-xs text-muted-foreground">
                    Can accept or reject participant applications
                  </p>
                </div>
                <Switch
                  checked={canManageParticipants}
                  onCheckedChange={setCanManageParticipants}
                  disabled={isPending}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Submit Proof</p>
                  <p className="text-xs text-muted-foreground">
                    Can submit proof of work for cleanups
                  </p>
                </div>
                <Switch
                  checked={canSubmitProof}
                  onCheckedChange={setCanSubmitProof}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            className="w-full sm:w-auto"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="w-full sm:w-auto"
            disabled={isPending || !canSubmit}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
