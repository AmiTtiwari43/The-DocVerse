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
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-blue-50/50 border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Your Health, Our Priority</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Find Your Perfect Doctor
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Connect with verified healthcare professionals, read authentic reviews, and book appointments instantly
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/search">
                <Button size="lg" className="text-lg px-8">
                  Search Doctors
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {!user && (
                <Link to="/signup">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Get Started Free
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Top Doctors Section */}
      {topDoctors.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-3">Top Rated Doctors</h2>
            <p className="text-muted-foreground text-lg">
              {city ? `Best doctors in ${city}` : 'Highly rated healthcare professionals'}
            </p>
          </div>
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="card-hover"
                >
                  <DoctorCard doctor={doctor} index={index} />
                </motion.div>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/search">
              <Button variant="outline" size="lg">
                View All Doctors
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="bg-muted/30 py-10 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-3">Why Choose Mediverse?</h2>
            <p className="text-muted-foreground text-lg">
              Everything you need for seamless healthcare management
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Card className="h-full hover:shadow-lg transition-all border-2 hover:border-primary/30 premium-shadow">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Verified Doctors</CardTitle>
                  <CardDescription>
                    All doctors are verified professionals with complete profiles and qualifications
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all border-2 hover:border-primary/30 premium-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Easy Booking</CardTitle>
                  <CardDescription>
                    Book appointments in seconds with available slots and instant confirmation
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Honest Reviews</CardTitle>
                  <CardDescription>
                    Read authentic reviews from patients and make informed decisions
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>AI Health Assistant</CardTitle>
                  <CardDescription>
                    Get instant health advice and find the right specialist for your needs
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Get Started?</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of patients who trust Mediverse for their healthcare needs
            </p>
            <Link to={user ? '/search' : '/signup'}>
              <Button size="lg" variant="secondary" className="text-lg px-8">
                {user ? 'Find a Doctor' : 'Sign Up Now'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
