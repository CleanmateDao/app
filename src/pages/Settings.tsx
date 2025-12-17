import { useState, useRef, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Users,
  Wallet,
  Save,
  Plus,
  X,
  Link2,
  Bell,
  LogOut,
  AlertTriangle,
  UserPlus,
  Upload,
  Trash2,
  Edit2,
  Check,
  Shield,
  FileText,
  Camera,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  CreditCard,
  Moon,
  Sun,
  Copy,
  Gift,
  Share2,
  Navigation,
  Loader2,
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
import { AddBankDialog } from "@/components/AddBankDialog";
import { DeleteBankAlertDialog } from "@/components/DeleteBankAlertDialog";
import { ConnectWalletDialog } from "@/components/ConnectWalletDialog";
import { InviteTeamMemberDialog } from "@/components/InviteTeamMemberDialog";
import { EditTeamMemberDialog } from "@/components/EditTeamMemberDialog";
import { RemoveTeamMemberAlertDialog } from "@/components/RemoveTeamMemberAlertDialog";
import { SignOutAlertDialog } from "@/components/SignOutAlertDialog";
import { DeactivateAccountAlertDialog } from "@/components/DeactivateAccountAlertDialog";
import { DeleteAccountAlertDialog } from "@/components/DeleteAccountAlertDialog";
import { useTheme } from "@/components/ThemeProvider";
import { useUser } from "@/services/subgraph/queries";
import { transformUserToProfile } from "@/services/subgraph/transformers";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { useSubmitKYCToAPI } from "@/services/api/kyc";
import {
  useMarkKYCPending,
  useUpdateProfile,
} from "@/services/contracts/mutations";
import type { UserMetadata } from "@/services/subgraph/types";
import {
  SUPPORTED_COUNTRIES,
  SUPPORTED_LANGUAGES,
  SUPPORTED_CURRENCIES,
  getStatesForCountry,
  type SupportedCountryCode,
  type SupportedCurrencyCode,
} from "@/constants/supported";
import {
  useBanks,
  useCreateBankAccount,
  useDeleteBankAccount,
  useSetDefaultBankAccount,
  useBanksListByCurrency,
  type BankAccount,
} from "@/services/api/banks";
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TeamMemberPermissions {
  canOrganizeCleanups: boolean;
  canManageParticipants: boolean;
  canSubmitProof: boolean;
  canViewRewards: boolean;
  canClaimRewards: boolean;
  canManageTeam: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  permissions: TeamMemberPermissions;
  avatar?: string;
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const walletAddress = useWalletAddress();

  // Fetch user data
  const { data: userData } = useUser(walletAddress);
  const userProfile = useMemo(
    () =>
      userData
        ? transformUserToProfile(userData, walletAddress || undefined)
        : null,
    [userData, walletAddress]
  );

  const [profile, setProfile] = useState({
    name: "",
    registrationNumber: "",
    foundedYear: "",
    teamSize: "",
    description: "",
    mission: "",
    vision: "",
    focusAreas: [] as string[],
    email: "",
    phone: "",
    website: "",
    country: SUPPORTED_COUNTRIES[0]?.name || "",
    city: "",
    address: "",
    walletAddress: "",
    socialLinks: {
      twitter: "",
      linkedin: "",
      facebook: "",
    },
  });
  const [newFocusArea, setNewFocusArea] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preferences, setPreferences] = useState<{
    emailNotifications: boolean;
    proposalUpdates: boolean;
    fundingAlerts: boolean;
    weeklyDigest: boolean;
    language: string;
    locationAccess: boolean;
  }>({
    emailNotifications: true,
    proposalUpdates: true,
    fundingAlerts: true,
    weeklyDigest: false,
    language: SUPPORTED_LANGUAGES[0].code,
    locationAccess: true,
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@greenearth.org",
      permissions: {
        canOrganizeCleanups: true,
        canManageParticipants: true,
        canSubmitProof: true,
        canViewRewards: true,
        canClaimRewards: true,
        canManageTeam: true,
      },
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@greenearth.org",
      permissions: {
        canOrganizeCleanups: true,
        canManageParticipants: true,
        canSubmitProof: true,
        canViewRewards: true,
        canClaimRewards: false,
        canManageTeam: false,
      },
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@greenearth.org",
      permissions: {
        canOrganizeCleanups: false,
        canManageParticipants: false,
        canSubmitProof: false,
        canViewRewards: true,
        canClaimRewards: false,
        canManageTeam: false,
      },
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePermissions, setInvitePermissions] =
    useState<TeamMemberPermissions>({
      canOrganizeCleanups: false,
      canManageParticipants: false,
      canSubmitProof: false,
      canViewRewards: true,
      canClaimRewards: false,
      canManageTeam: false,
    });

  // Bank accounts - fetch from API
  const { data: bankAccounts = [], isLoading: isLoadingBanks } =
    useBanks(walletAddress);
  const createBankAccountMutation = useCreateBankAccount();
  const deleteBankAccountMutation = useDeleteBankAccount();
  const setDefaultBankAccountMutation = useSetDefaultBankAccount();
  const [isAddBankDialogOpen, setIsAddBankDialogOpen] = useState(false);
  const [newBankAccount, setNewBankAccount] = useState({
    bankName: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
    currency: SUPPORTED_CURRENCIES[0].code as SupportedCurrencyCode,
  });
  const [deleteBankId, setDeleteBankId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch banks list from Paystack for the selected currency
  const { data: paystackBanks = [], isLoading: isLoadingPaystackBanks } =
    useBanksListByCurrency(newBankAccount.currency);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // KYC State
  const [kycStatus, setKycStatus] = useState<
    "not_started" | "pending" | "verified" | "rejected"
  >("not_started");
  const [kycData, setKycData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    documentType: "national_id" as
      | "passport"
      | "national_id"
      | "drivers_license"
      | "other",
    documentNumber: "",
    idDocument: null as File | null,
    idDocumentPreview: null as string | null,
    photograph: null as File | null,
    photographPreview: null as string | null,
    dateOfBirth: undefined as Date | undefined,
    nationality: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    proofOfAddress: null as File | null,
    proofOfAddressPreview: null as string | null,
  });
  const idDocumentRef = useRef<HTMLInputElement>(null);
  const photographRef = useRef<HTMLInputElement>(null);
  const proofOfAddressRef = useRef<HTMLInputElement>(null);

  const submitKYCToAPIMutation = useSubmitKYCToAPI();
  const markKYCPendingMutation = useMarkKYCPending();
  const updateProfileMutation = useUpdateProfile();

  // Load profile metadata from contract if available
  useEffect(() => {
    if (!walletAddress || !userProfile) return;

    // Update profile from userProfile data
    if (userProfile) {
      setProfile((prev) => ({
        ...prev,
        name: userProfile.name || prev.name,
        description: userProfile.bio || prev.description,
        country:
          userProfile.country ||
          prev.country ||
          SUPPORTED_COUNTRIES[0]?.name ||
          "",
        city: userProfile.city || prev.city,
        focusAreas: userProfile.focusAreas || prev.focusAreas,
        email: userProfile.email || prev.email,
        walletAddress: walletAddress || prev.walletAddress,
      }));
      if (userProfile.profileImage) {
        setProfileImage(userProfile.profileImage);
      }

      // Initialize KYC data from profile
      if (userProfile.name) {
        const nameParts = userProfile.name.trim().split(/\s+/);
        setKycData((prev) => ({
          ...prev,
          firstName: nameParts[0] || prev.firstName,
          lastName: nameParts.slice(1).join(" ") || prev.lastName,
        }));
      }
      if (userProfile.country) {
        setKycData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            country: userProfile.country || prev.address.country,
          },
        }));
      }
      if (userProfile.city) {
        setKycData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            city: userProfile.city || prev.address.city,
          },
        }));
      }
    }
  }, [walletAddress, userProfile]);

  const handleKycFileUpload = (
    field: "idDocument" | "photograph" | "proofOfAddress",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store the File object and create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewField = `${field}Preview` as
          | "idDocumentPreview"
          | "photographPreview"
          | "proofOfAddressPreview";
        setKycData((prev) => ({
          ...prev,
          [field]: file,
          [previewField]: reader.result as string,
        }));
        toast.success("Document uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitKyc = async () => {
    if (!walletAddress) {
      toast.error("Wallet not connected");
      return;
    }

    // Validate required fields
    if (
      !kycData.firstName ||
      !kycData.lastName ||
      !profile.email ||
      !kycData.documentType ||
      !kycData.idDocument ||
      !kycData.photograph ||
      !kycData.dateOfBirth ||
      !kycData.address.country ||
      !kycData.proofOfAddress
    ) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      // Step 1: Submit KYC data to KYC service
      toast.info("Submitting KYC data...");

      // Prepare files array
      const files: File[] = [];
      if (kycData.idDocument) files.push(kycData.idDocument);
      if (kycData.photograph) files.push(kycData.photograph);
      if (kycData.proofOfAddress) files.push(kycData.proofOfAddress);

      // Prepare address object
      const address = {
        street: kycData.address.street || undefined,
        city: kycData.address.city || undefined,
        state: kycData.address.state || undefined,
        country: kycData.address.country,
        zipCode: kycData.address.zipCode || undefined,
      };

      const kycSubmissionData = {
        userId: walletAddress,
        walletAddress,
        firstName: kycData.firstName,
        lastName: kycData.lastName,
        email: profile.email,
        phoneNumber: kycData.phoneNumber || undefined,
        dateOfBirth: kycData.dateOfBirth.toISOString().split("T")[0],
        nationality: kycData.nationality || undefined,
        documentType: kycData.documentType,
        documentNumber: kycData.documentNumber || undefined,
        address,
        files,
      };

      await submitKYCToAPIMutation.mutateAsync(kycSubmissionData);

      // Step 2: After successful POST, call smart contract mutation
      toast.info("Submitting KYC to blockchain...");
      await markKYCPendingMutation.sendTransaction();

      setKycStatus("pending");
      toast.success("KYC submitted for review");
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
      // Update profile metadata on blockchain using standardized UserMetadata type
      // Note: email, kycStatus, referralCode are stored in contract, not in metadata
      const profileMetadata: UserMetadata = {
        name: profile.name,
        bio: profile.description,
        country: profile.country,
        city: profile.city,
        focusAreas: profile.focusAreas,
        profileImage: profileImage,
      };

      toast.info("Updating profile on blockchain...");
      await updateProfileMutation.sendTransaction(
        JSON.stringify(profileMetadata)
      );

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(
        error instanceof Error
          ? `Failed to save settings: ${error.message}`
          : "Failed to save settings"
      );
    }
  };

  const addFocusArea = () => {
    if (newFocusArea.trim()) {
      setProfile({
        ...profile,
        focusAreas: [...profile.focusAreas, newFocusArea.trim()],
      });
      setNewFocusArea("");
      toast.success("Focus area added");
    }
  };

  const removeFocusArea = (area: string) => {
    setProfile({
      ...profile,
      focusAreas: profile.focusAreas.filter((a) => a !== area),
    });
    toast.success("Focus area removed");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast.success("Profile image uploaded");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      permissions: invitePermissions,
    };
    setTeamMembers([...teamMembers, newMember]);
    setInviteEmail("");
    setInvitePermissions({
      canOrganizeCleanups: false,
      canManageParticipants: false,
      canSubmitProof: false,
      canViewRewards: true,
      canClaimRewards: false,
      canManageTeam: false,
    });
    setIsInviteDialogOpen(false);
    toast.success(`Invitation sent to ${inviteEmail}`);
  };

  const handleAddBankAccount = async () => {
    if (
      !newBankAccount.bankName.trim() ||
      !newBankAccount.accountNumber.trim() ||
      !newBankAccount.accountName.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!walletAddress) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      await createBankAccountMutation.mutateAsync({
        ...newBankAccount,
        userId: walletAddress,
        isDefault: bankAccounts.length === 0,
      });
      setNewBankAccount({
        bankName: "",
        bankCode: "",
        accountNumber: "",
        accountName: "",
        currency: SUPPORTED_CURRENCIES[0].code as SupportedCurrencyCode,
      });
      setIsAddBankDialogOpen(false);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleRemoveBankAccount = (id: string) => {
    setDeleteBankId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBankAccount = async () => {
    if (!deleteBankId || !walletAddress) {
      return;
    }

    try {
      await deleteBankAccountMutation.mutateAsync({
        id: deleteBankId,
        userId: walletAddress,
      });
      setIsDeleteDialogOpen(false);
      setDeleteBankId(null);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleSetDefaultBankAccount = async (id: string) => {
    if (!walletAddress) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      await setDefaultBankAccountMutation.mutateAsync({
        id,
        userId: walletAddress,
      });
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return "****" + accountNumber.slice(-4);
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
    toast.success("Team member removed");
  };

  const handleUpdateMember = () => {
    if (editingMember) {
      setTeamMembers(
        teamMembers.map((m) => (m.id === editingMember.id ? editingMember : m))
      );
      setIsEditDialogOpen(false);
      setEditingMember(null);
      toast.success("Member updated");
    }
  };

  const handleSignOut = () => {
    toast.info("Signed out successfully");
  };

  const handleDeactivate = () => {
    toast.warning("Account deactivated");
  };

  const handleDeleteAccount = () => {
    toast.error("Account deleted");
  };

  const handleConnectWallet = () => {
    toast.success("Wallet connection initiated");
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

      <Tabs defaultValue="profile" className="space-y-6">
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
            <TabsTrigger value="wallets" className="text-xs sm:text-sm">
              Wallets
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs sm:text-sm">
              Preferences
            </TabsTrigger>
            <TabsTrigger value="team" className="text-xs sm:text-sm">
              Team
            </TabsTrigger>
            <TabsTrigger value="account" className="text-xs sm:text-sm">
              Account
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
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
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-primary" />
                    )}
                  </div>
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
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  {profileImage && (
                    <Button
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        setProfileImage(null);
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
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  placeholder="Tell us about yourself..."
                  value={profile.description}
                  onChange={(e) =>
                    setProfile({ ...profile, description: e.target.value })
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
                      setProfile({ ...profile, country: value })
                    }
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) =>
                      setProfile({ ...profile, city: e.target.value })
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.focusAreas.map((area) => (
                  <Badge key={area} variant="secondary" className="gap-1 pr-1">
                    {area}
                    <button
                      onClick={() => removeFocusArea(area)}
                      className="ml-1 hover:bg-muted rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add interest..."
                  value={newFocusArea}
                  onChange={(e) => setNewFocusArea(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addFocusArea()}
                />
                <Button variant="outline" onClick={addFocusArea}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ID Document */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Identity Document
              </CardTitle>
              <CardDescription>
                Upload your National ID or Passport
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select
                    value={kycData.documentType}
                    onValueChange={(
                      value:
                        | "passport"
                        | "national_id"
                        | "drivers_license"
                        | "other"
                    ) => setKycData({ ...kycData, documentType: value })}
                    disabled={
                      kycStatus === "verified" || kycStatus === "pending"
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national_id">National ID</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="drivers_license">
                        Driver's License
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    {kycData.documentType === "passport"
                      ? "Passport Number"
                      : kycData.documentType === "drivers_license"
                      ? "License Number"
                      : "ID Number"}
                  </Label>
                  <Input
                    value={kycData.documentNumber}
                    onChange={(e) =>
                      setKycData({ ...kycData, documentNumber: e.target.value })
                    }
                    placeholder={
                      kycData.documentType === "passport"
                        ? "Enter passport number"
                        : kycData.documentType === "drivers_license"
                        ? "Enter license number"
                        : "Enter ID number"
                    }
                    disabled={
                      kycStatus === "verified" || kycStatus === "pending"
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Upload Document</Label>
                <input
                  ref={idDocumentRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleKycFileUpload("idDocument", e)}
                  className="hidden"
                  disabled={kycStatus === "verified" || kycStatus === "pending"}
                />
                <div
                  onClick={() =>
                    kycStatus !== "verified" &&
                    kycStatus !== "pending" &&
                    idDocumentRef.current?.click()
                  }
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                    kycStatus !== "verified" &&
                      kycStatus !== "pending" &&
                      "cursor-pointer hover:border-primary hover:bg-primary/5",
                    kycData.idDocument
                      ? "border-green-500 bg-green-500/5"
                      : "border-border"
                  )}
                >
                  {kycData.idDocument ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Document uploaded</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload ID document
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

          {/* Photograph */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Photograph
              </CardTitle>
              <CardDescription>
                Upload a clear photo of yourself
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={photographRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleKycFileUpload("photograph", e)}
                className="hidden"
                disabled={kycStatus === "verified" || kycStatus === "pending"}
              />
              <div className="flex items-center gap-6">
                <div
                  onClick={() =>
                    kycStatus !== "verified" &&
                    kycStatus !== "pending" &&
                    photographRef.current?.click()
                  }
                  className={cn(
                    "w-32 h-32 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors",
                    kycStatus !== "verified" &&
                      kycStatus !== "pending" &&
                      "cursor-pointer hover:border-primary hover:bg-primary/5",
                    kycData.photograph ? "border-green-500" : "border-border"
                  )}
                >
                  {kycData.photographPreview ? (
                    <img
                      src={kycData.photographPreview}
                      alt="Your photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Requirements:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Clear, front-facing photo</li>
                    <li>Good lighting</li>
                    <li>Plain background</li>
                    <li>No sunglasses or hats</li>
                  </ul>
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
                  <Label>First Name *</Label>
                  <Input
                    value={kycData.firstName}
                    onChange={(e) =>
                      setKycData({ ...kycData, firstName: e.target.value })
                    }
                    placeholder="Enter your first name"
                    disabled={
                      kycStatus === "verified" || kycStatus === "pending"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    value={kycData.lastName}
                    onChange={(e) =>
                      setKycData({ ...kycData, lastName: e.target.value })
                    }
                    placeholder="Enter your last name"
                    disabled={
                      kycStatus === "verified" || kycStatus === "pending"
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={kycData.phoneNumber}
                    onChange={(e) =>
                      setKycData({ ...kycData, phoneNumber: e.target.value })
                    }
                    placeholder="Enter your phone number"
                    disabled={
                      kycStatus === "verified" || kycStatus === "pending"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Input
                    value={kycData.nationality}
                    onChange={(e) =>
                      setKycData({ ...kycData, nationality: e.target.value })
                    }
                    placeholder="Enter your nationality"
                    disabled={
                      kycStatus === "verified" || kycStatus === "pending"
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !kycData.dateOfBirth && "text-muted-foreground"
                      )}
                      disabled={
                        kycStatus === "verified" || kycStatus === "pending"
                      }
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {kycData.dateOfBirth
                        ? format(kycData.dateOfBirth, "PPP")
                        : "Select your date of birth"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={kycData.dateOfBirth}
                      onSelect={(date) =>
                        setKycData({ ...kycData, dateOfBirth: date })
                      }
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </CardTitle>
              <CardDescription>
                Your residential address for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Textarea
                  value={kycData.address.street}
                  onChange={(e) =>
                    setKycData({
                      ...kycData,
                      address: { ...kycData.address, street: e.target.value },
                    })
                  }
                  placeholder="Enter your full street address"
                  rows={2}
                  disabled={kycStatus === "verified" || kycStatus === "pending"}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={kycData.address.city}
                    onChange={(e) =>
                      setKycData({
                        ...kycData,
                        address: { ...kycData.address, city: e.target.value },
                      })
                    }
                    placeholder="City"
                    disabled={
                      kycStatus === "verified" || kycStatus === "pending"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>State/Province</Label>
                  <Select
                    value={kycData.address.state}
                    onValueChange={(value) =>
                      setKycData({
                        ...kycData,
                        address: { ...kycData.address, state: value },
                      })
                    }
                    disabled={
                      kycStatus === "verified" || kycStatus === "pending"
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state or province" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        // Get country code from country name
                        const country = SUPPORTED_COUNTRIES.find(
                          (c) => c.name === kycData.address.country
                        );
                        const countryCode = country?.code || "NG";
                        const states = getStatesForCountry(
                          countryCode as SupportedCountryCode
                        );
                        return states.map((state) => (
                          <SelectItem key={state.code} value={state.name}>
                            {state.name}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input
                    value={kycData.address.zipCode}
                    onChange={(e) =>
                      setKycData({
                        ...kycData,
                        address: {
                          ...kycData.address,
                          zipCode: e.target.value,
                        },
                      })
                    }
                    placeholder="Postal code"
                    disabled={
                      kycStatus === "verified" || kycStatus === "pending"
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Country *</Label>
                <Input
                  value={kycData.address.country}
                  onChange={(e) =>
                    setKycData({
                      ...kycData,
                      address: { ...kycData.address, country: e.target.value },
                    })
                  }
                  placeholder="Country"
                  disabled={kycStatus === "verified" || kycStatus === "pending"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Proof of Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Proof of Address
              </CardTitle>
              <CardDescription>
                Utility bill, bank statement, or government letter (dated within
                3 months)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={proofOfAddressRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleKycFileUpload("proofOfAddress", e)}
                className="hidden"
                disabled={kycStatus === "verified" || kycStatus === "pending"}
              />
              <div
                onClick={() =>
                  kycStatus !== "verified" &&
                  kycStatus !== "pending" &&
                  proofOfAddressRef.current?.click()
                }
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                  kycStatus !== "verified" &&
                    kycStatus !== "pending" &&
                    "cursor-pointer hover:border-primary hover:bg-primary/5",
                  kycData.proofOfAddress
                    ? "border-green-500 bg-green-500/5"
                    : "border-border"
                )}
              >
                {kycData.proofOfAddress ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Document uploaded</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload proof of address
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG or PDF up to 10MB
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {kycStatus !== "verified" && kycStatus !== "pending" && (
            <div className="flex justify-end">
              <Button onClick={handleSubmitKyc}>
                <Shield className="w-4 h-4 mr-2" />
                Submit KYC
              </Button>
            </div>
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
                  Get 10 B3TR for every friend who joins
                </p>
              </div>
            </div>
          </div>

          {/* Email Verification Warning */}
          {userProfile && !userProfile.isEmailVerified && (
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
                  <Button size="sm" className="w-full sm:w-auto">
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
                  <div className="flex items-center gap-3">
                    <div className="flex-1 p-4 bg-secondary rounded-lg border-2 border-dashed border-border">
                      <p className="text-2xl font-bold tracking-widest text-center">
                        {userProfile.referralCode || "N/A"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          userProfile.referralCode || ""
                        );
                        toast.success("Referral code copied to clipboard!");
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
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
                          toast.success("Referral link copied to clipboard!");
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
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

          {/* Referral Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Referral Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-secondary rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">
                    {userProfile?.referralCount || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Referrals
                  </p>
                </div>
                <div className="p-4 bg-secondary rounded-lg text-center">
                  <p className="text-2xl font-bold text-status-approved">
                    {Math.floor((userProfile?.referralCount || 0) * 0.8)}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg text-center col-span-2 md:col-span-1">
                  <p className="text-2xl font-bold text-primary">
                    {(userProfile?.referralCount || 0) * 10} B3TR
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rewards Earned
                  </p>
                </div>
              </div>
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
                      You both receive 10 B3TR tokens when they complete their
                      first cleanup
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallets Tab */}
        <TabsContent value="wallets" className="space-y-6">
          {/* Bank Accounts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Bank Accounts
                </CardTitle>
                <CardDescription>
                  Receive funding via traditional banking (NGN & GHS only)
                </CardDescription>
              </div>
              <AddBankDialog
                open={isAddBankDialogOpen}
                onOpenChange={setIsAddBankDialogOpen}
                bankAccount={newBankAccount}
                onBankAccountChange={setNewBankAccount}
                paystackBanks={paystackBanks}
                isLoadingPaystackBanks={isLoadingPaystackBanks}
                onSubmit={handleAddBankAccount}
                isPending={createBankAccountMutation.isPending}
              />
            </CardHeader>
            <CardContent>
              {isLoadingBanks ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Loading bank accounts...
                  </p>
                </div>
              ) : bankAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No bank accounts added yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bankAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30 gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              {account.bankName}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {account.currency}
                            </Badge>
                            {account.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {account.accountName} •{" "}
                            {maskAccountNumber(account.accountNumber)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-12 sm:ml-0">
                        {!account.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleSetDefaultBankAccount(account.id)
                            }
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveBankAccount(account.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delete Bank Account Confirmation Dialog */}
          <DeleteBankAlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={confirmDeleteBankAccount}
            isPending={deleteBankAccountMutation.isPending}
            onCancel={() => setDeleteBankId(null)}
          />

          {/* Web3 Wallet */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Web3 Wallet
              </CardTitle>
              <CardDescription>Receive crypto funding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Wallet Address</Label>
                <Input
                  value={profile.walletAddress}
                  onChange={(e) =>
                    setProfile({ ...profile, walletAddress: e.target.value })
                  }
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-3">
                <ConnectWalletDialog onConnect={handleConnectWallet} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Wallets
            </Button>
          </div>
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
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(value) =>
                    setPreferences({
                      ...preferences,
                      language: value as string,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Location Access */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Location Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Enable Location Access</p>
                  <p className="text-sm text-muted-foreground">
                    Allow the app to access your location for nearby cleanups
                  </p>
                </div>
                <Switch
                  checked={preferences.locationAccess}
                  onCheckedChange={(checked) => {
                    setPreferences({ ...preferences, locationAccess: checked });
                    toast.success(
                      checked
                        ? "Location access enabled"
                        : "Location access disabled"
                    );
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => {
                    setPreferences({
                      ...preferences,
                      emailNotifications: checked,
                    });
                    toast.success(
                      checked
                        ? "Email notifications enabled"
                        : "Email notifications disabled"
                    );
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Cleanup Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified on cleanup status changes
                  </p>
                </div>
                <Switch
                  checked={preferences.proposalUpdates}
                  onCheckedChange={(checked) => {
                    setPreferences({
                      ...preferences,
                      proposalUpdates: checked,
                    });
                    toast.success(
                      checked
                        ? "Cleanup updates enabled"
                        : "Cleanup updates disabled"
                    );
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Reward Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for new rewards
                  </p>
                </div>
                <Switch
                  checked={preferences.fundingAlerts}
                  onCheckedChange={(checked) => {
                    setPreferences({ ...preferences, fundingAlerts: checked });
                    toast.success(
                      checked
                        ? "Reward alerts enabled"
                        : "Reward alerts disabled"
                    );
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Weekly Digest</p>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of activity
                  </p>
                </div>
                <Switch
                  checked={preferences.weeklyDigest}
                  onCheckedChange={(checked) => {
                    setPreferences({ ...preferences, weeklyDigest: checked });
                    toast.success(
                      checked
                        ? "Weekly digest enabled"
                        : "Weekly digest disabled"
                    );
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team Members
                </CardTitle>
                <CardDescription>
                  Manage who can help organize your cleanups
                </CardDescription>
              </div>
              <InviteTeamMemberDialog
                open={isInviteDialogOpen}
                onOpenChange={setIsInviteDialogOpen}
                email={inviteEmail}
                onEmailChange={setInviteEmail}
                permissions={invitePermissions}
                onPermissionsChange={setInvitePermissions}
                onSubmit={handleInviteMember}
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-12 sm:ml-0 flex-wrap">
                      <div className="flex flex-wrap gap-1">
                        {
                          Object.entries(member.permissions).filter(
                            ([_, v]) => v
                          ).length
                        }{" "}
                        permissions
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingMember(member);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="w-[95vw] max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remove team member?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {member.name} from
                              your team? They will lose access to all
                              organization resources.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveMember(member.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Edit Member Dialog */}
          <EditTeamMemberDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            member={editingMember}
            onMemberChange={setEditingMember}
            onSave={handleUpdateMember}
          />
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
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

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Deactivate Account</p>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable your account
                  </p>
                </div>
                <DeactivateAccountAlertDialog onDeactivate={handleDeactivate} />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and data
                  </p>
                </div>
                <DeleteAccountAlertDialog onDelete={handleDeleteAccount} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
