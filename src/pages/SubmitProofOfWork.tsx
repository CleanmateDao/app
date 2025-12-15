import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  Image, 
  Video, 
  Star,
  X,
  Send,
  Users,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CleanupParticipant } from '@/types/cleanup';
import { toast } from 'sonner';
import { useCleanup } from '@/services/subgraph/queries';
import { transformCleanup } from '@/services/subgraph/transformers';
import { Loader2 } from 'lucide-react';
import { useSubmitProofOfWork } from '@/services/contracts/mutations';
import { 
  uploadFilesToIPFS, 
  uploadParticipantRatingsToIPFS,
  type ParticipantRating 
} from '@/services/ipfs';
import { useWalletAddress } from '@/hooks/use-wallet-address';

const MIN_MEDIA_COUNT = 10;

export default function SubmitProofOfWork() {
  const { id } = useParams();
  const navigate = useNavigate();
  const walletAddress = useWalletAddress();
  
  // Fetch cleanup data
  const { data: cleanupData, isLoading: isLoadingCleanup } = useCleanup(id || undefined);
  const cleanup = cleanupData ? transformCleanup(cleanupData) : null;
  
  const [proofMedia, setProofMedia] = useState<File[]>([]);
  const [participantRatings, setParticipantRatings] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const submitProofMutation = useSubmitProofOfWork();

  // Only accepted participants can be rated
  const acceptedParticipants = cleanup?.participants.filter(p => p.status === 'accepted') || [];

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
        <p className="text-muted-foreground mb-4">The cleanup you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/cleanups')}>Back to Cleanups</Button>
      </div>
    );
  }

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setProofMedia(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setProofMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleRating = (participantId: string, rating: number) => {
    setParticipantRatings(prev => ({
      ...prev,
      [participantId]: rating
    }));
  };

  const allParticipantsRated = acceptedParticipants.every(p => 
    participantRatings[p.id] !== undefined && participantRatings[p.id] >= 0
  );

  const hasEnoughMedia = proofMedia.length >= MIN_MEDIA_COUNT;

  const handleSubmit = async () => {
    if (!id || !cleanup) {
      toast.error('Cleanup information is missing');
      return;
    }

    if (!hasEnoughMedia) {
      toast.error(`Please upload at least ${MIN_MEDIA_COUNT} images/videos`);
      return;
    }

    if (!allParticipantsRated) {
      toast.error('Please rate all participants before submitting');
      return;
    }

    if (!walletAddress) {
      toast.error('Wallet not connected');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload proof media files to IPFS
      toast.info('Uploading proof media to IPFS...');
      setUploadProgress(25);
      
      const ipfsHashes = await uploadFilesToIPFS(proofMedia);
      const mimetypes = proofMedia.map(file => file.type);
      
      setUploadProgress(50);

      // Step 2: Prepare participant ratings data
      const ratingsData: ParticipantRating[] = acceptedParticipants.map(participant => {
        // Extract participant address from ID (format might be "cleanupId-address" or just address)
        const participantAddress = participant.id.includes('-') 
          ? participant.id.split('-')[1] 
          : participant.id;
        
        return {
          participantId: participant.id,
          participantAddress,
          participantName: participant.name,
          rating: participantRatings[participant.id] || 0,
          ratedAt: new Date().toISOString(),
          ratedBy: walletAddress,
        };
      });

      // Step 3: Upload participant ratings JSON to IPFS
      toast.info('Uploading participant ratings to IPFS...');
      setUploadProgress(75);
      
      const ratingsIpfsHash = await uploadParticipantRatingsToIPFS(ratingsData, id);
      
      // Note: The ratings IPFS hash is stored in the ratings JSON on IPFS
      // The contract expects ipfsHashes for proof media, but ratings are included in the IPFS data
      // If needed, you could add the ratings hash as an additional IPFS hash in the array
      
      setUploadProgress(90);

      // Step 4: Submit proof of work to the contract
      toast.info('Submitting proof of work to blockchain...');
      
      await submitProofMutation.mutateAsync({
        cleanupAddress: id,
        ipfsHashes,
        mimetypes,
      });

      setUploadProgress(100);
      toast.success('Proof of work submitted successfully!');
      
      // Navigate back to cleanup detail page
      setTimeout(() => {
        navigate(`/cleanups/${id}`);
      }, 1000);
    } catch (error) {
      console.error('Error submitting proof of work:', error);
      toast.error(
        error instanceof Error 
          ? `Failed to submit proof: ${error.message}` 
          : 'Failed to submit proof of work'
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const mediaProgress = Math.min((proofMedia.length / MIN_MEDIA_COUNT) * 100, 100);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto pb-24 lg:pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4"
      >
        <Button variant="ghost" size="icon" onClick={() => navigate(`/cleanups/${id}`)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl lg:text-2xl font-semibold mb-1">Submit Proof of Work</h1>
          <p className="text-muted-foreground text-sm">{cleanup.title}</p>
        </div>
      </motion.div>

      {/* Cleanup Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{cleanup.location.city}, {cleanup.location.country}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{cleanup.date}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{acceptedParticipants.length} participants</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Media Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Media
            </CardTitle>
            <CardDescription>
              Upload at least {MIN_MEDIA_COUNT} images or videos as proof of the cleanup work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className={proofMedia.length >= MIN_MEDIA_COUNT ? 'text-status-approved' : 'text-muted-foreground'}>
                  {proofMedia.length} / {MIN_MEDIA_COUNT} minimum
                </span>
                {proofMedia.length >= MIN_MEDIA_COUNT && (
                  <Badge className="bg-status-approved/10 text-status-approved border-status-approved/20">
                    Requirement met
                  </Badge>
                )}
              </div>
              <Progress value={mediaProgress} className="h-2" />
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleProofUpload}
                className="hidden"
                id="proof-upload"
              />
              <label htmlFor="proof-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">Click to upload</p>
                <p className="text-xs text-muted-foreground">Images and videos accepted</p>
              </label>
            </div>

            {/* Uploaded Files Preview */}
            {proofMedia.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded files ({proofMedia.length})</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {proofMedia.map((file, index) => (
                    <div 
                      key={index} 
                      className="relative group rounded-lg overflow-hidden border border-border aspect-square bg-secondary"
                    >
                      {file.type.startsWith('image') ? (
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={file.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <Video className="w-8 h-8 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Video</span>
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveMedia(index)}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                        <p className="text-[10px] text-white truncate">{file.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning if not enough */}
            {proofMedia.length > 0 && proofMedia.length < MIN_MEDIA_COUNT && (
              <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                <p className="text-sm text-primary">
                  Please upload {MIN_MEDIA_COUNT - proofMedia.length} more file(s) to meet the minimum requirement
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Rate Participants Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4" />
              Rate Participants
            </CardTitle>
            <CardDescription>
              Rate each participant from 0 to 5 stars based on their contribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            {acceptedParticipants.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No participants to rate</p>
            ) : (
              <div className="space-y-4">
                {acceptedParticipants.map((participant) => (
                  <ParticipantRatingRow
                    key={participant.id}
                    participant={participant}
                    rating={participantRatings[participant.id]}
                    onRate={(rating) => handleRating(participant.id, rating)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="sticky bottom-20 lg:bottom-0 z-10"
      >
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 text-sm">
                <div className="flex items-center gap-4">
                  <div className={hasEnoughMedia ? 'text-status-approved' : 'text-muted-foreground'}>
                    {hasEnoughMedia ? '✓' : '○'} {proofMedia.length}/{MIN_MEDIA_COUNT} media
                  </div>
                  <div className={allParticipantsRated ? 'text-status-approved' : 'text-muted-foreground'}>
                    {allParticipantsRated ? '✓' : '○'} All participants rated
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-auto space-y-2">
                {isSubmitting && uploadProgress > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-1" />
                  </div>
                )}
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!hasEnoughMedia || !allParticipantsRated || isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit for Review
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Separate component for participant rating row
function ParticipantRatingRow({ 
  participant, 
  rating, 
  onRate 
}: { 
  participant: CleanupParticipant;
  rating?: number;
  onRate: (rating: number) => void;
}) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-secondary rounded-lg gap-4">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{participant.name}</p>
          <p className="text-xs text-muted-foreground">{participant.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            className="p-1 transition-transform hover:scale-110"
            title={star === 0 ? 'No rating' : `${star} star${star > 1 ? 's' : ''}`}
          >
            {star === 0 ? (
              <div 
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium
                  ${rating === 0 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'border-muted-foreground text-muted-foreground hover:border-primary hover:text-primary'
                  }`}
              >
                0
              </div>
            ) : (
              <Star 
                className={`w-6 h-6 transition-colors ${
                  (hoveredStar !== null ? star <= hoveredStar : star <= (rating ?? -1))
                    ? 'text-yellow-500 fill-yellow-500' 
                    : 'text-muted-foreground'
                }`} 
              />
            )}
          </button>
        ))}
        {rating !== undefined && (
          <Badge variant="secondary" className="ml-2">
            {rating}/5
          </Badge>
        )}
      </div>
    </div>
  );
}
