import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Separator } from './ui/separator';

const Footer = () => {
  const location = useLocation();
  const { user } = useAppContext();
  
  // Hide footer on dashboard page for admins (admin panel)
  const isAdminDashboard = location.pathname === '/dashboard' && user?.role === 'admin';
  
  if (isAdminDashboard) {
    return null;
  }

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">M</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Mediverse
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted platform for finding verified doctors, booking appointments, and managing your healthcare needs seamlessly.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
              >
                <Facebook className="h-4 w-4 text-primary" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
              >
                <Twitter className="h-4 w-4 text-primary" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
              >
                <Instagram className="h-4 w-4 text-primary" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
              >
                <Linkedin className="h-4 w-4 text-primary" />
              </a>
            </div>
          </div>

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
                href="mailto:support@mediverse.com" 
                className="flex items-start gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 group-hover:text-primary" />
                <span>support@mediverse.com</span>
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
            © {new Date().getFullYear()} Mediverse. All rights reserved.
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
