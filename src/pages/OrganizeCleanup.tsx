import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  FileText,
  Upload,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Check,
  X,
  Plus,
  Trash2,
  Image,
  Video,
  Users,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import africanPattern from "@/assets/african-pattern-decorative.jpg";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { GoogleMap } from "@/components/ui/google-map";
import { PlacesAutocomplete } from "@/components/ui/places-autocomplete";
import { useUser } from "@/services/subgraph/queries";
import { transformUserToProfile } from "@/services/subgraph/transformers";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { uploadFilesToIPFS } from "@/services/ipfs";
import { useCreateCleanup } from "@/services/contracts/mutations";
import {
  stringifyCleanupMetadata,
  type CleanupMetadata,
} from "@cleanmate/cip-sdk";

const steps = [
  {
    id: 1,
    title: "Basic Info",
    icon: FileText,
    description: "Cleanup title and description",
  },
  {
    id: 2,
    title: "Location",
    icon: MapPin,
    description: "Where will it take place",
  },
  {
    id: 3,
    title: "Schedule",
    icon: CalendarIcon,
    description: "Date and time",
  },
  { id: 4, title: "Media", icon: Image, description: "Cover images" },
];

interface MediaItem {
  id: string;
  file: File;
  type: "image" | "video";
  preview: string;
}

export default function OrganizeCleanup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [location, setLocation] = useState({
    address: "",
    city: "",
    country: "",
    latitude: 0,
    longitude: 0,
  });
  const [schedule, setSchedule] = useState({
    date: "",
    startTime: "",
    endTime: "",
    maxParticipants: "",
  });
  const [media, setMedia] = useState<MediaItem[]>([]);

  const progress = (currentStep / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const walletAddress = useWalletAddress();
  const createCleanupMutation = useCreateCleanup(() => {
    navigate("/cleanups");
  });

  const handleSaveDraft = () => {
    toast.success("Draft saved successfully");
  };

  const handleSubmit = async () => {
    if (!walletAddress) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (!location.address || !location.city || !location.country) {
        toast.error("Please select a location");
        return;
      }

      if (
        !schedule.date ||
        !schedule.startTime ||
        !schedule.endTime ||
        !schedule.maxParticipants
      ) {
        toast.error("Please fill in all schedule details");
        return;
      }

      // Upload media files to Pinata IPFS
      let mediaIpfsHashes: string[] = [];
      if (media.length > 0) {
        toast.info("Uploading media to IPFS...");
        const files = media.map((item) => item.file);
        mediaIpfsHashes = await uploadFilesToIPFS(files);
      }

      // Create metadata JSON as plain string (not IPFS)
      const metadata: CleanupMetadata = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        media: mediaIpfsHashes.map((hash, index) => ({
          ipfsHash: hash,
          type: media[index].type,
          name: media[index].file.name,
        })),
      };

      // Convert metadata to JSON string (not uploading to IPFS)
      const metadataJsonString = stringifyCleanupMetadata(metadata);

      // Convert date/time to timestamps
      const dateTimestamp = Math.floor(
        new Date(schedule.date).getTime() / 1000
      );
      const [startHour, startMinute] = schedule.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = schedule.endTime.split(":").map(Number);
      const startDate = new Date(schedule.date);
      startDate.setHours(startHour, startMinute, 0, 0);
      const endDate = new Date(schedule.date);
      endDate.setHours(endHour, endMinute, 0, 0);

      const startTime = Math.floor(startDate.getTime() / 1000);
      const endTime = Math.floor(endDate.getTime() / 1000);

      console.log({
        metadata: metadataJsonString,
        category: formData.category,
        location: {
          address_: location.address,
          city: location.city,
          country: location.country,
          latitude: Math.round(location.latitude * 1e6).toString(),
          longitude: Math.round(location.longitude * 1e6).toString(),
        },
        date: dateTimestamp.toString(),
        startTime: startTime.toString(),
        endTime: endTime.toString(),
        maxParticipants: schedule.maxParticipants.toString(),
      });

      // Submit to contract
      toast.info("Creating cleanup on blockchain...");
      await createCleanupMutation.sendTransaction({
        metadata: metadataJsonString,
        category: formData.category,
        location: {
          address_: location.address,
          city: location.city,
          country: location.country,
          latitude: Math.round(location.latitude * 1e6).toString(),
          longitude: Math.round(location.longitude * 1e6).toString(),
        },
        date: dateTimestamp.toString(),
        startTime: startTime.toString(),
        endTime: endTime.toString(),
        maxParticipants: schedule.maxParticipants.toString(),
      });
    } catch (error) {
      console.error("Error creating cleanup:", error);
      toast.error(
        error instanceof Error
          ? `Failed to create cleanup: ${error.message}`
          : "Failed to create cleanup"
      );
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newMedia = Array.from(e.target.files).map((file) => {
        const isVideo = file.type.startsWith("video/");
        return {
          id: Date.now().toString() + Math.random(),
          file,
          type: isVideo ? ("video" as const) : ("image" as const),
          preview: URL.createObjectURL(file),
        };
      });
      setMedia([...media, ...newMedia]);
    }
  };

  const removeMedia = (id: string) => {
    const item = media.find((m) => m.id === id);
    if (item) {
      URL.revokeObjectURL(item.preview);
    }
    setMedia(media.filter((m) => m.id !== id));
  };

  // Fetch user data
  const { data: userData } = useUser(walletAddress);
  const userProfile = useMemo(
    () =>
      userData
        ? transformUserToProfile(userData, walletAddress || undefined)
        : null,
    [userData, walletAddress]
  );

  // Check if user has completed KYC and is an organizer
  const isKycVerified = userProfile?.kycStatus === "verified";
  const isOrganizer = userData?.isOrganizer ?? false;

  if (!isKycVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">
                KYC Verification Required
              </h2>
              <p className="text-muted-foreground">
                You need to complete your KYC verification before you can
                organize cleanups. This helps us ensure the safety and trust of
                our community.
              </p>
              <div className="flex flex-col gap-2 pt-4">
                <Button asChild>
                  <Link to="/settings?tab=kyc">
                    <Shield className="w-4 h-4 mr-2" />
                    Complete KYC Verification
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/cleanups">Back to Cleanups</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isKycVerified && !isOrganizer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">
                Organizer Status Pending
              </h2>
              <p className="text-muted-foreground">
                Although you have completed your KYC, we are still yet to make
                you an organizer. Please wait for your organizer status to be
                approved.
              </p>
              <div className="flex flex-col gap-2 pt-4">
                <Button variant="ghost" asChild>
                  <Link to="/cleanups">Back to Cleanups</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      {/* Sticky Header with Pattern Background */}
      <header className="sticky top-0 z-50 mx-2 sm:mx-4 mt-2 sm:mt-4">
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            backgroundImage: `url(${africanPattern})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />

          {/* Content */}
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/cleanups")}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-1 sm:w-1.5 h-5 sm:h-6 bg-primary rounded-full" />
                  <h1 className="text-base sm:text-lg font-semibold tracking-tight">
                    Organize Cleanup
                  </h1>
                </div>
                <p className="text-xs text-muted-foreground ml-3 sm:ml-3.5">
                  Step {currentStep} of {steps.length}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveDraft}
              className="gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Save className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Save Draft</span>
              <span className="sm:hidden">Save</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Bar & Step Indicators */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 w-full">
        <Progress value={progress} className="h-1.5" />

        {/* Compact Step Indicators - scrollable on mobile */}
        <div className="flex justify-between mt-3 gap-2 sm:gap-4 overflow-x-auto scrollbar-hide">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isComplete = step.id < currentStep;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 transition-all ${
                  step.id <= currentStep ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <div
                  className={cn(
                    "w-5 h-5 flex items-center justify-center transition-all",
                    isComplete && "text-primary",
                    isActive && "text-primary",
                    !isActive && !isComplete && "text-muted-foreground"
                  )}
                >
                  {isComplete ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:block",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
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

              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Cleanup Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Beach Cleanup Drive at Bar Beach"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData({ ...formData, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beach">Beach</SelectItem>
                            <SelectItem value="urban">Urban</SelectItem>
                            <SelectItem value="park">Park</SelectItem>
                            <SelectItem value="waterfront">
                              Waterfront
                            </SelectItem>
                            <SelectItem value="nature_reserve">
                              Nature Reserve
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <RichTextEditor
                          value={formData.description}
                          onChange={(value) =>
                            setFormData({ ...formData, description: value })
                          }
                          placeholder="Describe the cleanup event, what participants should expect, and what to bring..."
                        />
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
                        <Label>Search Location *</Label>
                        <PlacesAutocomplete
                          value={location.address}
                          placeholder="Search for an address or landmark..."
                          onPlaceSelect={(place) => {
                            setLocation({
                              address: place.address,
                              city: place.city,
                              country: place.country,
                              latitude: place.latitude,
                              longitude: place.longitude,
                            });
                          }}
                        />
                        <p className="text-xs text-muted-foreground">
                          Start typing to search for locations using Google
                          Places
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            placeholder="City"
                            value={location.city}
                            onChange={(e) =>
                              setLocation({ ...location, city: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            placeholder="Country"
                            value={location.country}
                            onChange={(e) =>
                              setLocation({
                                ...location,
                                country: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <GoogleMap
                        address={location.address}
                        city={location.city}
                        country={location.country}
                        onLocationSelect={(lat, lng, addr) => {
                          setLocation((prev) => ({
                            ...prev,
                            latitude: lat,
                            longitude: lng,
                            address: addr,
                          }));
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 3: Schedule */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={schedule.date}
                          onChange={(e) =>
                            setSchedule({ ...schedule, date: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startTime">Start Time *</Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) =>
                              setSchedule({
                                ...schedule,
                                startTime: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endTime">End Time *</Label>
                          <Input
                            id="endTime"
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) =>
                              setSchedule({
                                ...schedule,
                                endTime: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxParticipants">
                          Maximum Participants *
                        </Label>
                        <Input
                          id="maxParticipants"
                          type="number"
                          min="1"
                          placeholder="e.g., 50"
                          value={schedule.maxParticipants}
                          onChange={(e) =>
                            setSchedule({
                              ...schedule,
                              maxParticipants: e.target.value,
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Set a limit to manage the cleanup effectively
                          (includes you as the creator, minimum 1)
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 4: Media */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <Image className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload cover images for your cleanup event
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleMediaChange}
                          className="hidden"
                          id="media-upload"
                        />
                        <Button variant="outline" asChild>
                          <label
                            htmlFor="media-upload"
                            className="cursor-pointer"
                          >
                            Browse Images
                          </label>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {media.length > 0 && (
                    <Card>
                      <CardContent className="pt-6">
                        <Label className="mb-4 block">Uploaded Images</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {media.map((item) => (
                            <div
                              key={item.id}
                              className="relative group rounded-lg border border-border overflow-hidden"
                            >
                              <img
                                src={item.preview}
                                alt={item.file.name}
                                className="w-full h-32 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => removeMedia(item.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="sticky bottom-16 lg:bottom-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="gap-2"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={nextStep} className="gap-2" size="sm">
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="gap-2" size="sm">
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Create Cleanup</span>
              <span className="sm:hidden">Create</span>
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
