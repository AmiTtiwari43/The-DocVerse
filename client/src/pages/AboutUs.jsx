import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Shield, 
  Users, 
  Target, 
  Award, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const AboutUs = () => {
  const values = [
    {
      icon: Heart,
      title: 'Patient-Centric',
      description: 'We prioritize patient care and satisfaction above all else, ensuring the best healthcare experience.'
    },
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'All doctors are verified professionals with authentic credentials and real patient reviews.'
    },
    {
      icon: Award,
      title: 'Quality Excellence',
      description: 'We maintain the highest standards of quality in healthcare services and platform experience.'
    },
    {
      icon: Sparkles,
      title: 'Innovation',
      description: 'Leveraging AI and modern technology to revolutionize healthcare accessibility.'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Active Patients' },
    { value: '500+', label: 'Verified Doctors' },
    { value: '50+', label: 'Specializations' },
    { value: '25+', label: 'Cities Covered' }
  ];

  const features = [
    'Verified Healthcare Professionals',
    'Easy Online Appointment Booking',
    'Authentic Patient Reviews & Ratings',
    'AI-Powered Health Assistant',
    'Secure Payment Gateway',
    '24/7 Customer Support'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-blue-50/50 py-16 border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6 max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">About THE DocVerse</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Transforming Healthcare Access
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We're on a mission to make quality healthcare accessible to everyone, connecting patients with trusted doctors through technology and transparency.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-12 bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Our Mission</span>
              </div>
              <h2 className="text-4xl font-bold">Bridging the Gap Between Patients and Doctors</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                THE DocVerse was founded with a simple yet powerful vision: to eliminate the barriers that prevent people from accessing quality healthcare. We believe that finding a trusted doctor and booking an appointment should be as easy as ordering food online.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Through our platform, we're creating a transparent healthcare ecosystem where patients can make informed decisions based on verified information and authentic reviews.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-background border-2 hover:border-primary/30 hover:shadow-lg transition-all premium-shadow"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-base font-medium">{feature}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do, from product development to customer service
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all border-2 hover:border-primary/30 premium-shadow card-hover">
                  <CardHeader>
                    <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <value.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-12 bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Built by Healthcare Enthusiasts</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our diverse team combines expertise in healthcare, technology, and user experience to create the best platform for you
            </p>
          </div>

          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              We're a passionate team of engineers, designers, healthcare professionals, and customer success specialists working together to revolutionize how people access healthcare services.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Join us on our journey to make healthcare more accessible, transparent, and patient-friendly for everyone.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Experience Better Healthcare?</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of patients who trust THE DocVerse for their healthcare needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/search">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Find a Doctor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 hover:bg-white/20 text-white border-white/20">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
