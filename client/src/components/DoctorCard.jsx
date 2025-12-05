import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Star, MapPin, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import FavoriteButton from './FavoriteButton';

const DoctorCard = ({ doctor, index = 0 }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : i === fullStars && hasHalfStar
                ? "fill-yellow-400/50 text-yellow-400"
                : "fill-gray-300 text-gray-300"
            )}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={doctor.profilePhoto} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(doctor.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{doctor.name}</h3>
                      <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                    </div>
                    <FavoriteButton doctorId={doctor._id} />
                  </div>
                  {doctor.avgRating >= 4.5 && (
                    <Badge variant="success" className="mt-2">
                      <Award className="h-3 w-3 mr-1" />
                      Top Rated
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-2">
          {doctor.avgRating > 0 && (
            <div className="flex items-center gap-2">
              {renderStars(doctor.avgRating)}
              <span className="text-xs text-muted-foreground">
                ({doctor.reviewCount || 0} reviews)
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {doctor.city}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {doctor.experience} years experience
          </div>
          <div className="pt-2">
            <p className="text-2xl font-bold text-primary">₹{doctor.fees}</p>
            <p className="text-xs text-muted-foreground">Consultation fee</p>
          </div>
        </CardContent>
        <CardFooter>
          <Link to={`/doctor/${doctor._id}`} className="w-full">
            <Button className="w-full">View Profile & Book</Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default DoctorCard;

