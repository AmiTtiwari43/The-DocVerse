import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DoctorCard from '../components/DoctorCard';
import FilterSidebar from '../components/FilterSidebar';
import { Skeleton } from '../components/ui/skeleton';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { useAppContext } from '../context/AppContext';
import api from '../utils/api';
import { Search as SearchIcon, X, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const Search = () => {
  const [searchParams] = useSearchParams();
  const { city } = useAppContext();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    city: city || '',
    specialization: '',
    gender: '',
    minFee: '',
    maxFee: '',
    minExperience: '',
    sort: '',
  });
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const specialization = searchParams.get('specialization');
    const searchCity = searchParams.get('city');
    
    if (specialization || searchCity) {
      setFilters(prev => ({
        ...prev,
        ...(specialization && { specialization }),
        ...(searchCity && { city: searchCity }),
      }));
    } else if (city && !filters.city) {
      setFilters(prev => ({ ...prev, city }));
    }
  }, [city, searchParams]);

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = doctors.filter((doctor) => {
        const nameMatch = doctor.name?.toLowerCase().includes(query);
        const specMatch = doctor.specialization?.toLowerCase().includes(query);
        const cityMatch = doctor.city?.toLowerCase().includes(query);
        return nameMatch || specMatch || cityMatch;
      }).sort((a, b) => {
        // Prioritize exact name matches first
        const aNameMatch = a.name?.toLowerCase().startsWith(query) ? 0 : 1;
        const bNameMatch = b.name?.toLowerCase().startsWith(query) ? 0 : 1;
        if (aNameMatch !== bNameMatch) return aNameMatch - bNameMatch;
        
        // Then specialization matches
        const aSpecMatch = a.specialization?.toLowerCase().startsWith(query) ? 0 : 1;
        const bSpecMatch = b.specialization?.toLowerCase().startsWith(query) ? 0 : 1;
        if (aSpecMatch !== bSpecMatch) return aSpecMatch - bSpecMatch;
        
        // Finally by rating
        return (b.avgRating || 0) - (a.avgRating || 0);
      });
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [searchQuery, doctors]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await api.get('/doctors', { params });
      if (response.data.success) {
        setDoctors(response.data.data);
        setFilteredDoctors(response.data.data);
        const uniqueCities = [...new Set(response.data.data.map((d) => d.city))];
        setCities(uniqueCities);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      city: city || '',
      specialization: '',
      gender: '',
      minFee: '',
      maxFee: '',
      minExperience: '',
      sort: '',
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gradient">Find Doctors</h1>
          <p className="text-muted-foreground mb-6 text-lg">
            {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} found
          </p>
          
          {/* Search Bar */}
          <motion.div 
            className="relative max-w-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Search by doctor name, specialization, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 h-14 text-base border-2 focus:border-primary rounded-xl shadow-lg focus:shadow-xl transition-all bg-card/50 backdrop-blur-sm"
              />
              {searchQuery && (
                <motion.button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Mobile Filter Sheet */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full border-2 mb-4">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine your search to find the perfect doctor
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={resetFilters}
                    cities={cities}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block lg:col-span-1">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={resetFilters}
              cities={cities}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6 space-y-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredDoctors.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {filteredDoctors.map((doctor, index) => (
                  <DoctorCard key={doctor._id} doctor={doctor} index={index} />
                ))}
              </motion.div>
            ) : searchQuery && doctors.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-2 premium-shadow">
                  <CardContent className="p-12 text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    </motion.div>
                    <p className="text-lg text-muted-foreground mb-4">
                      No doctors match "{searchQuery}"
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => setSearchQuery('')}
                        variant="outline"
                        className="border-2"
                      >
                        Clear search
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-2 premium-shadow">
                  <CardContent className="p-12 text-center">
                    <p className="text-lg text-muted-foreground mb-4">
                      No doctors found. Try adjusting your filters.
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={resetFilters}
                        variant="outline"
                        className="border-2"
                      >
                        Reset filters
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;

