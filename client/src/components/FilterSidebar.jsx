import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { X, Filter, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const specializations = [
  'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedist',
  'Pediatrician', 'General Physician', 'Psychiatrist', 'Dentist',
  'Ophthalmologist', 'Gynecologist', 'Urologist'
];

const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'];

const FilterSidebar = ({ filters, onFilterChange, onReset, cities: availableCities = cities }) => {
  const activeFiltersCount = Object.values(filters).filter(v => v && v !== '').length;
  
  return (
    <Card className="sticky top-20 border-2 premium-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="h-5 w-5 rounded-full bg-gradient-primary text-primary-foreground text-xs flex items-center justify-center font-bold"
              >
                {activeFiltersCount}
              </motion.span>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={onReset} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset all filters</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['location', 'specialization']} className="w-full">
          <AccordionItem value="location" className="border-none">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Location & Basic</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div>
                <Label htmlFor="city" className="text-sm font-medium mb-2 block">City</Label>
                <Select
                  value={filters.city || 'all'}
                  onValueChange={(value) => onFilterChange('city', value === 'all' ? '' : value)}
                >
                  <SelectTrigger className="border-2">
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

              <div>
                <Label htmlFor="gender" className="text-sm font-medium mb-2 block">Gender</Label>
                <Select
                  value={filters.gender || 'any'}
                  onValueChange={(value) => onFilterChange('gender', value === 'any' ? '' : value)}
                >
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="specialization" className="border-none">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Specialization</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div>
                <Label htmlFor="specialization" className="text-sm font-medium mb-2 block">Specialization</Label>
                <Select
                  value={filters.specialization || 'all'}
                  onValueChange={(value) => onFilterChange('specialization', value === 'all' ? '' : value)}
                >
                  <SelectTrigger className="border-2">
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pricing" className="border-none">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Pricing & Experience</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div>
                <Label htmlFor="fee-range" className="text-sm font-medium mb-2 block">Fee Range (₹)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="min-fee"
                    type="number"
                    placeholder="Min"
                    value={filters.minFee || ''}
                    onChange={(e) => onFilterChange('minFee', e.target.value)}
                    className="border-2"
                  />
                  <Input
                    id="max-fee"
                    type="number"
                    placeholder="Max"
                    value={filters.maxFee || ''}
                    onChange={(e) => onFilterChange('maxFee', e.target.value)}
                    className="border-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="experience" className="text-sm font-medium mb-2 block">Min Experience (years)</Label>
                <Input
                  id="experience"
                  type="number"
                  placeholder="e.g. 5"
                  value={filters.minExperience || ''}
                  onChange={(e) => onFilterChange('minExperience', e.target.value)}
                  className="border-2"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="sort" className="border-none">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Sort & Order</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div>
                <Label htmlFor="sort" className="text-sm font-medium mb-2 block">Sort By</Label>
                <Select
                  value={filters.sort || 'default'}
                  onValueChange={(value) => onFilterChange('sort', value === 'default' ? '' : value)}
                >
                  <SelectTrigger className="border-2">
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator className="my-4" />

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="outline" 
            className="w-full border-2 hover:bg-accent/50" 
            onClick={onReset}
            disabled={activeFiltersCount === 0}
          >
            <X className="h-4 w-4 mr-2" />
            Reset All Filters
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default FilterSidebar;

