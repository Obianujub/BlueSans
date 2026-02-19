import { Link } from 'react-router-dom';
import { MapPin, Phone, Star } from 'lucide-react';
import RatingStars from './RatingStars';

export default function ArtisanCard({ artisan }) {
  return (
    <Link to={`/artisan/${artisan.id}`} data-testid={`artisan-card-${artisan.id}`}>
      <div className="bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group h-full">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={artisan.photo_url || 'https://images.unsplash.com/photo-1583182845142-55eb5b8fe184?w=600'}
            alt={artisan.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            data-testid={`artisan-image-${artisan.id}`}
          />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight" data-testid={`artisan-name-${artisan.id}`}>
                {artisan.name}
              </h3>
              <p className="text-sm font-medium tracking-wide uppercase text-slate-500 mt-1" data-testid={`artisan-job-${artisan.id}`}>
                {artisan.job_type}
              </p>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin size={16} />
              <span className="text-sm" data-testid={`artisan-location-${artisan.id}`}>{artisan.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone size={16} />
              <span className="text-sm" data-testid={`artisan-phone-${artisan.id}`}>{artisan.phone}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <RatingStars rating={artisan.average_rating || 0} />
            <span className="text-xs text-slate-500" data-testid={`artisan-reviews-count-${artisan.id}`}>
              {artisan.total_reviews || 0} reviews
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
