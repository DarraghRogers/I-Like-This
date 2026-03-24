import { useEffect, useState, useCallback } from 'react';
import type { FC } from 'react';
import {
  getNotificationStatus,
  requestNotificationPermission,
  removeToken,
  isUserSubscribed,
  setupForegroundNotifications,
} from '../services/notificationService';
import type { NotificationStatus } from '../services/notificationService';
import '../styles/NotificationBell.css';

interface NotificationBellProps {
  userId: string;
}

export const NotificationBell: FC<NotificationBellProps> = ({ userId }) => {
  const [status, setStatus] = useState<NotificationStatus>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);

  const checkStatus = useCallback(async () => {
    const s = await getNotificationStatus();
    setStatus(s);
    if (s === 'granted') {
      const sub = await isUserSubscribed(userId);
      setSubscribed(sub);
    }
  }, [userId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    setupForegroundNotifications((title, body) => {
      setToast({ title, body });
      setTimeout(() => setToast(null), 5000);
    }).then(unsub => {
      cleanup = unsub;
    });

    return () => { cleanup?.(); };
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    const success = await requestNotificationPermission(userId);
    if (success) {
      setSubscribed(true);
      setStatus('granted');
    } else {
      const s = await getNotificationStatus();
      setStatus(s);
    }
    setLoading(false);
    setShowMenu(false);
  };

  const handleDisable = async () => {
    setLoading(true);
    await removeToken(userId);
    setSubscribed(false);
    setLoading(false);
    setShowMenu(false);
  };

  if (status === 'unsupported') return null;

  return (
    <>
      <div className="notif-bell-wrapper">
        <button
          className={`notif-bell-btn ${subscribed ? 'active' : ''}`}
          onClick={() => setShowMenu(!showMenu)}
          title="Notification settings"
        >
          {subscribed ? '🔔' : '🔕'}
        </button>

        {showMenu && (
          <div className="notif-bell-menu">
            <div className="notif-bell-menu-header">Notifications</div>

            {status === 'denied' ? (
              <div className="notif-bell-menu-body">
                <p className="notif-bell-denied">
                  Notifications are blocked. Please enable them in your browser settings.
                </p>
              </div>
            ) : subscribed ? (
              <div className="notif-bell-menu-body">
                <p className="notif-bell-status-text">
                  ✅ Notifications are enabled
                </p>
                <p className="notif-bell-status-hint">
                  You'll be notified when someone adds a product, writes a review, or likes something.
                </p>
                <button
                  className="notif-bell-action-btn disable"
                  onClick={handleDisable}
                  disabled={loading}
                >
                  {loading ? 'Turning off...' : 'Turn Off Notifications'}
                </button>
              </div>
            ) : (
              <div className="notif-bell-menu-body">
                <p className="notif-bell-status-text">
                  Stay in the loop when the community is active
                </p>
                <p className="notif-bell-status-hint">
                  Get notified about new products, reviews, and likes.
                </p>
                <button
                  className="notif-bell-action-btn enable"
                  onClick={handleEnable}
                  disabled={loading}
                >
                  {loading ? 'Enabling...' : 'Enable Notifications'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* In-app toast for foreground notifications */}
      {toast && (
        <div className="notif-toast" onClick={() => setToast(null)}>
          <div className="notif-toast-title">{toast.title}</div>
          <div className="notif-toast-body">{toast.body}</div>
        </div>
      )}
    </>
  );
};
