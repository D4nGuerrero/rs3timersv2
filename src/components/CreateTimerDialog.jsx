import { useState } from 'react'
import { X, ChevronUp, ChevronDown } from 'lucide-react'
import './EditModal.css'

function Spinner({ value, onChange, min = 0, max = 99 }) {
  return (
    <div className="edit-spinner">
      <button onClick={() => onChange(Math.min(max, value + 1))}><ChevronUp size={13} /></button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
      />
      <button onClick={() => onChange(Math.max(min, value - 1))}><ChevronDown size={13} /></button>
    </div>
  )
}

export default function CreateTimerDialog({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(2)
  const [minutes, setMinutes] = useState(0)

  function handleAdd() {
    const added = onAdd({ name, days, hours, minutes })
    if (added === false) return
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Create New Timer</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <label className="field-label">Timer Name</label>
          <input
            className="modal-input"
            autoFocus
            placeholder="Timer Name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />

          <label className="field-label">Duration</label>
          <div className="duration-row">
            <div className="spinner-group">
              <Spinner value={days} onChange={setDays} max={365} />
              <span className="spinner-label">Days</span>
            </div>
            <div className="spinner-group">
              <Spinner value={hours} onChange={setHours} max={23} />
              <span className="spinner-label">Hours</span>
            </div>
            <div className="spinner-group">
              <Spinner value={minutes} onChange={setMinutes} max={59} />
              <span className="spinner-label">Minutes</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleAdd}>Add Timer</button>
        </div>
      </div>
    </div>
  )
}
