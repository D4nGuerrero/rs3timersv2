import { X } from 'lucide-react';
import './SettingsPanel.css';
import Rain from './Rain';
import AuthButton from './AuthButton';
import fallesi from '/public/fallesi.png';

export default function SettingsPanel({ onClose, onClearAll, user, onLogout }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Rain />
      <div className="modal settings-modal">
        <div className="settings-sheet-handle" />
        <div className="modal-header">
          <h3>Settings</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="settings-section">
            <h4>Data</h4>
            <p>
              Guest timers stay in your browser. Sign in to sync timers across
              devices with your account.
            </p>
            <button
              className="btn-danger"
              onClick={() => {
                if (confirm('Delete ALL timers? This cannot be undone.')) {
                  onClearAll();
                  onClose();
                }
              }}
            >
              Clear All Timers
            </button>
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
        <div className="modal-footer">
          <button className="btn-save" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
