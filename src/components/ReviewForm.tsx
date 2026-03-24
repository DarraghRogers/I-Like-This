import { useState } from 'react';
import type { FC } from 'react';
import { saveReview } from '../services/firestoreService';
import '../styles/Reviews.css';

interface ReviewFormProps {
  productId: string | undefined;
  userId: string;
  userName: string;
  userPhotoUrl: string | undefined;
  onReviewSubmitted: () => void;
}

export const ReviewForm: FC<ReviewFormProps> = ({
  productId,
  userId,
  userName,
  userPhotoUrl,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    setLoading(true);
    setError(null);

    try {
      if (comment.trim().length === 0) {
        setError('Please write a comment');
        setLoading(false);
        return;
      }

      await saveReview(productId, userId, userName, userPhotoUrl, rating, comment);
      setComment('');
      setRating(5);
      onReviewSubmitted();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form">
      <h3>Write a Review</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Rating</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                type="button"
                className={`star ${rating >= num ? 'active' : ''}`}
                onClick={() => setRating(num)}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="comment">Comment</label>
          <textarea
            id="comment"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your thoughts about this product..."
            rows={4}
            maxLength={500}
            disabled={loading}
          />
          <div className="char-count">
            {comment.length}/500
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          className="submit-button"
          disabled={loading || comment.trim().length === 0}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};
