import { useState, useEffect, useRef } from 'react'
import { MoreVertical, EyeOff, Pencil, Trash2, Pause, Play, RotateCcw, Timer } from 'lucide-react'
import EditModal from './EditModal'
import './TimerCard.css'

function formatDate(ts) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  })
}

function formatTimeLeft(ms) {
  if (ms <= 0) return { text: '0m 0s', done: true }
  const totalSec = Math.floor(ms / 1000)
  const days = Math.floor(totalSec / 86400)
  const hrs = Math.floor((totalSec % 86400) / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  const secs = totalSec % 60

  if (days > 0) return { text: `${days}d ${hrs}h ${mins}m`, done: false }
  if (hrs > 0) return { text: `${hrs}h ${mins}m ${secs}s`, done: false }
  return { text: `${mins}m ${secs}s`, done: false }
}

function getRemainingMs(timer, now = Date.now()) {
  const elapsed = timer.pausedAt !== null
    ? timer.pausedAt - timer.startTime
    : now - timer.startTime
  return timer.totalMs - elapsed
}

// SVG ring
function RingProgress({ progress }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.max(0, Math.min(1, progress)))

  return (
    <svg className="ring-svg" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} className="ring-track" strokeWidth="10" fill="none" />
      <circle
        cx="60" cy="60" r={r}
        className="ring-fill"
        strokeWidth="10"
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
    </svg>
  )
}

export default function TimerCard({ timer, isArchive, onPause, onReset, onHide, onDelete, onUpdate }) {
  const [now, setNow] = useState(timer.pausedAt ?? timer.startTime)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null) // 'delete' | 'reset' | null
  const menuRef = useRef(null)

  const isPaused = timer.pausedAt !== null

  useEffect(() => {
    if (isPaused) return
    const id = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(id)
  }, [isPaused])

  // Close menu on outside click
  useEffect(() => {
    function handle(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const remaining = getRemainingMs(timer, now)
  const { text: timeText, done } = formatTimeLeft(remaining)
  const progress = Math.max(0, remaining / timer.totalMs)
  const endTime = timer.startTime + timer.totalMs

  return (
    <>
      <div className={`timer-card ${done ? 'done' : ''} ${isPaused ? 'paused' : ''}`}>
        <div className="card-header">
          <div className="card-title-row">
            <h3 className="card-title">{timer.name}</h3>
            {isPaused && <span className="paused-badge">Paused</span>}
            {done && <span className="done-badge">Done</span>}
          </div>
          <div className="menu-wrap" ref={menuRef}>
            <button className="menu-btn" onClick={() => setMenuOpen(o => !o)}>
              <MoreVertical size={18} />
            </button>
            {menuOpen && (
              <div className="dropdown">
                <button onClick={() => { setEditOpen(true); setMenuOpen(false) }}>
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => { onHide(); setMenuOpen(false) }}>
                  <EyeOff size={14} /> {isArchive ? 'Unhide' : 'Hide'}
                </button>
                <button className="danger" onClick={() => { setConfirmAction('delete'); setMenuOpen(false) }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="card-dates">
          <div><span className="date-label">START:</span> {formatDate(timer.startTime)}</div>
          <div><span className="date-label">ENDS:</span> {formatDate(endTime)}</div>
        </div>

        <div className="ring-wrap">
          <RingProgress progress={progress} />
          <div className="ring-center">
            <Timer size={18} className="ring-icon" />
            <span className="time-text">{timeText}</span>
            <span className="time-sub">{done ? 'done' : 'left'}</span>
          </div>
        </div>

        <div className="card-actions">
          {confirmAction ? (
            <div className="confirm-row">
              <span className="confirm-label">
                {confirmAction === 'delete' ? 'Delete timer?' : 'Reset timer?'}
              </span>
              <div className="confirm-btns">
                <button className="action-btn" onClick={() => setConfirmAction(null)}>Cancel</button>
                <button
                  className="action-btn confirm-danger"
                  onClick={() => { confirmAction === 'delete' ? onDelete() : onReset(); setConfirmAction(null) }}
                >
                  {confirmAction === 'delete' ? 'Delete' : 'Reset'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <button className="action-btn" onClick={onPause}>
                {isPaused ? <><Play size={14} /> Resume</> : <><Pause size={14} /> Pause</>}
              </button>
              <button className="action-btn" onClick={() => setConfirmAction('reset')}>
                <RotateCcw size={14} /> Reset
              </button>
            </>
          )}
        </div>
      </div>

      {editOpen && (
        <EditModal
          timer={timer}
          onSave={(changes) => { onUpdate(changes); setEditOpen(false) }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  )
}
