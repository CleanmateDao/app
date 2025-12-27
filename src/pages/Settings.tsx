import { useState, useRef, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  User,
  Mail,
  Save,
  Plus,
  X,
  Link2,
  LogOut,
  Upload,
  Trash2,
  Shield,
  FileText,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Clock,
  Moon,
  Sun,
  Copy,
  Gift,
  Share2,
  CreditCard,
  Star,
  Loader2,
  Users,
  Edit2,
  MoreVertical,
} from "lucide-react";
import africanPattern from "@/assets/african-pattern.jpg";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AvatarViewerTrigger } from "@/components/ui/avatar-viewer";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { SignOutAlertDialog } from "@/components/SignOutAlertDialog";
import { EmailVerificationDialog } from "@/components/EmailVerificationDialog";
import { AddBankDialog } from "@/components/AddBankDialog";
import { DeleteBankAlertDialog } from "@/components/DeleteBankAlertDialog";
import { AddTeamMemberDialog } from "@/components/AddTeamMemberDialog";
import { EditTeamMemberPermissionsDialog } from "@/components/EditTeamMemberPermissionsDialog";
import { RemoveTeamMemberDialog } from "@/components/RemoveTeamMemberDialog";
import { useTheme } from "@/components/ThemeProvider";
import {
  useUser,
  useTeamMembers,
  subgraphKeys,
} from "@/services/subgraph/queries";
import { transformUserToProfile } from "@/services/subgraph/transformers";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { useWallet, WalletButton } from "@vechain/vechain-kit";
import { useQueryClient } from "@tanstack/react-query";
import { useSubmitKYCToAPI, useKYCSubmission } from "@/services/api/kyc";
import {
  useBanks,
  useBanksListByCurrency,
  useCreateBankAccount,
  useDeleteBankAccount,
  useSetDefaultBankAccount,
  type BankAccount,
} from "@/services/api/banks";
import { uploadFileToIPFS } from "@/services/ipfs";
import {
  useMarkKYCPending,
  useUpdateProfile,
  useSetReferralCode,
  useAddTeamMember,
  useRemoveTeamMember,
  useUpdateTeamMemberPermissions,
} from "@/services/contracts/mutations";
import type { UserProfile } from "@/types/user";
import {
  stringifyUserProfileMetadata,
  UserProfileMetadata,
} from "@cleanmate/cip-sdk";
import {
  SUPPORTED_COUNTRIES,
  SUPPORTED_CURRENCIES,
  type SupportedCountryCode,
  type SupportedCurrencyCode,
  isBankSupported,
  getCurrencyForCountry,
} from "@/constants/supported";
import { INTEREST_OPTIONS } from "@/constants/interests";
import { useExchangeRate } from "@/contexts/ExchangeRateContext";

const VALID_TABS = [
  "profile",
  "kyc",
  "referral",
  "team",
  "banks",
  "preferences",
  "account",
] as const;

type TabValue = (typeof VALID_TABS)[number];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const walletAddress = useWalletAddress();
  const { disconnect } = useWallet();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle tab change - update query params
  const handleTabChange = (value: string) => {
    const newTab = VALID_TABS.includes(value as TabValue)
      ? (value as TabValue)
      : "profile";
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (newTab === "profile") {
        // Remove tab param if it's the default
        newParams.delete("tab");
      } else {
        newParams.set("tab", newTab);
      }
      return newParams;
    });
  };

  // Plus button action preference
  const [plusButtonAction, setPlusButtonAction] = useState<
    "organize" | "streak"
  >(() => {
    const saved = localStorage.getItem("plusButtonAction");
    return (saved === "streak" ? "streak" : "organize") as
      | "organize"
      | "streak";
  });

  // Fetch user data
  const { data: userData, isLoading: isLoadingUser } = useUser(walletAddress);
  const userProfile = useMemo(
    () =>
      userData
        ? transformUserToProfile(userData, walletAddress || undefined)
        : null,
    [userData, walletAddress]
  );
  const isEmailVerified = !!userProfile?.isEmailVerified;
  const canApplyForKyc = userData?.email?.length > 0 && isEmailVerified;

  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: "",
    bio: "",
    interests: [],
    email: "",
    country: undefined,
    state: undefined,
    walletAddress: "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);

  // KYC status is sourced from the subgraph/contract via `useUser`.
  const kycStatus: "not_started" | "pending" | "verified" | "rejected" =
    userProfile?.kycStatus ?? "not_started";
  const [kycData, setKycData] = useState({
    documentType: "national_id_card" as
      | "national_id_card"
      | "voters_card"
      | "drivers_license"
      | "passport",
    document: null as File | null,
    documentPreview: null as string | null,
  });
  const documentRef = useRef<HTMLInputElement>(null);

  const submitKYCToAPIMutation = useSubmitKYCToAPI();
  const markKYCPendingMutation = useMarkKYCPending();
  const updateProfileMutation = useUpdateProfile();
  const { data: kycSubmission } = useKYCSubmission(walletAddress || null);
  const setReferralCodeMutation = useSetReferralCode();

  // Bank management
  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts } =
    useBanks(walletAddress);
  const deleteBankMutation = useDeleteBankAccount();
  const setDefaultBankMutation = useSetDefaultBankAccount();
  const createBankMutation = useCreateBankAccount();

  // Check if user's country supports banks
  // Ensure country is uppercase for consistency
  const userCountry = userProfile?.country?.toUpperCase() as
    | SupportedCountryCode
    | undefined;
  const isBankSupportedForUser = userCountry
    ? isBankSupported(userCountry)
    : false;
  const userCurrency = userCountry ? getCurrencyForCountry(userCountry) : null;

  const [addBankOpen, setAddBankOpen] = useState(false);
  const [deleteBankOpen, setDeleteBankOpen] = useState(false);
  const [selectedBankToDelete, setSelectedBankToDelete] =
    useState<BankAccount | null>(null);

  // Fetch banks list for user's currency only when add bank dialog is open
  const { data: banks = [], isLoading: isLoadingAvailableBanks } =
    useBanksListByCurrency(
      (userCurrency || "NGN") as SupportedCurrencyCode,
      addBankOpen
    );
  const [bankAccountForm, setBankAccountForm] = useState({
    bankName: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
    currency: (userCurrency || "NGN") as SupportedCurrencyCode,
  });

  // Team management
  const isOrganizer = userData?.isOrganizer ?? false;
  const { data: teamMembers = [], isLoading: isLoadingTeamMembers } =
    useTeamMembers(walletAddress || null);
  const addTeamMemberMutation = useAddTeamMember();
  const removeTeamMemberMutation = useRemoveTeamMember();
  const updateTeamMemberPermissionsMutation = useUpdateTeamMemberPermissions();

  const [addTeamMemberOpen, setAddTeamMemberOpen] = useState(false);
  const [editTeamMemberOpen, setEditTeamMemberOpen] = useState(false);
  const [removeTeamMemberOpen, setRemoveTeamMemberOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<
    (typeof teamMembers)[0] | null
  >(null);

  const { formatCurrencyEquivalent } = useExchangeRate();

  // Get tab from query params or default to "profile"
  // Validate that the tab is valid and accessible
  const currentTab = useMemo(() => {
    const tabFromUrl = searchParams.get("tab") as TabValue | null;

    // If no tab in URL, default to profile
    if (!tabFromUrl) {
      return "profile";
    }

    // Validate that the tab is in the valid list
    if (!VALID_TABS.includes(tabFromUrl)) {
      return "profile";
    }

    // If user is trying to access "team" tab but is not an organizer, default to profile
    if (tabFromUrl === "team" && !isOrganizer) {
      return "profile";
    }

    return tabFromUrl;
  }, [searchParams, isOrganizer]);

  // Clean up invalid tab query params
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as TabValue | null;
    if (tabFromUrl) {
      const isValidTab = VALID_TABS.includes(tabFromUrl);
      const isAccessibleTab =
        tabFromUrl !== "team" || (tabFromUrl === "team" && isOrganizer);

      if (!isValidTab || !isAccessibleTab) {
        // Remove invalid or inaccessible tab param
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.delete("tab");
          return newParams;
        });
      }
    }
  }, [searchParams, isOrganizer, setSearchParams]);

  // Load profile metadata from contract if available
  useEffect(() => {
    if (!walletAddress || !userProfile) return;

    // Update profile from userProfile data
    if (userProfile) {
      setProfile((prev) => ({
        ...prev,
        name: userProfile.name || prev.name,
        bio: userProfile.bio || prev.bio,
        country: userProfile.country || prev.country,
        state: userProfile.state || prev.state,
        interests: userProfile.interests || prev.interests,
        email: userProfile.email || prev.email,
        walletAddress: walletAddress || prev.walletAddress,
      }));
      if (userProfile.profileImage) {
        setProfileImage(userProfile.profileImage);
      }
    }
  }, [walletAddress, userProfile]);

  const handleKycFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store the File object and create a preview
      // Upload happens when the user clicks "Submit KYC"
      const reader = new FileReader();
      reader.onloadend = () => {
        setKycData((prev) => ({
          ...prev,
          document: file,
          documentPreview: reader.result as string,
        }));
        toast.success("Document selected. Click Submit KYC to upload.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitKyc = async () => {
    if (!walletAddress) {
      toast.error("Wallet not connected");
      return;
    }

    if (!canApplyForKyc) {
      toast.error("Please verify your email before applying for KYC");
      return;
    }

    // Validate required fields
    if (!kycData.documentType || !kycData.document) {
      toast.error("Please select document type and upload a document");
      return;
    }

    try {
      // Step 1: Submit KYC data to KYC service
      toast.info("Securely submitting KYC data...");

      // Prepare files array
      const files: File[] = [];
      if (kycData.document) files.push(kycData.document);

      const kycSubmissionData = {
        userId: walletAddress,
        walletAddress,
        documentType: kycData.documentType,
        files,
      };

      await submitKYCToAPIMutation.mutateAsync(kycSubmissionData);

      // Step 2: After successful POST, call smart contract mutation
      toast.info("Updating KYC status on blockchain...");
      await markKYCPendingMutation.sendTransaction();
    } catch (error) {
      console.error("Error submitting KYC:", error);
      toast.error(
        error instanceof Error
          ? `KYC submission failed: ${error.message}`
          : "Failed to submit KYC"
      );
    }
  };

  const handleSave = async () => {
    if (!walletAddress) {
      toast.error("Wallet not connected");
      return;
    }

    if (!userProfile) {
      toast.error("User not registered. Please complete onboarding first.");
      return;
    }

    try {
      let photoUrl: string | undefined = undefined;

      // If a new file was selected, upload on action click and store an IPFS URI.
      if (profilePhotoFile) {
        toast.info("Uploading profile photo to IPFS...");
        photoUrl = await uploadFileToIPFS(
          profilePhotoFile,
          `profile-photo-${walletAddress}`
        );
      }

      const profileMetadata: UserProfileMetadata<SupportedCountryCode, false> =
        {
          name: profile.name,
          bio: profile.bio || undefined,
          photo: photoUrl,
          location: {
            country: profile.country,
            state: profile.state,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          interests: profile.interests,
        };

      toast.info("Updating profile on blockchain...");
      await updateProfileMutation.sendTransaction(
        stringifyUserProfileMetadata(profileMetadata)
      );

      if (profilePhotoFile && photoUrl) {
        setProfileImage(photoUrl);
        setProfilePhotoFile(null);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(
        error instanceof Error
          ? `Failed to save settings: ${error.message}`
          : "Failed to save settings"
      );
    }
  };

  const toggleInterest = (interest: string) => {
    if (profile.interests.includes(interest)) {
      setProfile({
        ...profile,
        interests: profile.interests.filter((i) => i !== interest),
      });
      toast.success("Interest removed");
    } else {
      setProfile({
        ...profile,
        interests: [...profile.interests, interest],
      });
      toast.success("Interest added");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Local preview only; upload happens when the user clicks "Update Profile".
      const previewUrl = URL.createObjectURL(file);
      setProfileImage(previewUrl);
      setProfilePhotoFile(file);
      toast.success("Photo selected. Click Update Profile to upload.");
    }
  };

  const handleSignOut = () => {
    queryClient.clear();
    disconnect();
    toast.info("Signed out successfully");
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto pb-24 lg:pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-xl lg:text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account and preferences
        </p>
      </motion.div>

      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
          <TabsList className="bg-muted/50 p-1 inline-flex min-w-max">
            <TabsTrigger value="profile" className="text-xs sm:text-sm">
              Profile
            </TabsTrigger>
            <TabsTrigger value="kyc" className="text-xs sm:text-sm">
              KYC
            </TabsTrigger>
            <TabsTrigger value="referral" className="text-xs sm:text-sm">
              Referral
            </TabsTrigger>
            {isOrganizer && (
              <TabsTrigger value="team" className="text-xs sm:text-sm">
                Team
              </TabsTrigger>
            )}
            <TabsTrigger
              value="banks"
              className="text-xs sm:text-sm"
              disabled={!isBankSupportedForUser}
            >
              Banks
              {!isBankSupportedForUser && (
                <Badge
                  variant="secondary"
                  className="ml-1.5 text-[10px] px-1 py-0"
                >
                  Soon
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs sm:text-sm">
              Preferences
            </TabsTrigger>
            <TabsTrigger value="account" className="text-xs sm:text-sm">
              Account
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Email Verification Status */}
          {walletAddress && userData?.email?.length > 0 && (
            <Card
              className={cn(
                "border-l-4",
                isEmailVerified ? "border-l-green-500" : "border-l-primary"
              )}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                      isEmailVerified ? "bg-green-500/10" : "bg-primary/10"
                    )}
                  >
                    {isEmailVerified ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Mail className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {isEmailVerified ? "Email Verified" : "Verify Your Email"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isEmailVerified
                        ? `Your email ${
                            profile.email || ""
                          } has been verified. You can now use referrals and apply for KYC.`
                        : "Verify your email to unlock referrals and apply for KYC."}
                    </p>
                  </div>
                  {!isEmailVerified && (
                    <Button
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => setEmailVerificationOpen(true)}
                    >
                      Verify Email
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Profile Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {profileImage ? (
                    <AvatarViewerTrigger
                      src={profileImage}
                      alt="Profile"
                      size="xl"
                    >
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border cursor-pointer hover:opacity-90 transition-opacity">
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </AvatarViewerTrigger>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border">
                      <User className="w-10 h-10 text-primary" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!walletAddress}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  {profileImage && (
                    <Button
                      variant="ghost"
                      className="text-destructive"
                      disabled={!walletAddress}
                      onClick={() => {
                        setProfileImage(null);
                        setProfilePhotoFile(null);
                        toast.success("Profile photo removed");
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => {
                      setProfile({ ...profile, email: e.target.value });
                    }}
                    disabled={userData?.email?.length > 0}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  placeholder="Tell us about yourself..."
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={profile.country}
                    onValueChange={(value) =>
                      setProfile({
                        ...profile,
                        country: value as SupportedCountryCode,
                        state: profile.state,
                      })
                    }
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province/City</Label>
                  <Input
                    id="state"
                    placeholder="Enter state or province"
                    value={profile.state || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, state: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Interests</CardTitle>
              <CardDescription>
                Select the types of cleanups that interest you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={
                      profile.interests.includes(interest)
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
              {profile.interests.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Selected interests:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {interest}
                        <button
                          onClick={() => toggleInterest(interest)}
                          className="ml-1 hover:bg-muted rounded p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={
                !walletAddress || updateProfileMutation.isTransactionPending
              }
            >
              <Save className="w-4 h-4 mr-2" />
              {updateProfileMutation.isTransactionPending
                ? "Updating..."
                : "Update Profile"}
            </Button>
          </div>
        </TabsContent>

        {/* KYC Tab */}
        <TabsContent value="kyc" className="space-y-6">
          {/* KYC Status Banner */}
          <Card
            className={cn(
              "border-l-4",
              kycStatus === "not_started" && "border-l-muted-foreground",
              kycStatus === "pending" && "border-l-yellow-500",
              kycStatus === "verified" && "border-l-green-500",
              kycStatus === "rejected" && "border-l-destructive"
            )}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    kycStatus === "not_started" && "bg-muted",
                    kycStatus === "pending" && "bg-yellow-500/10",
                    kycStatus === "verified" && "bg-green-500/10",
                    kycStatus === "rejected" && "bg-destructive/10"
                  )}
                >
                  {kycStatus === "not_started" && (
                    <Shield className="w-6 h-6 text-muted-foreground" />
                  )}
                  {kycStatus === "pending" && (
                    <Clock className="w-6 h-6 text-yellow-500" />
                  )}
                  {kycStatus === "verified" && (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  )}
                  {kycStatus === "rejected" && (
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {kycStatus === "not_started" && "KYC Not Started"}
                    {kycStatus === "pending" && "KYC Under Review"}
                    {kycStatus === "verified" && "KYC Verified"}
                    {kycStatus === "rejected" && "KYC Rejected"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {kycStatus === "not_started" &&
                      "Complete your KYC verification to unlock all features"}
                    {kycStatus === "pending" &&
                      "Your documents are being reviewed. This may take 1-3 business days."}
                    {kycStatus === "verified" &&
                      "Your identity has been verified successfully"}
                    {kycStatus === "rejected" &&
                      "Your KYC was rejected. Please resubmit with correct documents."}
                  </p>
                  {kycStatus === "rejected" &&
                    kycSubmission?.rejectionReason && (
                      <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-sm font-medium text-destructive mb-1">
                          Rejection Reason:
                        </p>
                        <p className="text-sm text-foreground">
                          {kycSubmission.rejectionReason}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KYC Form - Only show when status is not pending or verified */}
          {kycStatus !== "pending" && kycStatus !== "verified" && (
            <>
              {/* ID Document */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Identity Document
                  </CardTitle>
                  <CardDescription>Upload your ID card</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select
                      value={kycData.documentType}
                      onValueChange={(
                        value:
                          | "national_id_card"
                          | "voters_card"
                          | "drivers_license"
                          | "passport"
                      ) => setKycData({ ...kycData, documentType: value })}
                      disabled={!canApplyForKyc}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national_id_card">
                          National ID
                        </SelectItem>
                        <SelectItem value="voters_card">Voters Card</SelectItem>
                        <SelectItem value="drivers_license">
                          Driver's License
                        </SelectItem>
                        <SelectItem value="passport">Passport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Upload Document</Label>
                    <input
                      ref={documentRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleKycFileUpload}
                      className="hidden"
                      disabled={!canApplyForKyc}
                    />
                    <div
                      onClick={() =>
                        canApplyForKyc && documentRef.current?.click()
                      }
                      className={cn(
                        "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                        canApplyForKyc &&
                          "cursor-pointer hover:border-primary hover:bg-primary/5",
                        kycData.document
                          ? "border-green-500 bg-green-500/5"
                          : "border-border"
                      )}
                    >
                      {kycData.document ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-medium">Document uploaded</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload document
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG or PDF up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {canApplyForKyc && (
                <div className="flex justify-end">
                  <Button onClick={handleSubmitKyc}>
                    <Shield className="w-4 h-4 mr-2" />
                    Submit KYC
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Referral Tab */}
        <TabsContent value="referral" className="space-y-6">
          {/* Referral Hero Image */}
          <div className="relative h-32 sm:h-40 rounded-lg overflow-hidden">
            <img
              src={africanPattern}
              alt="Referral background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40 flex items-center justify-center">
              <div className="text-center text-primary-foreground">
                <Gift className="w-10 h-10 mx-auto mb-2" />
                <h2 className="text-xl sm:text-2xl font-bold">
                  Invite Friends, Earn Rewards
                </h2>
                <p className="text-sm opacity-90">
                  Get 5 B3TR for every friend who joins
                  {formatCurrencyEquivalent(5) && (
                    <span className="block mt-0.5">
                      {formatCurrencyEquivalent(5)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Email Verification Warning */}
          {userProfile?.email?.length > 0 && !userProfile.isEmailVerified && (
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Verify Your Email</h3>
                    <p className="text-sm text-muted-foreground">
                      You need to verify your email address before you can refer
                      others.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => setEmailVerificationOpen(true)}
                  >
                    Verify Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Referral Code */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Your Referral Code
              </CardTitle>
              <CardDescription>
                Share your referral code with friends and earn rewards when they
                join
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userProfile?.isEmailVerified ? (
                <>
                  {!userProfile.referralCode ? (
                    <div className="text-center py-6 space-y-4">
                      <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="font-medium mb-2">No referral code yet</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Generate a unique referral code to start inviting
                          friends
                        </p>
                        <Button
                          onClick={async () => {
                            try {
                              await setReferralCodeMutation.sendTransaction();
                              // Query will be invalidated automatically by the mutation
                              queryClient.invalidateQueries({
                                queryKey: subgraphKeys.user(walletAddress),
                              });
                            } catch (error) {
                              console.error(
                                "Failed to generate referral code:",
                                error
                              );
                            }
                          }}
                          disabled={
                            setReferralCodeMutation.isTransactionPending
                          }
                        >
                          {setReferralCodeMutation.isTransactionPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Gift className="w-4 h-4 mr-2" />
                              Generate Referral Code
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 p-4 bg-secondary rounded-lg border-2 border-dashed border-border">
                          <p className="text-2xl font-bold tracking-widest text-center">
                            {userProfile.referralCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            const url = `${window.location.origin}/onboarding?ref=${userProfile.referralCode}`;
                            navigator.clipboard.writeText(url);
                            toast.success("Referral link copied to clipboard!");
                          }}
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          Copy Referral Link
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            const url = `${window.location.origin}/onboarding?ref=${userProfile.referralCode}`;
                            if (navigator.share) {
                              navigator.share({
                                title: "Join CleanApp",
                                text: "Join me on CleanApp and help make our environment cleaner!",
                                url: url,
                              });
                            } else {
                              navigator.clipboard.writeText(url);
                              toast.success(
                                "Referral link copied to clipboard!"
                              );
                            }
                          }}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Please verify your email to access your referral code
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                How Referrals Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Share Your Code</p>
                    <p className="text-sm text-muted-foreground">
                      Share your unique referral code with friends and family
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">They Sign Up</p>
                    <p className="text-sm text-muted-foreground">
                      Your friend creates an account using your referral code
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Both Earn Rewards</p>
                    <p className="text-sm text-muted-foreground">
                      You both receive 5 B3TR tokens when they complete their
                      first streak or cleanup.
                      {formatCurrencyEquivalent(5) && (
                        <span className="block mt-0.5">
                          {formatCurrencyEquivalent(5)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        {isOrganizer && (
          <TabsContent value="team" className="space-y-6">
            {/* Team Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Team Members
                    </CardTitle>
                    <CardDescription>
                      Manage your team members and their permissions
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setAddTeamMemberOpen(true)}
                    disabled={addTeamMemberMutation.isTransactionPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingTeamMembers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      No team members yet
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Add team members to help manage your cleanups
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setAddTeamMemberOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Member
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <Card key={member.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <User className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {member.member.slice(0, 6)}...
                                    {member.member.slice(-4)}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-mono truncate">
                                    {member.member}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {member.canEditCleanups && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Edit Cleanups
                                  </Badge>
                                )}
                                {member.canManageParticipants && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Manage Participants
                                  </Badge>
                                )}
                                {member.canSubmitProof && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Submit Proof
                                  </Badge>
                                )}
                                {!member.canEditCleanups &&
                                  !member.canManageParticipants &&
                                  !member.canSubmitProof && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      No permissions
                                    </Badge>
                                  )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Added{" "}
                                {format(
                                  new Date(member.addedAt * 1000),
                                  "MMM d, yyyy"
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedTeamMember(member);
                                  setEditTeamMemberOpen(true);
                                }}
                                disabled={
                                  updateTeamMemberPermissionsMutation.isTransactionPending
                                }
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setSelectedTeamMember(member);
                                  setRemoveTeamMemberOpen(true);
                                }}
                                disabled={
                                  removeTeamMemberMutation.isTransactionPending
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  About Team Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Add Team Members</p>
                      <p className="text-sm text-muted-foreground">
                        Add team members by their wallet address. They must be
                        registered users on the platform.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Set Permissions</p>
                      <p className="text-sm text-muted-foreground">
                        Grant specific permissions to each team member: edit
                        cleanups, manage participants, or submit proof of work.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Manage Access</p>
                      <p className="text-sm text-muted-foreground">
                        Update permissions or remove team members at any time.
                        Changes take effect immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Banks Tab */}
        <TabsContent value="banks" className="space-y-6">
          {isLoadingUser ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Loading profile...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : !walletAddress ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-3">
                  <CreditCard className="w-12 h-12 text-muted-foreground/50" />
                  <div className="text-center">
                    <h3 className="font-medium text-muted-foreground">
                      Connect Wallet
                    </h3>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Connect your wallet to manage bank accounts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : !isBankSupportedForUser || !userCurrency ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-3">
                  <CreditCard className="w-12 h-12 text-muted-foreground/50" />
                  <div className="text-center">
                    <h3 className="font-medium text-muted-foreground">
                      Coming Soon
                    </h3>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Bank account management will be available soon for your
                      country
                    </p>
                    {/* Temporary debug info - remove in production */}
                    {process.env.NODE_ENV === "development" && (
                      <p className="text-xs text-muted-foreground/50 mt-2">
                        Debug: Country={userCountry || "undefined"}, Supported=
                        {isBankSupportedForUser ? "yes" : "no"}, Currency=
                        {userCurrency || "none"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Bank Accounts
                      </CardTitle>
                      <CardDescription>
                        Manage your bank accounts for receiving payments
                      </CardDescription>
                    </div>
                    <AddBankDialog
                      open={addBankOpen}
                      onOpenChange={setAddBankOpen}
                      bankAccount={bankAccountForm}
                      onBankAccountChange={setBankAccountForm}
                      banks={banks}
                      isLoadingBanks={isLoadingAvailableBanks}
                      onSubmit={async () => {
                        if (!walletAddress) return;
                        try {
                          await createBankMutation.mutateAsync({
                            ...bankAccountForm,
                            userId: walletAddress,
                          });
                          setAddBankOpen(false);
                          setBankAccountForm({
                            bankName: "",
                            bankCode: "",
                            accountNumber: "",
                            accountName: "",
                            currency: (userCurrency ||
                              "NGN") as SupportedCurrencyCode,
                          });
                        } catch (error) {
                          // Error is handled by the mutation
                        }
                      }}
                      isPending={createBankMutation.isPending}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingBankAccounts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : bankAccounts.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        No bank accounts yet
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Add a bank account to receive payments
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bankAccounts.map((account) => (
                        <Card key={account.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium truncate">
                                        {account.bankName}
                                      </p>
                                      {account.isDefault && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          <Star className="w-3 h-3 mr-1" />
                                          Default
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground font-mono truncate">
                                      {account.accountNumber}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate mt-1">
                                      {account.accountName}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                  <Badge variant="outline" className="text-xs">
                                    {account.currency}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {!account.isDefault && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (walletAddress) {
                                        setDefaultBankMutation.mutate({
                                          id: account.id,
                                          userId: walletAddress,
                                        });
                                      }
                                    }}
                                    disabled={setDefaultBankMutation.isPending}
                                  >
                                    <Star className="w-4 h-4 mr-1" />
                                    Set Default
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBankToDelete(account);
                                    setDeleteBankOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          {/* Theme */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark theme
                  </p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => {
                    setTheme(checked ? "dark" : "light");
                    toast.success(
                      `Switched to ${checked ? "dark" : "light"} mode`
                    );
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Plus Button Action */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Plus Button Action
              </CardTitle>
              <CardDescription>
                Choose what the plus button does when tapped
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    plusButtonAction === "organize"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <input
                    type="radio"
                    name="plusButtonAction"
                    value="organize"
                    checked={plusButtonAction === "organize"}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPlusButtonAction("organize");
                        localStorage.setItem("plusButtonAction", "organize");
                        // Dispatch custom event for real-time updates
                        window.dispatchEvent(
                          new Event("plusButtonAction-changed")
                        );
                        toast.success("Plus button set to Organize a Cleanup");
                      }
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Organize a Cleanup</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Opens the organize cleanup page (default)
                    </p>
                  </div>
                </label>
                <label
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    plusButtonAction === "streak"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <input
                    type="radio"
                    name="plusButtonAction"
                    value="streak"
                    checked={plusButtonAction === "streak"}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPlusButtonAction("streak");
                        localStorage.setItem("plusButtonAction", "streak");
                        // Dispatch custom event for real-time updates
                        window.dispatchEvent(
                          new Event("plusButtonAction-changed")
                        );
                        toast.success("Plus button set to Submit a new streak");
                      }
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Submit a new streak</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Opens the streak submission page
                    </p>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          {!walletAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Connect Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center gap-4 py-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Connect your wallet to access all settings and features
                  </p>
                  <WalletButton
                    mobileVariant="iconAndDomain"
                    desktopVariant="iconAndDomain"
                  />
                </div>
              </CardContent>
            </Card>
          )}
          {walletAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Sign Out</p>
                    <p className="text-sm text-muted-foreground">
                      Sign out of your account on this device
                    </p>
                  </div>
                  <SignOutAlertDialog onSignOut={handleSignOut} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Email Verification Dialog */}
      <EmailVerificationDialog
        open={emailVerificationOpen}
        onOpenChange={setEmailVerificationOpen}
        email={profile.email}
        isVerified={isEmailVerified}
        onVerified={() => {
          // Invalidate user query to refetch updated verification status
          if (walletAddress) {
            queryClient.invalidateQueries({
              queryKey: subgraphKeys.user(walletAddress),
            });
          }
        }}
      />

      {/* Delete Bank Dialog */}
      <DeleteBankAlertDialog
        open={deleteBankOpen}
        onOpenChange={setDeleteBankOpen}
        onConfirm={() => {
          if (selectedBankToDelete && walletAddress) {
            deleteBankMutation.mutate(
              {
                id: selectedBankToDelete.id,
                userId: walletAddress,
              },
              {
                onSuccess: () => {
                  setDeleteBankOpen(false);
                  setSelectedBankToDelete(null);
                },
              }
            );
          }
        }}
        isPending={deleteBankMutation.isPending}
        onCancel={() => {
          setSelectedBankToDelete(null);
        }}
      />

      {/* Add Team Member Dialog */}
      <AddTeamMemberDialog
        open={addTeamMemberOpen}
        onOpenChange={setAddTeamMemberOpen}
        onSubmit={async (params) => {
          try {
            await addTeamMemberMutation.sendTransaction(params);
            setAddTeamMemberOpen(false);
          } catch (error) {
            console.error("Failed to add team member:", error);
          }
        }}
        isPending={addTeamMemberMutation.isTransactionPending}
      />

      {/* Edit Team Member Dialog */}
      <EditTeamMemberPermissionsDialog
        open={editTeamMemberOpen}
        onOpenChange={setEditTeamMemberOpen}
        teamMember={selectedTeamMember}
        onSubmit={async (params) => {
          try {
            await updateTeamMemberPermissionsMutation.sendTransaction(params);
            setEditTeamMemberOpen(false);
            setSelectedTeamMember(null);
          } catch (error) {
            console.error("Failed to update team member:", error);
          }
        }}
        isPending={updateTeamMemberPermissionsMutation.isTransactionPending}
      />

      {/* Remove Team Member Dialog */}
      <RemoveTeamMemberDialog
        open={removeTeamMemberOpen}
        onOpenChange={setRemoveTeamMemberOpen}
        memberAddress={selectedTeamMember?.member || ""}
        onConfirm={async () => {
          if (selectedTeamMember) {
            try {
              await removeTeamMemberMutation.sendTransaction(
                selectedTeamMember.member
              );
              setRemoveTeamMemberOpen(false);
              setSelectedTeamMember(null);
            } catch (error) {
              console.error("Failed to remove team member:", error);
            }
          }
        }}
        isPending={removeTeamMemberMutation.isTransactionPending}
      />
    </div>
  );
}
