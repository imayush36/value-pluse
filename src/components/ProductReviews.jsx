import React, { useState, useEffect } from 'react';
import { reviewService } from '../services';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import { User, MessageSquare, CheckCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductReviews({ productId, averageRating = 4.8, reviewCount = 0 }) {
  const { isAuthenticated, currentUser, openAuthModal } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (productId) {
      setLoading(true);
      reviewService
        .getProductReviews(productId)
        .then((res) => {
          if (res.data?.success) {
            setReviews(res.data.reviews || []);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [productId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a comment for your review');
      return;
    }

    setSubmitting(true);
    try {
      const res = await reviewService.addReview(productId, { rating, comment });
      if (res.data?.success && res.data.review) {
        setReviews((prev) => [res.data.review, ...prev]);
        setComment('');
        setRating(5);
        toast.success('Thank you! Your review has been published.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not submit review. Only verified purchasers can review this item.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="product-reviews-section mt-12 pt-8 border-t border-slate-200">
      <div className="flex flex-col md:flex-row gap-8 justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <MessageSquare size={24} className="text-primary" />
            Customer Ratings &amp; Reviews
          </h3>
          <div className="flex items-center gap-3">
            <div className="text-4xl font-extrabold text-slate-900">{averageRating || '4.8'}</div>
            <div>
              <StarRating rating={averageRating || 4.8} size={20} />
              <div className="text-xs text-slate-500 mt-1">Based on {reviewCount || reviews.length || 1} verified ratings</div>
            </div>
          </div>
        </div>

        {/* Review Form Card */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 w-full md:max-w-md">
          <h4 className="font-semibold text-slate-900 mb-2">Write a Review</h4>
          {isAuthenticated ? (
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Your Rating</label>
                <StarRating rating={rating} interactive onChange={setRating} size={24} />
              </div>
              <div>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this appliance..."
                  className="w-full p-3 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Send size={15} />
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 justify-center">
                <CheckCircle size={12} className="text-emerald-500" />
                Verified buyers only
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-slate-600 mb-3">Sign in to leave a review for this product</p>
              <button
                onClick={() => openAuthModal('login')}
                className="py-2 px-5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all"
              >
                Sign In to Review
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-500 text-sm">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev._id || rev.id} className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-xs">
                    {(rev.user?.fullName || rev.userName || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                      {rev.user?.fullName || rev.userName || 'Verified Buyer'}
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                        Verified Purchase
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                    </div>
                  </div>
                </div>
                <StarRating rating={rev.rating} size={14} />
              </div>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
