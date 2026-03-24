import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { getUserLikedProductsWithDetails, unlikeProduct } from '../services/firestoreService';
import type { Product } from '../types';
import '../styles/MyLikes.css';

interface MyLikesProps {
  userId: string;
  onProductClick: (product: Product) => void;
}

export const MyLikes: FC<MyLikesProps> = ({ userId, onProductClick }) => {
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLikedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const products = await getUserLikedProductsWithDetails(userId);
        setLikedProducts(products);
      } catch (err) {
        console.error('Error fetching liked products:', err);
        setError('Failed to load liked products');
        setLikedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedProducts();
  }, [userId]);

  const handleUnlike = async (productId: string | undefined) => {
    if (!productId) return;
    try {
      await unlikeProduct(userId, productId);
      setLikedProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Error unliking product:', err);
      setError('Failed to unlike product');
    }
  };

  if (loading) {
    return <div className="my-likes-loading">Loading your likes...</div>;
  }

  if (error) {
    return <div className="my-likes-error">{error}</div>;
  }

  if (likedProducts.length === 0) {
    return (
      <div className="my-likes-empty">
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📭</div>
        <p>No liked items yet!</p>
        <p style={{ fontSize: '0.9rem', color: '#888' }}>Scan a barcode to get started</p>
      </div>
    );
  }

  return (
    <div className="my-likes-container">
      <div className="my-likes-grid">
        {likedProducts.map(product => (
          <div key={product.id} className="like-card">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="like-card-image"
                onClick={() => onProductClick(product)}
              />
            )}
            <div className="like-card-content">
              <h3 className="like-card-name">{product.name}</h3>
              <p className="like-card-brand">{product.brand}</p>
              <div className="like-card-actions">
                <button
                  className="like-card-view"
                  onClick={() => onProductClick(product)}
                >
                  View
                </button>
                <button
                  className="like-card-unlike"
                  onClick={() => product.id && handleUnlike(product.id)}
                >
                  ❤️ Unlike
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
