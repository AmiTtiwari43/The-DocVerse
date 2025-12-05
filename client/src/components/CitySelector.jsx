import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAppContext } from '../context/AppContext';

const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'];

const CitySelector = () => {
  const { city, setCity } = useAppContext();
  const [selectedCity, setSelectedCity] = useState(city || '');

  useEffect(() => {
    const saved = localStorage.getItem('selectedCity');
    if (saved) {
      setSelectedCity(saved);
      setCity(saved);
    }
  }, [setCity]);

  const handleChange = (value) => {
    setSelectedCity(value);
    setCity(value);
    localStorage.setItem('selectedCity', value);
  };

  return (
    <Select value={selectedCity} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px] bg-background">
        <SelectValue placeholder="Select City" />
      </SelectTrigger>
      <SelectContent>
        {cities.map((city) => (
          <SelectItem key={city} value={city}>
            {city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CitySelector;

