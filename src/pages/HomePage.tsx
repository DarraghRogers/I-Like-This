import type { FC } from 'react';
import { useAuthStore } from '../stores/authStore';
import { logout } from '../config/auth';
import { useState, useCallback } from 'react';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { ProductDetails } from '../components/ProductDetails';
import { MyLikes } from '../components/MyLikes';
import { Discover } from '../components/Discover';
import { Groups } from '../components/Groups';
import { NotificationBell } from '../components/NotificationBell';
import { searchProductByBarcode } from '../services/productService';
import { saveProduct, getProductByBarcode } from '../services/firestoreService';
import type { Product } from '../types';
import '../styles/HomePage.css';

interface DebugLog {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'warn';
}

export const HomePage: FC = () => {
  const { profile, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('discover');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  const addLog = useCallback((message: string, type: 'info' | 'error' | 'warn' = 'info') => {
    const log: DebugLog = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    };
    setDebugLogs(prev => [...prev, log].slice(-10));
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const handleScan = useCallback(async (barcode: string) => {
    setIsLoadingProduct(true);
    setScanError(null);
    
    try {
      addLog(`Scanned: ${barcode}`, 'info');
      
      const cleanBarcode = barcode.trim();
      addLog(`Cleaned: ${cleanBarcode}`, 'info');
      
      addLog('Checking database...', 'info');
      let product = await getProductByBarcode(cleanBarcode);
      
      if (product) {
        addLog('Found in database!', 'info');
      } else {
        addLog('Fetching from Open Food Facts...', 'info');
        product = await searchProductByBarcode(cleanBarcode);
        
        if (!product) {
          const msg = 'Product not found. Please try another barcode.';
          addLog(msg, 'error');
          setScanError(msg);
          setIsLoadingProduct(false);
          return;
        }
        
        addLog('Found on Open Food Facts!', 'info');
        
        if (user) {
          addLog('Saving to database...', 'info');
          product.createdBy = user.uid;
          const productId = await saveProduct(product);
          product.id = productId;
          addLog('Saved successfully!', 'info');
        }
      }
      
      addLog('Showing product details...', 'info');
      setSelectedProduct(product);
      setIsScannerOpen(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`Error: ${errorMsg}`, 'error');
      console.error('Error scanning product:', error);
      setScanError('Error scanning barcode. Please try again.');
    } finally {
      setIsLoadingProduct(false);
    }
  }, [user, addLog]);

  return (
    <div className="home-container">
      <header className="app-header">
        <h1>👍 I Like This!</h1>
        <div className="user-info">
          {profile?.photoURL && (
            <img src={profile.photoURL} alt={profile.displayName} className="profile-pic" />
          )}
          <span>{profile?.displayName}</span>
          {user && <NotificationBell userId={user.uid} />}
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </header>

      <nav className="tabs">
        <button 
          className={`tab ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          🔍 Discover
        </button>
        <button 
          className={`tab ${activeTab === 'scanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('scanner')}
        >
          📱 Scanner
        </button>
        <button 
          className={`tab ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked')}
        >
          ❤️ My Likes
        </button>
        <button 
          className={`tab ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          👥 Groups
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'discover' && (
          <section className="tab-content">
            <h2>🔍 Discover</h2>
            <Discover onProductClick={setSelectedProduct} />
          </section>
        )}

        {activeTab === 'scanner' && (
          <section className="tab-content">
            <h2>📱 Barcode Scanner</h2>
            
            {!isScannerOpen ? (
              <button 
                className="start-scan-button"
                onClick={() => setIsScannerOpen(true)}
              >
                Start Scanning
              </button>
            ) : (
              <>
                <BarcodeScanner 
                  isScanning={isScannerOpen} 
                  onScan={handleScan}
                />
                {isLoadingProduct && (
                  <p className="loading-text">Loading product details...</p>
                )}
                {scanError && (
                  <div className="error-message">{scanError}</div>
                )}
                <button 
                  className="stop-scan-button"
                  onClick={() => {
                    setIsScannerOpen(false);
                    setScanError(null);
                  }}
                >
                  Stop Scanning
                </button>
              </>
            )}
          </section>
        )}

        {activeTab === 'liked' && (
          <section className="tab-content">
            <h2>❤️ My Liked Items</h2>
            {user && <MyLikes userId={user.uid} onProductClick={setSelectedProduct} />}
          </section>
        )}

        {activeTab === 'groups' && (
          <section className="tab-content">
            <h2>👥 Groups</h2>
            {user && (
              <Groups
                userId={user.uid}
                userName={profile?.displayName || 'User'}
                userPhoto={profile?.photoURL}
                onProductClick={setSelectedProduct}
              />
            )}
          </section>
        )}
      </main>

      <ProductDetails 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)}
      />

      {/* Debug modal */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 15px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          zIndex: 100,
          fontSize: '0.9rem',
        }}
      >
        🐛 Debug
      </button>

      {showDebug && (
        <div
          style={{
            position: 'fixed',
            bottom: '70px',
            right: '20px',
            width: '300px',
            maxHeight: '400px',
            backgroundColor: '#1a1a1a',
            border: '2px solid #2196F3',
            borderRadius: '10px',
            padding: '15px',
            color: '#fff',
            fontSize: '0.85rem',
            overflowY: 'auto',
            zIndex: 100,
            fontFamily: 'monospace',
          }}
        >
          <div style={{ marginBottom: '10px', fontWeight: 'bold', borderBottom: '1px solid #2196F3', paddingBottom: '5px' }}>
            Debug Logs
          </div>
          {debugLogs.length === 0 ? (
            <div style={{ color: '#888' }}>No logs yet...</div>
          ) : (
            debugLogs.map((log, i) => (
              <div
                key={i}
                style={{
                  marginBottom: '8px',
                  color: log.type === 'error' ? '#ff6b6b' : log.type === 'warn' ? '#ffd700' : '#4CAF50',
                }}
              >
                <span style={{ color: '#888' }}>[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
          <button
            onClick={() => setDebugLogs([])}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Clear Logs
          </button>
        </div>
      )}
    </div>
  );
};
