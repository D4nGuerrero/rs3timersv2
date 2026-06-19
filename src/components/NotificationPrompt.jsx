import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  getNotificationPermission,
  requestNotificationPermission,
} from '../lib/notificationService';
import './EditModal.css';

export default function NotificationPrompt({ timerName, onConfirm, onClose }) {
  const { theme } = useTheme();
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState('');

  async function handleAllow() {
    setError('');
    setRequesting(true);
    try {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        onConfirm();
        return;
      }

      if (permission === 'denied') {
        setError(
          'Notifications were blocked. Open your browser site settings and allow notifications for this page, then try again.',
        );
        return;
      }

      setError(
        'Permission was not granted. Look for the notification icon near your address bar and choose Allow.',
      );
    } finally {
      setRequesting(false);
    }
  }

  const alreadyDenied = getNotificationPermission() === 'denied';

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (!requesting && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal notification-prompt"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-prompt-title"
      >
        <div className="modal-header">
          <div className="modal-header-copy">
            <h3 id="notification-prompt-title">Enable notifications</h3>
            <p className="modal-subtitle">
              Get alerted when &ldquo;{timerName}&rdquo; finishes.
            </p>
          </div>
          <button
            type="button"
            className="modal-close"
            aria-label="Close"
            onClick={onClose}
            disabled={requesting}
          >
            {theme === 'runescape' ? (
              <span style={{ display: 'block', width: 16, height: 16 }} />
            ) : (
              <X size={18} />
            )}
          </button>
        </div>

        <div className="modal-body">
          <div className="notification-prompt-steps">
            <div className="notification-prompt-step">
              <span className="notification-prompt-step-num">1</span>
              <p>Click <strong>Allow notifications</strong> below.</p>
            </div>
            <div className="notification-prompt-step">
              <span className="notification-prompt-step-num">2</span>
              <p>
                Your browser will ask for permission — look for a popup or an icon
                next to the address bar and choose <strong>Allow</strong>.
              </p>
            </div>
            <div className="notification-prompt-step">
              <span className="notification-prompt-step-num">3</span>
              <p>
                Alerts work in the background while your browser is open. If you
                come back later, missed timers notify you on open.
              </p>
            </div>
          </div>

          {error && (
            <div className="notification-prompt-error" role="alert">
              {error}
            </div>
          )}

          {alreadyDenied && !error && (
            <div className="notification-prompt-error" role="status">
              Notifications are currently blocked for this site. Enable them in
              your browser settings, then try again.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose} disabled={requesting}>
            Not now
          </button>
          <button
            type="button"
            className="btn-save notification-prompt-allow"
            onClick={handleAllow}
            disabled={requesting || alreadyDenied}
          >
            <Bell size={15} />
            {requesting ? 'Waiting for browser...' : 'Allow notifications'}
          </button>
        </div>
      </div>
    </div>
  );
}