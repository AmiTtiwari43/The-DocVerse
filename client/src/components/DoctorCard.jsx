import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Star, MapPin, Clock, Award, User, Stethoscope } from 'lucide-react';
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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full flex flex-col card-hover border-2 hover:border-primary/50 premium-shadow bg-card/50 backdrop-blur-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500"></div>
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-start gap-4">
            <HoverCard>
              <HoverCardTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="cursor-pointer"
                >
                  <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-lg">
                    <AvatarImage src={doctor.profilePhoto} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                      {getInitials(doctor.name)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={doctor.profilePhoto} />
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                        {getInitials(doctor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold">{doctor.name}</h4>
                      <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{doctor.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{doctor.experience} years experience</span>
                    </div>
                    {doctor.avgRating > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{doctor.avgRating.toFixed(1)} ({doctor.reviewCount || 0} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{doctor.name}</h3>
                      <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FavoriteButton doctorId={doctor._id} />
                    </motion.div>
                  </div>
                  {doctor.avgRating >= 4.5 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                          >
                            <Badge variant="success" className="mt-2 shadow-md cursor-help">
                              <Award className="h-3 w-3 mr-1" />
                              Top Rated
                            </Badge>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This doctor has a rating of 4.5+ stars</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-3 relative z-10">
          {doctor.avgRating > 0 && (
            <div className="flex items-center gap-2">
              {renderStars(doctor.avgRating)}
              <span className="text-xs text-muted-foreground">
                ({doctor.reviewCount || 0} reviews)
              </span>
            </div>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-help">
                  <MapPin className="h-4 w-4 text-primary" />
                  {doctor.city}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Location: {doctor.city}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-help">
                  <Clock className="h-4 w-4 text-primary" />
                  {doctor.experience} years experience
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{doctor.experience} years of professional experience</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="pt-2 border-t border-border/50">
            <p className="text-2xl font-bold text-gradient">₹{doctor.fees}</p>
            <p className="text-xs text-muted-foreground">Consultation fee</p>
          </div>
        </CardContent>
        <CardFooter className="relative z-10">
          <Link to={`/doctor/${doctor._id}`} className="w-full">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="w-full bg-gradient-primary hover:opacity-90 shadow-lg">
                View Profile & Book
              </Button>
            </motion.div>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default DoctorCard;

