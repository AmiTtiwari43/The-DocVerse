import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/use-toast';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Stethoscope } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../utils/api';
import { motion } from 'framer-motion';

const GoogleLoginWrapper = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    // Use context? login method in context likely handles email/pass. 
    // We need a way to update global auth state after google success.
    const { setUser } = useAppContext();

    const handleSuccess = async (credentialResponse) => {
        try {
            const res = await api.post('/auth/google', { token: credentialResponse.credential });
            if (res.data.success) {
                 toast({
                    variant: "success",
                    title: "Logged in with Google!",
                    description: "Welcome back!",
                });
                // Manually update context since we bypassed specific context login fn
                setUser(res.data.data);
                navigate('/dashboard');
                // Force reload to ensure context sync if needed, though setting state should work
                // window.location.reload(); 
            }
        } catch (err) {
            console.error("Google Login Error", err);
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: err.response?.data?.message || "Google Login Failed",
            });
        }
    };

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
                console.log('Login Failed');
                toast({ variant: "destructive", title: "Login Failed", description: "Google Login Failed" });
            }}
            useOneTap
        />
    );
};

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAppContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast({
        variant: "success",
        title: "Welcome back!",
        description: "You've been logged in successfully",
      });
      navigate('/dashboard');
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err.response?.data?.message || err.message || 'Invalid credentials',
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
                <Stethoscope className="h-8 w-8 text-primary-foreground" />
              </div>
            </motion.div>
            <CardTitle className="text-3xl text-gradient">Welcome Back</CardTitle>
            <CardDescription className="text-base">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 shadow-lg" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </motion.div>

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
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-center text-muted-foreground mb-2">Demo Accounts:</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="font-medium">Admin</p>
                  <p className="text-muted-foreground">admin@demo.com</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">Doctor</p>
                  <p className="text-muted-foreground">doctor@demo.com</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">Patient</p>
                  <p className="text-muted-foreground">patient@demo.com</p>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">Password: admin123 / doctor123 / patient123</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
