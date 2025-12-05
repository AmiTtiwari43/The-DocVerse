import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../components/ui/use-toast';
import ReviewCard from '../components/ReviewCard';
import api from '../utils/api';
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Award, 
  Calendar,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import FavoriteButton from '../components/FavoriteButton';
import PaymentModal from '../components/PaymentModal';

const DoctorProfile = () => {
  const { id } = useParams();
  const { user } = useAppContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [booking, setBooking] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
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
        if (response.data.data.reviews) {
          setReviews(response.data.data.reviews);
        }
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

  const fetchAvailableSlots = async () => {
    try {
      const response = await api.get('/appointments/available-slots', {
        params: { doctorId: id, date: selectedDate },
      });
      if (response.data.success) {
        setAvailableSlots(response.data.data);
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
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || 'Error booking appointment',
      });
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
      });

      if (response.data.success) {
        toast({
          variant: "success",
          title: "Success!",
          description: "Review submitted successfully",
        });
        setReviewData({ rating: 5, comment: '' });
        fetchDoctor();
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
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Experience</p>
                        <p className="font-semibold">{doctor.experience} years</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Fee</p>
                        <p className="font-semibold">₹{doctor.fees}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-semibold">{doctor.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Reviews</p>
                        <p className="font-semibold">{reviews.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Reviews</CardTitle>
                    <CardDescription>
                      {reviews.length > 0
                        ? `Average rating: ${avgRating.toFixed(1)} from ${reviews.length} reviews`
                        : 'No reviews yet'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <ReviewCard key={review._id} review={review} />
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Write a Review</CardTitle>
                      <CardDescription>
                        Share your experience with this doctor
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Rating</label>
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
                      <div>
                        <label className="text-sm font-medium mb-2 block">Comment</label>
                        <Textarea
                          value={reviewData.comment}
                          onChange={(e) =>
                            setReviewData({ ...reviewData, comment: e.target.value })
                          }
                          placeholder="Share your experience..."
                          rows={4}
                        />
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
                    <label className="text-sm font-medium mb-2 block">Select Date</label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Time Slot</label>
                    <Select
                      value={selectedSlot}
                      onValueChange={setSelectedSlot}
                      disabled={!selectedDate}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSlots.length > 0 ? (
                          availableSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-slots" disabled>
                            {selectedDate ? 'No slots available' : 'Select date first'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
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
