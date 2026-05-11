import { Archive, Plus, Settings, Timer } from 'lucide-react';
import { useThemeIcons } from '../hooks/useThemeIcons';

import './MobileNav.css';

export default function MobileNav({
  activeView,
  onTimers,
  onArchive,
  onNewTimer,
  onOpenSettings,
  settingsOpen,
  user,
}) {

  const Icons = useThemeIcons();

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <button
        className="mobile-nav-add"
        onClick={onNewTimer}
        aria-label="Add timer"
      >
        <Plus size={26} />
      </button>
      <button
        className={`mobile-nav-item ${activeView === 'timers' ? 'active' : ''}`}
        onClick={onTimers}
      >
        <Icons.Timer size={20} />
        <span>Timers</span>
      </button>
      <button
        className={`mobile-nav-item ${activeView === 'archive' ? 'active' : ''}`}
        onClick={onArchive}
      >
        <Icons.Archive size={20} />
        <span>Archive</span>
      </button>
      <button
        className={`mobile-nav-item ${settingsOpen ? 'active' : ''}`}
        onClick={onOpenSettings}
      >
        <div className="nav-settings-icon-wrap">
         <Icons.Settings size={20} />
          <span className={`mobile-auth-dot ${user ? 'signed-in' : 'signed-out'}`} aria-hidden="true" />
        </div>
        <span>Settings</span>
      </button>
    </nav>
  );
}
