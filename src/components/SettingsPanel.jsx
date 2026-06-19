import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import {
  getNotificationPermission,
  isNotificationSupported,
  requestNotificationPermission,
  showTestNotification,
} from '../lib/notificationService';
import { isServiceWorkerSupported } from '../lib/serviceWorkerRegistration';
import './SettingsPanel.css';
import './EditModal.css';
import Rain from './Rain';
import AuthButton from './AuthButton';
import fallesi from '/public/fallesi.png';
import fallesiRs from '/public/fallesi_rs.png';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPanel({ onClose, onClearAll, user, onLogout, onToast }) {
  const { theme, setTheme } = useTheme();
  const [clearing, setClearing] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(() =>
    getNotificationPermission(),
  );
  const [requestingPermission, setRequestingPermission] = useState(false);
  const fallesiImage = theme === 'runescape' ? fallesiRs : fallesi;
  const notificationsSupported = isNotificationSupported();
  const serviceWorkerSupported = isServiceWorkerSupported();
  const notificationStatus =
    !notificationsSupported
      ? { tone: 'muted', label: 'Unsupported' }
      : notificationPermission === 'granted'
        ? { tone: 'ok', label: 'Enabled' }
        : notificationPermission === 'denied'
          ? { tone: 'warn', label: 'Blocked' }
          : { tone: 'muted', label: 'Not enabled' };

  async function handleEnableNotifications() {
    setRequestingPermission(true);
    try {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        onToast?.('Notifications enabled. Turn on the bell on any timer to get alerts.');
      } else if (permission === 'denied') {
        onToast?.('Notifications blocked. Enable them in your browser site settings.');
      } else {
        onToast?.('Permission not granted. Look for the browser prompt near the address bar.');
      }
    } finally {
      setRequestingPermission(false);
    }
  }

  async function handleTestNotification() {
    if (await showTestNotification()) {
      onToast?.('Test notification sent. Try switching tabs to confirm background alerts.');
    } else {
      onToast?.('Could not send test notification. Check browser permissions.');
    }
  }

  async function handleClearAll() {
    setClearing(true);
    try {
      const cleared = await onClearAll();
      if (cleared) {
        setConfirmClearOpen(false);
        onClose();
      }
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="settings-screen">
      <div className="settings-body">
          <div className="settings-section">
            <h4>Notifications</h4>
            <p>
              Status:{' '}
              <span className={`settings-inline-status tone-${notificationStatus.tone}`}>
                {notificationStatus.label}
              </span>
            </p>

            {!notificationsSupported ? (
              <p>Your browser does not support notifications.</p>
            ) : notificationPermission === 'granted' ? (
              <>
                <p>
                  Notifications are enabled. Turn on the bell on any timer you
                  want alerts for.
                </p>
                <div className="settings-help-list">
                  <p>• Background tab: should notify normally.</p>
                  <p>• Browser or app reopened later: missed timers should notify when the page wakes up.</p>
                  <p>• Fully closed browser at the exact timer end is not guaranteed without web push.</p>
                  {!serviceWorkerSupported && (
                    <p>• This browser is missing service worker support, so background alerts may be limited.</p>
                  )}
                </div>
                <button type="button" className="btn-save" onClick={handleTestNotification}>
                  Send test notification
                </button>
              </>
            ) : notificationPermission === 'denied' ? (
              <>
                <p>
                  Notifications are blocked. Re-enable them in your browser site
                  settings, then refresh this page.
                </p>
                <div className="settings-help-list">
                  <p>• Chrome/Edge: click the lock or tune icon in the address bar.</p>
                  <p>• Set Notifications to Allow for this site.</p>
                  <p>• If alerts still do nothing, also verify Windows notifications are enabled for your browser.</p>
                </div>
              </>
            ) : (
              <>
                <p>
                  First allow browser notifications here. After that, turn on the
                  bell on any individual timer you care about.
                </p>
                <div className="settings-help-list">
                  <p>• Your browser may show a popup.</p>
                  <p>• If not, look for the notification icon near the address bar.</p>
                </div>
                <button
                  type="button"
                  className="btn-save"
                  disabled={requestingPermission}
                  onClick={handleEnableNotifications}
                >
                  {requestingPermission ? 'Waiting for browser...' : 'Enable Notifications'}
                </button>
              </>
            )}
          </div>
          <div className="settings-section">
            <h4>Data</h4>
            <p>
              Timers are stored in Supabase. You must be signed in to create or
              change them.
            </p>
            <button
              className="btn-danger"
              disabled={clearing}
              onClick={() => setConfirmClearOpen(true)}
            >
              {clearing ? 'Deleting...' : 'Clear All Timers'}
            </button>
          </div>
          <div className="settings-section">
            <h4>Theme</h4>
            <div className="theme-switcher">
              <button
                className={`theme-btn${theme === 'default' ? ' active' : ''}`}
                onClick={() => setTheme('default')}
              >
                Default
              </button>
              <button
                className={`theme-btn${theme === 'runescape' ? ' active' : ''}`}
                onClick={() => setTheme('runescape')}
              >
                RuneScape
              </button>
              <button
                className={`theme-btn${theme === 'synthwave' ? ' active' : ''}`}
                onClick={() => setTheme('synthwave')}
              >
                Synthwave
              </button>
              <button
                className={`theme-btn${theme === 'dark' ? ' active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                Dark
              </button>
            </div>
          </div>
          <div className="settings-section">
            <h4>About</h4>
            <p>
              Danny's Timers — a simple countdown timer app.
            </p>
          </div>

          <div className="settings-section" style={{ position: 'relative' }}>
            <h4
              //  center text
              style={{
                textAlign: 'center',
                marginBottom: '10px',
              }}
            >
              Fallesi Productions
            </h4>
            <p>
              <span className="settings-fallesi-art" aria-hidden="true">
                <img
                  src={fallesiImage}
                  alt="Fallesi Productions"
                  className="settings-fallesi-image"
                />
              </span>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '150px',
                  marginTop: '20px',
                  overflow: 'hidden',
                }}
              >
                <Rain />
              </div>
            </p>
          </div>
          <div className="settings-section account-section">
            <h4>Account</h4>
            <AuthButton user={user} onLogout={onLogout} />
          </div>
      </div>

      {confirmClearOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !clearing) {
              setConfirmClearOpen(false);
            }
          }}
        >
          <div className="modal settings-clear-modal" role="dialog" aria-modal="true" aria-labelledby="clear-all-title">
            <div className="modal-header">
              <div className="modal-header-copy">
                <h3 id="clear-all-title">Clear all timers?</h3>
                <p className="modal-subtitle">
                  This removes every timer from your account and cannot be undone.
                </p>
              </div>
              <button
                type="button"
                className="modal-close"
                aria-label="Close clear all dialog"
                onClick={() => setConfirmClearOpen(false)}
                disabled={clearing}
              >
                {theme === 'runescape' ? <span style={{ display: 'block', width: 16, height: 16 }}></span> : <X size={18} />}
              </button>
            </div>

            <div className="modal-body">
              <div className="settings-clear-warning">
                <div className="settings-clear-icon">
                  <AlertTriangle size={18} />
                </div>
                <div className="settings-clear-copy">
                  <strong>This is permanent.</strong>
                  <span>
                    Hidden, active, and paused timers will all be deleted.
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setConfirmClearOpen(false)}
                disabled={clearing}
              >
                Keep Timers
              </button>
              <button
                type="button"
                className="btn-save settings-clear-confirm"
                onClick={handleClearAll}
                disabled={clearing}
              >
                {clearing ? 'Deleting...' : 'Yes, Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
