import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Skeleton } from './ui/skeleton';

const RatingDistribution = ({ doctorId }) => {
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatingDistribution();
  }, [doctorId]);

  const fetchRatingDistribution = async () => {
    try {
      const response = await api.get(`/reviews/rating-distribution/${doctorId}`);
      if (response.data.success) {
        setDistribution(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching rating distribution:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  if (!distribution) {
    return <div className="text-muted-foreground text-sm">No ratings yet</div>;
  }

  const maxCount = Math.max(...Object.values(distribution.distribution));

  return (
    <div className="space-y-4">
      {/* Average Rating */}
      <div className="flex items-start gap-4">
        <div>
          <div className="text-4xl font-bold text-yellow-500">{distribution.avgRating.toFixed(1)}</div>
          <div className="flex gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.round(distribution.avgRating) ? 'text-yellow-400 text-lg' : 'text-gray-300 text-lg'}>
                ★
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {distribution.totalReviews} {distribution.totalReviews === 1 ? 'Review' : 'Reviews'}
          </p>
        </div>
      </div>

      {/* Rating Bars */}
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution.distribution[star] || 0;
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12">
                <span className="text-sm font-medium">{star}</span>
                <span className="text-yellow-400 text-sm">★</span>
              </div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="w-12 text-right text-sm text-muted-foreground">{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingDistribution;
