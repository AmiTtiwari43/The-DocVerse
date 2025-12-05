import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useToast } from '../components/ui/use-toast';
import { Skeleton } from '../components/ui/skeleton';
import api from '../utils/api';
import { Camera, Save, User, Mail, Phone, MapPin, Upload, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, updateUser } = useAppContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profilePhoto: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        profilePhoto: user.profilePhoto || ''
      });
      setPreviewUrl(user.profilePhoto || '');
    }
  }, [user]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image under 5MB",
        });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'mediverse_profiles'); // You'll need to create this in Cloudinary
    formData.append('folder', 'mediverse/profiles');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'demo'}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoUrl = profileData.profilePhoto;

      // Upload new photo if selected
      if (selectedFile) {
        setUploading(true);
        toast({
          title: "Uploading photo...",
          description: "Please wait while we upload your image",
        });
        photoUrl = await uploadToCloudinary(selectedFile);
        setUploading(false);
      }

      const response = await api.put('/users/profile', {
        ...profileData,
        profilePhoto: photoUrl
      });

      if (response.data.success) {
        await updateUser(response.data.data);
        toast({
          variant: "success",
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setLoading(false);
      setUploading(false);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Edit Profile</h1>
            <p className="text-muted-foreground">Update your personal information and profile picture</p>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Make changes to your account information here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Photo Section */}
                <div className="flex flex-col items-center gap-4 pb-6 border-b">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-primary/20">
                      <AvatarImage src={previewUrl} alt={profileData.name} />
                      <AvatarFallback className="text-3xl bg-primary/10">
                        {getInitials(profileData.name)}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="photo-upload"
                      className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg"
                    >
                      {uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Camera className="h-5 w-5" />
                      )}
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploading || loading}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{profileData.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="h-4 w-4" />
                      <span>{selectedFile.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(profileData.profilePhoto || '');
                        }}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Click the camera icon to upload a new photo (max 5MB)
                  </p>
                </div>

                {/* Form Fields */}
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                      disabled
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </label>
                    <Input
                      id="address"
                      name="address"
                      value={profileData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading || uploading}
                    size="lg"
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading || uploading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
