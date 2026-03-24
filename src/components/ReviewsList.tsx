import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { getProductReviews, deleteReview, type Review } from '../services/firestoreService';
import '../styles/Reviews.css';

interface ReviewsListProps {
  productId: string | undefined;
  userId: string;
  onReviewDeleted?: () => void;
}

export const ReviewsList: FC<ReviewsListProps> = ({ productId, userId, onReviewDeleted }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedReviews = await getProductReviews(productId);
        setReviews(fetchedReviews);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;

    try {
      await deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      onReviewDeleted?.();
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review');
    }
  };

  if (loading) {
    return <div className="reviews-loading">Loading reviews...</div>;
  }

  if (error) {
    return <div className="reviews-error">{error}</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="reviews-empty">
        <p>No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <div className="reviews-list">
      <div className="reviews-header">
        <h3>Reviews ({reviews.length})</h3>
        <div className="average-rating">
          <span className="stars">{'★'.repeat(Math.round(Number(averageRating)))}</span>
          <span className="rating-value">{averageRating}</span>
        </div>
      </div>

      <div className="reviews-container">
        {reviews.map(review => (
          <div key={review.id} className="review-item">
            <div className="review-header">
              <div className="reviewer-info">
                {review.userPhotoUrl && (
                  <img
                    src={review.userPhotoUrl}
                    alt={review.userName}
                    className="reviewer-photo"
                  />
                )}
                <div>
                  <p className="reviewer-name">{review.userName}</p>
                  <p className="review-date">
                    {review.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              {userId === review.userId && (
                <button
                  className="delete-button"
                  onClick={() => handleDeleteReview(review.id)}
                  title="Delete review"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="review-rating">
              {'★'.repeat(review.rating)}
              {'☆'.repeat(5 - review.rating)}
            </div>

            <p className="review-comment">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
