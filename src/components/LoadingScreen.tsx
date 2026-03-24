import type { FC } from 'react';
import '../styles/LoadingScreen.css';

export const LoadingScreen: FC = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">👍</div>
        <h1 className="loading-title">I Like This!</h1>
        
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
        
        <p className="loading-text">Initializing app...</p>
        <p className="loading-subtitle">Connecting you with your friends</p>
      </div>
    </div>
  );
};
