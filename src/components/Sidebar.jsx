import { Timer, Archive, Settings } from 'lucide-react'
import AuthButton from './AuthButton'
import './Sidebar.css'
import { useThemeIcons } from '../hooks/useThemeIcons';

export default function Sidebar({
  activeView,
  setActiveView,
  user,
  onLogout,
}) {
    const Icons = useThemeIcons();
  
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
          <Icons.Timer size={18} />
          Timers
        </button>
        <button
          className={`nav-item ${activeView === 'archive' ? 'active' : ''}`}
          onClick={() => setActiveView('archive')}
        >
          <Icons.Archive size={18} />
          Archive
        </button>
        <button className={`nav-item ${activeView === 'settings' ? 'active' : ''}`} onClick={() => setActiveView('settings')}>
          <Icons.Settings size={18} />
          Settings
        </button>
      </nav>

      <div className="sidebar-account">
        <AuthButton user={user} onLogout={onLogout} />
      </div>
    </aside>
  )
}
