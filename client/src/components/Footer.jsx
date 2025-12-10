import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Separator } from './ui/separator';
import { motion } from 'framer-motion';

const Footer = () => {
  const location = useLocation();
  const { user } = useAppContext();
  
  // Hide footer on dashboard page for admins (admin panel)
  const isAdminDashboard = location.pathname === '/dashboard' && user?.role === 'admin';
  
  if (isAdminDashboard) {
    return null;
  }

  return (
    <footer className="bg-gradient-primary-subtle border-t mt-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <motion.div 
                className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-primary-foreground font-bold text-xl">D</span>
              </motion.div>
              <span className="text-2xl font-bold text-gradient">
                THE DocVerse
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted platform for finding verified doctors, booking appointments, and managing your healthcare needs seamlessly.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "https://facebook.com" },
                { icon: Twitter, href: "https://twitter.com" },
                { icon: Instagram, href: "https://instagram.com" },
                { icon: Linkedin, href: "https://linkedin.com" },
              ].map((social, index) => (
                <motion.a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all border border-primary/20"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <social.icon className="h-4 w-4 text-primary" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Quick Links</h3>
            <nav className="flex flex-col space-y-2.5">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/search" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Find Doctors
              </Link>
              {user && (
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              )}
              {!user && (
                <>
                  <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Login
                  </Link>
                  <Link to="/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* For Patients */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">For Patients</h3>
            <nav className="flex flex-col space-y-2.5">
              <Link to="/search" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Search Doctors
              </Link>
              {user && (
                <>
                  <Link to="/favorites" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    My Favorites
                  </Link>
                  <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    My Appointments
                  </Link>
                </>
              )}
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Help & Support
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <a 
                href="mailto:support@docverse.com" 
                className="flex items-start gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 group-hover:text-primary" />
                <span>support@docverse.com</span>
              </a>
              <a 
                href="tel:+918800000000" 
                className="flex items-start gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 group-hover:text-primary" />
                <span>+91 88000 00000</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} THE DocVerse. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500 mx-1" /> for better healthcare
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
