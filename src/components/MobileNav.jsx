import { Archive, Plus, Settings, Timer } from 'lucide-react'
import './MobileNav.css'

export default function MobileNav({
  activeView,
  onTimers,
  onArchive,
  onNewTimer,
  onOpenSettings,
  settingsOpen,
}) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <button
        className={`mobile-nav-item ${activeView === 'timers' ? 'active' : ''}`}
        onClick={onTimers}
      >
        <Timer size={20} />
        <span>Timers</span>
      </button>
      <button
        className={`mobile-nav-item ${activeView === 'archive' ? 'active' : ''}`}
        onClick={onArchive}
      >
        <Archive size={20} />
        <span>Archive</span>
      </button>
      <button className="mobile-nav-add" onClick={onNewTimer} aria-label="Add timer">
        <Plus size={26} />
      </button>
      <button
        className={`mobile-nav-item ${settingsOpen ? 'active' : ''}`}
        onClick={onOpenSettings}
      >
        <Settings size={20} />
        <span>Settings</span>
      </button>
    </nav>
  )
}
