import {
  Archive,
  Plus,
  Settings,
  Timer,
  MoreVertical,
} from 'lucide-react';

import gearIcon from '../assets/themes/runescape/gear.png';
import timerIcon from '../assets/themes/runescape/clock.png';
import archiveIcon from '../assets/themes/runescape/archive.png';
import menuIcon from '../assets/themes/runescape/menu.png';
import menuIconHover from '../assets/themes/runescape/menu_selected.png';
import { useTheme } from '../context/ThemeContext';

// Stable component references — defined outside the hook so React
// doesn't remount them on every render (which causes jiggle/flash).
const RSTimer    = () => <img src={timerIcon}    className="pixel-icon" alt="" />;
const RSSettings = () => <img src={gearIcon}     className="pixel-icon" alt="" />;
const RSArchive  = () => <img src={archiveIcon}  className="pixel-icon" alt="" />;
const RSMenu     = () => <img src={menuIcon}     className="pixel-icon menu-icon" alt="" />;
const RSMenuHover= () => <img src={menuIconHover} className="pixel-icon menu-icon" alt="" />;

const RS_ICONS = {
  Timer: RSTimer,
  Settings: RSSettings,
  Archive: RSArchive,
  Menu: RSMenu,
  MenuHover: RSMenuHover,
};

const DEFAULT_ICONS = {
  Timer:   (props) => <Timer {...props} />,
  Archive: (props) => <Archive {...props} />,
  Settings:(props) => <Settings {...props} />,
  Plus:    (props) => <Plus {...props} />,
  Menu:    (props) => <MoreVertical {...props} />,
};

export function useThemeIcons() {
  const { theme } = useTheme();
  return theme === 'runescape' ? RS_ICONS : DEFAULT_ICONS;
}