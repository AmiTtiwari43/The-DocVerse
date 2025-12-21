import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../components/ui/use-toast';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../utils/api';
import { motion } from 'framer-motion';

const GoogleLoginWrapper = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { setUser } = useAppContext();

    const handleSuccess = async (credentialResponse) => {
        try {
            const res = await api.post('/auth/google', { token: credentialResponse.credential });
            if (res.data.success) {
                 toast({
                    variant: "success",
                    title: "Signed up with Google!",
                    description: "Welcome to THE DocVerse!",
                });
                localStorage.setItem('token', res.data.token);
                setUser(res.data.data);
                navigate('/dashboard');
            }
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Signup Failed",
                description: err.response?.data?.message || "Google Signup Failed",
            });
        }
    };

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
                toast({ variant: "destructive", title: "Signup Failed" });
            }}
        />
    );
};



const Signup = () => {
    const { setUser } = useAppContext(); // Get setters if available, or just use api and reload?
    // Actually, context 'signup' probably sets state. I should check AppContext. 
    // For now, I'll implement the logic here.
    
  const [step, setStep] = useState('signup');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value) => {
    setFormData({ ...formData, role: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (step === 'signup') {
         // Step 1: Send OTP
         const res = await api.post('/auth/signup', formData);
         if (res.data.success) {
            setStep('otp');
            toast({
                variant: 'success',
                title: 'Verification Code Sent',
                description: `Please check ${formData.email} for the OTP.`,
            });
         }
      } else {
         // Step 2: Verify OTP
         const res = await api.post('/auth/verify', { email: formData.email, otp });
         if (res.data.success) {
            // Update Context if possible, or just reload/navigate
            // Assuming AppContext checks cookies/token on mount
            localStorage.setItem('token', res.data.token);
            toast({
                variant: 'success',
                title: 'Account Verified!',
                description: 'Welcome to THE DocVerse!',
            });
            // Force reload to update context or use context methods if available
            // navigate('/dashboard');
            window.location.href = '/dashboard'; 
         }
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || err.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-primary-subtle"></div>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-2 premium-shadow-lg glass-effect">
          <CardHeader className="space-y-1 text-center">
            <motion.div 
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="h-16 w-16 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                <UserPlus className="h-8 w-8 text-primary-foreground" />
              </div>
            </motion.div>
            <CardTitle className="text-3xl text-gradient">
                {step === 'signup' ? 'Create Account' : 'Verify Email'}
            </CardTitle>
            <CardDescription className="text-base">
              {step === 'signup' ? 'Join THE DocVerse and start your healthcare journey' : `Enter the code sent to ${formData.email}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {step === 'signup' ? (
                <>
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                    <Input id="name" type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" type="email" name="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        placeholder="Create a password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Must be 8+ chars, incl. number & special char.</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">I am a</label>
                    <Select value={formData.role} onValueChange={handleRoleChange}>
                      <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                    <label htmlFor="otp" className="text-sm font-medium">Verification Code</label>
                    <Input 
                        id="otp" 
                        type="text" 
                        placeholder="123456" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                        className="text-center text-2xl tracking-widest"
                        maxLength={6}
                        required 
                    />
                </div>
              )}

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 shadow-lg" disabled={loading}>
                  {loading ? 'Processing...' : (step === 'signup' ? 'Sign Up' : 'Verify & Login')}
                </Button>
              </motion.div>
              
              {step === 'signup' && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                      <GoogleLoginWrapper />
                  </div>
                </>
              )}
              
              {step === 'otp' && (
                  <Button 
                    type="button" 
                    variant="link" 
                    className="w-full text-sm text-muted-foreground"
                    onClick={() => setStep('signup')}
                  >
                    Back to Signup
                  </Button>
              )}
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
