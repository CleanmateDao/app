import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle2, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useRequestVerificationCode,
  useVerifyEmailCode,
  useRegenerateVerificationCode,
} from "@/services/api/email-verification";
import { useWalletAddress } from "@/hooks/use-wallet-address";

interface EmailVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email?: string;
  isVerified?: boolean;
  onVerified?: () => void;
}

export function EmailVerificationDialog({
  open,
  onOpenChange,
  email: initialEmail,
  isVerified = false,
  onVerified,
}: EmailVerificationDialogProps) {
  const walletAddress = useWalletAddress();
  const [email, setEmail] = useState(initialEmail || "");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code" | "completed">(
    isVerified ? "completed" : initialEmail ? "code" : "email"
  );
  const [resendCooldown, setResendCooldown] = useState(0);

  const requestCodeMutation = useRequestVerificationCode();
  const verifyCodeMutation = useVerifyEmailCode();
  const regenerateCodeMutation = useRegenerateVerificationCode();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (isVerified) {
        setStep("completed");
      } else if (initialEmail) {
        setEmail(initialEmail);
        setStep("code");
      } else {
        setStep("email");
        setEmail("");
      }
      setCode("");
      setResendCooldown(0);
    }
  }, [open, isVerified, initialEmail]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleRequestCode = async () => {
    if (!email || !walletAddress) return;

    try {
      await requestCodeMutation.mutateAsync({
        email,
        walletAddress,
      });
      setStep("code");
      setResendCooldown(60); // 1 minute cooldown
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleRegenerateCode = async () => {
    if (!email || !walletAddress || resendCooldown > 0) return;

    try {
      await regenerateCodeMutation.mutateAsync({
        email,
        walletAddress,
      });
      setResendCooldown(60); // 1 minute cooldown
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleVerifyCode = async () => {
    if (!email || !code || !walletAddress) return;

    try {
      await verifyCodeMutation.mutateAsync({
        email,
        code,
        walletAddress,
      });
      setStep("completed");
      onVerified?.();
      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[90%] rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Verification
          </DialogTitle>
          <DialogDescription>
            {step === "completed"
              ? "Your email has been verified successfully!"
              : step === "code"
              ? "Enter the verification code sent to your email"
              : "Enter your email address to receive a verification code"}
          </DialogDescription>
        </DialogHeader>

        {step === "completed" ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Email Verified!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {email} has been verified successfully
              </p>
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full"
              variant="outline"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {step === "email" && (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={requestCodeMutation.isPending}
                />
                <Button
                  onClick={handleRequestCode}
                  disabled={
                    !email ||
                    !walletAddress ||
                    requestCodeMutation.isPending ||
                    !email.includes("@")
                  }
                  className="w-full"
                >
                  {requestCodeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </Button>
              </div>
            )}

            {step === "code" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setCode(value);
                    }}
                    maxLength={6}
                    disabled={verifyCodeMutation.isPending}
                    className="text-center text-lg tracking-widest font-mono"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Code sent to {email}
                  </p>
                </div>

                <Button
                  onClick={handleVerifyCode}
                  disabled={
                    !code ||
                    code.length !== 6 ||
                    !walletAddress ||
                    verifyCodeMutation.isPending
                  }
                  className="w-full"
                >
                  {verifyCodeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </Button>

                <div className="flex flex-col items-center gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      Didn't receive the code?
                    </span>
                    {resendCooldown > 0 ? (
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <Clock className="w-3 h-3" />
                        Resend in {formatTime(resendCooldown)}
                      </span>
                    ) : (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={handleRegenerateCode}
                        disabled={
                          regenerateCodeMutation.isPending || !walletAddress
                        }
                        className="h-auto p-0"
                      >
                        {regenerateCodeMutation.isPending ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Resend Code"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

