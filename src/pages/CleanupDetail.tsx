import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  Star,
  Check,
  X,
  Upload,
  Image,
  Video,
  Send,
  Mail,
  User,
  Info,
  UserPlus,
  Loader2,
  Search,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RatingDialog } from "@/components/RatingDialog";
import { SubmitProofDialog } from "@/components/SubmitProofDialog";
import { AcceptParticipantAlertDialog } from "@/components/AcceptParticipantAlertDialog";
import { RejectParticipantAlertDialog } from "@/components/RejectParticipantAlertDialog";
import { ParticipantInfoDialog } from "@/components/ParticipantInfoDialog";
import { JoinRequestDialog } from "@/components/JoinRequestDialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CleanupStatus, CleanupParticipant } from "@/types/cleanup";
import { toast } from "sonner";
import { useCleanup, useUser } from "@/services/subgraph/queries";
import {
  transformCleanup,
  transformUserToProfile,
} from "@/services/subgraph/transformers";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import {
  useAcceptParticipant,
  useRejectParticipant,
  useApplyToCleanup,
  useUpdateCleanupStatus,
  useSubmitProofOfWork,
} from "@/services/contracts/mutations";
import { useTeamMember } from "@/services/subgraph/queries";

const statusConfig: Record<
  CleanupStatus,
  { label: string; className: string }
> = {
  open: {
    label: "Open for Registration",
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
    label: "Rewards Distributed",
    className: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  },
};

export default function CleanupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const walletAddress = useWalletAddress();

  // Fetch cleanup data
  const { data: cleanupData, isLoading: isLoadingCleanup } = useCleanup(
    id || undefined
  );
  const cleanup = cleanupData ? transformCleanup(cleanupData) : null;

  // Fetch current user data
  const { data: currentUserData } = useUser(walletAddress);
  const currentUserProfile = currentUserData
    ? transformUserToProfile(currentUserData, walletAddress || undefined)
    : null;

  // All hooks must be called before any early returns
  const [participants, setParticipants] = useState<CleanupParticipant[]>([]);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<CleanupParticipant | null>(null);
  const [rating, setRating] = useState(0);
  const [proofMedia, setProofMedia] = useState<File[]>([]);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  // New states for confirmations and participant info
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [participantInfoOpen, setParticipantInfoOpen] = useState(false);
  const [actionParticipant, setActionParticipant] =
    useState<CleanupParticipant | null>(null);

  // Join request state
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);

  // Search and infinite scroll for accepted participants
  const [participantSearch, setParticipantSearch] = useState("");
  const [displayedParticipantsCount, setDisplayedParticipantsCount] =
    useState(5);
  const [isLoadingMoreParticipants, setIsLoadingMoreParticipants] =
    useState(false);

  // Mutations
  const acceptParticipantMutation = useAcceptParticipant();
  const rejectParticipantMutation = useRejectParticipant();
  const applyToCleanupMutation = useApplyToCleanup();
  const updateStatusMutation = useUpdateCleanupStatus();
  const submitProofMutation = useSubmitProofOfWork();

  // Fetch organizer data
  const { data: organizerData } = useUser(cleanup?.organizer.id);

  // Check team membership and permissions
  const { data: teamMembership } = useTeamMember(
    cleanup?.organizer.id,
    walletAddress || undefined
  );

  // Update participants when cleanup data changes
  useEffect(() => {
    if (cleanup) {
      setParticipants(cleanup.participants);
    }
  }, [cleanup]);

  // Check if current user is the organizer
  const isOrganizer =
    cleanup && walletAddress
      ? cleanup.organizer.id.toLowerCase() === walletAddress.toLowerCase()
      : false;

  // Check if user is a team member and get permissions
  const isTeamMember = !!teamMembership;
  const canManageParticipants =
    isOrganizer || (isTeamMember && teamMembership?.canManageParticipants);
  const canEditCleanups =
    isOrganizer || (isTeamMember && teamMembership?.canEditCleanups);
  const canSubmitProof =
    isOrganizer || (isTeamMember && teamMembership?.canSubmitProof);

  // Check if current user has already applied
  const currentUserEmail = currentUserProfile?.email || "";
  const existingApplication = participants.find(
    (p) =>
      p.email === currentUserEmail ||
      (walletAddress && p.id.includes(walletAddress.toLowerCase()))
  );
  const hasApplied = !!existingApplication;
  const applicationStatus = existingApplication?.status;

  // Filter participants: exclude organizer from regular participants list
  const acceptedParticipants = participants.filter(
    (p) =>
      p.status === "accepted" &&
      (!walletAddress ||
        !cleanup ||
        p.id.toLowerCase() !== cleanup.organizer.id.toLowerCase())
  );
  const pendingParticipants = participants.filter(
    (p) => p.status === "pending"
  );

  // Check if current user is a participant (not organizer)
  const isParticipant =
    walletAddress &&
    participants.some(
      (p) =>
        p.id.toLowerCase().includes(walletAddress.toLowerCase()) &&
        p.status === "accepted" &&
        !isOrganizer
    );

  const filteredParticipants = acceptedParticipants.filter(
    (p) =>
      p.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
      p.email.toLowerCase().includes(participantSearch.toLowerCase())
  );

  const displayedParticipants = filteredParticipants.slice(
    0,
    displayedParticipantsCount
  );
  const hasMoreParticipants =
    displayedParticipantsCount < filteredParticipants.length;

  // Infinite scroll sentinel for participants
  const participantsSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = participantsSentinelRef.current;
    if (!sentinel || !hasMoreParticipants || isLoadingMoreParticipants) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          hasMoreParticipants &&
          !isLoadingMoreParticipants
        ) {
          setIsLoadingMoreParticipants(true);
          setTimeout(() => {
            setDisplayedParticipantsCount((prev) =>
              Math.min(prev + 5, filteredParticipants.length)
            );
            setIsLoadingMoreParticipants(false);
          }, 300);
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
  }, [
    hasMoreParticipants,
    isLoadingMoreParticipants,
    filteredParticipants.length,
  ]);

  if (isLoadingCleanup) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Loading cleanup...</p>
      </div>
    );
  }

  if (!cleanup) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Cleanup Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The cleanup you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate("/cleanups")}>Back to Cleanups</Button>
      </div>
    );
  }

  const handleAcceptParticipant = async () => {
    if (!actionParticipant || !cleanup || !id) return;

    // Find participant address from the participant data
    // The participant ID should contain the address or we need to get it from subgraph
    const participantAddress =
      actionParticipant.id.split("-")[1] || actionParticipant.id;

    try {
      await acceptParticipantMutation.mutateAsync({
        cleanupAddress: id,
        participant: participantAddress,
      });
      setAcceptDialogOpen(false);
      setActionParticipant(null);
    } catch (error) {
      // Error is handled by mutation
    }
  };

  const handleRejectParticipant = async () => {
    if (!actionParticipant || !cleanup || !id) return;

    const participantAddress =
      actionParticipant.id.split("-")[1] || actionParticipant.id;

    try {
      await rejectParticipantMutation.mutateAsync({
        cleanupAddress: id,
        participant: participantAddress,
      });
      setRejectDialogOpen(false);
      setRejectReason("");
      setActionParticipant(null);
    } catch (error) {
      // Error is handled by mutation
    }
  };

  const openAcceptDialog = (participant: CleanupParticipant) => {
    setActionParticipant(participant);
    setAcceptDialogOpen(true);
  };

  const openRejectDialog = (participant: CleanupParticipant) => {
    setActionParticipant(participant);
    setRejectDialogOpen(true);
  };

  const openParticipantInfo = (participant: CleanupParticipant) => {
    setSelectedParticipant(participant);
    setParticipantInfoOpen(true);
  };

  const handleRateParticipant = () => {
    if (selectedParticipant && rating > 0) {
      setParticipants(
        participants.map((p) =>
          p.id === selectedParticipant.id ? { ...p, rating } : p
        )
      );
      toast.success(`Rated ${selectedParticipant.name} with ${rating} stars`);
      setRatingDialogOpen(false);
      setSelectedParticipant(null);
      setRating(0);
    }
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProofMedia([...proofMedia, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmitForReview = () => {
    if (proofMedia.length === 0) {
      toast.error("Please upload proof of work (images/videos)");
      return;
    }
    toast.success("Cleanup submitted for review");
    setSubmitDialogOpen(false);
  };

  const handleJoinRequest = async () => {
    if (!id || !walletAddress) return;

    setIsSubmittingJoin(true);

    try {
      await applyToCleanupMutation.mutateAsync(id);
      setJoinDialogOpen(false);
      setJoinMessage("");
    } catch (error) {
      // Error is handled by mutation
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  // Check if cleanup is full
  const isFull = acceptedParticipants.length >= (cleanup?.maxParticipants || 0);

  // Check if user has verified email
  const isEmailVerified = currentUserProfile?.isEmailVerified || false;

  // Can user request to join?
  const canRequestJoin =
    cleanup?.status === "open" && !isOrganizer && !hasApplied && !isFull;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto pb-24 lg:pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/cleanups")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-xl lg:text-2xl font-semibold">
              {cleanup.title}
            </h1>
            <Badge className={statusConfig[cleanup.status].className}>
              {statusConfig[cleanup.status].label}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{cleanup.description}</p>

          {/* Join Request Section */}
          {canRequestJoin && isEmailVerified && (
            <Button
              className="mt-4 gap-2"
              onClick={() => setJoinDialogOpen(true)}
            >
              <UserPlus className="w-4 h-4" />
              Request to Join
            </Button>
          )}

          {/* Email Verification Required */}
          {canRequestJoin && !isEmailVerified && (
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">
                    Email Verification Required
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You need to verify your email address before you can join
                    cleanups.
                  </p>
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => navigate("/settings")}
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    Verify Email
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Application Status */}
          {hasApplied && (
            <div className="mt-4">
              {applicationStatus === "pending" && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-3 h-3" />
                  Application Pending
                </Badge>
              )}
              {applicationStatus === "accepted" && (
                <Badge className="bg-status-approved/10 text-status-approved border-status-approved/20 gap-1">
                  <Check className="w-3 h-3" />
                  You're Participating
                </Badge>
              )}
              {applicationStatus === "rejected" && (
                <Badge variant="destructive" className="gap-1">
                  <X className="w-3 h-3" />
                  Application Rejected
                </Badge>
              )}
            </div>
          )}

          {isFull &&
            !hasApplied &&
            !isOrganizer &&
            cleanup.status === "open" && (
              <Badge variant="secondary" className="mt-4">
                This cleanup is full
              </Badge>
            )}
        </div>
      </motion.div>

      {/* Key Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs">Location</span>
            </div>
            <p className="font-medium text-sm">{cleanup.location.city}</p>
            <p className="text-xs text-muted-foreground">
              {cleanup.location.address}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Date</span>
            </div>
            <p className="font-medium text-sm">{cleanup.date}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Time</span>
            </div>
            <p className="font-medium text-sm">
              {cleanup.startTime} - {cleanup.endTime}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Participants</span>
            </div>
            <p className="font-medium text-sm">
              {acceptedParticipants.length}/{cleanup.maxParticipants}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Media Gallery */}
      {cleanup.proofMedia.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Image className="w-4 h-4" />
                Media ({cleanup.proofMedia.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {cleanup.proofMedia.map((media) => (
                  <div
                    key={media.id}
                    className="relative group rounded-lg overflow-hidden border border-border aspect-video cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    {media.type === "video" ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                        <Video className="w-8 h-8 text-muted-foreground" />
                      </div>
                    ) : (
                      <img
                        src={media.url}
                        alt={media.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white truncate font-medium">
                        {media.name}
                      </p>
                      <p className="text-[10px] text-white/70">{media.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pending Requests */}
      {pendingParticipants.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Pending Requests ({pendingParticipants.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <button
                    onClick={() => openParticipantInfo(participant)}
                    className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {participant.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {participant.name}
                        </p>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Applied {participant.appliedAt}
                      </p>
                    </div>
                  </button>
                  {canManageParticipants && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRejectDialog(participant)}
                        disabled={rejectParticipantMutation.isPending}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openAcceptDialog(participant)}
                        disabled={acceptParticipantMutation.isPending}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Accepted Participants */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants ({acceptedParticipants.length})
            </CardTitle>
            {acceptedParticipants.length > 0 && (
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={participantSearch}
                  onChange={(e) => {
                    setParticipantSearch(e.target.value);
                    setDisplayedParticipantsCount(5);
                  }}
                  className="h-8 pl-9 text-sm"
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {acceptedParticipants.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No participants yet
              </p>
            ) : filteredParticipants.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No participants match your search
              </p>
            ) : (
              <>
                {displayedParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <button
                      onClick={() => openParticipantInfo(participant)}
                      className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {participant.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {participant.name}
                          </p>
                          {participant.isKyced && (
                            <Badge
                              variant="secondary"
                              className="h-5 px-1.5 gap-0.5 text-xs bg-status-approved/10 text-status-approved border-status-approved/20"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              KYC
                            </Badge>
                          )}
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </div>
                        {participant.rating ? (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < participant.rating!
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Not rated yet
                          </p>
                        )}
                      </div>
                    </button>
                    {(cleanup.status === "in_progress" ||
                      cleanup.status === "completed") &&
                      !participant.rating &&
                      (isOrganizer || isParticipant) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedParticipant(participant);
                            setRatingDialogOpen(true);
                          }}
                        >
                          <Star className="w-4 h-4 mr-1" />
                          Rate
                        </Button>
                      )}
                  </div>
                ))}

                {/* Infinite Scroll Sentinel */}
                {filteredParticipants.length > 0 && (
                  <div
                    ref={participantsSentinelRef}
                    className="h-4 flex items-center justify-center py-2"
                  >
                    {isLoadingMoreParticipants && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Loading more participants...</span>
                      </div>
                    )}
                    {!hasMoreParticipants &&
                      displayedParticipants.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Showing all {filteredParticipants.length} participants
                        </p>
                      )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Proof of Work */}
      {(cleanup.status === "in_progress" ||
        cleanup.status === "completed" ||
        cleanup.status === "rewarded") && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Image className="w-4 h-4" />
                Proof of Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cleanup.proofMedia.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {cleanup.proofMedia.map((media) => (
                    <div
                      key={media.id}
                      className="relative rounded-lg overflow-hidden border border-border"
                    >
                      <img
                        src={media.url}
                        alt={media.name}
                        className="w-full h-24 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                        <p className="text-xs text-white truncate">
                          {media.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4 mb-4">
                  No proof uploaded yet
                </p>
              )}

              {cleanup.status !== "rewarded" && canSubmitProof && (
                <Button
                  className="w-full"
                  onClick={() => navigate(`/cleanups/${id}/submit-proof`)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Proof of Work
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Rating Dialog */}
      <RatingDialog
        open={ratingDialogOpen}
        onOpenChange={setRatingDialogOpen}
        participantName={selectedParticipant?.name}
        rating={rating}
        onRatingChange={setRating}
        onSubmit={handleRateParticipant}
      />

      {/* Submit for Review Dialog */}
      <SubmitProofDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        proofMedia={proofMedia}
        onProofUpload={handleProofUpload}
        onSubmit={handleSubmitForReview}
      />

      {/* Accept Confirmation Dialog */}
      <AcceptParticipantAlertDialog
        open={acceptDialogOpen}
        onOpenChange={setAcceptDialogOpen}
        participantName={actionParticipant?.name}
        onAccept={handleAcceptParticipant}
        onCancel={() => setActionParticipant(null)}
      />

      {/* Reject Confirmation Dialog */}
      <RejectParticipantAlertDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        participantName={actionParticipant?.name}
        rejectReason={rejectReason}
        onRejectReasonChange={setRejectReason}
        onReject={handleRejectParticipant}
        onCancel={() => {
          setActionParticipant(null);
          setRejectReason("");
        }}
      />

      {/* Participant Info Dialog */}
      <ParticipantInfoDialog
        open={participantInfoOpen}
        onOpenChange={setParticipantInfoOpen}
        participant={selectedParticipant}
      />

      {/* Join Request Dialog */}
      <JoinRequestDialog
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
        cleanup={cleanup}
        acceptedParticipantsCount={acceptedParticipants.length}
        message={joinMessage}
        onMessageChange={setJoinMessage}
        currentUserProfile={currentUserProfile}
        onSubmit={handleJoinRequest}
        isSubmitting={isSubmittingJoin}
      />
    </div>
  );
}
