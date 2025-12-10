import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import DoctorCard from '../components/DoctorCard';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Calendar, 
  Star, 
  Shield, 
  ArrowRight,
  Sparkles,
  Heart,
  Clock
} from 'lucide-react';
import api from '../utils/api';

const Home = () => {
  const { user, city } = useAppContext();
  const [topDoctors, setTopDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopDoctors();
  }, [city]);

  const fetchTopDoctors = async () => {
    try {
      const params = city ? { city, limit: 3 } : { limit: 3 };
      const response = await api.get('/doctors/top', { params });
      if (response.data.success) {
        setTopDoctors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching top doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-primary-subtle border-b">
        <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-6"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-primary/10 backdrop-blur-sm border border-primary/20 text-primary mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">Your Health, Our Priority</span>
            </motion.div>
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-gradient"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Find Your Perfect Doctor
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Connect with verified healthcare professionals, read authentic reviews, and book appointments instantly
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <Link to="/search">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="text-lg px-8 bg-gradient-primary hover:opacity-90 shadow-lg glow-effect">
                    Search Doctors
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              {!user && (
                <Link to="/signup">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="outline" className="text-lg px-8 border-2 hover:bg-accent/50">
                      Get Started Free
                    </Button>
                  </motion.div>
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Top Doctors Section */}
      {topDoctors.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-3 text-gradient">Top Rated Doctors</h2>
            <p className="text-muted-foreground text-lg">
              {city ? `Best doctors in ${city}` : 'Highly rated healthcare professionals'}
            </p>
          </motion.div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-2">
                  <CardContent className="p-5 space-y-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topDoctors.map((doctor, index) => (
                <motion.div
                  key={doctor._id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                  className="card-hover"
                >
                  <DoctorCard doctor={doctor} index={index} />
                </motion.div>
              ))}
            </div>
          )}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link to="/search">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="lg" className="border-2 hover:bg-accent/50">
                  View All Doctors
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      )}

      {/* Features Section */}
      <div className="bg-gradient-primary-subtle py-16 border-y relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-3 text-gradient">Why Choose THE DocVerse?</h2>
            <p className="text-muted-foreground text-lg">
              Everything you need for seamless healthcare management
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full card-hover border-2 hover:border-primary/50 premium-shadow bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <motion.div 
                    className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-lg"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Shield className="h-7 w-7 text-primary-foreground" />
                  </motion.div>
                  <CardTitle className="text-xl">Verified Doctors</CardTitle>
                  <CardDescription className="text-base">
                    All doctors are verified professionals with complete profiles and qualifications
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full card-hover border-2 hover:border-primary/50 premium-shadow bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <motion.div 
                    className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-lg"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Calendar className="h-7 w-7 text-primary-foreground" />
                  </motion.div>
                  <CardTitle className="text-xl">Easy Booking</CardTitle>
                  <CardDescription className="text-base">
                    Book appointments in seconds with available slots and instant confirmation
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full card-hover border-2 hover:border-primary/50 premium-shadow bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <motion.div 
                    className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-lg"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Star className="h-7 w-7 text-primary-foreground" />
                  </motion.div>
                  <CardTitle className="text-xl">Honest Reviews</CardTitle>
                  <CardDescription className="text-base">
                    Read authentic reviews from patients and make informed decisions
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full card-hover border-2 hover:border-primary/50 premium-shadow bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <motion.div 
                    className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-lg"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Heart className="h-7 w-7 text-primary-foreground" />
                  </motion.div>
                  <CardTitle className="text-xl">AI Health Assistant</CardTitle>
                  <CardDescription className="text-base">
                    Get instant health advice and find the right specialist for your needs
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-primary text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/80"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p 
              className="text-xl text-white/90 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Join thousands of patients who trust THE DocVerse for their healthcare needs
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link to={user ? '/search' : '/signup'}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="secondary" className="text-lg px-8 bg-white text-primary hover:bg-white/90 shadow-xl">
                    {user ? 'Find a Doctor' : 'Sign Up Now'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
