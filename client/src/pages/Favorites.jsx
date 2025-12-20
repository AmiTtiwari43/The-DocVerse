import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import DoctorCard from '../components/DoctorCard';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../components/ui/use-toast';
import api from '../utils/api';
import { Heart } from 'lucide-react';

const Favorites = () => {
  const { user } = useAppContext();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites');
      if (response.data.success) {
        setFavorites(response.data.data);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load favorites",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-muted-foreground">Please login to view favorites</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            <h1 className="text-4xl font-bold">My Favorites</h1>
          </div>
          <p className="text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? 'doctor' : 'doctors'} saved
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav, index) => (
              <DoctorCard key={fav._id} doctor={fav.doctor} index={index} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-2">No favorites yet</p>
              <p className="text-sm text-muted-foreground">
                Start adding doctors to your favorites to see them here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Favorites;

