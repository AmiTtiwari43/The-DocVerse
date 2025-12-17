import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAppContext } from '../context/AppContext';
import { useToast } from './ui/use-toast';
import api from '../utils/api';
import { MessageCircle, Send, Bot, User, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, city } = useAppContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Fetch history when user changes or widget opens
  useEffect(() => {
    const fetchHistory = async () => {
      if (user && isOpen) {
        try {
          const res = await api.get('/chat/history');
          if (res.data.success) {
            setMessages(res.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch chat history", error);
        }
      } else if (!user) {
        setMessages([]); // Clear messages if no user
      }
    };

    fetchHistory();
  }, [user, isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    // Optimistic update
    const tempUserMsg = { role: 'user', content: userMessage };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chat', { symptoms: userMessage, city });
      if (response.data.success) {
        // Backend now returns the full saved message objects in `history` array (last 2)
        // Or we can construct it from response data.
        // Let's use the explicit data returned to ensure tips/doctors are present
        const data = response.data.data;
        const aiResponse = {
          role: 'ai',
          content: data.response,
          tips: data.tips, 
          suggestedSpecialization: data.suggestedSpecialization,
          relatedDoctors: data.relatedDoctors
        };
        setMessages((prev) => [...prev, aiResponse]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: error.response?.data?.message || 'Sorry, I encountered an error. Please try again.' },
      ]);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to get AI response",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFindDoctors = (specialization) => {
    setIsOpen(false);
    navigate(`/search?specialization=${encodeURIComponent(specialization)}${city ? `&city=${encodeURIComponent(city)}` : ''}`);
    toast({
      variant: "success",
      title: "Searching...",
      description: `Finding ${specialization} doctors${city ? ` in ${city}` : ''}`,
    });
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />
            
            {/* Sidebar Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-background shadow-2xl z-50 flex flex-col border-l"
            >
              <div className="px-6 pt-6 pb-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">AI Health Assistant</h2>
                    <p className="text-sm text-muted-foreground">
                      Describe your symptoms and get instant health advice
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[400px]">
            <AnimatePresence>
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8 space-y-4"
                >
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-2">How can I help you today?</p>
                    <p className="text-sm text-muted-foreground">
                      Tell me about your symptoms and I'll suggest the right specialist
                    </p>
                  </div>
                </motion.div>
              )}
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ai' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {msg.suggestedSpecialization && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFindDoctors(msg.suggestedSpecialization)}
                        className="mt-2"
                      >
                        Find {msg.suggestedSpecialization} Doctors
                        <Sparkles className="ml-2 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>


              <div ref={scrollRef} />
              </div>

              <div className="border-t p-4 bg-background">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
                placeholder="Describe your symptoms..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
                  This is not a substitute for professional medical advice
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatWidget;
