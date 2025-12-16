import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Loader2, CheckCircle, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useJoinStreak } from "@/services/contracts/mutations";
import { useUserStreakStats } from "@/services/subgraph/queries";
import { useWalletAddress } from "@/hooks/use-wallet-address";

interface JoinStreakDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinStreakDrawer({
  open,
  onOpenChange,
}: JoinStreakDrawerProps) {
  const walletAddress = useWalletAddress();
  const { data: streakStats } = useUserStreakStats(walletAddress || undefined);
  const { sendTransaction, isTransactionPending, isWaitingForWalletConfirmation } =
    useJoinStreak();

  const hasJoined = !!streakStats?.streakerCode;

  const handleJoin = async () => {
    try {
      await sendTransaction();
      // Keep drawer open briefly to show success, then close
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      // Error is handled by the mutation hook
      console.error("Failed to join streak:", error);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
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
            <DrawerTitle className="text-xl font-bold">Join Streak Program</DrawerTitle>
          </div>
          <DrawerDescription className="text-sm text-muted-foreground">
            {hasJoined
              ? "You've already joined the streak program!"
              : "Start your sustainable action journey and earn rewards"}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4 overflow-y-auto">
          {hasJoined ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-status-approved/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-status-approved" />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Your Streaker Code</p>
                <p className="font-mono font-bold text-2xl text-primary">
                  {streakStats?.streakerCode}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Show this code in your videos for validation
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm">What is Streak?</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      Record short videos of your sustainable actions
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      Get a unique streaker code to show in your videos
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      Earn B3TR tokens when your submissions are approved
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">
                  By joining, you'll receive:
                </p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-status-approved" />
                    <span>A unique streaker code</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-status-approved" />
                    <span>Ability to submit sustainable actions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-status-approved" />
                    <span>Earn rewards for approved submissions</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <DrawerFooter className="gap-2">
          {hasJoined ? (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                onClick={handleJoin}
                disabled={isTransactionPending || isWaitingForWalletConfirmation}
                className="w-full gap-2"
              >
                {isTransactionPending || isWaitingForWalletConfirmation ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isWaitingForWalletConfirmation
                      ? "Waiting for confirmation..."
                      : "Processing..."}
                  </>
                ) : (
                  <>
                    <Flame className="h-4 w-4" />
                    Join Streak Program
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full"
                disabled={isTransactionPending || isWaitingForWalletConfirmation}
              >
                Cancel
              </Button>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

