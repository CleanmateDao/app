import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  MessageSquare,
  Plus,
  Play,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarViewerTrigger } from "@/components/ui/avatar-viewer";
import { SubmitProofDialog } from "@/components/SubmitProofDialog";
import { AcceptParticipantAlertDialog } from "@/components/AcceptParticipantAlertDialog";
import { RejectParticipantAlertDialog } from "@/components/RejectParticipantAlertDialog";
import { ParticipantInfoDialog } from "@/components/ParticipantInfoDialog";
import { JoinRequestDialog } from "@/components/JoinRequestDialog";
import { UpdateCleanupStatusAlertDialog } from "@/components/UpdateCleanupStatusAlertDialog";
import {
  MediaViewerDialog,
  type MediaItem,
} from "@/components/MediaViewerDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  CleanupStatus,
  CleanupParticipant,
  CleanupStatusUI,
  CleanupUpdate,
  CleanupMedia,
} from "@/types/cleanup";
import { toast } from "sonner";
import {
  useCleanup,
  useUser,
} from "@/services/subgraph/queries";
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
  useAddCleanupUpdate,
} from "@/services/contracts/mutations";
import { useTeamMember } from "@/services/subgraph/queries";
import { stringifyCleanupUpdateMetadata } from "@cleanmate/cip-sdk";
import { uploadFilesToIPFS } from "@/services/ipfs";
import { formatAddress } from "@/lib/utils";
const statusConfig: Record<
  CleanupStatusUI,
  { label: string; className: string }
> = {
  unpublished: {
    label: "Unpublished",
    className: "bg-muted/10 text-muted-foreground border-muted/20",
  },
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
  const cleanup = useMemo(
    () => (cleanupData ? transformCleanup(cleanupData) : null),
    [cleanupData]
  );

  // Fetch current user data
  const { data: currentUserData } = useUser(walletAddress);
  const currentUserProfile = useMemo(
    () =>
      currentUserData
        ? transformUserToProfile(currentUserData, walletAddress || undefined)
        : null,
    [currentUserData, walletAddress]
  );

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

  // Status update dialog state
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
  const [pendingNewStatus, setPendingNewStatus] =
    useState<CleanupStatusUI | null>(null);

  // Media viewer state
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [viewerMedia, setViewerMedia] = useState<MediaItem[]>([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  // Cleanup updates state
  const [updateDescription, setUpdateDescription] = useState("");
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [updateMedia, setUpdateMedia] = useState<File[]>([]);
  const [isUpdateFormExpanded, setIsUpdateFormExpanded] = useState(false);

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string): boolean => {
    if (!html || !html.trim()) return true;
    // Remove HTML tags and check if there's any meaningful content
    const textContent = html.replace(/<[^>]*>/g, "").trim();
    return !textContent;
  };

  // Store preview URLs - use useMemo to create URLs and trigger re-renders
  const previewUrls = useMemo(() => {
    return updateMedia.map((file) => URL.createObjectURL(file));
  }, [updateMedia]);

  // Cleanup preview URLs when component unmounts or media changes
  useEffect(() => {
    // Cleanup on unmount or when media changes
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

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
  const addUpdateMutation = useAddCleanupUpdate();

  // Fetch organizer data
  const { data: organizerData } = useUser(cleanup?.organizer.id);

  // Fetch cleanup updates

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

  const filteredParticipants = useMemo(() => {
    if (!participantSearch.trim()) {
      return acceptedParticipants;
    }
    const searchLower = participantSearch.toLowerCase();
    return acceptedParticipants.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.email.toLowerCase().includes(searchLower)
    );
  }, [acceptedParticipants, participantSearch]);

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
      await acceptParticipantMutation.sendTransaction({
        cleanupId: id,
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
      await rejectParticipantMutation.sendTransaction({
        cleanupId: id,
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
      await applyToCleanupMutation.sendTransaction(id);
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

  // Handle adding cleanup update
  const handleAddUpdate = async () => {
    if (!id || isHtmlEmpty(updateDescription)) {
      toast.error("Please enter an update description");
      return;
    }

    if (!canEditCleanups) {
      toast.error("You don't have permission to add updates");
      return;
    }

    setIsAddingUpdate(true);
    try {
      // Upload media files to IPFS if any
      let mediaMetadata: Array<{
        ipfsHash: string;
        type: string;
        name: string;
      }> = [];

      if (updateMedia.length > 0) {
        toast.info("Uploading media to IPFS...");
        const ipfsUrls = await uploadFilesToIPFS(updateMedia);

        mediaMetadata = updateMedia.map((file, index) => {
          const isVideo = file.type.startsWith("video/");
          const isImage = file.type.startsWith("image/");
          const mediaType = isVideo ? "video" : isImage ? "image" : "file";

          return {
            ipfsHash: ipfsUrls[index],
            type: mediaType,
            name: file.name,
          };
        });
      }

      const metadata = stringifyCleanupUpdateMetadata({
        description: updateDescription.trim() || "",
        media: mediaMetadata,
      });

      await addUpdateMutation.sendTransaction({
        cleanupId: id,
        metadata,
      });

      setUpdateDescription("");
      setUpdateMedia([]);
      setIsUpdateFormExpanded(false);
      setIsAddingUpdate(false);
    } catch (error) {
      setIsAddingUpdate(false);
      // Error is handled by mutation
    }
  };

  const handleUpdateMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Filter to only allow images and videos
      const validFiles = newFiles.filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("video/")
      );
      if (validFiles.length < newFiles.length) {
        toast.error("Only images and videos are allowed");
      }
      setUpdateMedia([...updateMedia, ...validFiles]);
    }
  };

  const handleRemoveUpdateMedia = (index: number) => {
    setUpdateMedia(updateMedia.filter((_, i) => i !== index));
  };

  // Handle status update
  const handleStatusUpdateClick = (newStatus: CleanupStatusUI) => {
    setPendingNewStatus(newStatus);
    setStatusUpdateDialogOpen(true);
  };

  const handleStatusUpdateConfirm = async () => {
    if (!id || !pendingNewStatus || !cleanup) return;

    try {
      // Convert UI status to enum value
      const statusMap: Record<CleanupStatusUI, number> = {
        unpublished: CleanupStatus.UNPUBLISHED,
        open: CleanupStatus.OPEN,
        in_progress: CleanupStatus.IN_PROGRESS,
        completed: CleanupStatus.COMPLETED,
        rewarded: CleanupStatus.REWARDED,
      };

      await updateStatusMutation.sendTransaction({
        cleanupId: id,
        newStatus: statusMap[pendingNewStatus],
      });

      setStatusUpdateDialogOpen(false);
      setPendingNewStatus(null);
    } catch (error) {
      // Error is handled by mutation
    }
  };

  // Helper function to convert CleanupMedia to MediaItem
  const convertToMediaItems = (media: CleanupMedia[]): MediaItem[] => {
    return media.map((item) => ({
      url: item.url,
      type: item.type,
      caption: item.name,
    }));
  };

  // Handle opening media viewer
  const handleOpenMediaViewer = (
    media: CleanupMedia[],
    initialIndex: number = 0
  ) => {
    const mediaItems = convertToMediaItems(media);
    setViewerMedia(mediaItems);
    setViewerInitialIndex(initialIndex);
    setMediaViewerOpen(true);
  };

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

          {/* Status Update Buttons - Only for organizers/team members with edit permission */}
          {canEditCleanups && (
            <div className="mt-4 flex flex-wrap gap-2">
              {cleanup.status === "open" && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdateClick("in_progress")}
                  disabled={updateStatusMutation.isTransactionPending}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Cleanup (In Progress)
                </Button>
              )}
              {cleanup.status === "in_progress" && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdateClick("completed")}
                  disabled={updateStatusMutation.isTransactionPending}
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Completed
                </Button>
              )}
            </div>
          )}
          <div
            className="text-muted-foreground text-sm prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: cleanup.description }}
          />

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

      {/* Media Gallery - Show metadata media (initial images) if available */}
      {cleanup.metadataMedia && cleanup.metadataMedia.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Image className="w-4 h-4" />
                Medias ({cleanup.metadataMedia.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {cleanup.metadataMedia.map((media, index) => (
                  <div
                    key={media.id}
                    onClick={() =>
                      handleOpenMediaViewer(cleanup.metadataMedia || [], index)
                    }
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Proof Media Gallery */}
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
                Proof of Work Medias ({cleanup.proofMedia.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {cleanup.proofMedia.map((media, index) => (
                  <div
                    key={media.id}
                    onClick={() =>
                      handleOpenMediaViewer(cleanup.proofMedia, index)
                    }
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
                    {participant.avatar ? (
                      <AvatarViewerTrigger
                        src={participant.avatar}
                        alt={participant.name}
                        size="md"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={participant.avatar}
                            alt={participant.name}
                          />
                          <AvatarFallback>
                            {participant.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </AvatarViewerTrigger>
                    ) : (
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {participant.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {participant.name}
                        </p>
                        {participant.isOrganizer && (
                          <Badge
                            variant="secondary"
                            className="h-5 px-1.5 gap-0.5 text-xs bg-primary/10 text-primary border-primary/20"
                          >
                            Organizer
                          </Badge>
                        )}
                        {participant.isKyced && (
                          <Badge
                            variant="secondary"
                            className="h-5 px-1.5 gap-0.5 text-xs bg-status-approved/10 text-status-approved border-status-approved/20"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            KYC
                          </Badge>
                        )}
                        {participant.emailVerified && (
                          <Badge
                            variant="secondary"
                            className="h-5 px-1.5 gap-0.5 text-xs bg-status-approved/10 text-status-approved border-status-approved/20"
                          >
                            <Mail className="w-3 h-3" />
                          </Badge>
                        )}
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
                        disabled={
                          rejectParticipantMutation.isTransactionPending
                        }
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openAcceptDialog(participant)}
                        disabled={
                          acceptParticipantMutation.isTransactionPending
                        }
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
                      {participant.avatar ? (
                        <AvatarViewerTrigger
                          src={participant.avatar}
                          alt={participant.name}
                          size="md"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={participant.avatar}
                              alt={participant.name}
                            />
                            <AvatarFallback>
                              {participant.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </AvatarViewerTrigger>
                      ) : (
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {participant.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {participant.name}
                          </p>
                          {participant.isOrganizer && (
                            <Badge
                              variant="secondary"
                              className="h-5 px-1.5 gap-0.5 text-xs bg-primary/10 text-primary border-primary/20"
                            >
                              Organizer
                            </Badge>
                          )}
                          {participant.isKyced && (
                            <Badge
                              variant="secondary"
                              className="h-5 px-1.5 gap-0.5 text-xs bg-status-approved/10 text-status-approved border-status-approved/20"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              KYC
                            </Badge>
                          )}
                          {participant.emailVerified && (
                            <Badge
                              variant="secondary"
                              className="h-5 px-1.5 gap-0.5 text-xs bg-status-approved/10 text-status-approved border-status-approved/20"
                            >
                              <Mail className="w-3 h-3" />
                            </Badge>
                          )}
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {participant.country}
                        </p>
                      </div>
                    </button>
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

      {/* Updates Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Updates ({cleanup.updates.length})
            </CardTitle>
            {canEditCleanups && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsUpdateFormExpanded(true);
                  // Scroll to update form after a brief delay to ensure it's rendered
                  setTimeout(() => {
                    document.getElementById("add-update-form")?.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                    });
                  }, 100);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Update
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Update Form */}
            {canEditCleanups && isUpdateFormExpanded && (
              <div id="add-update-form" className="space-y-3 pb-4 border-b">
                <div className="space-y-2">
                  <RichTextEditor
                    placeholder="Share an update about this cleanup..."
                    value={updateDescription}
                    onChange={(value) => setUpdateDescription(value)}
                  />
                </div>

                {/* Media Upload Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleUpdateMediaUpload}
                      className="hidden"
                      id="update-media-upload"
                      disabled={isAddingUpdate}
                    />
                    <label htmlFor="update-media-upload">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                        disabled={isAddingUpdate}
                        asChild
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Attach Image/Video
                        </span>
                      </Button>
                    </label>
                  </div>

                  {/* Preview Uploaded Media */}
                  {updateMedia.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        {updateMedia.length} file(s) attached
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {updateMedia.map((file, index) => {
                          const isVideo = file.type.startsWith("video/");
                          const previewUrl = previewUrls[index];

                          return (
                            <div
                              key={index}
                              className="relative group rounded-lg overflow-hidden border border-border aspect-video"
                            >
                              {isVideo ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                                  <Video className="w-6 h-6 text-muted-foreground" />
                                </div>
                              ) : previewUrl ? (
                                <img
                                  src={previewUrl}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                                  <Image className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveUpdateMedia(index)}
                                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={isAddingUpdate}
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-2">
                                <p className="text-xs text-white truncate font-medium">
                                  {file.name}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setUpdateDescription("");
                      setUpdateMedia([]);
                      setIsUpdateFormExpanded(false);
                    }}
                    disabled={isAddingUpdate}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddUpdate}
                    disabled={
                      isAddingUpdate ||
                      isHtmlEmpty(updateDescription) ||
                      addUpdateMutation.isTransactionPending
                    }
                  >
                    {isAddingUpdate ||
                    addUpdateMutation.isTransactionPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post Update
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Updates List */}
            {cleanup.updates.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  No updates yet.{" "}
                  {canEditCleanups && "Be the first to share an update!"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cleanup.updates.map((update, index) => (
                  <div
                    key={update.id}
                    className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
                  >
                    {/* Update Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Header */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">
                          {formatAddress(update.organizer)}
                        </p>
                        {update.organizer.toLowerCase() ===
                          cleanup.organizer.id.toLowerCase() && (
                          <Badge
                            variant="secondary"
                            className="h-5 px-1.5 gap-0.5 text-xs bg-primary/10 text-primary border-primary/20"
                          >
                            Organizer
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {update.addedAt}
                        </span>
                      </div>

                      {/* Description */}
                      {update.description && (
                        <div
                          className="text-sm text-foreground prose prose-sm dark:prose-invert max-w-none break-words"
                          dangerouslySetInnerHTML={{
                            __html: update.description,
                          }}
                        />
                      )}

                      {/* Media */}
                      {update.media && update.media.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                          {update.media.map((media, index) => (
                            <div
                              key={media.id}
                              onClick={() =>
                                handleOpenMediaViewer(update.media || [], index)
                              }
                              className="relative group rounded-lg overflow-hidden border border-border aspect-video cursor-pointer hover:border-primary/50 transition-colors"
                            >
                              {media.type === "video" ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                                  <Video className="w-6 h-6 text-muted-foreground" />
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
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

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

      {/* Status Update Confirmation Dialog */}
      {cleanup && pendingNewStatus && (
        <UpdateCleanupStatusAlertDialog
          open={statusUpdateDialogOpen}
          onOpenChange={(open) => {
            setStatusUpdateDialogOpen(open);
            if (!open) {
              setPendingNewStatus(null);
            }
          }}
          currentStatus={cleanup.status}
          newStatus={pendingNewStatus}
          onConfirm={handleStatusUpdateConfirm}
          isUpdating={updateStatusMutation.isTransactionPending}
        />
      )}

      {/* Media Viewer Dialog */}
      <MediaViewerDialog
        open={mediaViewerOpen}
        onOpenChange={setMediaViewerOpen}
        media={viewerMedia}
        initialIndex={viewerInitialIndex}
      />
    </div>
  );
}
