import {
  Archive,
  Plus,
  Settings,
  Timer,
} from 'lucide-react';

import gearIcon from '../assets/themes/runescape/gear.png';
import timerIcon from '../assets/themes/runescape/clock.png';
import archiveIcon from '../assets/themes/runescape/archive.png';
import menuIcon from '../assets/themes/runescape/menu.png';
import menuIconHover from '../assets/themes/runescape/menu_selected.png';
import { useTheme } from '../context/ThemeContext';

export function useThemeIcons() {
  const { theme } = useTheme();
  if (theme === 'runescape') {
    return {
      Timer: () => <img src={timerIcon} className="pixel-icon" />,
      Settings: () => <img src={gearIcon} className="pixel-icon" />,
      Archive: () => <img src={archiveIcon} className="pixel-icon" />,
      Menu: () => <img src={menuIcon} className="pixel-icon menu-icon" />,
      MenuHover: () => <img src={menuIconHover} className="pixel-icon menu-icon" />,
    };
  }

  return {
    Timer: (props) => <Timer {...props} />,
    Archive: (props) => <Archive {...props} />,
    Settings: (props) => <Settings {...props} />,
    Plus: (props) => <Plus {...props} />,
    Menu: (props) => <MoreVertical {...props} />,
  };
}