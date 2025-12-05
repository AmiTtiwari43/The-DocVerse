import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DoctorCard from '../components/DoctorCard';
import FilterSidebar from '../components/FilterSidebar';
import { Skeleton } from '../components/ui/skeleton';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useAppContext } from '../context/AppContext';
import api from '../utils/api';
import { Search as SearchIcon, X } from 'lucide-react';

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
    <div className="min-h-screen bg-background py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-3">Find Doctors</h1>
          <p className="text-muted-foreground mb-4">
            {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} found
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by doctor name, specialization, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base border-2 focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDoctors.map((doctor, index) => (
                  <DoctorCard key={doctor._id} doctor={doctor} index={index} />
                ))}
              </div>
            ) : searchQuery && doctors.length > 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground mb-2">
                    No doctors match "{searchQuery}"
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-primary hover:underline"
                  >
                    Clear search
                  </button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-lg text-muted-foreground mb-4">
                    No doctors found. Try adjusting your filters.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="text-primary hover:underline"
                  >
                    Reset filters
                  </button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;

