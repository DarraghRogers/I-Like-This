import { useEffect, useState, useMemo } from 'react';
import type { FC } from 'react';
import { getProductsWithStats, searchProducts } from '../services/firestoreService';
import type { ProductWithStats } from '../services/firestoreService';
import type { Product } from '../types';
import '../styles/Discover.css';

interface DiscoverProps {
  onProductClick: (product: Product) => void;
}

type SortMode = 'trending' | 'recent' | 'top-rated';

export const Discover: FC<DiscoverProps> = ({ onProductClick }) => {
  const [products, setProducts] = useState<ProductWithStats[]>([]);
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('trending');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductsWithStats();
        setProducts(data);
      } catch {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const debounce = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchProducts(searchQuery.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortMode) {
      case 'trending':
        return sorted.sort((a, b) => b.likeCount - a.likeCount);
      case 'recent':
        return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'top-rated':
        return sorted.sort((a, b) => {
          if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
          return b.reviewCount - a.reviewCount;
        });
    }
  }, [products, sortMode]);

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;
    const empty = 5 - full - (hasHalf ? 1 : 0);
    return (
      <span className="discover-stars">
        {'★'.repeat(full)}
        {hasHalf && '½'}
        {'☆'.repeat(empty)}
      </span>
    );
  };

  const renderProductCard = (product: ProductWithStats | Product) => {
    const stats = 'likeCount' in product ? product as ProductWithStats : null;
    return (
      <div
        key={product.id}
        className="discover-card"
        onClick={() => onProductClick(product)}
      >
        <div className="discover-card-image-wrapper">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="discover-card-image"
            />
          ) : (
            <div className="discover-card-no-image">📦</div>
          )}
          {stats && stats.likeCount > 0 && (
            <span className="discover-card-badge">❤️ {stats.likeCount}</span>
          )}
        </div>
        <div className="discover-card-content">
          <h3 className="discover-card-name">{product.name}</h3>
          <p className="discover-card-brand">{product.brand}</p>
          {stats && stats.avgRating > 0 && (
            <div className="discover-card-rating">
              {renderStars(stats.avgRating)}
              <span className="discover-card-rating-text">
                {stats.avgRating} ({stats.reviewCount})
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="discover-loading">
        <div className="discover-spinner" />
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return <div className="discover-error">{error}</div>;
  }

  return (
    <div className="discover-container">
      <div className="discover-search-bar">
        <span className="discover-search-icon">🔍</span>
        <input
          type="text"
          className="discover-search-input"
          placeholder="Search products by name, brand, or barcode..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="discover-search-clear"
            onClick={() => setSearchQuery('')}
          >
            ✕
          </button>
        )}
      </div>

      {searchQuery.trim() ? (
        <div className="discover-section">
          <h3 className="discover-section-title">
            {searching
              ? 'Searching...'
              : `Results for "${searchQuery}" (${searchResults?.length ?? 0})`}
          </h3>
          {!searching && searchResults && searchResults.length === 0 && (
            <div className="discover-empty">
              <div className="discover-empty-icon">🔎</div>
              <p>No products found matching "{searchQuery}"</p>
              <p className="discover-empty-hint">Try a different search term or scan a new product</p>
            </div>
          )}
          {searchResults && searchResults.length > 0 && (
            <div className="discover-grid">
              {searchResults.map(p => {
                const withStats = products.find(ps => ps.id === p.id);
                return renderProductCard(withStats || p);
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="discover-sort-bar">
            <button
              className={`discover-sort-btn ${sortMode === 'trending' ? 'active' : ''}`}
              onClick={() => setSortMode('trending')}
            >
              🔥 Trending
            </button>
            <button
              className={`discover-sort-btn ${sortMode === 'recent' ? 'active' : ''}`}
              onClick={() => setSortMode('recent')}
            >
              🆕 Recent
            </button>
            <button
              className={`discover-sort-btn ${sortMode === 'top-rated' ? 'active' : ''}`}
              onClick={() => setSortMode('top-rated')}
            >
              ⭐ Top Rated
            </button>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="discover-empty">
              <div className="discover-empty-icon">🌎</div>
              <p>No products discovered yet!</p>
              <p className="discover-empty-hint">
                Be the first — scan a product barcode to add it to the community
              </p>
            </div>
          ) : (
            <div className="discover-grid">
              {sortedProducts.map(renderProductCard)}
            </div>
          )}
        </>
      )}
    </div>
  );
};
