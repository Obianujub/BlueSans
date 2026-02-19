import { Star } from 'lucide-react';

export default function RatingStars({ rating, size = 16, showNumber = true }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
        />
      ))}
      {showNumber && <span className="ml-1 text-sm text-slate-600 font-medium">{rating.toFixed(1)}</span>}
    </div>
  );
}
