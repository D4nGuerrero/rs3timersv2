import { useState } from 'react';
import './SettingsPanel.css';
import Rain from './Rain';
import AuthButton from './AuthButton';
import fallesi from '/public/fallesi.png';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPanel({ onClose, onClearAll, user, onLogout }) {
  const { theme, setTheme } = useTheme();
  const [clearing, setClearing] = useState(false);

  async function handleClearAll() {
    if (!confirm('Delete ALL timers? This cannot be undone.')) return;
    setClearing(true);
    try {
      const cleared = await onClearAll();
      if (cleared) onClose();
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
              onClick={handleClearAll}
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
            </div>
          </div>
          <div className="settings-section">
            <h4>About</h4>
            <p>
              Danny's Timers — a simple countdown timer app. Built with Vite +
              React.
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
              <img
                src={fallesi}
                alt="Fallesi Productions"
                // middle position
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',

                  width: '120px',
                  display: 'block',
                  marginBottom: '10px',
                }}
              />
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
    </div>
  );
}
