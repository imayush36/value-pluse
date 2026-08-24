import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, interactive = false, onChange, size = 16 }) {
  const [hoverRating, setHoverRating] = useState(0);

  const activeRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange && onChange(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'} p-0.5 bg-transparent border-0`}
          aria-label={`${star} star`}
        >
          <Star
            size={size}
            className={`${
              star <= activeRating
                ? 'fill-amber-400 text-amber-400'
                : star - 0.5 <= activeRating
                ? 'fill-amber-300 text-amber-300'
                : 'text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
