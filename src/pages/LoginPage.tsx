import { useState } from 'react';
import type { FC } from 'react';
import { loginWithGoogle, loginWithGitHub } from '../config/auth';
import '../styles/LoginPage.css';

export const LoginPage: FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGitHub();
    } catch (err) {
      setError('Failed to login with GitHub');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>👍 I Like This!</h1>
        <p className="subtitle">Scan, Share & Rate What You Love</p>

        {error && <div className="error-message">{error}</div>}

        <div className="button-container">
          <button
            className="login-button google"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign in with Google'}
          </button>

          <button
            className="login-button github"
            onClick={handleGitHubLogin}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign in with GitHub'}
          </button>
        </div>

        <p className="info-text">
          Join a community of friends sharing products they love!
        </p>
      </div>
    </div>
  );
};
