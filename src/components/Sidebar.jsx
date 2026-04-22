import { Timer, Archive, Settings } from 'lucide-react'
import AuthButton from './AuthButton'
import './Sidebar.css'

export default function Sidebar({
  activeView,
  setActiveView,
  onOpenSettings,
  user,
  onLogout,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Timer size={20} className="brand-icon" />
        <span>Danny's Timers</span>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeView === 'timers' ? 'active' : ''}`}
          onClick={() => setActiveView('timers')}
        >
          <Timer size={18} />
          Timers
        </button>
        <button
          className={`nav-item ${activeView === 'archive' ? 'active' : ''}`}
          onClick={() => setActiveView('archive')}
        >
          <Archive size={18} />
          Archive
        </button>
        <button className="nav-item" onClick={onOpenSettings}>
          <Settings size={18} />
          Settings
        </button>
      </nav>

      <button className="new-timer-btn" onClick={onOpenSettings}>
        New Timer
      </button>

      <div className="sidebar-account">
        <AuthButton user={user} onLogout={onLogout} />
      </div>
    </aside>
  )
}
