import React from 'react';

const ReviewCard = ({ review }) => {
  return (
    <div className="border rounded-lg p-4 mb-4 bg-gray-50">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold">{review.patientId?.name}</h4>
          <p className="text-yellow-500">{'⭐'.repeat(review.rating)}</p>
          <p className="text-gray-700 mt-2">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
