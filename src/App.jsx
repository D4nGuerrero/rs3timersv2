import { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import TimerGrid from './components/TimerGrid';
import CreateTimerBar from './components/CreateTimerBar';
import MobileCreateTimerSheet from './components/MobileCreateTimerSheet';
import SettingsPanel from './components/SettingsPanel';
import Toast from './components/Toast';
import { supabase } from './lib/supabase';
import {
  fetchTimers,
  saveTimer,
  deleteTimer as deleteTimerFromDb,
  deleteAllTimers,
} from './lib/timerService';
import { parseStoredImage } from './lib/presetImages';
import './App.css';
import './styles/themes.css';

const uid = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
        const random = Math.floor(Math.random() * 16);
        const value = character === 'x' ? random : (random & 0x3) | 0x8;
        return value.toString(16);
      });

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AUTH_TIMEOUT_MS = 6000;
const LOCAL_TIMERS_KEY = 'danny-timers-local';

function withTimeout(promise, label, timeoutMs = AUTH_TIMEOUT_MS) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function normalizeTimer(timer) {
  const fallbackCreatedAt = timer?.createdAt ?? timer?.startTime ?? Date.now();
  const parsedStoredImage = parseStoredImage(timer?.imageUrl ?? '');
  return {
    ...timer,
    name: timer?.name ?? '',
    totalMs: Number(timer?.totalMs ?? 0),
    startTime: Number(timer?.startTime ?? Date.now()),
    pausedAt: timer?.pausedAt ?? null,
    hidden: Boolean(timer?.hidden),
    notes: timer?.notes ?? '',
    imageKey: timer?.imageKey ?? parsedStoredImage.imageKey ?? '',
    imageUrl: timer?.imageKey ? '' : parsedStoredImage.imageUrl,
    createdAt: Number.isFinite(Number(timer?.createdAt))
      ? Number(timer.createdAt)
      : fallbackCreatedAt,
    id:
      timer?.id && typeof timer.id === 'string' && UUID_PATTERN.test(timer.id)
        ? timer.id
        : uid(),
  };
}

function loadLocalTimers() {
  try {
    const raw = localStorage.getItem(LOCAL_TIMERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeTimer);
  } catch (error) {
    console.error('Failed to load local timers:', error);
    return [];
  }
}

function saveLocalTimers(timers) {
  try {
    localStorage.setItem(LOCAL_TIMERS_KEY, JSON.stringify(timers));
  } catch (error) {
    console.error('Failed to save local timers:', error);
  }
}

export default function App() {
  const [timers, setTimers] = useState(() => loadLocalTimers());
  const [activeView, setActiveView] = useState('timers');
  const [createTimerOpen, setCreateTimerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ message: '', visible: false });
  const toastTimer = useRef(null);

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

  useEffect(() => {
    saveLocalTimers(timers);
  }, [timers]);

  async function getAuthenticatedUserId() {
    if (user?.id) return user.id;

    const {
      data: { session },
      error: sessionError,
    } = await withTimeout(supabase.auth.getSession(), 'getSession');

    if (sessionError) throw sessionError;
    if (session?.user) {
      setUser(session.user);
      return session.user.id;
    }

    const refreshed = await withTimeout(supabase.auth.refreshSession(), 'refreshSession');
    if (refreshed.error) throw refreshed.error;
    if (refreshed.data.session?.user) {
      setUser(refreshed.data.session.user);
      return refreshed.data.session.user.id;
    }

    const {
      data: { user: sessionUser },
      error,
    } = await withTimeout(supabase.auth.getUser(), 'getUser');

    if (error) throw error;
    return sessionUser?.id ?? null;
  }

  async function persistTimerChange(actionLabel, action) {
    try {
      console.log(`[db] ${actionLabel} requested`);
      const userId = await getAuthenticatedUserId();
      if (!userId) {
        console.warn(`[db] ${actionLabel} skipped: no authenticated user`);
        showToast('Sign in to change timers.');
        return false;
      }
      console.log(`[db] ${actionLabel} start`, { userId });
      await action(userId);
      console.log(`[db] ${actionLabel} success`, { userId });
      return true;
    } catch (err) {
      console.error(`${actionLabel} failed:`, err);
      showToast(`Could not ${actionLabel}. No changes were made.`);
      return false;
    }
  }

  async function handleLogout() {
    try {
      const { error } = await withTimeout(supabase.auth.signOut(), 'signOut');
      if (error) throw error;
      setUser(null);
      setTimers(loadLocalTimers());
      showToast('Signed out. See you next time! 👋');
    } catch (error) {
      console.error('Sign out error:', error);
      showToast('Sign out failed. Please try again.');
    }
  }

  // Auth setup: handle session on load and auth state changes
  useEffect(() => {
    let cancelled = false;

    async function handleSignedIn(session) {
      try {
        const dbTimers = await fetchTimers(session.user.id);
        if (cancelled) return;
        setUser(session.user);
        setTimers(dbTimers.map(normalizeTimer));
        showToast(
          `Welcome back, ${session.user.user_metadata?.full_name?.split(' ')[0] || 'back'}! 👋`,
        );
      } catch (err) {
        console.error('DB load on sign-in failed:', err);
        if (cancelled) return;
        setTimers(loadLocalTimers());
        showToast('Could not load timers from Supabase.');
      }
    }

    async function bootstrapAuth() {
      try {
        const {
          data: { session },
        } = await withTimeout(supabase.auth.getSession(), 'bootstrap getSession');

        if (cancelled) return;

        if (session?.user) {
          setUser(session.user);
          const dbTimers = await fetchTimers(session.user.id);
          if (cancelled) return;
          setTimers(dbTimers.map(normalizeTimer));
        } else {
          setUser(null);
          setTimers(loadLocalTimers());
        }
      } catch (err) {
        console.error('Auth bootstrap failed:', err);
        if (!cancelled) {
          setTimers(loadLocalTimers());
          showToast('Could not load timers from Supabase.');
        }
      }
    }

    bootstrapAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session.user);
        setTimeout(() => {
          if (!cancelled) void handleSignedIn(session);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setTimers(loadLocalTimers());
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function addTimer({ name, days, hours, minutes, notes, imageUrl, imageKey = '' }) {
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
      notes: notes?.trim() ?? '',
      imageKey,
      imageUrl: imageKey ? '' : imageUrl?.trim() ?? '',
      createdAt: now,
    };
    console.log('[timer] add', newTimer);
    const saved = await persistTimerChange('add timer', (userId) => saveTimer(userId, newTimer));
    if (!saved) return false;
    setTimers((prev) => [newTimer, ...prev]);
    showToast(`"${name.trim()}" timer added! ⏱️`);
    return true;
  }

  async function updateTimer(id, changes) {
    const current = timers.find((t) => t.id === id);
    if (!current) return false;
    const updated = { ...current, ...changes, createdAt: Date.now() };
    console.log('[timer] update', { id, changes, updated });
    const saved = await persistTimerChange('update timer', (userId) => saveTimer(userId, updated));
    if (saved) {
      setTimers((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
    console.log('[timer] update save result', { id, saved });
    return saved;
  }

  async function deleteTimer(id) {
    const timer = timers.find((t) => t.id === id);
    if (!timer) return false;
    console.log('[timer] delete', { id, timer });
    const deleted = await persistTimerChange('delete timer', (userId) =>
      deleteTimerFromDb(userId, id),
    );
    if (!deleted) return false;
    setTimers((prev) => prev.filter((t) => t.id !== id));
    showToast(`"${timer.name}" deleted 🗑️`);
    return true;
  }

  async function pauseTimer(id) {
    const t = timers.find((t) => t.id === id);
    if (!t) return false;
    const updated =
      t.pausedAt !== null
        ? {
            ...t,
            startTime: t.startTime + (Date.now() - t.pausedAt),
            pausedAt: null,
            createdAt: Date.now(),
          }
        : { ...t, pausedAt: Date.now(), createdAt: Date.now() };
    console.log('[timer] pause', { id, updated });
    const saved = await persistTimerChange(
      t.pausedAt !== null ? 'resume timer' : 'pause timer',
      (userId) => saveTimer(userId, updated),
    );
    if (!saved) return false;
    setTimers((prev) => prev.map((timer) => (timer.id === id ? updated : timer)));
    return true;
  }

  async function resetTimer(id) {
    const t = timers.find((t) => t.id === id);
    if (!t) return false;
    const updated = { ...t, startTime: Date.now(), pausedAt: null, createdAt: Date.now() };
    console.log('[timer] reset', { id, updated });
    const saved = await persistTimerChange('reset timer', (userId) => saveTimer(userId, updated));
    if (!saved) return false;
    setTimers((prev) => prev.map((timer) => (timer.id === id ? updated : timer)));
    return true;
  }

  async function hideTimer(id) {
    const t = timers.find((t) => t.id === id);
    if (!t) return false;
    const updated = { ...t, hidden: !t.hidden, createdAt: Date.now() };
    console.log('[timer] hide', { id, updated });
    const saved = await persistTimerChange(
      t.hidden ? 'unhide timer' : 'hide timer',
      (userId) => saveTimer(userId, updated),
    );
    if (!saved) return false;
    setTimers((prev) => prev.map((timer) => (timer.id === id ? updated : timer)));
    return true;
  }

  async function clearAll() {
    if (!timers.length) return true;
    const deleted = await persistTimerChange('clear timers', (userId) =>
      deleteAllTimers(userId),
    );
    if (!deleted) return false;
    setTimers([]);
    showToast('All timers deleted.');
    return true;
  }

  const visibleTimers = timers.filter((t) =>
    activeView === 'timers' ? !t.hidden : t.hidden,
  );

  return (
    <div className="app">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        onLogout={handleLogout}
      />
      <main className="main">
        {activeView === 'settings' ? (
          <SettingsPanel
            onClose={() => setActiveView('timers')}
            onClearAll={clearAll}
            user={user}
            onLogout={handleLogout}
          />
        ) : (
          <>
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
          </>
        )}
      </main>
      <MobileNav
        activeView={activeView}
        onTimers={() => setActiveView('timers')}
        onArchive={() => setActiveView('archive')}
        onNewTimer={openMobileCreateTimer}
        onOpenSettings={() => setActiveView('settings')}
        user={user}
      />
      {createTimerOpen && (
        <MobileCreateTimerSheet
          onClose={() => setCreateTimerOpen(false)}
          onAdd={addTimer}
        />
      )}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
