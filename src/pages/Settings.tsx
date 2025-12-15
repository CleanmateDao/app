import { useState, useRef } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { defaultNGOProfile } from "@/data/mockData";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";
import { useUser } from "@/services/subgraph/queries";
import { transformUserToProfile } from "@/services/subgraph/transformers";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { useMemo, useEffect } from "react";
import { useSubmitKYCToAPI } from "@/services/api/kyc";
import {
  useMarkKYCPending,
  useSetSettingsData,
  useUpdateProfile,
  useUpdateEmail,
} from "@/services/contracts/mutations";
import { uploadSettingsToIPFS, getSettingsFromIPFS } from "@/services/ipfs";

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

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: "NGN" | "GHS";
  isDefault: boolean;
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

  const [profile, setProfile] = useState(defaultNGOProfile);
  const [newFocusArea, setNewFocusArea] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    proposalUpdates: true,
    fundingAlerts: true,
    weeklyDigest: false,
    language: "en",
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

  // Bank accounts state
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: "b1",
      bankName: "First Bank Nigeria",
      accountNumber: "3045678901",
      accountName: "GreenEarth Foundation",
      currency: "NGN",
      isDefault: true,
    },
  ]);
  const [isAddBankDialogOpen, setIsAddBankDialogOpen] = useState(false);
  const [newBankAccount, setNewBankAccount] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    currency: "NGN" as "NGN" | "GHS",
  });
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // KYC State
  const [kycStatus, setKycStatus] = useState<
    "not_started" | "pending" | "verified" | "rejected"
  >("not_started");
  const [kycData, setKycData] = useState({
    idType: "national_id" as "national_id" | "passport",
    idNumber: "",
    idDocument: null as string | null,
    photograph: null as string | null,
    dateOfBirth: undefined as Date | undefined,
    address: "",
    city: "",
    postalCode: "",
    country: "",
    proofOfAddress: null as string | null,
  });
  const idDocumentRef = useRef<HTMLInputElement>(null);
  const photographRef = useRef<HTMLInputElement>(null);
  const proofOfAddressRef = useRef<HTMLInputElement>(null);

  const submitKYCToAPIMutation = useSubmitKYCToAPI();
  const markKYCPendingMutation = useMarkKYCPending();
  const setSettingsDataMutation = useSetSettingsData();
  const updateProfileMutation = useUpdateProfile();
  const updateEmailMutation = useUpdateEmail();

  // Load settings from IPFS if available
  useEffect(() => {
    const loadSettings = async () => {
      if (!walletAddress || !userProfile) return;

      // In a real implementation, you would fetch the IPFS hash from the contract
      // and then fetch the settings from IPFS. For now, we'll just use local state.
      // This would require adding a query to fetch settings IPFS hash from contract
    };

    loadSettings();
  }, [walletAddress, userProfile]);

  const handleKycFileUpload = (
    field: "idDocument" | "photograph" | "proofOfAddress",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // For KYC, we store the file directly (not uploading to Pinata as per requirement)
      const reader = new FileReader();
      reader.onloadend = () => {
        setKycData((prev) => ({ ...prev, [field]: reader.result as string }));
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

    if (
      !kycData.idNumber ||
      !kycData.idDocument ||
      !kycData.photograph ||
      !kycData.dateOfBirth ||
      !kycData.address ||
      !kycData.proofOfAddress
    ) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      // Step 1: Submit KYC data to backend API via POST request
      toast.info("Submitting KYC data...");
      const kycSubmissionData = {
        idType: kycData.idType,
        idNumber: kycData.idNumber,
        dateOfBirth: kycData.dateOfBirth.toISOString(),
        address: kycData.address,
        city: kycData.city,
        postalCode: kycData.postalCode,
        country: kycData.country,
        walletAddress,
      };

      await submitKYCToAPIMutation.mutateAsync(kycSubmissionData);

      // Step 2: After successful POST, call smart contract mutation
      toast.info("Submitting KYC to blockchain...");
      await markKYCPendingMutation.mutateAsync();

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
      // Step 1: Update profile metadata on blockchain (only one contract call)
      const profileMetadata = JSON.stringify({
        name: profile.name,
        description: profile.description,
        country: profile.country,
        city: profile.city,
        focusAreas: profile.focusAreas,
      });

      toast.info("Updating profile on blockchain...");
      await updateProfileMutation.mutateAsync(profileMetadata);

      // Step 2: Update email if changed (separate contract call if needed)
      if (profile.email && profile.email !== userProfile.email) {
        toast.info("Updating email on blockchain...");
        await updateEmailMutation.mutateAsync(profile.email);
      }

      // Step 3: Upload settings to IPFS (only after successful profile update)
      toast.info("Uploading settings to IPFS...");
      const settingsData = {
        profile: {
          name: profile.name,
          email: profile.email,
          description: profile.description,
          country: profile.country,
          city: profile.city,
          focusAreas: profile.focusAreas,
          profileImage: profileImage,
        },
        preferences: preferences,
        bankAccounts: bankAccounts,
        walletAddress: profile.walletAddress,
      };

      const ipfsHash = await uploadSettingsToIPFS(settingsData);

      // Step 4: Save IPFS hash to contract
      toast.info("Saving settings to blockchain...");
      await setSettingsDataMutation.mutateAsync(ipfsHash);

      toast.success("Settings saved successfully");
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

  const handleAddBankAccount = () => {
    if (
      !newBankAccount.bankName.trim() ||
      !newBankAccount.accountNumber.trim() ||
      !newBankAccount.accountName.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    const newAccount: BankAccount = {
      id: Date.now().toString(),
      ...newBankAccount,
      isDefault: bankAccounts.length === 0,
    };
    setBankAccounts([...bankAccounts, newAccount]);
    setNewBankAccount({
      bankName: "",
      accountNumber: "",
      accountName: "",
      currency: "NGN",
    });
    setIsAddBankDialogOpen(false);
    toast.success("Bank account added");
  };

  const handleRemoveBankAccount = (id: string) => {
    setBankAccounts(bankAccounts.filter((b) => b.id !== id));
    toast.success("Bank account removed");
  };

  const handleSetDefaultBankAccount = (id: string) => {
    setBankAccounts(
      bankAccounts.map((b) => ({ ...b, isDefault: b.id === id }))
    );
    toast.success("Default bank account updated");
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
                  <Input
                    id="country"
                    value={profile.country}
                    onChange={(e) =>
                      setProfile({ ...profile, country: e.target.value })
                    }
                  />
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
                    value={kycData.idType}
                    onValueChange={(value: "national_id" | "passport") =>
                      setKycData({ ...kycData, idType: value })
                    }
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    {kycData.idType === "passport"
                      ? "Passport Number"
                      : "ID Number"}
                  </Label>
                  <Input
                    value={kycData.idNumber}
                    onChange={(e) =>
                      setKycData({ ...kycData, idNumber: e.target.value })
                    }
                    placeholder={
                      kycData.idType === "passport"
                        ? "Enter passport number"
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
                  {kycData.photograph ? (
                    <img
                      src={kycData.photograph}
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
                <Calendar className="w-4 h-4" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
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
                  value={kycData.address}
                  onChange={(e) =>
                    setKycData({ ...kycData, address: e.target.value })
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
                    value={kycData.city}
                    onChange={(e) =>
                      setKycData({ ...kycData, city: e.target.value })
                    }
                    placeholder="City"
                    disabled={
                      kycStatus === "verified" || kycStatus === "pending"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input
                    value={kycData.postalCode}
                    onChange={(e) =>
                      setKycData({ ...kycData, postalCode: e.target.value })
                    }
                    placeholder="Postal code"
                    disabled={
                      kycStatus === "verified" || kycStatus === "pending"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={kycData.country}
                    onChange={(e) =>
                      setKycData({ ...kycData, country: e.target.value })
                    }
                    placeholder="Country"
                    disabled={
                      kycStatus === "verified" || kycStatus === "pending"
                    }
                  />
                </div>
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
              <Dialog
                open={isAddBankDialogOpen}
                onOpenChange={setIsAddBankDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Bank Account</DialogTitle>
                    <DialogDescription>
                      Add a new bank account to receive payments.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select
                        value={newBankAccount.currency}
                        onValueChange={(v) =>
                          setNewBankAccount({
                            ...newBankAccount,
                            currency: v as "NGN" | "GHS",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NGN">
                            Nigerian Naira (₦)
                          </SelectItem>
                          <SelectItem value="GHS">
                            Ghanaian Cedi (GH₵)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input
                        placeholder="Enter bank name"
                        value={newBankAccount.bankName}
                        onChange={(e) =>
                          setNewBankAccount({
                            ...newBankAccount,
                            bankName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input
                        placeholder="Enter account number"
                        value={newBankAccount.accountNumber}
                        onChange={(e) =>
                          setNewBankAccount({
                            ...newBankAccount,
                            accountNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Holder Name</Label>
                      <Input
                        placeholder="Enter account holder name"
                        value={newBankAccount.accountName}
                        onChange={(e) =>
                          setNewBankAccount({
                            ...newBankAccount,
                            accountName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddBankDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddBankAccount}
                      className="w-full sm:w-auto"
                    >
                      Add Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {bankAccounts.length === 0 ? (
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
                                Remove bank account?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this bank
                                account?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                              <AlertDialogCancel className="w-full sm:w-auto">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleRemoveBankAccount(account.id)
                                }
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
              )}
            </CardContent>
          </Card>

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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Link2 className="w-4 h-4" />
                      Connect Wallet
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md">
                    <DialogHeader>
                      <DialogTitle>Connect Wallet</DialogTitle>
                      <DialogDescription>
                        Choose a wallet provider to connect your Web3 wallet.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-4">
                      <Button
                        variant="outline"
                        className="justify-start h-14"
                        onClick={handleConnectWallet}
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                          <Wallet className="w-4 h-4" />
                        </div>
                        MetaMask
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start h-14"
                        onClick={handleConnectWallet}
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                          <Wallet className="w-4 h-4" />
                        </div>
                        WalletConnect
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start h-14"
                        onClick={handleConnectWallet}
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                          <Wallet className="w-4 h-4" />
                        </div>
                        Coinbase Wallet
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                    setPreferences({ ...preferences, language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
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
              <Dialog
                open={isInviteDialogOpen}
                onOpenChange={setIsInviteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Invite
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation and select their permissions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Permissions</Label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              Organize Cleanups
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Can create and manage cleanup events
                            </p>
                          </div>
                          <Switch
                            checked={invitePermissions.canOrganizeCleanups}
                            onCheckedChange={(checked) =>
                              setInvitePermissions({
                                ...invitePermissions,
                                canOrganizeCleanups: checked,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              Manage Participants
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Can accept or reject participant applications
                            </p>
                          </div>
                          <Switch
                            checked={invitePermissions.canManageParticipants}
                            onCheckedChange={(checked) =>
                              setInvitePermissions({
                                ...invitePermissions,
                                canManageParticipants: checked,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              Submit Proof of Work
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Can submit cleanup evidence
                            </p>
                          </div>
                          <Switch
                            checked={invitePermissions.canSubmitProof}
                            onCheckedChange={(checked) =>
                              setInvitePermissions({
                                ...invitePermissions,
                                canSubmitProof: checked,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">View Rewards</p>
                            <p className="text-xs text-muted-foreground">
                              Can see reward information
                            </p>
                          </div>
                          <Switch
                            checked={invitePermissions.canViewRewards}
                            onCheckedChange={(checked) =>
                              setInvitePermissions({
                                ...invitePermissions,
                                canViewRewards: checked,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Claim Rewards</p>
                            <p className="text-xs text-muted-foreground">
                              Can claim rewards to wallet or bank
                            </p>
                          </div>
                          <Switch
                            checked={invitePermissions.canClaimRewards}
                            onCheckedChange={(checked) =>
                              setInvitePermissions({
                                ...invitePermissions,
                                canClaimRewards: checked,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Manage Team</p>
                            <p className="text-xs text-muted-foreground">
                              Can invite and remove team members
                            </p>
                          </div>
                          <Switch
                            checked={invitePermissions.canManageTeam}
                            onCheckedChange={(checked) =>
                              setInvitePermissions({
                                ...invitePermissions,
                                canManageTeam: checked,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsInviteDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleInviteMember}
                      className="w-full sm:w-auto"
                    >
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Team Member</DialogTitle>
                <DialogDescription>
                  Update permissions for {editingMember?.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Organize Cleanups</p>
                        <p className="text-xs text-muted-foreground">
                          Can create and manage cleanup events
                        </p>
                      </div>
                      <Switch
                        checked={
                          editingMember?.permissions.canOrganizeCleanups ??
                          false
                        }
                        onCheckedChange={(checked) =>
                          setEditingMember(
                            editingMember
                              ? {
                                  ...editingMember,
                                  permissions: {
                                    ...editingMember.permissions,
                                    canOrganizeCleanups: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          Manage Participants
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Can accept or reject participant applications
                        </p>
                      </div>
                      <Switch
                        checked={
                          editingMember?.permissions.canManageParticipants ??
                          false
                        }
                        onCheckedChange={(checked) =>
                          setEditingMember(
                            editingMember
                              ? {
                                  ...editingMember,
                                  permissions: {
                                    ...editingMember.permissions,
                                    canManageParticipants: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          Submit Proof of Work
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Can submit cleanup evidence
                        </p>
                      </div>
                      <Switch
                        checked={
                          editingMember?.permissions.canSubmitProof ?? false
                        }
                        onCheckedChange={(checked) =>
                          setEditingMember(
                            editingMember
                              ? {
                                  ...editingMember,
                                  permissions: {
                                    ...editingMember.permissions,
                                    canSubmitProof: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">View Rewards</p>
                        <p className="text-xs text-muted-foreground">
                          Can see reward information
                        </p>
                      </div>
                      <Switch
                        checked={
                          editingMember?.permissions.canViewRewards ?? false
                        }
                        onCheckedChange={(checked) =>
                          setEditingMember(
                            editingMember
                              ? {
                                  ...editingMember,
                                  permissions: {
                                    ...editingMember.permissions,
                                    canViewRewards: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Claim Rewards</p>
                        <p className="text-xs text-muted-foreground">
                          Can claim rewards to wallet or bank
                        </p>
                      </div>
                      <Switch
                        checked={
                          editingMember?.permissions.canClaimRewards ?? false
                        }
                        onCheckedChange={(checked) =>
                          setEditingMember(
                            editingMember
                              ? {
                                  ...editingMember,
                                  permissions: {
                                    ...editingMember.permissions,
                                    canClaimRewards: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Manage Team</p>
                        <p className="text-xs text-muted-foreground">
                          Can invite and remove team members
                        </p>
                      </div>
                      <Switch
                        checked={
                          editingMember?.permissions.canManageTeam ?? false
                        }
                        onCheckedChange={(checked) =>
                          setEditingMember(
                            editingMember
                              ? {
                                  ...editingMember,
                                  permissions: {
                                    ...editingMember.permissions,
                                    canManageTeam: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateMember}
                  className="w-full sm:w-auto"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">Sign Out</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[95vw] max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sign out?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will be signed out of your account on this device.
                        You can sign back in at any time.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSignOut}
                        className="w-full sm:w-auto"
                      >
                        Sign Out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                    >
                      Deactivate
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[95vw] max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deactivate account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your account will be temporarily disabled. You can
                        reactivate it by signing in again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeactivate}
                        className="bg-destructive text-destructive-foreground w-full sm:w-auto"
                      >
                        Deactivate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and data
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[95vw] max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete account permanently?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All your data and cleanup
                        history will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground w-full sm:w-auto"
                      >
                        Delete Forever
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
