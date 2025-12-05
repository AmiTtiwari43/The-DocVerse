import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Separator } from '../components/ui/separator';
import { useToast } from '../components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import AppointmentCard from '../components/AppointmentCard';
import api from '../utils/api';
import { 
  Calendar, 
  Star, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Edit,
  Save,
  X,
  Send,
  Shield,
  UserCheck,
  UserX,
  DollarSign,
  MessageSquare,
  Trash2,
  BarChart3,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAppContext();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [doctorStats, setDoctorStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '', specialization: '', experience: '', fees: '', city: '', bio: '', gender: '', licenseNumber: ''
  });

  // Admin states
  const [adminData, setAdminData] = useState({ 
    users: [], 
    doctors: [],
    patients: [],
    pendingDoctors: [], 
    allAppointments: [],
    payments: [],
    reviews: [],
    analytics: null
  });
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAppointments(),
      user?.role === 'doctor' && fetchDoctorProfile(),
      user?.role === 'doctor' && fetchDoctorStats(),
      user?.role === 'admin' && fetchAdminData(),
      user?.role === 'patient' && fetchReviews(),
    ]);
    setLoading(false);
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      if (response.data.success) setAppointments(response.data.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      // Fetch reviews written by patient
      const response = await api.get('/reviews');
      if (response.data.success) setReviews(response.data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchDoctorProfile = async () => {
    try {
      const response = await api.get('/doctors/profile');
      if (response.data.success) {
        setDoctorProfile(response.data.data);
        setProfileData({
          name: response.data.data.name || '',
          specialization: response.data.data.specialization || '',
          experience: response.data.data.experience || '',
          fees: response.data.data.fees || '',
          city: response.data.data.city || '',
          bio: response.data.data.bio || '',
          gender: response.data.data.gender || '',
          licenseNumber: response.data.data.licenseNumber || '',
        });
      }
    } catch (error) {
      console.log('Doctor profile not found');
    }
  };

  const fetchDoctorStats = async () => {
    try {
      const response = await api.get('/doctors/stats/me');
      if (response.data.success) setDoctorStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAdminData = async () => {
    setAdminLoading(true);
    try {
      const [usersRes, pendingRes, appRes, paymentsRes, analyticsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/doctors/pending'),
        api.get('/admin/appointments'),
        api.get('/payments/history').catch(() => ({ data: { data: [] } })),
        api.get('/analytics/admin').catch(() => ({ data: { data: null } }))
      ]);
      
      // Separate doctors and patients
      const allUsers = usersRes.data.data || [];
      const doctors = allUsers.filter(u => u.role === 'doctor');
      const patients = allUsers.filter(u => u.role === 'patient');
      
      // Fetch all reviews
      let allReviews = [];
      try {
        const reviewsRes = await api.get('/admin/reviews');
        allReviews = reviewsRes.data.data || [];
      } catch (err) {
        console.log('Reviews endpoint not available');
      }
      
      setAdminData({
        users: allUsers,
        doctors,
        patients,
        pendingDoctors: pendingRes.data.data || [],
        allAppointments: appRes.data.data || [],
        payments: paymentsRes.data.data || [],
        reviews: allReviews,
        analytics: analyticsRes.data.data
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || 'Failed to load admin data',
      });
    } finally {
      setAdminLoading(false);
    }
  };

  const handleRequestVerification = async () => {
    try {
      const response = await api.post('/doctors/request-verification');
      if (response.data.success) {
        toast({
          variant: "success",
          title: "Success",
          description: "Verification request submitted!",
        });
        fetchDoctorProfile();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || 'Failed to submit request',
      });
    }
  };

  const handleVerifyDoctor = async (doctorId) => {
    try {
      await api.patch(`/admin/doctors/verify/${doctorId}`);
      toast({
        variant: "success",
        title: "Success",
        description: "Doctor verified successfully!",
      });
      fetchAdminData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to verify doctor',
      });
    }
  };

  const handleRejectDoctor = async (doctorId) => {
    try {
      await api.patch(`/admin/doctors/reject/${doctorId}`);
      toast({
        variant: "success",
        title: "Success",
        description: "Doctor rejected",
      });
      fetchAdminData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to reject doctor',
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!doctorProfile) {
        const response = await api.post('/doctors/profile', profileData);
        if (response.data.success) {
          setDoctorProfile(response.data.data);
          setEditingProfile(false);
          toast({
            variant: "success",
            title: "Success",
            description: "Profile created successfully!",
          });
        }
      } else {
        const response = await api.put('/doctors/profile', profileData);
        if (response.data.success) {
          setDoctorProfile(response.data.data);
          setEditingProfile(false);
          toast({
            variant: "success",
            title: "Success",
            description: "Profile updated successfully!",
          });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || 'Error saving profile',
      });
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}`, { status: newStatus });
      if (response.data.success) {
        fetchAppointments();
        toast({
          variant: "success",
          title: "Success",
          description: `Appointment ${newStatus}`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Error updating appointment',
      });
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      const response = await api.patch(`/appointments/${appointmentId}/complete`);
      if (response.data.success) {
        fetchAppointments();
        toast({
          variant: "success",
          title: "Success",
          description: "Appointment marked as completed",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Error completing appointment',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
        </div>

        {/* Patient Dashboard */}
        {user?.role === 'patient' && (
          <Tabs defaultValue="appointments" className="space-y-6">
            <TabsList>
              <TabsTrigger value="appointments">
                <Calendar className="h-4 w-4 mr-2" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="reviews">
                <Star className="h-4 w-4 mr-2" />
                My Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Appointments</CardTitle>
                  <CardDescription>View and manage your appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  {appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <div key={appointment._id}>
                          <AppointmentCard 
                            appointment={appointment} 
                            onUpdate={fetchAppointments}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No appointments yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Reviews</CardTitle>
                  <CardDescription>Reviews you've written</CardDescription>
                </CardHeader>
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review._id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{review.doctorId?.name}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'fill-gray-300 text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                  {review.comment}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No reviews yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Doctor Dashboard */}
        {user?.role === 'doctor' && (
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="appointments">
                <Calendar className="h-4 w-4 mr-2" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="stats">
                <TrendingUp className="h-4 w-4 mr-2" />
                Statistics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Doctor Profile</CardTitle>
                      <CardDescription>Manage your profile information</CardDescription>
                    </div>
                    {doctorProfile && (
                      <Badge variant={doctorProfile.status === 'verified' ? 'success' : 'warning'}>
                        {doctorProfile.status === 'verified' ? 'Verified' : 
                         doctorProfile.status === 'pending' ? 'Pending Approval' : 'Rejected'}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!editingProfile && doctorProfile ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-semibold">{doctorProfile.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Specialization</p>
                          <p className="font-semibold">{doctorProfile.specialization}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Experience</p>
                          <p className="font-semibold">{doctorProfile.experience} years</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Fees</p>
                          <p className="font-semibold">₹{doctorProfile.fees}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">City</p>
                          <p className="font-semibold">{doctorProfile.city}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Gender</p>
                          <p className="font-semibold capitalize">{doctorProfile.gender || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant={doctorProfile.status === 'verified' ? 'success' : 'warning'}>
                            {doctorProfile.status === 'verified' ? 'Verified' : 
                             doctorProfile.status === 'pending' ? 'Pending' : 'Rejected'}
                          </Badge>
                        </div>
                      </div>
                      {doctorProfile.bio && (
                        <div>
                          <p className="text-sm text-muted-foreground">Bio</p>
                          <p className="mt-1">{doctorProfile.bio}</p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-4">
                        <Button onClick={() => setEditingProfile(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                        {doctorProfile.status !== 'pending' && (
                          <Button variant="outline" onClick={handleRequestVerification}>
                            Request Verification
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Name</label>
                          <Input
                            name="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Specialization</label>
                          <Input
                            name="specialization"
                            value={profileData.specialization}
                            onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Experience (years)</label>
                          <Input
                            type="number"
                            name="experience"
                            value={profileData.experience}
                            onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Fees</label>
                          <Input
                            type="number"
                            name="fees"
                            value={profileData.fees}
                            onChange={(e) => setProfileData({ ...profileData, fees: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">City</label>
                          <Input
                            name="city"
                            value={profileData.city}
                            onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Gender</label>
                          <Select
                            value={profileData.gender || ''}
                            onValueChange={(value) => setProfileData({ ...profileData, gender: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">License Number</label>
                          <Input
                            name="licenseNumber"
                            value={profileData.licenseNumber}
                            onChange={(e) => setProfileData({ ...profileData, licenseNumber: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Bio</label>
                        <Textarea
                          name="bio"
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">
                          <Save className="h-4 w-4 mr-2" />
                          Save Profile
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setEditingProfile(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Requests</CardTitle>
                  <CardDescription>Manage patient appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  {appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <div key={appointment._id}>
                          <AppointmentCard 
                            appointment={appointment} 
                            onUpdate={fetchAppointments}
                          />
                          {user?.role === 'doctor' && appointment.status === 'pending' && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          )}
                          {user?.role === 'doctor' && appointment.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="success"
                              className="mt-2"
                              onClick={() => handleCompleteAppointment(appointment._id)}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No appointments yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              {doctorStats && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Total Reviews</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{doctorStats.totalReviews}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Average Rating</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold flex items-center gap-2">
                          {doctorStats.avgRating.toFixed(1)}
                          <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Total Appointments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{doctorStats.totalAppointments}</div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Pending</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{doctorStats.pendingAppointments}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Completed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{doctorStats.completedAppointments}</div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Admin Dashboard */}
        {user?.role === 'admin' && (
          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid grid-cols-3 lg:grid-cols-7 gap-2">
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Pending</span>
              </TabsTrigger>
              <TabsTrigger value="doctors" className="gap-2">
                <UserCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Doctors</span>
              </TabsTrigger>
              <TabsTrigger value="patients" className="gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Patients</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Payments</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Reviews</span>
              </TabsTrigger>
              <TabsTrigger value="appointments" className="gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Appointments</span>
              </TabsTrigger>
            </TabsList>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{adminData.patients.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Registered users</p>
                  </CardContent>
                </Card>
                
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Doctors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{adminData.doctors.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Verified & pending</p>
                  </CardContent>
                </Card>
                
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{adminData.allAppointments.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">All time bookings</p>
                  </CardContent>
                </Card>
                
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">{adminData.pendingDoctors.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Doctor verifications</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest platform updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Platform is running smoothly</p>
                          <p className="text-xs text-muted-foreground">All systems operational</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                    <CardDescription>Key metrics overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Active Patients</span>
                        <span className="text-sm font-medium">{adminData.patients.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Verified Doctors</span>
                        <span className="text-sm font-medium">{adminData.doctors.filter(d => d.status === 'verified').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Reviews</span>
                        <span className="text-sm font-medium">{adminData.reviews.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Completed Appointments</span>
                        <span className="text-sm font-medium">{adminData.allAppointments.filter(a => a.status === 'completed').length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Doctor Verifications</CardTitle>
                  <CardDescription>Review and approve doctor profiles</CardDescription>
                </CardHeader>
                <CardContent>
                  {adminLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : adminData.pendingDoctors.length > 0 ? (
                    <div className="space-y-4">
                      {adminData.pendingDoctors.map((doctor) => (
                        <Card key={doctor._id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{doctor.name}</h3>
                                <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                                <p className="text-sm text-muted-foreground">{doctor.city}</p>
                                <p className="text-sm text-muted-foreground">Experience: {doctor.experience} years</p>
                                {doctor.licenseNumber && (
                                  <p className="text-sm text-muted-foreground">License: {doctor.licenseNumber}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleVerifyDoctor(doctor._id)}
                                >
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectDoctor(doctor._id)}
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No pending doctors
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Doctors Tab */}
            <TabsContent value="doctors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Doctors ({adminData.doctors.length})</CardTitle>
                  <CardDescription>Manage doctor accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {adminData.doctors.length > 0 ? (
                      adminData.doctors.map((doctor) => (
                        <Card key={doctor._id} className="border">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{doctor.name}</h3>
                                <p className="text-sm text-muted-foreground">{doctor.email}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant={doctor.isBlocked ? 'destructive' : 'default'}>
                                    {doctor.isBlocked ? 'Blocked' : 'Active'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    if (window.confirm('Delete this doctor?')) {
                                      api.delete(`/admin/users/${doctor._id}`).then(() => {
                                        toast({
                                          variant: "success",
                                          title: "Success",
                                          description: "Doctor deleted",
                                        });
                                        fetchAdminData();
                                      });
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No doctors registered</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Patients Tab */}
            <TabsContent value="patients" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Patients ({adminData.patients.length})</CardTitle>
                  <CardDescription>Manage patient accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {adminData.patients.length > 0 ? (
                      adminData.patients.map((patient) => (
                        <Card key={patient._id} className="border">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{patient.name}</h3>
                                <p className="text-sm text-muted-foreground">{patient.email}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge>{patient.isBlocked ? 'Blocked' : 'Active'}</Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    if (window.confirm('Delete this patient?')) {
                                      api.delete(`/admin/users/${patient._id}`).then(() => {
                                        toast({
                                          variant: "success",
                                          title: "Success",
                                          description: "Patient deleted",
                                        });
                                        fetchAdminData();
                                      });
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No patients registered</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Management</CardTitle>
                  <CardDescription>Review and approve payment transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {adminData.payments.length > 0 ? (
                      adminData.payments.slice(0, 20).map((payment) => (
                        <Card key={payment._id} className="border-2">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-lg">₹{payment.amount}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Transaction ID: {payment._id?.slice(-8)}
                                    </p>
                                  </div>
                                </div>
                                <div className="ml-13 space-y-1">
                                  <p className="text-sm">
                                    <span className="font-medium">Patient:</span> {payment.patientId?.name || 'N/A'}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">Doctor:</span> {payment.doctorId?.name || 'N/A'}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {payment.paymentMethod?.toUpperCase() || 'N/A'} • {new Date(payment.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge 
                                  variant={
                                    payment.status === 'completed' ? 'default' : 
                                    payment.status === 'pending' ? 'warning' : 
                                    'destructive'
                                  }
                                  className="capitalize"
                                >
                                  {payment.status}
                                </Badge>
                                {payment.status === 'pending' && (
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => {
                                        if (window.confirm('Approve this payment?')) {
                                          api.patch(`/admin/payments/${payment._id}/approve`).then(() => {
                                            toast({
                                              variant: "success",
                                              title: "Payment Approved",
                                              description: "Payment has been approved successfully",
                                            });
                                            fetchAdminData();
                                          }).catch(err => {
                                            toast({
                                              variant: "destructive",
                                              title: "Error",
                                              description: err.response?.data?.message || "Failed to approve payment. Endpoint may not be implemented.",
                                            });
                                          });
                                        }
                                      }}
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => {
                                        if (window.confirm('Reject this payment?')) {
                                          api.patch(`/admin/payments/${payment._id}/reject`).then(() => {
                                            toast({
                                              variant: "success",
                                              title: "Payment Rejected",
                                              description: "Payment has been rejected",
                                            });
                                            fetchAdminData();
                                          }).catch(err => {
                                            toast({
                                              variant: "destructive",
                                              title: "Error",
                                              description: err.response?.data?.message || "Failed to reject payment. Endpoint may not be implemented.",
                                            });
                                          });
                                        }
                                      }}
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No payments to review</p>
                      </div>
                    )}
                  </div>
                  {adminData.payments.length > 0 && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        💡 <strong>Note:</strong> Payment approval/rejection requires backend API endpoints 
                        (<code>/admin/payments/:id/approve</code> and <code>/admin/payments/:id/reject</code>). 
                        If these don't work, contact your developer to implement them.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Review Management ({adminData.reviews.length})</CardTitle>
                  <CardDescription>Moderate user reviews</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {adminData.reviews.length > 0 ? (
                      adminData.reviews.map((review) => (
                        <Card key={review._id} className="border">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold">{review.patientId?.name || 'Anonymous'}</p>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'fill-gray-300 text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  For: Dr. {review.doctorId?.name || 'Unknown'}
                                </p>
                                <p className="text-sm">{review.comment}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  if (window.confirm('Delete this review?')) {
                                    api.delete(`/admin/reviews/${review._id}`).then(() => {
                                      toast({
                                        variant: "success",
                                        title: "Success",
                                        description: "Review deleted",
                                      });
                                      fetchAdminData();
                                    }).catch(err => {
                                      toast({
                                        variant: "destructive",
                                        title: "Error",
                                        description: "Failed to delete review",
                                      });
                                    });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No reviews yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Appointments</CardTitle>
                  <CardDescription>View all platform appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  {adminData.allAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {adminData.allAppointments.map((apt) => (
                        <Card key={apt._id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">Dr. {apt.doctorId?.name}</p>
                                <p className="text-sm text-muted-foreground">{apt.doctorId?.specialization}</p>
                                <p className="text-sm mt-2">Patient: {apt.patientId?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(apt.date).toLocaleDateString()} - {apt.slot}
                                </p>
                                <Badge className="mt-2">{apt.status}</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No appointments
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
