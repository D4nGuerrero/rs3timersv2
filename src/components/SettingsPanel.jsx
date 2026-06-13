import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './SettingsPanel.css';
import './EditModal.css';
import Rain from './Rain';
import AuthButton from './AuthButton';
import fallesi from '/public/fallesi.png';
import fallesiRs from '/public/fallesi_rs.png';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPanel({ onClose, onClearAll, user, onLogout }) {
  const { theme, setTheme } = useTheme();
  const [clearing, setClearing] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const fallesiImage = theme === 'runescape' ? fallesiRs : fallesi;

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
