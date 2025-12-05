import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  HeadphonesIcon
} from 'lucide-react';

const ContactUs = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        variant: "success",
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'support@mediverse.com',
      description: 'Send us an email anytime',
      link: 'mailto:support@mediverse.com'
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+91 88000 00000',
      description: 'Mon-Sat from 9am to 8pm',
      link: 'tel:+918800000000'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: 'Mumbai, Maharashtra',
      description: 'India - 400001',
      link: null
    },
    {
      icon: Clock,
      title: 'Working Hours',
      content: '9:00 AM - 8:00 PM',
      description: 'Monday to Saturday',
      link: null
    }
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
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Get In Touch</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              We're Here to Help
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all border-2 hover:border-primary/30 premium-shadow card-hover">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{info.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {info.link ? (
                      <a 
                        href={info.link}
                        className="block font-semibold text-foreground hover:text-primary transition-colors mb-1"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <p className="font-semibold text-foreground mb-1">{info.content}</p>
                    )}
                    <CardDescription>{info.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Contact Form Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Send Us a Message</h2>
                <p className="text-lg text-muted-foreground">
                  Fill out the form and our team will get back to you within 24 hours.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <HeadphonesIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">24/7 Customer Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Our support team is available round the clock to assist you with any queries or concerns.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Quick Response Time</h3>
                    <p className="text-sm text-muted-foreground">
                      We typically respond to all inquiries within 24 hours on business days.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-2 premium-shadow">
                <CardHeader>
                  <CardTitle>Contact Form</CardTitle>
                  <CardDescription>
                    Fill in your details and we'll get back to you soon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us more about your inquiry..."
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading} size="lg">
                      {loading ? 'Sending...' : 'Send Message'}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Map Section (Placeholder) */}
      <div className="py-12 bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Find Us</h2>
            <p className="text-lg text-muted-foreground">
              Visit our office or reach out through any of the channels above
            </p>
          </div>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2">
            <div className="text-center space-y-2">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-lg font-medium">Mumbai, Maharashtra, India</p>
              <p className="text-sm text-muted-foreground">Map integration coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Teaser */}
      <div className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Looking for Quick Answers?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Check out our AI Health Assistant for instant help with finding the right doctor for your needs.
          </p>
          <Button size="lg" className="gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat with AI Assistant
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
