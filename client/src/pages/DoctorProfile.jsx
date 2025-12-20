import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../components/ui/use-toast';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Progress } from '../components/ui/progress';
import ReviewCard from '../components/ReviewCard';
import RatingDistribution from '../components/RatingDistribution';
import api from '../utils/api';
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Award, 
  Calendar,
  MessageSquare,
  CheckCircle2,
  CalendarIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import FavoriteButton from '../components/FavoriteButton';
import PaymentModal from '../components/PaymentModal';
import ClinicSlideshow from '../components/ClinicSlideshow';

const DoctorProfile = () => {
  const { id } = useParams();
  const { user } = useAppContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarDate, setCalendarDate] = useState();
  
  // Sync calendar date with selectedDate
  useEffect(() => {
    if (calendarDate) {
      setSelectedDate(format(calendarDate, 'yyyy-MM-dd'));
    }
  }, [calendarDate]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsWithDetails, setSlotsWithDetails] = useState([]);
  const [booking, setBooking] = useState(false);
  
  // Review State
  const [reviewData, setReviewData] = useState({ 
    rating: 5, 
    comment: '',
    title: '',
    isAnonymous: false,
    isRecommended: true,
    detailedRatings: {
      waitTime: 5,
      bedsideManner: 5,
      staffFriendliness: 5
    }
  });
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingAppointment, setPendingAppointment] = useState(null);

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchDoctor = async () => {
    try {
      const response = await api.get(`/doctors/${id}`);
      if (response.data.success) {
        setDoctor(response.data.data);
        // Initial fetch of reviews
        fetchReviews();
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load doctor profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/${id}`, {
        params: {
          sortBy,
          rating: filterRating
        }
      });
      if (response.data.success) {
        setReviews(response.data.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // Re-fetch reviews when filters change
  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [id, sortBy, filterRating]);

  const fetchAvailableSlots = async () => {
    try {
      const response = await api.get('/appointments/available-slots', {
        params: { doctorId: id, date: selectedDate },
      });
      if (response.data.success) {
        setAvailableSlots(response.data.data || []);
        // Store detailed slot information if available
        if (response.data.slotsWithDetails) {
          setSlotsWithDetails(response.data.slotsWithDetails);
        }
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleBookAppointment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedDate || !selectedSlot) {
      toast({
        variant: "destructive",
        title: "Required",
        description: "Please select date and slot",
      });
      return;
    }

    setBooking(true);
    try {
      const response = await api.post('/appointments', {
        doctorId: id,
        date: selectedDate,
        slot: selectedSlot,
      });

      if (response.data.success) {
        setPendingAppointment(response.data.data);
        setShowPaymentModal(true);
        setSelectedDate('');
        setSelectedSlot('');
        setAvailableSlots([]);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error booking appointment';
      const bookingDetails = error.response?.data?.bookingDetails;
      
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: bookingDetails 
          ? `${errorMessage}. This slot was booked by ${bookingDetails.patientName} at ${bookingDetails.bookedAt}.`
          : errorMessage,
      });
      
      // Refresh slots to show updated booking information
      if (selectedDate) {
        fetchAvailableSlots();
      }
    } finally {
      setBooking(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!reviewData.comment.trim()) {
      toast({
        variant: "destructive",
        title: "Required",
        description: "Please write a comment",
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await api.post('/reviews', {
        doctorId: id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        title: reviewData.title,
        isAnonymous: reviewData.isAnonymous,
        isRecommended: reviewData.isRecommended,
        detailedRatings: reviewData.detailedRatings,
      });

      if (response.data.success) {
        toast({
          variant: "success",
          title: "Success!",
          description: "Review submitted successfully",
        });
        setReviewData({ 
          rating: 5, 
          comment: '',
          title: '',
          isAnonymous: false,
          isRecommended: true,
          detailedRatings: {
            waitTime: 5,
            bedsideManner: 5,
            staffFriendliness: 5
          }
        });
        fetchReviews(); // Refresh review list
        fetchDoctor(); // Refresh doctor stats
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || 'Error submitting review',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : i < rating
                ? 'fill-yellow-400/50 text-yellow-400'
                : 'fill-gray-300 text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-lg font-semibold">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-muted-foreground">Doctor not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Doctor Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={doctor.profilePhoto} />
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                    {getInitials(doctor.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h1 className="text-4xl font-bold mb-2">{doctor.name}</h1>
                          <p className="text-xl text-muted-foreground mb-4">{doctor.specialization}</p>
                          {avgRating > 0 && renderStars(avgRating)}
                        </div>
                        <div className="flex items-center gap-2">
                          {user && <FavoriteButton doctorId={doctor._id} />}
                          {doctor.isVerified && (
                            <Badge variant="success" className="h-fit">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help">
                            <Clock className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Experience</p>
                              <p className="font-semibold">{doctor.experience} years</p>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{doctor.experience} years of professional experience</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Fee</p>
                              <p className="font-semibold">₹{doctor.fees}</p>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Consultation fee per visit</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help">
                            <MapPin className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Clinic Location</p>
                              <p className="font-semibold">{doctor.address?.fullAddress || doctor.city}</p>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p className="font-semibold mb-1">Clinic Address:</p>
                            <p>{doctor.address?.fullAddress || `${doctor.city}, India`}</p>
                            {doctor.address?.street && <p className="mt-1 text-xs text-gray-300">{doctor.address.street}</p>}
                            {doctor.address?.zipCode && <p className="text-xs text-gray-300">ZIP: {doctor.address.zipCode}</p>}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Reviews</p>
                              <p className="font-semibold">{reviews.length}</p>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{reviews.length} patient {reviews.length === 1 ? 'review' : 'reviews'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ClinicSlideshow images={doctor.clinicImages} />
            <Tabs defaultValue="about" className="w-full">
              <TabsList>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews ({reviews.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {doctor.bio ? (
                      <p className="text-muted-foreground leading-relaxed">{doctor.bio}</p>
                    ) : (
                      <p className="text-muted-foreground">No bio available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {/* Rating Distribution */}
                {reviews.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Rating Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RatingDistribution doctorId={id} />
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <CardTitle>Patient Reviews</CardTitle>
                        <CardDescription>
                          {reviews.length > 0
                            ? `${reviews.length} reviews from patients`
                            : 'No reviews yet'}
                        </CardDescription>
                      </div>
                      
                      {/* Sorting and Filtering Controls */}
                      <div className="flex gap-2">
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Sort By" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="highest">Highest Rating</SelectItem>
                            <SelectItem value="lowest">Lowest Rating</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={filterRating} onValueChange={setFilterRating}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Filter By" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Ratings</SelectItem>
                            <SelectItem value="5">5 Stars</SelectItem>
                            <SelectItem value="4">4 Stars</SelectItem>
                            <SelectItem value="3">3 Stars</SelectItem>
                            <SelectItem value="2">2 Stars</SelectItem>
                            <SelectItem value="1">1 Star</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <ReviewCard 
                            key={review._id} 
                            review={review} 
                            onReplyAdded={() => {
                              // Refresh reviews when a reply is added
                              const fetchReviews = async () => {
                                try {
                                  const response = await api.get(`/reviews/${id}`);
                                  if (response.data.success) {
                                    setReviews(response.data.data.reviews);
                                  }
                                } catch (error) {
                                  console.error('Error fetching reviews:', error);
                                }
                              };
                              fetchReviews();
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No reviews yet. Be the first to review!
                      </p>
                    )}
                  </CardContent>
                </Card>



                {user && user.role === 'patient' && (
                  <>
                    {reviews.filter(r => r.patientId?._id === user.id).length >= 3 ? (
                      <Card>
                         <CardContent className="pt-6 text-center text-muted-foreground">
                            You have reached the maximum limit of 3 reviews for this doctor.
                         </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle>Write a Review</CardTitle>
                          <CardDescription>
                            Share your experience with this doctor
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                      {/* Review Title */}
                      <div>
                        <Label className="mb-2 block">Review Title</Label>
                        <Input
                          placeholder="Summarize your experience (e.g., Great Doctor!)"
                          value={reviewData.title}
                          onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Overall Rating */}
                        <div>
                          <Label className="mb-2 block">Overall Rating</Label>
                          <Select
                            value={reviewData.rating.toString()}
                            onValueChange={(value) =>
                              setReviewData({ ...reviewData, rating: parseInt(value) })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 - Excellent</SelectItem>
                              <SelectItem value="4">4 - Very Good</SelectItem>
                              <SelectItem value="3">3 - Good</SelectItem>
                              <SelectItem value="2">2 - Fair</SelectItem>
                              <SelectItem value="1">1 - Poor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Detailed Ratings */}
                        <div className="space-y-3">
                          <Label>Detailed Ratings</Label>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span>Wait Time</span>
                              <Select
                                value={reviewData.detailedRatings.waitTime.toString()}
                                onValueChange={(val) => setReviewData({
                                  ...reviewData,
                                  detailedRatings: { ...reviewData.detailedRatings, waitTime: parseInt(val) }
                                })}
                              >
                                <SelectTrigger className="h-8 w-[60px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[5,4,3,2,1].map(r => <SelectItem key={r} value={r.toString()}>{r}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Bedside Manner</span>
                              <Select
                                value={reviewData.detailedRatings.bedsideManner.toString()}
                                onValueChange={(val) => setReviewData({
                                  ...reviewData,
                                  detailedRatings: { ...reviewData.detailedRatings, bedsideManner: parseInt(val) }
                                })}
                              >
                                <SelectTrigger className="h-8 w-[60px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[5,4,3,2,1].map(r => <SelectItem key={r} value={r.toString()}>{r}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Staff</span>
                              <Select
                                value={reviewData.detailedRatings.staffFriendliness.toString()}
                                onValueChange={(val) => setReviewData({
                                  ...reviewData,
                                  detailedRatings: { ...reviewData.detailedRatings, staffFriendliness: parseInt(val) }
                                })}
                              >
                                <SelectTrigger className="h-8 w-[60px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[5,4,3,2,1].map(r => <SelectItem key={r} value={r.toString()}>{r}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <Label className="mb-2 block">Comment</Label>
                        <Textarea
                          value={reviewData.comment}
                          onChange={(e) =>
                            setReviewData({ ...reviewData, comment: e.target.value })
                          }
                          placeholder="Share your detailed experience..."
                          rows={4}
                        />
                      </div>

                      {/* Toggles */}
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="anonymous" 
                            checked={reviewData.isAnonymous}
                            onCheckedChange={(checked) => setReviewData({...reviewData, isAnonymous: checked})}
                          />
                          <label
                            htmlFor="anonymous"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Post Anonymously
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="recommend" 
                            checked={reviewData.isRecommended}
                            onCheckedChange={(checked) => setReviewData({...reviewData, isRecommended: checked})}
                          />
                          <label
                            htmlFor="recommend"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            I recommend this doctor
                          </label>
                        </div>
                      </div>
                      
                      <Button
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="w-full"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </CardContent>
                  </Card>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            {user && user.role === 'patient' ? (
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Book Appointment
                  </CardTitle>
                  <CardDescription>
                    Select a date and time slot
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="date-picker" className="text-sm font-medium mb-2 block">Select Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date-picker"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-2",
                            !calendarDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {calendarDate ? format(calendarDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={calendarDate}
                          onSelect={setCalendarDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="time-slot" className="text-sm font-medium mb-2 block">Select Time Slot</Label>
                    {!selectedDate ? (
                      <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg border-2 border-dashed">
                        Please select a date first
                      </div>
                    ) : slotsWithDetails.length > 0 ? (
                      <div className="space-y-2">
                        {slotsWithDetails.map((slotInfo) => (
                          <div key={slotInfo.slot}>
                            {slotInfo.available ? (
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button
                                  type="button"
                                  variant={selectedSlot === slotInfo.slot ? "default" : "outline"}
                                  className={cn(
                                    "w-full justify-start border-2",
                                    selectedSlot === slotInfo.slot && "bg-gradient-primary"
                                  )}
                                  onClick={() => setSelectedSlot(slotInfo.slot)}
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  {slotInfo.slot}
                                  <span className="ml-auto text-xs text-green-600 font-medium">Available</span>
                                </Button>
                              </motion.div>
                            ) : (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="w-full p-3 bg-muted/50 rounded-lg border-2 border-destructive/20 cursor-not-allowed">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm font-medium text-muted-foreground line-through">
                                            {slotInfo.slot}
                                          </span>
                                        </div>
                                        <Badge variant="destructive" className="text-xs">
                                          Booked
                                        </Badge>
                                      </div>
                                      <div className="mt-2 text-xs text-muted-foreground">
                                        <div>Booked: {slotInfo.bookedAt}</div>
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="font-semibold mb-1">Slot Already Booked</p>
                                    <p className="text-xs">Booked at: {slotInfo.bookedAt}</p>
                                    <p className="text-xs">Status: {slotInfo.status}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <Select
                        value={selectedSlot}
                        onValueChange={setSelectedSlot}
                        disabled={!selectedDate}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue placeholder="Choose a slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg border-2 border-dashed text-center">
                        No slots available for this date
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleBookAppointment}
                    disabled={booking || !selectedDate || !selectedSlot}
                    className="w-full"
                    size="lg"
                  >
                    {booking ? 'Booking...' : 'Book Appointment'}
                  </Button>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Consultation Fee</span>
                      <span className="font-semibold text-lg">₹{doctor.fees}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : !user ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign in to book an appointment
                  </p>
                  <Button onClick={() => navigate('/login')} className="w-full">
                    Login
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>

        {/* Payment Modal */}
        {pendingAppointment && (
          <PaymentModal
            open={showPaymentModal}
            onOpenChange={setShowPaymentModal}
            appointment={pendingAppointment}
            doctor={doctor}
            onSuccess={() => {
              toast({
                variant: "success",
                title: "Success!",
                description: "Appointment booked and payment completed",
              });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
