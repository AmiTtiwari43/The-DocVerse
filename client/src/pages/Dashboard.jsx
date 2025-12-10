import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
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
} from "../components/ui/alert-dialog";
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Separator } from '../components/ui/separator';
import { useToast } from '../components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import AppointmentCard from '../components/AppointmentCard';
import api from '../utils/api';
import {
  Calendar,
  CalendarCheck,
  Star,
  Users,
  ChevronDown,
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
  Activity,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler,
  ArcElement
);

const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Neurologist', 
  'Orthopedist', 'Pediatrician', 'Psychiatrist', 'Dentist',
  'Ophthalmologist', 'Gynecologist', 'Urologist', 'ENT Specialist'
];

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
    name: '', specialization: '', experience: '', fees: '', city: '', bio: '', gender: '', licenseNumber: '',
    address: { street: '', city: '', state: '', zipCode: '', fullAddress: '' }
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
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const analyticsIntervalRef = useRef(null);

  useEffect(() => {
    fetchData();
    
    // Set up real-time polling for admin analytics (every 30 seconds)
    if (user?.role === 'admin') {
      analyticsIntervalRef.current = setInterval(() => {
        fetchAdminData();
        setLastUpdate(new Date());
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (analyticsIntervalRef.current) {
        clearInterval(analyticsIntervalRef.current);
      }
    };
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
          address: response.data.data.address || { street: '', city: '', state: '', zipCode: '', fullAddress: '' },
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
      const [usersRes, pendingRes, appRes, paymentsRes, analyticsRes, reviewsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/doctors/pending'),
        api.get('/admin/appointments'),
        api.get('/admin/payments').catch(() => ({ data: { data: [] } })),
        api.get('/analytics/admin').catch(() => ({ data: { data: null } })),
        api.get('/admin/reviews').catch(() => ({ data: { data: [] } }))
      ]);
      
      // Separate doctors and patients
      const allUsers = usersRes.data.data || [];
      const doctors = allUsers.filter(u => u.role === 'doctor');
      const patients = allUsers.filter(u => u.role === 'patient');
      
      const allReviews = reviewsRes.data.data || [];

      // Build fallback analytics if analytics endpoint didn't return data
      const rawAnalytics = analyticsRes?.data?.data;
      let analytics = rawAnalytics;
      if (!analytics) {
        // Prepare last 12 months buckets
        const months = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          months.push({ key, month: d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear() });
        }

        const patientMap = {};
        const doctorMap = {};
        const salesMap = {};
        const revenueMap = {};

        const payments = paymentsRes.data.data || [];

        // Count users by createdAt
        allUsers.forEach(u => {
          if (!u.createdAt) return;
          const d = new Date(u.createdAt);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (u.role === 'patient') patientMap[key] = (patientMap[key] || 0) + 1;
          if (u.role === 'doctor') doctorMap[key] = (doctorMap[key] || 0) + 1;
        });

        // Count sales and revenue by payment createdAt
        payments.forEach(p => {
          if (!p.createdAt) return;
          const d = new Date(p.createdAt);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (p.status === 'completed') {
            salesMap[key] = (salesMap[key] || 0) + 1;
            revenueMap[key] = (revenueMap[key] || 0) + (p.amount || 0);
          }
        });

        const monthlyPatients = months.map(m => ({ month: m.month, count: patientMap[m.key] || 0 }));
        const monthlyDoctors = months.map(m => ({ month: m.month, count: doctorMap[m.key] || 0 }));
        const monthlySales = months.map(m => ({ month: m.month, sales: salesMap[m.key] || 0 }));
        const monthlyRevenue = months.map(m => ({ month: m.month, revenue: revenueMap[m.key] || 0 }));

        analytics = {
          monthlyPatients,
          monthlyDoctors,
          monthlySales,
          monthlyRevenue,
          totalPatients: patients.length,
          totalDoctors: doctors.length,
          totalAppointments: (appRes.data.data || []).length,
          totalRevenue: (payments.reduce((s, p) => s + (p.status === 'completed' ? (p.amount || 0) : 0), 0)),
        };
      }

      setAdminData({
        users: allUsers,
        doctors,
        patients,
        pendingDoctors: pendingRes.data.data || [],
        allAppointments: appRes.data.data || [],
        payments: paymentsRes.data.data || [],
        reviews: allReviews,
        analytics,
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
        description: error.response?.data?.message || 'Error updating appointment',
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
        description: error.response?.data?.message || 'Error completing appointment',
      });
    }
  };

  const handleRequestVerification = async () => {
    try {
      const response = await api.post('/doctors/request-verification', {});
      if (response.data.success) {
        setDoctorProfile(response.data.data);
        toast({
          variant: "success",
          title: "Success",
          description: "Verification request submitted successfully!",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || 'Error submitting verification request',
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
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gradient">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Welcome back, {user?.name}!</p>
        </motion.div>

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
                          <Select
                            value={profileData.specialization}
                            onValueChange={(value) => setProfileData({ ...profileData, specialization: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                            <SelectContent>
                              {SPECIALIZATIONS.map((spec) => (
                                <SelectItem key={spec} value={spec}>
                                  {spec}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">Clinic Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Street Address</label>
                            <Input
                              name="address.street"
                              placeholder="e.g., 123 Main Street"
                              value={profileData.address?.street || ''}
                              onChange={(e) => setProfileData({ 
                                ...profileData, 
                                address: { ...profileData.address, street: e.target.value } 
                              })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">State</label>
                            <Input
                              name="address.state"
                              placeholder="e.g., Maharashtra"
                              value={profileData.address?.state || ''}
                              onChange={(e) => setProfileData({ 
                                ...profileData, 
                                address: { ...profileData.address, state: e.target.value } 
                              })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">ZIP Code</label>
                            <Input
                              name="address.zipCode"
                              placeholder="e.g., 411004"
                              value={profileData.address?.zipCode || ''}
                              onChange={(e) => setProfileData({ 
                                ...profileData, 
                                address: { ...profileData.address, zipCode: e.target.value } 
                              })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Full Address (Summary)</label>
                            <Input
                              name="address.fullAddress"
                              placeholder="e.g., 123 Main St, City - 411004"
                              value={profileData.address?.fullAddress || ''}
                              onChange={(e) => setProfileData({ 
                                ...profileData, 
                                address: { ...profileData.address, fullAddress: e.target.value } 
                              })}
                            />
                          </div>
                        </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { title: "Total Revenue", value: `₹${doctorStats.totalRevenue || 0}`, icon: DollarSign, color: "text-green-600" },
                      { title: "Total Reviews", value: doctorStats.totalReviews, icon: MessageSquare, color: "text-primary" },
                      { title: "Average Rating", value: doctorStats.avgRating.toFixed(1), icon: Star, color: "text-yellow-500", showStar: true },
                      { title: "Total Appointments", value: doctorStats.totalAppointments, icon: Calendar, color: "text-accent" },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                      >
                        <Card className="border-2 premium-shadow card-hover">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{stat.title}</CardTitle>
                              <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className={`text-2xl font-bold ${stat.color} flex items-center gap-2 mb-2`}>
                              {stat.value}
                              {stat.showStar && <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />}
                            </div>
                            {stat.title === "Average Rating" && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="mt-2">
                                      <Progress 
                                        value={(parseFloat(stat.value) / 5) * 100} 
                                        className="h-2"
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Rating out of 5 stars</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Status Cards */}
                     <div className="grid grid-cols-2 gap-4">
                      {[
                        { title: "Pending", value: doctorStats.pendingAppointments, color: "text-orange-500" },
                        { title: "Completed", value: doctorStats.completedAppointments, color: "text-green-500" },
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.title}
                          initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                          whileHover={{ y: -5, scale: 1.02 }}
                        >
                          <Card className="border-2 premium-shadow card-hover h-full">
                            <CardHeader>
                              <CardTitle className="text-lg">{stat.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className={`text-2xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                              {doctorStats.totalAppointments > 0 && (
                                <Progress 
                                  value={(stat.value / doctorStats.totalAppointments) * 100} 
                                  className="h-2"
                                />
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                     </div>
                     
                     {/* Revenue Chart */}
                     <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                     >
                        <Card className="border-2 premium-shadow h-full">
                            <CardHeader>
                                <CardTitle>Revenue Trend</CardTitle>
                                <CardDescription>Last 6 months earnings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px] w-full">
                                    {doctorStats.monthlyRevenue ? (
                                        <Bar
                                            data={{
                                                labels: doctorStats.monthlyRevenue.map(d => d.month),
                                                datasets: [{
                                                    label: 'Revenue',
                                                    data: doctorStats.monthlyRevenue.map(d => d.revenue),
                                                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                                                    borderRadius: 4,
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: { legend: { display: false } },
                                                scales: { y: { beginAtZero: true } }
                                            }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            No revenue data available
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                     </motion.div>
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
              {/* Header with refresh button */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Global Analytics</h2>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fetchAdminData();
                    setLastUpdate(new Date());
                  }}
                  disabled={adminLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${adminLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { 
                    title: "Total Sales", 
                    value: `₹${((adminData.analytics?.totalRevenue) ?? 0).toLocaleString('en-IN')}`, 
                    desc: "Total revenue", 
                    icon: DollarSign, 
                    color: "text-green-600" 
                  },
                  { 
                    title: "Total Patients", 
                    value: adminData.analytics?.totalPatients ?? adminData.patients.length, 
                    desc: "Registered users", 
                    icon: Users, 
                    color: "text-primary" 
                  },
                  { 
                    title: "Total Doctors", 
                    value: adminData.analytics?.totalDoctors ?? adminData.doctors.length, 
                    desc: "Verified & pending", 
                    icon: UserCheck, 
                    color: "text-accent" 
                  },
                  { 
                    title: "Total Appointments", 
                    value: adminData.analytics?.totalAppointments ?? adminData.allAppointments.length, 
                    desc: "All time bookings", 
                    icon: Calendar, 
                    color: "text-blue-600" 
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <Card className="border-2 premium-shadow card-hover">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                          <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Charts Section */}
              {adminLoading && !adminData.analytics ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <Skeleton className="h-80 w-full" />
                  <Skeleton className="h-80 w-full" />
                </div>
              ) : adminData.analytics ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Sales/Revenue Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          Sales & Revenue Trend
                        </CardTitle>
                        <CardDescription>Monthly revenue over the last 12 months</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <Line
                            data={{
                              labels: adminData.analytics.monthlyRevenue?.map(r => r.month) || [],
                              datasets: [
                                {
                                  label: 'Revenue (₹)',
                                  data: adminData.analytics.monthlyRevenue?.map(r => r.revenue) || [],
                                  borderColor: 'rgb(34, 197, 94)',
                                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                  tension: 0.4,
                                  fill: true,
                                  pointRadius: 4,
                                  pointHoverRadius: 6,
                                  pointBackgroundColor: 'rgb(34, 197, 94)',
                                  pointBorderColor: '#fff',
                                  pointBorderWidth: 2,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: true,
                                  position: 'top',
                                },
                                tooltip: {
                                  mode: 'index',
                                  intersect: false,
                                  callbacks: {
                                    label: function(context) {
                                      return `Revenue: ₹${context.parsed.y.toLocaleString('en-IN')}`;
                                    }
                                  }
                                },
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    callback: function(value) {
                                      return '₹' + value.toLocaleString('en-IN');
                                    }
                                  },
                                  grid: {
                                    color: 'rgba(0, 0, 0, 0.05)',
                                  }
                                },
                                x: {
                                  grid: {
                                    display: false,
                                  }
                                }
                              },
                              interaction: {
                                mode: 'nearest',
                                axis: 'x',
                                intersect: false
                              }
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Doctors Growth Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <UserCheck className="h-5 w-5 text-accent" />
                          Doctors Growth
                        </CardTitle>
                        <CardDescription>Total doctors count over the last 12 months</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <Line
                            data={{
                              labels: adminData.analytics.monthlyDoctors?.map(d => d.month) || [],
                              datasets: [
                                {
                                  label: 'Total Doctors',
                                  data: adminData.analytics.monthlyDoctors?.map(d => d.count) || [],
                                  borderColor: 'rgb(59, 130, 246)',
                                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                  tension: 0.4,
                                  fill: true,
                                  pointRadius: 4,
                                  pointHoverRadius: 6,
                                  pointBackgroundColor: 'rgb(59, 130, 246)',
                                  pointBorderColor: '#fff',
                                  pointBorderWidth: 2,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: true,
                                  position: 'top',
                                },
                                tooltip: {
                                  mode: 'index',
                                  intersect: false,
                                  callbacks: {
                                    label: function(context) {
                                      return `Doctors: ${context.parsed.y}`;
                                    }
                                  }
                                },
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    stepSize: 1,
                                  },
                                  grid: {
                                    color: 'rgba(0, 0, 0, 0.05)',
                                  }
                                },
                                x: {
                                  grid: {
                                    display: false,
                                  }
                                }
                              },
                              interaction: {
                                mode: 'nearest',
                                axis: 'x',
                                intersect: false
                              }
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Patients Growth Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          Patients Growth
                        </CardTitle>
                        <CardDescription>Total patients count over the last 12 months</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <Line
                            data={{
                              labels: adminData.analytics.monthlyPatients?.map(p => p.month) || [],
                              datasets: [
                                {
                                  label: 'Total Patients',
                                  data: adminData.analytics.monthlyPatients?.map(p => p.count) || [],
                                  borderColor: 'rgb(168, 85, 247)',
                                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                  tension: 0.4,
                                  fill: true,
                                  pointRadius: 4,
                                  pointHoverRadius: 6,
                                  pointBackgroundColor: 'rgb(168, 85, 247)',
                                  pointBorderColor: '#fff',
                                  pointBorderWidth: 2,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: true,
                                  position: 'top',
                                },
                                tooltip: {
                                  mode: 'index',
                                  intersect: false,
                                  callbacks: {
                                    label: function(context) {
                                      return `Patients: ${context.parsed.y}`;
                                    }
                                  }
                                },
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    stepSize: 1,
                                  },
                                  grid: {
                                    color: 'rgba(0, 0, 0, 0.05)',
                                  }
                                },
                                x: {
                                  grid: {
                                    display: false,
                                  }
                                }
                              },
                              interaction: {
                                mode: 'nearest',
                                axis: 'x',
                                intersect: false
                              }
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Sales Count Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-orange-600" />
                          Sales Count
                        </CardTitle>
                        <CardDescription>Number of completed payments per month</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <Bar
                            data={{
                              labels: adminData.analytics.monthlySales?.map(s => s.month) || [],
                              datasets: [
                                {
                                  label: 'Number of Sales',
                                  data: adminData.analytics.monthlySales?.map(s => s.sales) || [],
                                  backgroundColor: 'rgba(249, 115, 22, 0.6)',
                                  borderColor: 'rgb(249, 115, 22)',
                                  borderWidth: 2,
                                  borderRadius: 4,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: true,
                                  position: 'top',
                                },
                                tooltip: {
                                  mode: 'index',
                                  intersect: false,
                                  callbacks: {
                                    label: function(context) {
                                      return `Sales: ${context.parsed.y}`;
                                    }
                                  }
                                },
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    stepSize: 1,
                                  },
                                  grid: {
                                    color: 'rgba(0, 0, 0, 0.05)',
                                  }
                                },
                                x: {
                                  grid: {
                                    display: false,
                                  }
                                }
                              },
                              interaction: {
                                mode: 'nearest',
                                axis: 'x',
                                intersect: false
                              }
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground py-8">
                      No analytics data available. Please refresh to load data.
                    </p>
                  </CardContent>
                </Card>
              )}
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
                                      Transaction ID: {payment.transactionId || payment._id?.slice(-8)}
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
                              <div className="flex flex-col items-end gap-2 w-48">
                                <div className="flex gap-2 flex-wrap justify-end">
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
                                  <Badge 
                                    variant={
                                      payment.adminStatus === 'approved' ? 'success' : 
                                      payment.adminStatus === 'rejected' ? 'destructive' : 
                                      'outline'
                                    }
                                    className="capitalize"
                                  >
                                    Admin: {payment.adminStatus || 'pending'}
                                  </Badge>
                                </div>
                                {payment.adminStatus === 'pending' && (
                                  <div className="flex gap-2 mt-2">
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="default"
                                        >
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Approve
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Approve Payment?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will confirm the appointment and send a confirmation email to the patient.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => {
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
                                                  description: err.response?.data?.message || "Failed to approve payment",
                                                });
                                              });
                                            }}
                                          >
                                            Approve
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                        >
                                          <XCircle className="h-3 w-3 mr-1" />
                                          Reject
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Reject Payment?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will cancel the appointment and notify the patient. This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            onClick={() => {
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
                                                  description: err.response?.data?.message || "Failed to reject payment",
                                                });
                                              });
                                            }}
                                          >
                                            Reject
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
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
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-700">
                        ✓ <strong>Payment Approval System Active:</strong> Admin can approve or reject payments. Approved payments will confirm appointments. Rejected payments will cancel appointments and notify the patient.
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
                  <div className="space-y-4">
                    {adminData.reviews.length > 0 ? (
                      Object.values(adminData.reviews.reduce((acc, review) => {
                        const docId = review.doctorId?._id || 'unknown';
                        if (!acc[docId]) {
                          acc[docId] = {
                            id: docId,
                            name: review.doctorId?.name || 'Unknown Doctor',
                            specialization: review.doctorId?.specialization || 'General',
                            reviews: [],
                            avgRating: 0
                          };
                        }
                        acc[docId].reviews.push(review);
                        acc[docId].avgRating = acc[docId].reviews.reduce((sum, r) => sum + r.rating, 0) / acc[docId].reviews.length;
                        return acc;
                      }, {})).map((doctorGroup) => (
                        <Card key={doctorGroup.id} className="border-2 overflow-hidden">
                          <div 
                            className="p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                            onClick={(e) => {
                              const content = e.currentTarget.nextElementSibling;
                              content.classList.toggle('hidden');
                              e.currentTarget.querySelector('.chevron').classList.toggle('rotate-180');
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg">{doctorGroup.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{doctorGroup.specialization}</span>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium text-foreground">{doctorGroup.avgRating.toFixed(1)}</span>
                                    <span>({doctorGroup.reviews.length} reviews)</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="chevron transition-transform duration-200">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="hidden border-t bg-background">
                            <div className="p-4 space-y-3">
                              {doctorGroup.reviews.map((review) => (
                                <div key={review._id} className="p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold text-sm">{review.patientId?.name || 'Anonymous'}</p>
                                        <div className="flex items-center gap-0.5">
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
                                      <p className="text-sm">{review.comment}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-8 w-8 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
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
                                </div>
                              ))}
                            </div>
                          </div>
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
              {/* Appointment Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-100">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total</p>
                      <p className="text-2xl font-bold text-blue-700">{adminData.allAppointments.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-200" />
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Completed</p>
                      <p className="text-2xl font-bold text-green-700">
                        {adminData.allAppointments.filter(a => a.status === 'completed').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-200" />
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-100">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Active</p>
                      <p className="text-2xl font-bold text-orange-700">
                        {adminData.allAppointments.filter(a => ['pending', 'confirmed'].includes(a.status)).length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-200" />
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-100">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Cancelled</p>
                      <p className="text-2xl font-bold text-red-700">
                        {adminData.allAppointments.filter(a => ['cancelled', 'rejected'].includes(a.status)).length}
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-200" />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Appointments</CardTitle>
                  <CardDescription>View all platform appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  {adminData.allAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {adminData.allAppointments.map((apt) => (
                        <Card key={apt._id} className="border hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex gap-4">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                                  apt.status === 'completed' ? 'bg-green-100 text-green-600' :
                                  apt.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                                  apt.status === 'cancelled' || apt.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                  'bg-orange-100 text-orange-600'
                                }`}>
                                  {apt.status === 'completed' ? <CheckCircle className="h-6 w-6" /> :
                                   apt.status === 'confirmed' ? <CalendarCheck className="h-6 w-6" /> :
                                   apt.status === 'cancelled' || apt.status === 'rejected' ? <XCircle className="h-6 w-6" /> :
                                   <Clock className="h-6 w-6" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-lg">Dr. {apt.doctorId?.name}</p>
                                    <Badge variant={
                                      apt.status === 'completed' ? 'success' :
                                      apt.status === 'confirmed' ? 'default' :
                                      apt.status === 'cancelled' || apt.status === 'rejected' ? 'destructive' :
                                      'warning'
                                    } className="capitalize flex items-center gap-1">
                                      {apt.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                                      {apt.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{apt.doctorId?.specialization}</p>
                                  <div className="mt-2 text-sm">
                                    <span className="text-muted-foreground">Patient:</span> <span className="font-medium">{apt.patientId?.name}</span>
                                  </div>
                                  <div className="text-sm flex items-center gap-2 mt-1 text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(apt.date).toLocaleDateString()}
                                    <span className="mx-1">•</span>
                                    <Clock className="h-3 w-3" />
                                    {apt.slot}
                                  </div>
                                </div>
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
