import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

// Using free placeholder images from Placehold.co or Unsplash source
const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop", // Hospital hallway
  "https://images.unsplash.com/photo-1504813184591-01572f98c85f?q=80&w=1200&auto=format&fit=crop", // Medical equipment
  "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=1200&auto=format&fit=crop", // Waiting room
  "https://images.unsplash.com/photo-1516549655169-df83a25a836d?q=80&w=1200&auto=format&fit=crop", // Doctors talking
];

const ClinicSlideshow = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayImages = images && images.length > 0 ? images : DEFAULT_IMAGES;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    }, 5000); // 5 seconds interval

    return () => clearInterval(interval);
  }, [displayImages.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-xl mb-8 group">
      {/* Slides */}
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {displayImages.map((src, index) => (
          <div key={index} className="min-w-full h-full relative">
            <img 
              src={src} 
              alt={`Clinic view ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            {/* Optional Overlay */}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-4 left-4 text-white p-2">
                 <h3 className="text-xl font-bold drop-shadow-md">State of the Art Facilities</h3>
                 <p className="text-sm drop-shadow-md">Providing the best care for you</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows (Visible on Hover) */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={goToNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {displayImages.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ClinicSlideshow;
