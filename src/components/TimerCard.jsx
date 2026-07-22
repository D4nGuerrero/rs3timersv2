import { useState, useEffect, useRef } from 'react'
import { EyeOff, Pencil, Trash2, Play, Pause, RotateCcw, FileText, X } from 'lucide-react'
import EditModal from './EditModal'
import './TimerCard.css'
import MarkdownNotes from './MarkdownNotes'
import { useThemeIcons } from '../hooks/useThemeIcons'
import { ProgressBar } from './themes/runescape/ProgressBar'
import { useTheme } from '../context/ThemeContext'
import { useNow } from '../hooks/useNow'
import trialsResetIcon from '../assets/themes/runescape/trials_reset.png'
import { resolveTimerImage } from '../lib/presetImages'
import { formatTimeLeft, getRemainingMs, getTimerProgress } from '../lib/timerUtils'


function formatDate(ts) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  })
}

function getPendingLabel(action) {
  switch (action) {
    case 'delete':
      return 'Deleting...'
    case 'reset':
      return 'Resetting...'
    case 'pause':
      return 'Pausing...'
    case 'resume':
      return 'Resuming...'
    case 'hide':
      return 'Saving...'
    default:
      return 'Saving...'
  }
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

export default function TimerCard({
  timer,
  isArchive,
  onPause,
  onReset,
  onHide,
  onDelete,
  onUpdate,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null) // 'delete' | 'reset' | null
  const [pendingAction, setPendingAction] = useState('')
  const [notesOpen, setNotesOpen] = useState(false)
  const menuRef = useRef(null)
  const notesOverlayRef = useRef(null)
  const { theme } = useTheme();
  const displayImageUrl = resolveTimerImage(timer)

  

  const isPaused = timer.pausedAt !== null
  const now = useNow(!isPaused)

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
  const progress = getTimerProgress(remaining, timer.totalMs)
  const endTime = timer.startTime + timer.totalMs

  const Icons = useThemeIcons();

  async function runAction(name, action) {
    if (pendingAction) return false
    setPendingAction(name)
    try {
      return await action()
    } finally {
      setPendingAction('')
    }
  }

  return (
    <>
      <div className={`timer-card ${done ? 'done' : ''} ${isPaused ? 'paused' : ''}`}>
        <div className="card-header">
          <div className="card-title-row">
            <h3 className="card-title">{timer.name}</h3>
            {isPaused && <span className="paused-badge">Paused</span>}
            {done && <span className="done-badge">Done</span>}
          </div>
          <div className="card-header-actions">
            {timer.notes?.trim() && (
              <button
                type="button"
                className="menu-btn notes-icon-btn"
                aria-label="Show notes"
                title="Show notes"
                onClick={() => setNotesOpen(true)}
              >
                <FileText size={14} />
              </button>
            )}
            <div className="menu-wrap" ref={menuRef}>
              <button className="menu-btn" onClick={() => setMenuOpen(o => !o)}>
                {theme === 'runescape' && menuOpen && Icons.MenuHover
                  ? <Icons.MenuHover size={14} />
                  : <Icons.Menu size={14} />}
              </button>
              {menuOpen && (
                <div className="dropdown">
                  <button onClick={() => { setEditOpen(true); setMenuOpen(false) }}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    disabled={Boolean(pendingAction)}
                    onClick={async () => {
                      const saved = await runAction('hide', onHide)
                      if (saved) setMenuOpen(false)
                    }}
                  >
                    <EyeOff size={14} /> {pendingAction === 'hide' ? 'Saving...' : isArchive ? 'Unhide' : 'Hide'}
                  </button>
                  <button className="danger" onClick={() => { setConfirmAction('delete'); setMenuOpen(false) }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card-dates">
          <div><span className="date-label">START:</span> {formatDate(timer.startTime)}</div>
          <div><span className="date-label">ENDS:</span> {formatDate(endTime)}</div>
        </div>

     {theme === 'runescape' ? (
          <div className="progress-wrap">
            {displayImageUrl && (
              <img
                className="timer-card-image"
                src={displayImageUrl}
                alt=""
              />
            )}
       
       {done ? (
        'READY!'
       ) : (
        <span className="time-left">{timeText} left</span>
       )}
       
       <ProgressBar progress={progress} done={done} />   
        </div>
      
      ) : (
          <div className="default-visual-wrap">
            <div className="ring-wrap">
             <div className="ring-background-fill" aria-hidden="true" />
             {displayImageUrl && (
               <img
                 className="ring-background-image"
                 src={displayImageUrl}
                 alt=""
               />
             )}
             <RingProgress progress={progress} />
             
            <div className="ring-center">
              <span className="time-text">{timeText}</span>
            </div>
          </div>
        </div>
      )}

     
      

        <div className="card-actions">
          {confirmAction ? (
            <div className="confirm-row">
              <span className="confirm-label">
                {confirmAction === 'delete' ? 'Delete timer?' : 'Reset timer?'}
              </span>
              <div className="confirm-btns">
                <button className="action-btn" disabled={Boolean(pendingAction)} onClick={() => setConfirmAction(null)}>Cancel</button>
                <button
                  className="action-btn confirm-danger"
                  disabled={Boolean(pendingAction)}
                  onClick={async () => {
                    const action = confirmAction === 'delete' ? onDelete : onReset
                    const saved = await runAction(confirmAction, action)
                    if (saved) setConfirmAction(null)
                  }}
                >
                  {pendingAction
                    ? getPendingLabel(confirmAction)
                    : confirmAction === 'delete'
                      ? 'Delete'
                      : 'Reset'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                className="action-btn"
                disabled={Boolean(pendingAction)}
                onClick={() => runAction('pause', onPause)}
              >
                {pendingAction === 'pause'
                  ? getPendingLabel(isPaused ? 'resume' : 'pause')
                  : isPaused
                    ? <><Play size={16} /> Resume</>
                    : <><Pause size={16} /> Pause</>}
              </button>
            
              <button className="action-btn" onClick={() => setConfirmAction('reset')}>
                {theme === 'runescape'
                  ? <img className="button-icon-sprite reset-button-icon" src={trialsResetIcon} alt="" />
                  : <RotateCcw size={14} />}
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {notesOpen && timer.notes?.trim() && (
        <div
          className="modal-overlay"
          ref={notesOverlayRef}
          onMouseDown={(e) => {
            if (e.target === notesOverlayRef.current) notesOverlayRef.current._closeOnUp = true
          }}
          onMouseUp={(e) => {
            if (notesOverlayRef.current._closeOnUp && e.target === notesOverlayRef.current) {
              setNotesOpen(false)
            }
            notesOverlayRef.current._closeOnUp = false
          }}
        >
          <div className="modal notes-dialog">
            <div className="modal-header">
              <h3>{timer.name} Notes</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setNotesOpen(false)}
              >
                {theme === 'runescape' ? <span style={{ display: 'block', width: 16, height: 16 }}></span> : <X size={18} />}
              </button>
            </div>
            <div className="modal-body">
              <div className="timer-notes timer-notes-dialog">
                <FileText size={14} />
                <MarkdownNotes text={timer.notes} />
              </div>
            </div>
          </div>
        </div>
      )}

      {editOpen && (
        <EditModal
          timer={timer}
          onSave={onUpdate}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  )
}
