import { useState, useEffect } from 'react';
import type { FC } from 'react';
import type { Product } from '../types';
import { useAuthStore } from '../stores/authStore';
import { likeProduct, unlikeProduct, isProductLikedByUser } from '../services/firestoreService';
import { ReviewForm } from './ReviewForm';
import { ReviewsList } from './ReviewsList';
import '../styles/ProductDetails.css';
import '../styles/Reviews.css';

interface ProductDetailsProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetails: FC<ProductDetailsProps> = ({ product, onClose }) => {
  const { user, profile } = useAuthStore();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewsKey, setReviewsKey] = useState(0);

  useEffect(() => {
    if (product && user) {
      checkIfLiked();
    }
  }, [product, user]);

  const checkIfLiked = async () => {
    if (!product?.id || !user) return;
    const liked = await isProductLikedByUser(user.uid, product.id);
    setIsLiked(liked);
  };

  const handleLikeClick = async () => {
    if (!product?.id || !user || isLoading) return;

    setIsLoading(true);
    try {
      if (isLiked) {
        await unlikeProduct(user.uid, product.id);
        setIsLiked(false);
      } else {
        await likeProduct(user.uid, product.id);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error updating like status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setReviewsKey(prev => prev + 1);
  };

  if (!product) {
    return null;
  }

  return (
    <div className="product-details-overlay" onClick={onClose}>
      <div className="product-details-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>✕</button>

        <div className="product-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <div className="image-placeholder">No Image</div>
          )}
        </div>

        <div className="product-info">
          <h2>{product.name}</h2>
          <p className="brand">{product.brand}</p>
          <p className="barcode">Barcode: {product.barcode}</p>

          {product.description && (
            <div className="section">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          {product.nutritionFacts && (
            <div className="section">
              <h3>Nutrition Facts (per 100g)</h3>
              <div className="nutrition-grid">
                {product.nutritionFacts.calories && (
                  <div className="nutrition-item">
                    <span className="label">Calories</span>
                    <span className="value">{product.nutritionFacts.calories} kcal</span>
                  </div>
                )}
                {product.nutritionFacts.protein && (
                  <div className="nutrition-item">
                    <span className="label">Protein</span>
                    <span className="value">{product.nutritionFacts.protein}g</span>
                  </div>
                )}
                {product.nutritionFacts.fat && (
                  <div className="nutrition-item">
                    <span className="label">Fat</span>
                    <span className="value">{product.nutritionFacts.fat}g</span>
                  </div>
                )}
                {product.nutritionFacts.carbs && (
                  <div className="nutrition-item">
                    <span className="label">Carbs</span>
                    <span className="value">{product.nutritionFacts.carbs}g</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {product.ingredients && (
            <div className="section">
              <h3>Ingredients</h3>
              <p>{product.ingredients}</p>
            </div>
          )}

          {product.allergens && (
            <div className="section warning">
              <h3>⚠️ Allergens</h3>
              <p>{product.allergens}</p>
            </div>
          )}

          {product.retailers && product.retailers.length > 0 && (
            <div className="section">
              <h3>Where to Buy</h3>
              <ul className="retailers-list">
                {product.retailers.map((retailer, idx) => (
                  <li key={idx}>{retailer}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            className={`like-button ${isLiked ? 'liked' : ''}`}
            onClick={handleLikeClick}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : isLiked ? '❤️ Liked' : '🤍 Like'}
          </button>

          {/* Reviews Section */}
          {user && profile && (
            <div className="reviews-section">
              <ReviewForm
                productId={product.id}
                userId={user.uid}
                userName={profile.displayName || 'Anonymous'}
                userPhotoUrl={profile.photoURL}
                onReviewSubmitted={handleReviewSubmitted}
              />

              <ReviewsList
                key={reviewsKey}
                productId={product.id}
                userId={user.uid}
                onReviewDeleted={handleReviewSubmitted}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
