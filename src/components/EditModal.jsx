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

function msToFields(ms) {
  const totalSec = Math.floor(ms / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  return { days, hours, minutes }
}

function fieldsToMs({ days, hours, minutes }) {
  return ((days * 24 * 60 + hours * 60 + minutes) * 60) * 1000
}

// Convert a timestamp to datetime-local input value
function tsToInput(ts) {
  const d = new Date(ts)
  // datetime-local needs: YYYY-MM-DDTHH:MM
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EditModal({ timer, onSave, onClose }) {
  const [name, setName] = useState(timer.name)
  const { days: d0, hours: h0, minutes: m0 } = msToFields(timer.totalMs)
  const [days, setDays] = useState(d0)
  const [hours, setHours] = useState(h0)
  const [minutes, setMinutes] = useState(m0)
  const [startInput, setStartInput] = useState(tsToInput(timer.startTime))

  function handleSave() {
    const totalMs = fieldsToMs({ days, hours, minutes })
    if (!name.trim() || totalMs === 0) return
    const newStart = new Date(startInput).getTime()
    onSave({
      name: name.trim(),
      totalMs,
      startTime: isNaN(newStart) ? timer.startTime : newStart,
    })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Edit Timer</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <label className="field-label">Timer Name</label>
          <input
            className="modal-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Timer Name"
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

          <label className="field-label">
            Start Time
            <span className="field-hint"> — set this to the past to backfill progress</span>
          </label>
          <input
            className="modal-input"
            type="datetime-local"
            value={startInput}
            onChange={e => setStartInput(e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}
