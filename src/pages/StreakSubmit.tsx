import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Flame,
  Play,
  CheckCircle,
  X,
  RefreshCw,
  Send,
  Video,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { STREAK_RULES } from "@/types/streak";
import { useUserStreakStats } from "@/services/subgraph/queries";
import { transformUserStreakStats } from "@/types/streak";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { useSubmitStreak } from "@/services/contracts/mutations";
import { uploadFileToIPFS } from "@/services/ipfs";

type SubmitStep = "rules" | "record" | "preview" | "submitting" | "success";

const MAX_DURATION = 5000; // 5 seconds in ms

export default function StreakSubmit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const walletAddress = useWalletAddress();

  // Fetch streak stats for streaker code
  const { data: streakStatsData } = useUserStreakStats(
    walletAddress || undefined
  );
  const streakStats = useMemo(() => {
    return transformUserStreakStats(streakStatsData || null);
  }, [streakStatsData]);

  // Submit streak mutation
  const { sendTransaction, isTransactionPending } = useSubmitStreak();

  const [step, setStep] = useState<SubmitStep>("rules");
  const [dontShowRules, setDontShowRules] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingStartRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const chunksRef = useRef<Blob[]>([]);

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
  useEffect(() => {
    if (isMobile === false) {
      toast({
        title: "Mobile Only",
        description: "Streak submission is only available on mobile devices.",
        variant: "destructive",
      });
      navigate("/streaks");
    }
  }, [isMobile, navigate, toast]);

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
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
      setStep("preview");
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100);
    recordingStartRef.current = Date.now();
    setIsRecording(true);

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
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingProgress(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const handleContinue = () => {
    if (dontShowRules) {
      localStorage.setItem("skipStreakRules", "true");
    }
    setStep("record");
  };

  const handleRetake = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
    setStep("record");
  };

  const handleSubmit = async () => {
    if (!recordedBlob) {
      toast({
        title: "Error",
        description: "No video recorded",
        variant: "destructive",
      });
      return;
    }

    setStep("submitting");

    try {
      // Step 1: Convert Blob to File for IPFS upload
      const mimeType = recordedBlob.type || "video/webm";
      const fileName = `streak-${Date.now()}.${
        mimeType.split("/")[1] || "webm"
      }`;
      const videoFile = new File([recordedBlob], fileName, { type: mimeType });

      // Step 2: Upload video to IPFS
      toast({
        title: "Uploading video...",
        description: "Please wait while we upload your video to IPFS",
      });

      const ipfsHash = await uploadFileToIPFS(videoFile, fileName);

      if (!ipfsHash || ipfsHash.trim() === "") {
        throw new Error("Failed to get IPFS hash after upload");
      }

      // Step 3: Submit streak with IPFS hash
      await sendTransaction({
        metadata: JSON.stringify({
          description: "Sustainable action submission",
          timestamp: new Date().toISOString(),
          streakerCode: streakStats?.streakerCode || null,
        }),
        ipfsHashes: [ipfsHash],
        mimetypes: [mimeType],
      });

      setStep("success");

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

  // Show loading while detecting device
  if (isMobile === undefined) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Flame className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Rules Screen
  if (step === "rules") {
    return (
      <div className="min-h-screen bg-background">
        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background pt-6 pb-8 px-4">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/streaks")}
                className="bg-background/50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <Flame className="h-6 w-6 text-primary" />
                </motion.div>
                <h1 className="text-xl font-bold">Record a Streak</h1>
              </div>
            </div>

            {/* Streaker Code - Prominent */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/10">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">
                      Your Streaker Code
                    </span>
                  </div>
                  <p className="font-mono font-black text-2xl text-primary tracking-wider">
                    {streakStats?.streakerCode || "Not joined yet"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Write this on paper & show it in your video
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        <div className="p-4 pb-8 max-w-md mx-auto -mt-2">
          {/* Rules */}
          <Card className="border-border/50 mb-6">
            <CardContent className="p-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                How to Record
              </h2>
              <div className="space-y-4">
                {STREAK_RULES.map((rule, index) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md shadow-primary/20">
                      <span className="text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{rule.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {rule.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Example Video Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-border/50 bg-muted/30 mb-6 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Video className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Example Video</span>
                </div>
                <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer shadow-lg shadow-primary/30"
                  >
                    <Play className="h-6 w-6 text-primary-foreground ml-1" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Don't show again checkbox */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center space-x-2 mb-6"
          >
            <Checkbox
              id="dontShowRules"
              checked={dontShowRules}
              onCheckedChange={(checked) => setDontShowRules(checked === true)}
            />
            <Label
              htmlFor="dontShowRules"
              className="text-sm text-muted-foreground"
            >
              Don't show rules next time
            </Label>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              className="w-full gap-2 h-12 text-base font-semibold shadow-lg shadow-primary/20"
              onClick={handleContinue}
            >
              Continue to Record
              <Video className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Recording Screen
  if (step === "record") {
    const circumference = 2 * Math.PI * 52;
    const strokeDashoffset =
      circumference - (recordingProgress / 100) * circumference;

    return (
      <div className="fixed inset-0 bg-black flex flex-col">
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
                  : "5 sec max"}
              </span>
            </motion.div>
            <div className="w-10" />
          </div>
        </motion.div>

        {/* Video Preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="flex-1 object-cover"
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
            {/* Streaker code reminder */}
            <motion.div
              animate={{
                y: isRecording ? -10 : 0,
                opacity: isRecording ? 0.5 : 1,
              }}
              className="mb-6 px-4 py-2 bg-black/60 rounded-full backdrop-blur-sm border border-white/10"
            >
              <span className="text-xs text-white/90">
                Show:{" "}
                <span className="font-mono font-bold text-primary">
                  {streakStats?.streakerCode || "Not joined yet"}
                </span>
              </span>
            </motion.div>

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
                <motion.circle
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
                  style={{ transition: "stroke-dashoffset 0.1s linear" }}
                />
              </svg>

              {/* Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                className={`relative w-[96px] h-[96px] rounded-full border-4 border-white flex items-center justify-center transition-all duration-200 ${
                  isRecording ? "bg-status-rejected/20" : "bg-white/10"
                }`}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startRecording();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  stopRecording();
                }}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={isRecording ? stopRecording : undefined}
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

            <motion.p
              animate={{ opacity: isRecording ? 0.5 : 1 }}
              className="mt-6 text-white/80 text-sm font-medium"
            >
              {isRecording ? "Release to stop" : "Hold to record"}
            </motion.p>
          </div>
        </motion.div>
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
        {recordedUrl && (
          <video
            src={recordedUrl}
            autoPlay
            loop
            playsInline
            className="flex-1 object-cover"
          />
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
