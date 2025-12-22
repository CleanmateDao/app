import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Flame,
  Play,
  Pause,
  CheckCircle,
  X,
  RefreshCw,
  Send,
  Video,
  Loader2,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { STREAK_RULES } from "@/types/streak";
import { useUserStreakStats } from "@/services/subgraph/queries";
import { transformUserStreakStats } from "@/types/streak";
import { STREAK_CATEGORIES } from "@/constants/streak-categories";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { useSubmitStreak } from "@/services/contracts/mutations";
import { uploadFileToIPFS } from "@/services/ipfs";
import { useRecording } from "@/contexts/RecordingContext";
import {
  stringifyStreakSubmissionMetadata,
  type StreakSubmissionMetadata,
} from "@cleanmate/cip-sdk";
import { StreakTipsDialog } from "@/components/StreakTipsDialog";

type SubmitStep = "record" | "preview" | "submitting" | "success";

const MAX_DURATION = 5000; // 5 seconds in ms
const MIN_DURATION = 2000; // 2 seconds in ms

/**
 * Formats seconds into a human-readable string
 */
function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "now";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) {
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  }
  return `${secs}s`;
}

/**
 * Detects the device type from the user agent
 * @returns "ios" | "android" | "desktop"
 */
function getDeviceType(): "ios" | "android" | "desktop" {
  const userAgent = navigator.userAgent.toLowerCase();

  // Check for iOS devices
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return "ios";
  }

  // Check for Android devices
  if (/android/.test(userAgent)) {
    return "android";
  }

  // Default to desktop
  return "desktop";
}

export default function StreakSubmit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const walletAddress = useWalletAddress();
  const { setIsRecording: setContextRecording } = useRecording();

  // Fetch streak stats
  const { data: streakStatsData } = useUserStreakStats(
    walletAddress || undefined
  );
  const streakStats = useMemo(() => {
    return transformUserStreakStats(streakStatsData || null);
  }, [streakStatsData]);

  // Submit streak mutation
  const submitStreakMutation = useSubmitStreak();

  // Rate limit: 30 minutes from last submission
  const RATE_LIMIT_MINUTES = 30;
  const RATE_LIMIT_MS = useMemo(() => RATE_LIMIT_MINUTES * 60 * 1000, []);

  // Calculate if user can submit based on last submission time
  const canSubmit = useMemo(() => {
    if (!streakStats?.lastSubmissionAt) return true;
    const lastSubmissionTime = Number(streakStats.lastSubmissionAt);
    const now = Date.now();
    return now - lastSubmissionTime >= RATE_LIMIT_MS;
  }, [streakStats?.lastSubmissionAt, RATE_LIMIT_MS]);

  // Calculate time remaining until can submit
  const [timeUntilCanSubmit, setTimeUntilCanSubmit] = useState(0);

  useEffect(() => {
    if (!streakStats?.lastSubmissionAt) {
      setTimeUntilCanSubmit(0);
      return;
    }

    const updateCountdown = () => {
      const lastSubmissionTime = Number(streakStats.lastSubmissionAt);
      const now = Date.now();
      const elapsed = now - lastSubmissionTime;
      const remaining = Math.max(0, RATE_LIMIT_MS - elapsed);
      setTimeUntilCanSubmit(Math.floor(remaining / 1000)); // Convert to seconds
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [streakStats?.lastSubmissionAt, RATE_LIMIT_MS]);

  const [step, setStep] = useState<SubmitStep>("record");
  const [dontShowRules, setDontShowRules] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("Waste");
  const [showTipsDialog, setShowTipsDialog] = useState(false);
  const [showCategoryTooltip, setShowCategoryTooltip] = useState(false);
  const categoryTooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Support multiple media items
  const [mediaItems, setMediaItems] = useState<
    Array<{
      id: string;
      blob: Blob;
      url: string;
      mimeType: string;
      duration?: number;
    }>
  >([]);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingStartRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const chunksRef = useRef<Blob[]>([]);
  const isVideoPlayingRef = useRef<boolean>(false);
  const currentPreviewIndexRef = useRef<number>(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const recordButtonRef = useRef<HTMLButtonElement | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err);
        });
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please grant permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Check if rules should be skipped
  useEffect(() => {
    const skipRules = localStorage.getItem("skipStreakRules") === "true";
    if (skipRules) {
      setStep("record");
    }
  }, []);

  // Redirect non-mobile users (wait for proper detection)
  // useEffect(() => {
  //   if (isMobile === false) {
  //     toast({
  //       title: "Mobile Only",
  //       description: "Streak submission is only available on mobile devices.",
  //       variant: "destructive",
  //     });
  //     navigate("/streaks");
  //   }
  // }, [isMobile, navigate, toast]);

  // Initialize camera when entering record step
  useEffect(() => {
    if (step === "record") {
      initCamera();
    }
    return () => {
      if (step === "record") {
        stopCamera();
      }
    };
  }, [initCamera, step, stopCamera]);

  // Reset recording state when leaving record step
  useEffect(() => {
    if (step !== "record") {
      setContextRecording(false);
    }
  }, [step, setContextRecording]);

  // Track previous category to detect changes
  const previousCategoryRef = useRef<string | null>(null);
  const isInitialMountRef = useRef(true);

  // Show tooltip when category changes
  useEffect(() => {
    // Skip if not on record step
    if (step !== "record") {
      return;
    }

    // Skip on initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      previousCategoryRef.current = selectedCategory;
      return;
    }

    // Check if category actually changed
    const categoryChanged = previousCategoryRef.current !== selectedCategory;

    if (categoryChanged) {
      // Clear any existing timeout
      if (categoryTooltipTimeoutRef.current) {
        clearTimeout(categoryTooltipTimeoutRef.current);
      }

      // Update previous category
      previousCategoryRef.current = selectedCategory;

      // Show tooltip
      setShowCategoryTooltip(true);

      // Hide tooltip after 4 seconds
      categoryTooltipTimeoutRef.current = setTimeout(() => {
        setShowCategoryTooltip(false);
      }, 4000);
    }

    return () => {
      if (categoryTooltipTimeoutRef.current) {
        clearTimeout(categoryTooltipTimeoutRef.current);
      }
    };
  }, [selectedCategory, step]);

  // Play preview video when entering preview step
  useEffect(() => {
    const currentMedia = mediaItems[currentPreviewIndexRef.current];
    if (step === "preview" && previewVideoRef.current && currentMedia) {
      const video = previewVideoRef.current;
      let isInitialized = false;

      // Ensure source is set (it should already be from the video element)
      if (!video.src || video.src !== currentMedia.url) {
        video.src = currentMedia.url;
      }

      // Function to initialize and play video (only once)
      const initializeVideo = async () => {
        if (isInitialized) return;
        isInitialized = true;

        // Reset to start
        video.currentTime = 0;
        setVideoProgress(0);

        // Wait a bit for video to be ready
        if (video.readyState >= 2) {
          try {
            await video.play();
            isVideoPlayingRef.current = true;
            setIsVideoPlaying(true);
          } catch (err) {
            console.error("Error playing preview video:", err);
            isVideoPlayingRef.current = false;
            setIsVideoPlaying(false);
          }
        }
      };

      // Try to initialize when video can play
      const handleCanPlay = () => {
        if (!isInitialized) {
          initializeVideo();
        }
      };

      // Handle video end (loop)
      const handleEnded = () => {
        video.currentTime = 0;
        setVideoProgress(0);
        video.play().catch(console.error);
      };

      // Add event listeners
      video.addEventListener("canplay", handleCanPlay, { once: true });
      video.addEventListener("ended", handleEnded);

      // Try immediately if already ready
      if (video.readyState >= 2) {
        initializeVideo();
      }

      // Fallback timeout
      const timeoutId = setTimeout(() => {
        if (!isInitialized && video.readyState >= 2) {
          initializeVideo();
        }
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("ended", handleEnded);
      };
    } else if (step !== "preview" && previewVideoRef.current) {
      // Pause video when leaving preview step
      const video = previewVideoRef.current;
      video.pause();
      video.currentTime = 0;
      setVideoProgress(0);
      isVideoPlayingRef.current = false;
      setIsVideoPlaying(false);
    }
  }, [step, mediaItems]);

  // Pulse animation for record button
  useEffect(() => {
    if (step === "record" && !isRecording) {
      const interval = setInterval(() => {
        setPulseAnimation(true);
        setTimeout(() => setPulseAnimation(false), 1000);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [step, isRecording]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp8,opus",
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      console.log("Recording stopped, blob created:", {
        size: blob.size,
        type: blob.type,
        chunks: chunksRef.current.length,
      });

      if (blob.size === 0) {
        console.error("Empty blob created!");
        toast({
          title: "Recording Error",
          description: "The recorded video is empty. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      const mimeType = blob.type || "video/webm";
      const mediaId = `media-${Date.now()}-${Math.random()}`;

      // Calculate video duration
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = url;
      video.onloadedmetadata = () => {
        console.log("Video metadata loaded in onstop:", {
          duration: video.duration,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
        });

        // Check minimum duration requirement
        const durationMs = video.duration * 1000;
        if (durationMs < MIN_DURATION) {
          // Clean up the blob URL
          URL.revokeObjectURL(url);
          toast({
            title: "Video Too Short",
            description: `Video must be at least ${
              MIN_DURATION / 1000
            } seconds long. Please record again.`,
            variant: "destructive",
          });
          return;
        }

        // Add new media item to array
        setMediaItems((prev) => [
          ...prev,
          {
            id: mediaId,
            blob,
            url,
            mimeType,
            duration: video.duration,
          },
        ]);

        // Set first item as preview if it's the first one
        if (mediaItems.length === 0) {
          setVideoDuration(video.duration);
        }
      };
      video.onerror = (e) => {
        console.error("Error loading video metadata:", video.error);
        // Still add the media item even if duration can't be calculated
        setMediaItems((prev) => [
          ...prev,
          {
            id: mediaId,
            blob,
            url,
            mimeType,
          },
        ]);
      };

      setStep("preview");
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100);
    recordingStartRef.current = Date.now();
    setIsRecording(true);
    setContextRecording(true);

    // Animate progress
    const updateProgress = () => {
      const elapsed = Date.now() - recordingStartRef.current;
      const progress = Math.min((elapsed / MAX_DURATION) * 100, 100);
      setRecordingProgress(progress);

      if (elapsed >= MAX_DURATION) {
        stopRecording();
      } else {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };
    animationFrameRef.current = requestAnimationFrame(updateProgress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopRecording = useCallback(() => {
    // Allow stopping at any time (hold-release behavior)
    // Duration validation happens in the onstop handler
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setContextRecording(false);
    setRecordingProgress(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [setContextRecording]);

  // Set up non-passive touch event listeners for record button
  useEffect(() => {
    const button = recordButtonRef.current;
    if (!button || step !== "record") return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Start recording on press/hold
      if (!isRecording) {
        startRecording();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Stop recording on release
      if (isRecording) {
        stopRecording();
      }
    };

    const handleTouchCancel = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Stop recording if touch is cancelled
      if (isRecording) {
        stopRecording();
      }
    };

    // Add non-passive event listeners
    button.addEventListener("touchstart", handleTouchStart, { passive: false });
    button.addEventListener("touchend", handleTouchEnd, { passive: false });
    button.addEventListener("touchcancel", handleTouchCancel, {
      passive: false,
    });

    return () => {
      button.removeEventListener("touchstart", handleTouchStart);
      button.removeEventListener("touchend", handleTouchEnd);
      button.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [step, isRecording, startRecording, stopRecording]);

  const handleContinue = () => {
    // Check rate limit before allowing recording
    if (!canSubmit && timeUntilCanSubmit > 0) {
      toast({
        title: "Rate Limit Exceeded",
        description: `You can submit again in ${formatTimeRemaining(
          timeUntilCanSubmit
        )}. Please wait before recording a new streak.`,
        variant: "destructive",
      });
      return;
    }

    if (dontShowRules) {
      localStorage.setItem("skipStreakRules", "true");
    }
    setStep("record");
  };

  const handleRetake = () => {
    // Clear all media items
    mediaItems.forEach((item) => {
      URL.revokeObjectURL(item.url);
    });
    setMediaItems([]);
    setStep("record");
  };

  const handleRemoveMedia = (mediaId: string) => {
    setMediaItems((prev) => {
      const itemToRemove = prev.find((item) => item.id === mediaId);
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.url);
      }
      const filtered = prev.filter((item) => item.id !== mediaId);

      // If we removed the currently previewed item, update preview
      if (
        filtered.length > 0 &&
        currentPreviewIndexRef.current >= filtered.length
      ) {
        currentPreviewIndexRef.current = filtered.length - 1;
      } else if (filtered.length === 0) {
        currentPreviewIndexRef.current = 0;
        setStep("record");
      }

      return filtered;
    });

    toast({
      title: "Media Removed",
      description: "Media item has been removed from your submission.",
    });
  };

  const toggleVideoPlayback = useCallback(async () => {
    if (!previewVideoRef.current) return;

    try {
      if (previewVideoRef.current.paused) {
        await previewVideoRef.current.play();
        isVideoPlayingRef.current = true;
        setIsVideoPlaying(true);
      } else {
        previewVideoRef.current.pause();
        isVideoPlayingRef.current = false;
        setIsVideoPlaying(false);
      }
    } catch (error) {
      console.error("Error toggling video playback:", error);
    }
  }, []);

  const handleSubmit = async () => {
    if (mediaItems.length === 0) {
      toast({
        title: "Error",
        description: "No media recorded",
        variant: "destructive",
      });
      return;
    }

    // Check rate limit before submitting
    if (!canSubmit) {
      toast({
        title: "Rate Limit Exceeded",
        description: `Please wait ${formatTimeRemaining(
          timeUntilCanSubmit
        )} before submitting again.`,
        variant: "destructive",
      });
      setStep("preview");
      return;
    }

    setStep("submitting");

    try {
      // Step 1: Upload all media files to IPFS
      toast({
        title: "Uploading media...",
        description: `Please wait while we upload ${mediaItems.length} media file(s) to IPFS`,
      });

      const ipfsHashes: string[] = [];
      const mimetypes: string[] = [];
      const totalSize = mediaItems.reduce(
        (sum, item) => sum + item.blob.size,
        0
      );
      const totalDuration = mediaItems.reduce(
        (sum, item) => sum + (item.duration || 0),
        0
      );

      // Upload each media item
      for (let i = 0; i < mediaItems.length; i++) {
        const item = mediaItems[i];
        const fileName = `streak-${Date.now()}-${i}.${
          item.mimeType.split("/")[1] ||
          (item.mimeType.startsWith("video/") ? "webm" : "jpg")
        }`;
        const file = new File([item.blob], fileName, { type: item.mimeType });

        const ipfsUrl = await uploadFileToIPFS(file, fileName);

        if (!ipfsUrl || ipfsUrl.trim() === "") {
          throw new Error(`Failed to upload media item ${i + 1} to IPFS`);
        }

        ipfsHashes.push(ipfsUrl);
        mimetypes.push(item.mimeType);
      }

      // Step 2: Submit streak with IPFS URLs
      const deviceType = getDeviceType();

      const streakSubmissionMetadata: StreakSubmissionMetadata = {
        description: `I did a sustainable action: ${selectedCategory}`,
        timestamp: new Date().toISOString(),
        streakerCode: streakStats?.streakerCode,
        mediaCount: mediaItems.length,
        totalMediaLength: totalDuration,
        totalSize: totalSize,
        deviceType: deviceType,
      };

      await submitStreakMutation.sendTransaction({
        metadata: stringifyStreakSubmissionMetadata(streakSubmissionMetadata),
        ipfsHashes,
        mimetypes,
      });

      setStep("success");

      // Clean up media URLs
      mediaItems.forEach((item) => {
        URL.revokeObjectURL(item.url);
      });
      setMediaItems([]);

      // Navigate after showing success
      setTimeout(() => {
        toast({
          title: "Streak Submitted! 🔥",
          description: "Your sustainable action has been recorded.",
        });
        navigate("/streaks");
      }, 2500);
    } catch (error) {
      console.error("Failed to submit streak:", error);
      setStep("preview");

      // Provide more specific error messages
      let errorMessage = "Failed to submit streak";
      if (error instanceof Error) {
        if (
          error.message.includes("IPFS") ||
          error.message.includes("upload")
        ) {
          errorMessage =
            "Failed to upload video to IPFS. Please check your connection and try again.";
        } else if (
          error.message.includes("Wallet") ||
          error.message.includes("not connected")
        ) {
          errorMessage = "Wallet connection issue. Please check your wallet.";
        } else if (error.message.includes("Pinata")) {
          errorMessage =
            "IPFS service error. Please ensure VITE_PINATA_JWT is configured.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Recording Screen
  if (step === "record") {
    const circumference = 2 * Math.PI * 52;
    const strokeDashoffset =
      circumference - (recordingProgress / 100) * circumference;

    return (
      <div
        className="fixed inset-0 bg-black flex flex-col"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
        }}
      >
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/70 via-black/40 to-transparent"
        >
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
              onClick={() => navigate("/streaks")}
            >
              <X className="h-6 w-6" />
            </Button>
            <motion.div
              animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full backdrop-blur-sm"
            >
              <Flame
                className={`h-5 w-5 ${
                  isRecording ? "text-status-rejected" : "text-primary"
                }`}
              />
              <span className="text-white text-sm font-medium">
                {isRecording
                  ? `${((recordingProgress / 100) * 5).toFixed(1)}s`
                  : "2-5 sec"}
              </span>
            </motion.div>
            <Tooltip
              open={showCategoryTooltip && !isRecording}
              onOpenChange={setShowCategoryTooltip}
            >
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full"
                  onClick={() => {
                    setShowTipsDialog(true);
                    setShowCategoryTooltip(false);
                  }}
                  disabled={isRecording}
                >
                  <Lightbulb className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <TooltipArrow className="fill-popover" />
                <p className="text-sm">
                  Click to see how to submit a valid{" "}
                  {selectedCategory.toLowerCase()} streak
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        {/* Video Preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="flex-1 object-cover w-full h-full"
          style={{ transform: "scaleX(-1)" }} // Mirror the video for selfie view
        />

        {/* Recording overlay effect */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="absolute inset-0 border-4 border-status-rejected/50 animate-pulse" />
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute top-6 right-6 flex items-center gap-2"
              >
                <div className="w-3 h-3 rounded-full bg-status-rejected" />
                <span className="text-white text-xs font-medium">REC</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 z-10 p-6 pb-10 bg-gradient-to-t from-black/80 via-black/50 to-transparent"
        >
          <div className="flex flex-col items-center">
            {/* Record Button */}
            <div className="relative">
              {/* Outer glow */}
              <motion.div
                animate={
                  pulseAnimation && !isRecording
                    ? { scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }
                    : {}
                }
                className="absolute inset-0 rounded-full bg-primary/30"
                style={{ transform: "scale(1.2)" }}
              />

              {/* Progress ring */}
              <svg
                className="absolute -inset-3 w-[120px] h-[120px]"
                viewBox="0 0 120 120"
              >
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="6"
                />
                {/* Progress circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={
                    isRecording
                      ? "hsl(var(--status-rejected))"
                      : "hsl(var(--primary))"
                  }
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 60 60)"
                  style={{
                    transition: "stroke-dashoffset 0.05s linear",
                    opacity: isRecording ? 1 : 0.3,
                  }}
                />
              </svg>

              {/* Button */}
              <motion.button
                ref={recordButtonRef}
                whileTap={{ scale: 0.95 }}
                className={`relative w-[96px] h-[96px] rounded-full border-4 border-white flex items-center justify-center transition-all duration-200 select-none touch-none ${
                  isRecording ? "bg-status-rejected/20" : "bg-white/10"
                }`}
                style={{
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  WebkitTouchCallout: "none",
                  touchAction: "none",
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  // Start recording on press/hold
                  if (!isRecording) {
                    startRecording();
                  }
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  // Stop recording on release
                  if (isRecording) {
                    stopRecording();
                  }
                }}
                onMouseLeave={(e) => {
                  e.preventDefault();
                  // Stop recording if mouse leaves button while holding
                  if (isRecording) {
                    stopRecording();
                  }
                }}
              >
                <AnimatePresence mode="wait">
                  {isRecording ? (
                    <motion.div
                      key="stop"
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      className="w-8 h-8 bg-white rounded-md"
                    />
                  ) : (
                    <motion.div
                      key="record"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="w-16 h-16 bg-status-rejected rounded-full shadow-lg shadow-status-rejected/50"
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Category Swiper */}
            <div className="mt-6 w-full max-w-md mx-auto overflow-hidden">
              <Swiper
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                slidesPerView="auto"
                spaceBetween={16}
                centeredSlides
                initialSlide={0}
                className="category-swiper"
                onSlideChange={(swiper) => {
                  const activeIndex = swiper.activeIndex;
                  if (STREAK_CATEGORIES[activeIndex]) {
                    setSelectedCategory(STREAK_CATEGORIES[activeIndex]);
                  }
                }}
              >
                {STREAK_CATEGORIES.map((category, index) => (
                  <SwiperSlide key={category} style={{ width: "auto" }}>
                    <motion.button
                      onClick={() => {
                        setSelectedCategory(category);
                        if (swiperRef.current) {
                          swiperRef.current.slideTo(index, 300);
                        }
                      }}
                      animate={{
                        scale: selectedCategory === category ? 1.15 : 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                        selectedCategory === category
                          ? "text-white font-semibold"
                          : "text-white/60"
                      }`}
                    >
                      {category}
                    </motion.button>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </motion.div>

        {/* Tips Dialog */}
        <StreakTipsDialog
          open={showTipsDialog}
          onOpenChange={setShowTipsDialog}
          category={selectedCategory as (typeof STREAK_CATEGORIES)[number]}
        />
      </div>
    );
  }

  // Preview Screen
  if (step === "preview") {
    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/70 to-transparent"
        >
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
              onClick={() => navigate("/streaks")}
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full backdrop-blur-sm">
              <CheckCircle className="h-4 w-4 text-status-approved" />
              <span className="text-white text-sm font-medium">Preview</span>
            </div>
            <div className="w-10" />
          </div>
        </motion.div>

        {/* Video Preview */}
        {mediaItems.length > 0 ? (
          <div className="relative flex-1 w-full h-full">
            <video
              ref={previewVideoRef}
              src={mediaItems[currentPreviewIndexRef.current]?.url}
              autoPlay
              loop
              playsInline
              muted
              preload="auto"
              className="w-full h-full object-cover bg-black"
              style={{
                minHeight: 0,
                display: "block",
              }}
              onClick={toggleVideoPlayback}
              onLoadedMetadata={(e) => {
                const video = e.currentTarget;
                const currentMedia = mediaItems[currentPreviewIndexRef.current];
                if (currentMedia) {
                  setVideoDuration(video.duration);
                }
              }}
              onPlay={() => {
                if (!isVideoPlayingRef.current) {
                  isVideoPlayingRef.current = true;
                  setIsVideoPlaying(true);
                }
              }}
              onPlaying={() => {
                if (!isVideoPlayingRef.current) {
                  isVideoPlayingRef.current = true;
                  setIsVideoPlaying(true);
                }
              }}
              onPause={() => {
                if (isVideoPlayingRef.current) {
                  isVideoPlayingRef.current = false;
                  setIsVideoPlaying(false);
                }
              }}
              onTimeUpdate={(e) => {
                const video = e.currentTarget;
                if (video.duration > 0) {
                  const progress = (video.currentTime / video.duration) * 100;
                  setVideoProgress(progress);
                }
              }}
              onEnded={() => {
                setVideoProgress(0);
              }}
              onError={(e) => {
                const video = e.currentTarget;
                console.error("Video preview error:", {
                  error: video.error,
                  code: video.error?.code,
                  message: video.error?.message,
                });
                toast({
                  title: "Video Preview Error",
                  description:
                    "Unable to load video preview. Please try recording again.",
                  variant: "destructive",
                });
              }}
            />
            {/* Play/Pause Overlay Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* Circular Progress Ring */}
                <svg
                  className="absolute -inset-3 w-[120px] h-[120px] transform -rotate-90"
                  viewBox="0 0 120 120"
                >
                  {/* Background circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="6"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="white"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={
                      2 * Math.PI * 52 * (1 - videoProgress / 100)
                    }
                    style={{
                      transition: "stroke-dashoffset 0.1s linear",
                    }}
                  />
                </svg>
                <motion.button
                  initial={{ opacity: 0.7, scale: 1 }}
                  animate={{
                    opacity: isVideoPlaying ? 0.3 : 1,
                    scale: 1,
                  }}
                  whileHover={{
                    opacity: 1,
                    scale: 1.1,
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleVideoPlayback();
                  }}
                  className="pointer-events-auto relative w-24 h-24 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 hover:bg-black/80 transition-colors z-10"
                >
                  <AnimatePresence mode="wait">
                    {isVideoPlaying ? (
                      <motion.div
                        key="pause"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Pause
                          className="w-12 h-12 text-white ml-1"
                          fill="white"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="play"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Play
                          className="w-12 h-12 text-white ml-1"
                          fill="white"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No media recorded</p>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent"
        >
          <div className="flex gap-3 max-w-md mx-auto">
            <Button
              variant="outline"
              className="flex-1 gap-2 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handleRetake}
            >
              <RefreshCw className="h-5 w-5" />
              Retake
            </Button>
            <Button
              className="flex-1 gap-2 h-12 text-base font-semibold shadow-lg shadow-primary/30"
              onClick={handleSubmit}
            >
              <Send className="h-5 w-5" />
              Submit
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Submitting Screen
  if (step === "submitting") {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative w-20 h-20 mx-auto mb-6"
          >
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <Flame className="absolute inset-0 m-auto h-8 w-8 text-primary" />
          </motion.div>
          <h2 className="text-xl font-bold mb-2">Uploading Streak</h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we process your video...
          </p>
        </motion.div>
      </div>
    );
  }

  // Success Screen
  if (step === "success") {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center overflow-hidden">
        {/* Background particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                scale: 0,
                x: "50%",
                y: "50%",
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
              }}
              transition={{
                duration: 2,
                delay: i * 0.05,
                ease: "easeOut",
              }}
              className="absolute w-3 h-3 rounded-full bg-primary"
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center px-6 relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-status-approved to-status-approved/60 flex items-center justify-center shadow-2xl shadow-status-approved/30"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <CheckCircle className="h-12 w-12 text-white" />
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold mb-2"
          >
            Streak Submitted! 🔥
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-muted-foreground"
          >
            Your sustainable action is being reviewed
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return null;
}
