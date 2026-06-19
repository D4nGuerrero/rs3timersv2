const NOTIFY_PREFS_KEY = 'danny-timers-notify';

export function loadNotifyPrefs() {
  try {
    const raw = localStorage.getItem(NOTIFY_PREFS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (error) {
    console.error('Failed to load notification prefs:', error);
    return {};
  }
}

export function saveNotifyPref(timerId, enabled) {
  const prefs = loadNotifyPrefs();
  if (enabled) {
    prefs[timerId] = true;
  } else {
    delete prefs[timerId];
  }
  try {
    localStorage.setItem(NOTIFY_PREFS_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error('Failed to save notification pref:', error);
  }
}

export function applyNotifyPrefs(timers) {
  const prefs = loadNotifyPrefs();
  return timers.map((timer) => ({
    ...timer,
    notify: Boolean(prefs[timer.id]),
  }));
}

export function pruneNotifyPrefs(activeTimerIds) {
  const prefs = loadNotifyPrefs();
  const activeIds = new Set(activeTimerIds);
  let changed = false;

  for (const timerId of Object.keys(prefs)) {
    if (!activeIds.has(timerId)) {
      delete prefs[timerId];
      changed = true;
    }
  }

  if (changed) {
    try {
      localStorage.setItem(NOTIFY_PREFS_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error('Failed to prune notification prefs:', error);
    }
  }
}