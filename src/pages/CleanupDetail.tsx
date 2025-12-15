import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Star,
  Check,
  X,
  Upload,
  Image,
  Video,
  Send,
  Mail,
  User,
  Info,
  UserPlus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { mockCleanups, mockUserProfile } from '@/data/mockData';
import { CleanupStatus, CleanupParticipant } from '@/types/cleanup';
import { toast } from 'sonner';

const statusConfig: Record<CleanupStatus, { label: string; className: string }> = {
  open: { label: 'Open for Registration', className: 'bg-status-approved/10 text-status-approved border-status-approved/20' },
  in_progress: { label: 'In Progress', className: 'bg-primary/10 text-primary border-primary/20' },
  completed: { label: 'Completed', className: 'bg-accent/10 text-accent border-accent/20' },
  rewarded: { label: 'Rewards Distributed', className: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
};

export default function CleanupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cleanup = mockCleanups.find((c) => c.id === id);
  
  const [participants, setParticipants] = useState<CleanupParticipant[]>(cleanup?.participants || []);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<CleanupParticipant | null>(null);
  const [rating, setRating] = useState(0);
  const [proofMedia, setProofMedia] = useState<File[]>([]);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  
  // New states for confirmations and participant info
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [participantInfoOpen, setParticipantInfoOpen] = useState(false);
  const [actionParticipant, setActionParticipant] = useState<CleanupParticipant | null>(null);
  
  // Join request state
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);

  // Check if current user is the organizer
  const isOrganizer = cleanup?.organizer.id === 'org-1'; // Mock: assume current user org is 'org-1'
  
  // Check if current user has already applied
  const currentUserEmail = mockUserProfile.email;
  const existingApplication = participants.find(p => p.email === currentUserEmail);
  const hasApplied = !!existingApplication;
  const applicationStatus = existingApplication?.status;

  if (!cleanup) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Cleanup Not Found</h2>
        <p className="text-muted-foreground mb-4">The cleanup you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/cleanups')}>Back to Cleanups</Button>
      </div>
    );
  }

  const handleAcceptParticipant = () => {
    if (actionParticipant) {
      setParticipants(participants.map(p => 
        p.id === actionParticipant.id ? { ...p, status: 'accepted' as const } : p
      ));
      toast.success(`${actionParticipant.name} has been accepted`);
      setAcceptDialogOpen(false);
      setActionParticipant(null);
    }
  };

  const handleRejectParticipant = () => {
    if (actionParticipant) {
      setParticipants(participants.map(p => 
        p.id === actionParticipant.id ? { ...p, status: 'rejected' as const } : p
      ));
      toast.success(`${actionParticipant.name} has been rejected`);
      setRejectDialogOpen(false);
      setRejectReason('');
      setActionParticipant(null);
    }
  };

  const openAcceptDialog = (participant: CleanupParticipant) => {
    setActionParticipant(participant);
    setAcceptDialogOpen(true);
  };

  const openRejectDialog = (participant: CleanupParticipant) => {
    setActionParticipant(participant);
    setRejectDialogOpen(true);
  };

  const openParticipantInfo = (participant: CleanupParticipant) => {
    setSelectedParticipant(participant);
    setParticipantInfoOpen(true);
  };

  const handleRateParticipant = () => {
    if (selectedParticipant && rating > 0) {
      setParticipants(participants.map(p => 
        p.id === selectedParticipant.id ? { ...p, rating } : p
      ));
      toast.success(`Rated ${selectedParticipant.name} with ${rating} stars`);
      setRatingDialogOpen(false);
      setSelectedParticipant(null);
      setRating(0);
    }
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProofMedia([...proofMedia, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmitForReview = () => {
    if (proofMedia.length === 0) {
      toast.error('Please upload proof of work (images/videos)');
      return;
    }
    toast.success('Cleanup submitted for review');
    setSubmitDialogOpen(false);
  };

  const handleJoinRequest = () => {
    setIsSubmittingJoin(true);
    
    // Simulate API call
    setTimeout(() => {
      const newParticipant: CleanupParticipant = {
        id: `p-${Date.now()}`,
        name: mockUserProfile.name,
        email: mockUserProfile.email,
        status: 'pending',
        appliedAt: new Date().toISOString().split('T')[0],
      };
      
      setParticipants([...participants, newParticipant]);
      setIsSubmittingJoin(false);
      setJoinDialogOpen(false);
      setJoinMessage('');
      toast.success('Your request to join has been submitted!');
    }, 1000);
  };

  const acceptedParticipants = participants.filter(p => p.status === 'accepted');
  const pendingParticipants = participants.filter(p => p.status === 'pending');
  
  // Search and pagination for accepted participants
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantsPage, setParticipantsPage] = useState(1);
  const participantsPerPage = 5;
  
  const filteredParticipants = acceptedParticipants.filter(p => 
    p.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
    p.email.toLowerCase().includes(participantSearch.toLowerCase())
  );
  const totalParticipantPages = Math.ceil(filteredParticipants.length / participantsPerPage);
  const paginatedParticipants = filteredParticipants.slice(
    (participantsPage - 1) * participantsPerPage,
    participantsPage * participantsPerPage
  );
  
  // Check if cleanup is full
  const isFull = acceptedParticipants.length >= (cleanup?.maxParticipants || 0);
  
  // Check if user has verified email
  const isEmailVerified = mockUserProfile.isEmailVerified;
  
  // Can user request to join?
  const canRequestJoin = cleanup?.status === 'open' && !isOrganizer && !hasApplied && !isFull;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto pb-24 lg:pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4"
      >
        <Button variant="ghost" size="icon" onClick={() => navigate('/cleanups')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-xl lg:text-2xl font-semibold">{cleanup.title}</h1>
            <Badge className={statusConfig[cleanup.status].className}>
              {statusConfig[cleanup.status].label}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{cleanup.description}</p>
          
          {/* Join Request Section */}
          {canRequestJoin && isEmailVerified && (
            <Button 
              className="mt-4 gap-2" 
              onClick={() => setJoinDialogOpen(true)}
            >
              <UserPlus className="w-4 h-4" />
              Request to Join
            </Button>
          )}
          
          {/* Email Verification Required */}
          {canRequestJoin && !isEmailVerified && (
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Email Verification Required</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You need to verify your email address before you can join cleanups.
                  </p>
                  <Button size="sm" className="mt-2" onClick={() => navigate('/settings')}>
                    <Mail className="w-3 h-3 mr-1" />
                    Verify Email
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Application Status */}
          {hasApplied && (
            <div className="mt-4">
              {applicationStatus === 'pending' && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-3 h-3" />
                  Application Pending
                </Badge>
              )}
              {applicationStatus === 'accepted' && (
                <Badge className="bg-status-approved/10 text-status-approved border-status-approved/20 gap-1">
                  <Check className="w-3 h-3" />
                  You're Participating
                </Badge>
              )}
              {applicationStatus === 'rejected' && (
                <Badge variant="destructive" className="gap-1">
                  <X className="w-3 h-3" />
                  Application Rejected
                </Badge>
              )}
            </div>
          )}
          
          {isFull && !hasApplied && !isOrganizer && cleanup.status === 'open' && (
            <Badge variant="secondary" className="mt-4">
              This cleanup is full
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Key Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs">Location</span>
            </div>
            <p className="font-medium text-sm">{cleanup.location.city}</p>
            <p className="text-xs text-muted-foreground">{cleanup.location.address}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Date</span>
            </div>
            <p className="font-medium text-sm">{cleanup.date}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Time</span>
            </div>
            <p className="font-medium text-sm">{cleanup.startTime} - {cleanup.endTime}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Participants</span>
            </div>
            <p className="font-medium text-sm">{acceptedParticipants.length}/{cleanup.maxParticipants}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Media Gallery */}
      {cleanup.proofMedia.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Image className="w-4 h-4" />
                Media ({cleanup.proofMedia.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {cleanup.proofMedia.map((media) => (
                  <div 
                    key={media.id} 
                    className="relative group rounded-lg overflow-hidden border border-border aspect-video cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    {media.type === 'video' ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                        <Video className="w-8 h-8 text-muted-foreground" />
                      </div>
                    ) : (
                      <img 
                        src={media.url} 
                        alt={media.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white truncate font-medium">{media.name}</p>
                      <p className="text-[10px] text-white/70">{media.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pending Requests */}
      {pendingParticipants.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Pending Requests ({pendingParticipants.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingParticipants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <button 
                    onClick={() => openParticipantInfo(participant)}
                    className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{participant.name}</p>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">Applied {participant.appliedAt}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openRejectDialog(participant)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => openAcceptDialog(participant)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Accepted Participants */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants ({acceptedParticipants.length})
            </CardTitle>
            {acceptedParticipants.length > 0 && (
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={participantSearch}
                  onChange={(e) => {
                    setParticipantSearch(e.target.value);
                    setParticipantsPage(1);
                  }}
                  className="h-8 pl-9 text-sm"
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {acceptedParticipants.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No participants yet</p>
            ) : filteredParticipants.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No participants match your search</p>
            ) : (
              <>
                {paginatedParticipants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <button 
                      onClick={() => openParticipantInfo(participant)}
                      className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{participant.name}</p>
                          {participant.isKyced && (
                            <Badge variant="secondary" className="h-5 px-1.5 gap-0.5 text-xs bg-status-approved/10 text-status-approved border-status-approved/20">
                              <ShieldCheck className="w-3 h-3" />
                              KYC
                            </Badge>
                          )}
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </div>
                        {participant.rating ? (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < participant.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Not rated yet</p>
                        )}
                      </div>
                    </button>
                    {(cleanup.status === 'in_progress' || cleanup.status === 'completed') && !participant.rating && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedParticipant(participant);
                          setRatingDialogOpen(true);
                        }}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Rate
                      </Button>
                    )}
                  </div>
                ))}
                
                {/* Pagination */}
                {totalParticipantPages > 1 && (
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {(participantsPage - 1) * participantsPerPage + 1}-{Math.min(participantsPage * participantsPerPage, acceptedParticipants.length)} of {acceptedParticipants.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={participantsPage === 1}
                        onClick={() => setParticipantsPage(participantsPage - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={participantsPage === totalParticipantPages}
                        onClick={() => setParticipantsPage(participantsPage + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Proof of Work */}
      {(cleanup.status === 'in_progress' || cleanup.status === 'completed' || cleanup.status === 'rewarded') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Image className="w-4 h-4" />
                Proof of Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cleanup.proofMedia.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {cleanup.proofMedia.map((media) => (
                    <div key={media.id} className="relative rounded-lg overflow-hidden border border-border">
                      <img src={media.url} alt={media.name} className="w-full h-24 object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                        <p className="text-xs text-white truncate">{media.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4 mb-4">No proof uploaded yet</p>
              )}
              
              {cleanup.status !== 'rewarded' && isOrganizer && (
                <Button 
                  className="w-full" 
                  onClick={() => navigate(`/cleanups/${id}/submit-proof`)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Proof of Work
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Participant</DialogTitle>
            <DialogDescription>
              How would you rate {selectedParticipant?.name}'s participation?
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star 
                  className={`w-8 h-8 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                />
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRatingDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRateParticipant} disabled={rating === 0}>Submit Rating</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit for Review Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit for Review</DialogTitle>
            <DialogDescription>
              Upload images and videos as proof of the cleanup work to submit for review and receive rewards.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center mb-4">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleProofUpload}
                className="hidden"
                id="proof-upload"
              />
              <label htmlFor="proof-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload images/videos</p>
              </label>
            </div>
            {proofMedia.length > 0 && (
              <div>
                <Label className="mb-2 block">Selected files ({proofMedia.length})</Label>
                <div className="space-y-2">
                  {proofMedia.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded">
                      {file.type.startsWith('image') ? (
                        <Image className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Video className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm truncate flex-1">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitForReview}>
              <Send className="w-4 h-4 mr-2" />
              Submit for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Accept Confirmation Dialog */}
      <AlertDialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Participant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to accept <strong>{actionParticipant?.name}</strong> as a participant for this cleanup?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActionParticipant(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAcceptParticipant}>
              <Check className="w-4 h-4 mr-2" />
              Accept
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Participant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject <strong>{actionParticipant?.name}</strong>? You can provide an optional reason below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">Reason (optional)</Label>
            <Textarea
              id="reject-reason"
              placeholder="Enter a reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setActionParticipant(null);
              setRejectReason('');
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRejectParticipant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Participant Info Dialog */}
      <Dialog open={participantInfoOpen} onOpenChange={setParticipantInfoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Participant Details</DialogTitle>
          </DialogHeader>
          {selectedParticipant && (
            <div className="space-y-6 py-4">
              {/* Avatar and Name */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-xl">{selectedParticipant.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedParticipant.name}</h3>
                  <Badge variant={
                    selectedParticipant.status === 'accepted' ? 'default' :
                    selectedParticipant.status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {selectedParticipant.status.charAt(0).toUpperCase() + selectedParticipant.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{selectedParticipant.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Applied On</p>
                    <p className="text-sm font-medium">{selectedParticipant.appliedAt}</p>
                  </div>
                </div>
                {selectedParticipant.rating && (
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                    <Star className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < selectedParticipant.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                          />
                        ))}
                        <span className="text-sm ml-2">{selectedParticipant.rating}/5</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setParticipantInfoOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Request Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request to Join</DialogTitle>
            <DialogDescription>
              Submit your request to participate in "{cleanup.title}". The organizer will review and approve your request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Cleanup Summary */}
            <div className="p-4 bg-secondary rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{cleanup.date} • {cleanup.startTime} - {cleanup.endTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{cleanup.location.address}, {cleanup.location.city}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{acceptedParticipants.length}/{cleanup.maxParticipants} participants</span>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="join-message">Message to Organizer (optional)</Label>
              <Textarea
                id="join-message"
                placeholder="Introduce yourself or share why you'd like to join this cleanup..."
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                rows={3}
                disabled={isSubmittingJoin}
              />
            </div>

            {/* User Info Preview */}
            <div className="p-3 border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Your application will include:</p>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>{mockUserProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{mockUserProfile.name}</p>
                  <p className="text-xs text-muted-foreground">{mockUserProfile.email}</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setJoinDialogOpen(false);
                setJoinMessage('');
              }}
              disabled={isSubmittingJoin}
            >
              Cancel
            </Button>
            <Button onClick={handleJoinRequest} disabled={isSubmittingJoin}>
              {isSubmittingJoin ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
