import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Wallet,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Trophy,
  Target,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import africanPattern from "@/assets/african-pattern-decorative.jpg";
import africanMask from "@/assets/african-mask.jpg";
import { WalletButton } from "@vechain/vechain-kit";
import {
  useRegisterUser,
  useRegisterWithReferral,
  useUpdateProfile,
} from "@/services/contracts/mutations";
import {
  UserProfileMetadata,
  stringifyUserProfileMetadata,
} from "@cleanmate/cip-sdk";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { useSearchParams } from "react-router-dom";
import { useUser } from "@/services/subgraph/queries";
import {
  SUPPORTED_COUNTRIES,
  type SupportedCountryCode,
} from "@/constants/supported";
import { INTEREST_OPTIONS } from "@/constants/interests";
import CleanMateLogoIcon from "@/components/icons/logo-icon";

export interface OnboardingData {
  fullName: string;
  email: string;
  bio: string;
  country: SupportedCountryCode;
  state: string;
  interests: string[];
  referralCode: string;
  agreeTerms: boolean;
}

const initialData: OnboardingData = {
  fullName: "",
  email: "",
  bio: "",
  country: "NG",
  state: "",
  interests: [],
  referralCode: "",
  agreeTerms: false,
};

const steps = [
  {
    id: 1,
    title: "Profile",
    icon: User,
    description: "Tell us about yourself",
  },
  {
    id: 2,
    title: "Location",
    icon: MapPin,
    description: "Where will you organize or join cleanups?",
  },
  {
    id: 3,
    title: "Wallet",
    icon: Wallet,
    description: "Get rewarded for your impact",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const walletAddress = useWalletAddress();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(() => {
    // Check for referral code in URL first, then localStorage
    const refCodeFromUrl = searchParams.get("ref");
    const refCodeFromStorage = localStorage.getItem("referral");
    const refCode = refCodeFromUrl || refCodeFromStorage || "";

    // Save URL ref code to localStorage if present
    if (refCodeFromUrl) {
      localStorage.setItem("referral", refCodeFromUrl);
    }

    return { ...initialData, referralCode: refCode };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mark onboarding as visited when component mounts
  useEffect(() => {
    localStorage.setItem("hasSeenOnboarding", "true");
  }, []);

  // Save referral code to localStorage when URL param changes
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      localStorage.setItem("referral", refCode);
      // Update the form data if it's different
      setData((prev) => {
        if (prev.referralCode !== refCode) {
          return { ...prev, referralCode: refCode };
        }
        return prev;
      });
    }
  }, [searchParams]);

  const { data: existingUser } = useUser(walletAddress);
  const userExists = !!existingUser;

  const registerUserMutation = useRegisterUser(() => {
    toast.success(
      "Welcome, Cleanup Champion! Start organizing your first cleanup."
    );
    navigate("/dashboard");
  });
  const registerWithReferralMutation = useRegisterWithReferral(() => {
    toast.success(
      "Welcome, Cleanup Champion! Start organizing your first cleanup."
    );
    navigate("/dashboard");
  });
  const updateProfileMutation = useUpdateProfile(() => {
    toast.success(
      "Welcome, Cleanup Champion! Start organizing your first cleanup."
    );
    navigate("/dashboard");
  });

  const progress = (currentStep / steps.length) * 100;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const toggleInterest = (interest: string) => {
    if (data.interests.includes(interest)) {
      updateData({ interests: data.interests.filter((i) => i !== interest) });
    } else {
      updateData({ interests: [...data.interests, interest] });
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!walletAddress) {
      toast.error("Wallet not connected");
      return;
    }

    // Validate required fields
    if (!data.fullName || !data.email || !data.agreeTerms) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const userMetadata: UserProfileMetadata<SupportedCountryCode, true> = {
        name: data.fullName,
        bio: data.bio || undefined,
        location: {
          country: data.country,
          state: data.state,
        },
        interests: data.interests,
      };

      // Step 1: Register user on blockchain or update profile if exists
      if (userExists) {
        // User already exists, just update profile metadata
        toast.info("Updating profile...");
        await updateProfileMutation.sendTransaction(
          stringifyUserProfileMetadata(userMetadata)
        );
      } else {
        // New user registration
        toast.info("Registering on blockchain...");
        if (data.referralCode) {
          await registerWithReferralMutation.sendTransaction({
            metadata: stringifyUserProfileMetadata(userMetadata),
            email: data.email,
            referralCode: data.referralCode,
          });
        } else {
          await registerUserMutation.sendTransaction({
            metadata: stringifyUserProfileMetadata(userMetadata),
            email: data.email,
          });
        }
      }

      // Mark onboarding as seen after successful completion
      localStorage.setItem("hasSeenOnboarding", "true");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error(
        error instanceof Error
          ? `Failed to complete onboarding: ${error.message}`
          : "Failed to complete onboarding"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    toast.info("You can complete your profile anytime in Settings.");
    navigate("/dashboard");
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.fullName && data.email && data.agreeTerms;
      case 2:
        return data.country;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with African Pattern */}
      <header className="sticky top-0 z-50 mx-4 mt-4">
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            backgroundImage: `url(${africanPattern})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />

          <div className="relative max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CleanMateLogoIcon />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold tracking-tight">
                    Become a Cleanup Champion
                  </h1>
                </div>
                <p className="text-xs text-muted-foreground">
                  Step {currentStep} of {steps.length}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip
            </Button>
          </div>
        </div>
      </header>

      {/* Compact Progress & Step Indicators */}
      <div className="max-w-4xl mx-auto px-6 py-3 w-full">
        <Progress value={progress} className="h-1.5" />

        <div className="flex justify-between mt-3 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isComplete = step.id < currentStep;

            return (
              <button
                key={step.id}
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                className={`flex items-center gap-2 transition-all ${
                  step.id <= currentStep ? "cursor-pointer" : "cursor-default"
                }`}
                disabled={step.id > currentStep}
              >
                <div
                  className={`w-5 h-5 flex items-center justify-center transition-all ${
                    isComplete
                      ? "text-primary"
                      : isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold">
                  {steps[currentStep - 1].title}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {steps[currentStep - 1].description}
                </p>
              </div>

              {/* Step 1: Profile */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Gamification Hero */}
                  <div className="relative rounded-2xl overflow-hidden">
                    <img
                      src={africanMask}
                      alt="African art"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-sm border-2 border-primary flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Join 500+ changemakers
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Making a difference across the globe
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">
                          Full Name or Organization Name *
                        </Label>
                        <Input
                          id="fullName"
                          placeholder="Your name"
                          value={data.fullName}
                          onChange={(e) =>
                            updateData({ fullName: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={data.email}
                          onChange={(e) =>
                            updateData({ email: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">About You</Label>
                        <Textarea
                          id="bio"
                          placeholder="Share your passion for the environment..."
                          rows={3}
                          value={data.bio}
                          onChange={(e) => updateData({ bio: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="referralCode">
                          Referral Code (Optional)
                        </Label>
                        <Input
                          id="referralCode"
                          placeholder="Enter referral code"
                          value={data.referralCode}
                          onChange={(e) =>
                            updateData({
                              referralCode: e.target.value.toUpperCase(),
                            })
                          }
                          className="uppercase"
                        />
                        <p className="text-xs text-muted-foreground">
                          Got a referral code from a friend? Enter it to earn
                          bonus rewards!
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <Label>What types of cleanups interest you?</Label>
                      <div className="flex flex-wrap gap-2">
                        {INTEREST_OPTIONS.map((interest) => (
                          <Badge
                            key={interest}
                            variant={
                              data.interests.includes(interest)
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer transition-colors"
                            onClick={() => toggleInterest(interest)}
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="terms"
                          checked={data.agreeTerms}
                          onCheckedChange={(checked) =>
                            updateData({ agreeTerms: checked === true })
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="terms"
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            I agree to the Terms of Service and Privacy Policy *
                          </label>
                          <p className="text-xs text-muted-foreground">
                            By joining, you commit to organizing safe and
                            impactful cleanup events.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 2: Location */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Select
                          value={data.country}
                          onValueChange={(value) =>
                            updateData({
                              country: value as SupportedCountryCode,
                              state: "",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUPPORTED_COUNTRIES.map((country) => (
                              <SelectItem
                                key={country.code}
                                value={country.code}
                              >
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province/City *</Label>
                        <Input
                          id="state"
                          placeholder="Enter state or province"
                          value={data.state}
                          onChange={(e) =>
                            updateData({ state: e.target.value })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 3: Wallet */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Rewards Preview */}
                  <div
                    className="relative rounded-2xl overflow-hidden p-6"
                    style={{
                      backgroundImage: `url(${africanPattern})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-primary/90" />
                    <div className="relative text-primary-foreground text-center">
                      <Trophy className="w-12 h-12 mx-auto mb-3 opacity-90" />
                      <h3 className="text-xl font-bold">Earn B3TR Rewards</h3>
                      <p className="text-sm opacity-90 mt-1">
                        Get tokens for every sustainable action you take.
                      </p>
                    </div>
                  </div>

                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="text-center py-2">
                        <h3 className="font-semibold mb-2">
                          Connect Your Wallet
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Link a VeChain wallet to receive your B3TR rewards
                        </p>
                        <div className="flex justify-center">
                          <WalletButton
                            mobileVariant="iconAndDomain"
                            desktopVariant="iconAndDomain"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="sticky bottom-0 z-40 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  Setting up...
                </>
              ) : (
                <>
                  Complete Setup
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
