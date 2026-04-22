import TimerCard from './TimerCard'
import './TimerGrid.css'

export default function TimerGrid({ timers, activeView, onPause, onReset, onHide, onDelete, onUpdate }) {
  const isArchive = activeView === 'archive'

  if (timers.length === 0) {
    return (
      <div className="empty-state">
        {isArchive
          ? <p>No hidden timers. Hide a timer from its menu to archive it here.</p>
          : <p>No timers yet — create one above!</p>
        }
      </div>
    )
  }

  return (
    <div>
      {isArchive && (
        <p className="archive-hint">Hidden timers — click <strong>Unhide</strong> from the menu to restore.</p>
      )}
      <div className="timer-grid">
        {timers.map(timer => (
          <TimerCard
            key={timer.id}
            timer={timer}
            isArchive={isArchive}
            onPause={() => onPause(timer.id)}
            onReset={() => onReset(timer.id)}
            onHide={() => onHide(timer.id)}
            onDelete={() => onDelete(timer.id)}
            onUpdate={(changes) => onUpdate(timer.id, changes)}
          />
        ))}
      </div>
    </div>
  )
}
