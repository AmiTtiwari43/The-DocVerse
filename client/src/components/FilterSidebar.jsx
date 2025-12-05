import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Label } from '@radix-ui/react-label';
import { X } from 'lucide-react';

const specializations = [
  'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedist',
  'Pediatrician', 'General Physician', 'Psychiatrist', 'Dentist',
  'Ophthalmologist', 'Gynecologist', 'Urologist'
];

const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'];

const FilterSidebar = ({ filters, onFilterChange, onReset, cities: availableCities = cities }) => {
  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Filters
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">City</Label>
          <Select
            value={filters.city || 'all'}
            onValueChange={(value) => onFilterChange('city', value === 'all' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {availableCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium mb-2 block">Specialization</Label>
          <Select
            value={filters.specialization || 'all'}
            onValueChange={(value) => onFilterChange('specialization', value === 'all' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Specializations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium mb-2 block">Gender</Label>
          <Select
            value={filters.gender || 'any'}
            onValueChange={(value) => onFilterChange('gender', value === 'any' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium mb-2 block">Fee Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minFee || ''}
              onChange={(e) => onFilterChange('minFee', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxFee || ''}
              onChange={(e) => onFilterChange('maxFee', e.target.value)}
            />
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium mb-2 block">Min Experience (years)</Label>
          <Input
            type="number"
            placeholder="e.g. 5"
            value={filters.minExperience || ''}
            onChange={(e) => onFilterChange('minExperience', e.target.value)}
          />
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium mb-2 block">Sort By</Label>
          <Select
            value={filters.sort || 'default'}
            onValueChange={(value) => onFilterChange('sort', value === 'default' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="rating">Highest Rating</SelectItem>
              <SelectItem value="fee_low">Fee: Low to High</SelectItem>
              <SelectItem value="fee_high">Fee: High to Low</SelectItem>
              <SelectItem value="experience">Most Experience</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" className="w-full" onClick={onReset}>
          Reset All Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default FilterSidebar;

