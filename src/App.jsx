import { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import TimerGrid from './components/TimerGrid';
import CreateTimerBar from './components/CreateTimerBar';
import MobileCreateTimerSheet from './components/MobileCreateTimerSheet';
import SettingsPanel from './components/SettingsPanel';
import Toast from './components/Toast';
import { supabase } from './lib/supabase';
import Rain from './components/Rain';
import {
  fetchTimers,
  saveTimer,
  deleteTimer as deleteTimerFromDb,
  saveAllTimers,
} from './lib/timerService';
import './App.css';
import './styles/themes.css';

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const STORAGE_KEY = 'dannys-timers';
const THEME_KEY = 'danny-timers-theme';

function loadTimers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTimers(timers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
}

export default function App() {
  const [timers, setTimers] = useState(loadTimers);
  const [activeView, setActiveView] = useState('timers');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createTimerOpen, setCreateTimerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'default');
  const toastTimer = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function showToast(message) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, visible: true });
    toastTimer.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }

  function openMobileCreateTimer() {
    setActiveView('timers');
    setCreateTimerOpen(true);
  }

  // Always keep localStorage in sync as a reliable fallback on refresh
  useEffect(() => {
    saveTimers(timers);
  }, [timers]);

  // Logout: clear state immediately; SIGNED_OUT event will also fire if signOut succeeds
  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    // Fallback: clear regardless of whether the API call succeeded
    setUser(null);
    setTimers(loadTimers());
    showToast('Signed out. See you next time! 👋');
  }

  // Auth setup: handle session on load and auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          setUser(session.user);
          try {
            const dbTimers = await fetchTimers(session.user.id);
            setTimers(dbTimers);
          } catch (err) {
            console.error('Failed to load timers from DB:', err);
          }
        }
      } else if (event === 'SIGNED_IN') {
        setUser(session.user);
        try {
          const guestTimers = loadTimers();
          if (guestTimers.length > 0) {
            await saveAllTimers(session.user.id, guestTimers);
            localStorage.removeItem(STORAGE_KEY);
          }
          const dbTimers = await fetchTimers(session.user.id);
          setTimers(dbTimers);
          showToast(
            `Welcome back, ${session.user.user_metadata?.full_name?.split(' ')[0] || 'back'}! 👋`,
          );
        } catch (err) {
          console.error('DB sync on sign-in failed:', err);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setTimers(loadTimers());
        showToast('Signed out. See you next time! 👋');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  function addTimer({ name, days, hours, minutes }) {
    const totalMs = (days * 24 * 60 + hours * 60 + minutes) * 60 * 1000;
    if (!name.trim() || totalMs === 0) return false;
    const now = Date.now();
    const newTimer = {
      id: uid(),
      name: name.trim(),
      totalMs,
      startTime: now,
      pausedAt: null,
      hidden: false,
      createdAt: now,
    };
    setTimers((prev) => [newTimer, ...prev]);
    if (user)
      saveTimer(user.id, newTimer).catch((err) =>
        console.error('saveTimer failed:', err),
      );
    return true;
  }

  function updateTimer(id, changes) {
    const current = timers.find((t) => t.id === id);
    if (!current) return;
    const updated = { ...current, ...changes };
    setTimers((prev) => prev.map((t) => (t.id === id ? updated : t)));
    if (user)
      saveTimer(user.id, updated).catch((err) =>
        console.error('saveTimer failed:', err),
      );
  }

  function deleteTimer(id) {
    setTimers((prev) => prev.filter((t) => t.id !== id));
    if (user)
      deleteTimerFromDb(user.id, id).catch((err) =>
        console.error('deleteTimer failed:', err),
      );
  }

  function pauseTimer(id) {
    const t = timers.find((t) => t.id === id);
    if (!t) return;
    const updated =
      t.pausedAt !== null
        ? {
            ...t,
            startTime: t.startTime + (Date.now() - t.pausedAt),
            pausedAt: null,
          }
        : { ...t, pausedAt: Date.now() };
    setTimers((prev) =>
      prev.map((timer) => (timer.id === id ? updated : timer)),
    );
    if (user)
      saveTimer(user.id, updated).catch((err) =>
        console.error('saveTimer failed:', err),
      );
  }

  function resetTimer(id) {
    const t = timers.find((t) => t.id === id);
    if (!t) return;
    const updated = { ...t, startTime: Date.now(), pausedAt: null };
    setTimers((prev) =>
      prev.map((timer) => (timer.id === id ? updated : timer)),
    );
    if (user)
      saveTimer(user.id, updated).catch((err) =>
        console.error('saveTimer failed:', err),
      );
  }

  function hideTimer(id) {
    const t = timers.find((t) => t.id === id);
    if (!t) return;
    const updated = { ...t, hidden: !t.hidden };
    setTimers((prev) =>
      prev.map((timer) => (timer.id === id ? updated : timer)),
    );
    if (user)
      saveTimer(user.id, updated).catch((err) =>
        console.error('saveTimer failed:', err),
      );
  }

  function clearAll() {
    if (user)
      timers.forEach((t) =>
        deleteTimerFromDb(user.id, t.id).catch((err) =>
          console.error('deleteTimer failed:', err),
        ),
      );
    setTimers([]);
  }

  const visibleTimers = timers.filter((t) =>
    activeView === 'timers' ? !t.hidden : t.hidden,
  );

  return (
    <div className="app">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenSettings={() => setSettingsOpen(true)}
        user={user}
        onLogout={handleLogout}
      />
      <main className="main">
        {activeView === 'timers' && (
          <CreateTimerBar onAdd={addTimer} className="inline-create-bar" />
        )}
        <div className="timers-grid-scroll">
          <TimerGrid
            timers={visibleTimers}
            activeView={activeView}
            onPause={pauseTimer}
            onReset={resetTimer}
            onHide={hideTimer}
            onDelete={deleteTimer}
            onUpdate={updateTimer}
          />
        </div>
      </main>
      <MobileNav
        activeView={activeView}
        onTimers={() => setActiveView('timers')}
        onArchive={() => setActiveView('archive')}
        onNewTimer={openMobileCreateTimer}
        onOpenSettings={() => setSettingsOpen(true)}
        settingsOpen={settingsOpen}
      />
      {createTimerOpen && (
        <MobileCreateTimerSheet
          onClose={() => setCreateTimerOpen(false)}
          onAdd={addTimer}
        />
      )}
      {settingsOpen && (
        <SettingsPanel
          onClose={() => setSettingsOpen(false)}
          onClearAll={clearAll}
          user={user}
          onLogout={handleLogout}
          theme={theme}
          setTheme={setTheme}
        />
      )}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
