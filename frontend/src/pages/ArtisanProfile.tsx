import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Phone, Star, Calendar } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import RatingStars from "../components/RatingStars";
import { Artisan, Review } from "../types";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

interface ReviewFormData {
  user_name: string;
  rating: number;
  comment: string;
}

const ArtisanProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    user_name: "",
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    if (id) {
      fetchArtisan();
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchArtisan = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Artisan>(`${API}/artisans/${id}`);
      setArtisan(response.data);
    } catch (error) {
      console.error("Error fetching artisan:", error);
      toast.error("Failed to load artisan profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get<Review[]>(`${API}/reviews/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewForm.user_name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      await axios.post(`${API}/reviews`, {
        artisan_id: id,
        ...reviewForm,
      });

      toast.success("Review submitted successfully!");
      setReviewForm({ user_name: "", rating: 5, comment: "" });
      setShowReviewForm(false);
      fetchReviews();
      fetchArtisan();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-white pt-32 flex items-center justify-center"
        data-testid="loading-state"
      >
        <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div
        className="min-h-screen bg-white pt-32 flex items-center justify-center"
        data-testid="not-found"
      >
        <p className="text-xl text-slate-600">Artisan not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-5">
            <div className="aspect-[4/5] overflow-hidden bg-slate-200">
              <img
                src={
                  artisan.photo_url
                    ? artisan.photo_url.startsWith("/uploads")
                      ? `${process.env.REACT_APP_BACKEND_URL}${artisan.photo_url}`
                      : artisan.photo_url
                    : "https://images.unsplash.com/photo-1583182845142-55eb5b8fe184?w=800"
                }
              />
            </div>
          </div>

          <div className="md:col-span-7">
            <p
              className="text-sm font-medium tracking-wide uppercase text-slate-500 mb-2"
              data-testid="artisan-job-type"
            >
              {artisan.job_type}
            </p>
            <h1
              className="text-5xl md:text-6xl font-black tracking-tight leading-none text-slate-900 mb-6"
              data-testid="artisan-name"
            >
              {artisan.name}
            </h1>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-slate-700">
                <MapPin size={24} className="text-primary" />
                <span className="text-lg" data-testid="artisan-location">
                  {artisan.location}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Phone size={24} className="text-primary" />
                <a
                  href={`tel:${artisan.phone}`}
                  className="text-lg hover:text-primary transition-colors"
                  data-testid="artisan-phone"
                >
                  {artisan.phone}
                </a>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Average Rating</p>
                  <RatingStars rating={artisan.average_rating || 0} size={24} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 mb-2">Total Reviews</p>
                  <p
                    className="text-3xl font-bold text-slate-900"
                    data-testid="total-reviews"
                  >
                    {artisan.total_reviews || 0}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="w-full bg-primary text-white hover:bg-primary-hover px-8 py-4 font-bold tracking-wide shadow-lg hover:shadow-xl transition-all active:scale-95"
              data-testid="leave-review-btn"
            >
              {showReviewForm ? "Cancel" : "Leave a Review"}
            </button>
          </div>
        </div>

        {showReviewForm && (
          <div
            className="bg-slate-50 border border-slate-200 p-8 mb-12"
            data-testid="review-form"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Write a Review
            </h2>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={reviewForm.user_name}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, user_name: e.target.value })
                  }
                  className="w-full h-14 bg-white border-2 border-slate-200 focus:border-primary focus:ring-0 px-4 text-lg placeholder:text-slate-400"
                  placeholder="Enter your name"
                  data-testid="review-name-input"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setReviewForm({ ...reviewForm, rating: star })
                      }
                      className="transition-colors"
                      data-testid={`rating-star-${star}`}
                    >
                      <Star
                        size={32}
                        className={
                          star <= reviewForm.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  rows={4}
                  className="w-full bg-white border-2 border-slate-200 focus:border-primary focus:ring-0 px-4 py-3 text-lg placeholder:text-slate-400"
                  placeholder="Share your experience..."
                  data-testid="review-comment-input"
                />
              </div>

              <button
                type="submit"
                className="bg-primary text-white hover:bg-primary-hover px-8 py-4 font-bold tracking-wide shadow-lg hover:shadow-xl transition-all active:scale-95"
                data-testid="submit-review-btn"
              >
                Submit Review
              </button>
            </form>
          </div>
        )}

        <div>
          <h2
            className="text-4xl font-bold text-slate-900 mb-8"
            data-testid="reviews-title"
          >
            Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div
              className="bg-slate-50 border border-slate-200 p-12 text-center"
              data-testid="no-reviews"
            >
              <p className="text-slate-600">
                No reviews yet. Be the first to review!
              </p>
            </div>
          ) : (
            <div className="space-y-6" data-testid="reviews-list">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-slate-50 border border-slate-200 p-6"
                  data-testid={`review-${review.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p
                        className="font-bold text-slate-900 text-lg"
                        data-testid={`review-name-${review.id}`}
                      >
                        {review.user_name}
                      </p>
                      <RatingStars rating={review.rating} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={16} />
                      <span data-testid={`review-date-${review.id}`}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p
                    className="text-slate-700 leading-relaxed"
                    data-testid={`review-comment-${review.id}`}
                  >
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtisanProfile;
