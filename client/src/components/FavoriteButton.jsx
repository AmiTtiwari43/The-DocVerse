import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { useAppContext } from '../context/AppContext';
import { useToast } from './ui/use-toast';
import api from '../utils/api';
import { cn } from '../lib/utils';

const FavoriteButton = ({ doctorId, className }) => {
  const { user } = useAppContext();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && doctorId) {
      checkFavorite();
    }
  }, [user, doctorId]);

  const checkFavorite = async () => {
    try {
      const response = await api.get(`/favorites/${doctorId}`);
      if (response.data.success) {
        setIsFavorite(response.data.data.isFavorite);
      }
    } catch (error) {
      // Not favorited or error
    }
  };

  const handleToggle = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please login to add favorites",
      });
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${doctorId}`);
        setIsFavorite(false);
        toast({
          variant: "success",
          title: "Removed",
          description: "Removed from favorites",
        });
      } else {
        await api.post('/favorites', { doctorId });
        setIsFavorite(true);
        toast({
          variant: "success",
          title: "Added",
          description: "Added to favorites",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || 'Failed to update favorite',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
      className={cn(className)}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-colors",
          isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
        )}
      />
    </Button>
  );
};

export default FavoriteButton;

