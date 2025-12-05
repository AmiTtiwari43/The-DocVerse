import React, { useState, useEffect } from 'react';
import DoctorCard from '../components/DoctorCard';
import FilterSidebar from '../components/FilterSidebar';
import { Skeleton } from '../components/ui/skeleton';
import { Card, CardContent } from '../components/ui/card';
import { useAppContext } from '../context/AppContext';
import api from '../utils/api';

const Search = () => {
  const { city } = useAppContext();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
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
    if (city && !filters.city) {
      setFilters(prev => ({ ...prev, city }));
    }
  }, [city]);

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

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
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Find Doctors</h1>
          <p className="text-muted-foreground">
            {doctors.length} {doctors.length === 1 ? 'doctor' : 'doctors'} found
          </p>
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
            ) : doctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctors.map((doctor, index) => (
                  <DoctorCard key={doctor._id} doctor={doctor} index={index} />
                ))}
              </div>
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

