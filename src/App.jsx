import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TimerGrid from './components/TimerGrid'
import CreateTimerBar from './components/CreateTimerBar'
import SettingsPanel from './components/SettingsPanel'
import { supabase } from './lib/supabase'
import {
  fetchTimers,
  saveTimer,
  deleteTimer as deleteTimerFromDb,
  saveAllTimers,
} from './lib/timerService'
import './App.css'

const STORAGE_KEY = 'dannys-timers'

function loadTimers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTimers(timers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timers))
}

export default function App() {
  const [timers, setTimers] = useState(loadTimers)
  const [activeView, setActiveView] = useState('timers')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [user, setUser] = useState(null)

  // Persist to localStorage only when logged out
  useEffect(() => {
    if (!user) saveTimers(timers)
  }, [timers, user])

  // Auth setup: handle session on load and auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') {
          if (session?.user) {
            setUser(session.user)
            const dbTimers = await fetchTimers(session.user.id)
            setTimers(dbTimers)
          }
        } else if (event === 'SIGNED_IN') {
          setUser(session.user)
          // Migrate any existing localStorage timers to DB
          const localTimers = loadTimers()
          if (localTimers.length > 0) {
            await saveAllTimers(session.user.id, localTimers)
          }
          const dbTimers = await fetchTimers(session.user.id)
          setTimers(dbTimers)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setTimers(loadTimers())
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  function addTimer({ name, days, hours, minutes }) {
    const totalMs = ((days * 24 * 60 + hours * 60 + minutes) * 60) * 1000
    if (!name.trim() || totalMs === 0) return
    const now = Date.now()
    const newTimer = {
      id: crypto.randomUUID(),
      name: name.trim(),
      totalMs,
      startTime: now,
      pausedAt: null,
      hidden: false,
      createdAt: now,
    }
    setTimers(prev => [newTimer, ...prev])
    if (user) saveTimer(user.id, newTimer)
  }

  function updateTimer(id, changes) {
    const current = timers.find(t => t.id === id)
    if (!current) return
    const updated = { ...current, ...changes }
    setTimers(prev => prev.map(t => t.id === id ? updated : t))
    if (user) saveTimer(user.id, updated)
  }

  function deleteTimer(id) {
    setTimers(prev => prev.filter(t => t.id !== id))
    if (user) deleteTimerFromDb(user.id, id)
  }

  function pauseTimer(id) {
    const t = timers.find(t => t.id === id)
    if (!t) return
    const updated = t.pausedAt !== null
      ? { ...t, startTime: t.startTime + (Date.now() - t.pausedAt), pausedAt: null }
      : { ...t, pausedAt: Date.now() }
    setTimers(prev => prev.map(timer => timer.id === id ? updated : timer))
    if (user) saveTimer(user.id, updated)
  }

  function resetTimer(id) {
    const t = timers.find(t => t.id === id)
    if (!t) return
    const updated = { ...t, startTime: Date.now(), pausedAt: null }
    setTimers(prev => prev.map(timer => timer.id === id ? updated : timer))
    if (user) saveTimer(user.id, updated)
  }

  function hideTimer(id) {
    const t = timers.find(t => t.id === id)
    if (!t) return
    const updated = { ...t, hidden: !t.hidden }
    setTimers(prev => prev.map(timer => timer.id === id ? updated : timer))
    if (user) saveTimer(user.id, updated)
  }

  function clearAll() {
    if (user) timers.forEach(t => deleteTimerFromDb(user.id, t.id))
    setTimers([])
  }

  const visibleTimers = timers.filter(t =>
    activeView === 'timers' ? !t.hidden : t.hidden
  )

  return (
    <div className="app">
      <Sidebar activeView={activeView} setActiveView={setActiveView} onOpenSettings={() => setSettingsOpen(true)} user={user} />
      <main className="main">
        {activeView === 'timers' && <CreateTimerBar onAdd={addTimer} />}
        <TimerGrid
          timers={visibleTimers}
          activeView={activeView}
          onPause={pauseTimer}
          onReset={resetTimer}
          onHide={hideTimer}
          onDelete={deleteTimer}
          onUpdate={updateTimer}
        />
      </main>
      {settingsOpen && (
        <SettingsPanel onClose={() => setSettingsOpen(false)} onClearAll={clearAll} />
      )}
    </div>
  )
}
