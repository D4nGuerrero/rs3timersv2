import { X } from 'lucide-react'
import './SettingsPanel.css'

export default function SettingsPanel({ onClose, onClearAll }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal settings-modal">
        <div className="modal-header">
          <h3>Settings</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="settings-section">
            <h4>Data</h4>
            <p>All timers are stored locally in your browser. Nothing is sent to any server.</p>
            <button className="btn-danger" onClick={() => {
              if (confirm('Delete ALL timers? This cannot be undone.')) {
                onClearAll()
                onClose()
              }
            }}>
              Clear All Timers
            </button>
          </div>
          <div className="settings-section">
            <h4>About</h4>
            <p>Danny's Timers — a simple countdown timer app. Built with Vite + React.</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-save" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
