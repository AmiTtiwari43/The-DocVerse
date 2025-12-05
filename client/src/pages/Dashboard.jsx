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
  UserX
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
    pendingDoctors: [], 
    allAppointments: [] 
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
      const [usersRes, pendingRes, appRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/doctors/pending'),
        api.get('/admin/appointments'),
      ]);
      setAdminData({
        users: usersRes.data.data,
        pendingDoctors: pendingRes.data.data,
        allAppointments: appRes.data.data,
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
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending">
                <Shield className="h-4 w-4 mr-2" />
                Pending Doctors
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                All Users
              </TabsTrigger>
              <TabsTrigger value="appointments">
                <Calendar className="h-4 w-4 mr-2" />
                Appointments
              </TabsTrigger>
            </TabsList>

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

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>Manage platform users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Role</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminData.users.map((u) => (
                          <tr key={u._id} className="border-b">
                            <td className="p-2">{u.name}</td>
                            <td className="p-2">{u.email}</td>
                            <td className="p-2">
                              <Badge>{u.role}</Badge>
                            </td>
                            <td className="p-2">
                              {u.role !== 'admin' && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    if (window.confirm('Delete this user?')) {
                                      api.delete(`/admin/users/${u._id}`).then(() => {
                                        toast({
                                          variant: "success",
                                          title: "Success",
                                          description: "User deleted",
                                        });
                                        fetchAdminData();
                                      });
                                    }
                                  }}
                                >
                                  Delete
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
