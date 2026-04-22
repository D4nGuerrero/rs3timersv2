import { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateTimerDialog from './CreateTimerDialog'
import './CreateTimerBar.css'

export default function CreateTimerBar({ onAdd, showTitle = true, className = '' }) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className={`create-bar-wrapper ${className}`.trim()}>
      {showTitle && (
        <div className="create-bar-header">
          <h2 className="create-title">Create New Timer</h2>
          <button className="add-btn" onClick={() => setDialogOpen(true)}>
            <Plus size={16} />
            Add Timer
          </button>
        </div>
      )}
      {dialogOpen && (
        <CreateTimerDialog onAdd={onAdd} onClose={() => setDialogOpen(false)} />
      )}
    </div>
  )
}
