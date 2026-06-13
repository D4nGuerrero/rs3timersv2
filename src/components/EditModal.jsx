import { useState, useRef } from 'react'
import { X, ChevronUp, ChevronDown } from 'lucide-react'
import './EditModal.css'
import { useTheme } from '../context/ThemeContext'

function Spinner({ value, onChange, min = 0, max = 99 }) {
  return (
    <div className="edit-spinner">
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))}><ChevronUp size={13} /></button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
      />
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}><ChevronDown size={13} /></button>
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
  const  { theme } = useTheme()
  const [name, setName] = useState(timer.name)
  const { days: d0, hours: h0, minutes: m0 } = msToFields(timer.totalMs)
  const [days, setDays] = useState(d0)
  const [hours, setHours] = useState(h0)
  const [minutes, setMinutes] = useState(m0)
  const [startInput, setStartInput] = useState(tsToInput(timer.startTime))
  const [notes, setNotes] = useState(timer.notes ?? '')
  const [imageKey, setImageKey] = useState(timer.imageKey ?? '')
  const [imageUrl, setImageUrl] = useState(timer.imageUrl ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    setError('')

    const totalMs = fieldsToMs({ days, hours, minutes })
    if (!name.trim()) {
      setError('Timer name is required.')
      return
    }
    if (totalMs === 0) {
      setError('Timer duration must be greater than zero.')
      return
    }

    const newStart = new Date(startInput).getTime()
    const changes = {
      name: name.trim(),
      totalMs,
      startTime: isNaN(newStart) ? timer.startTime : newStart,
      notes: notes.trim(),
      imageKey,
      imageUrl: imageKey ? '' : imageUrl.trim(),
    }
    console.log('[ui] submit edit', { timerId: timer.id, changes })
    try {
      setSaving(true)
      const saved = await onSave(changes)
      if (!saved) {
        setError('Could not save changes to Supabase.')
        return
      }
      onClose()
    } catch (err) {
      console.error('[ui] edit submit failed', err)
      setError('Could not save changes to Supabase.')
    } finally {
      setSaving(false)
    }
  }

  const overlayRef = useRef(null)

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onMouseDown={(e) => { if (e.target === overlayRef.current) overlayRef.current._closeOnUp = true }}
      onMouseUp={(e) => { if (!saving && overlayRef.current._closeOnUp && e.target === overlayRef.current) onClose(); overlayRef.current._closeOnUp = false }}
    >
      <form className="modal" onSubmit={handleSave}>
        <div className="modal-header">
          <h3>Edit Timer</h3>
          <button type="button" className="modal-close" onClick={onClose} disabled={saving}>
            {theme === 'runescape' ? <span style={{ display: 'block', width: 16, height: 16 }}></span> : <X size={18} />}
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="edit-error" role="alert">
              {error}
            </div>
          )}

          <label className="field-label">Timer Name</label>
          <input
            className={`modal-input${error && error.includes('name') ? ' error' : ''}`}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error && error.includes('name')) setError('')
            }}
            placeholder="Timer Name"
            aria-invalid={Boolean(error && error.includes('name'))}
          />

          <label className="field-label">Duration</label>
          <div className={`duration-row${error && error.includes('duration') ? ' error' : ''}`}>
            <div className="spinner-group">
              <Spinner value={days} onChange={setDays} max={365} />
              <span className="spinner-label">Days</span>
            </div>
            <div className="spinner-group">
              <Spinner value={hours} onChange={setHours} max={9999} />
              <span className="spinner-label">Hours</span>
            </div>
            <div className="spinner-group">
              <Spinner value={minutes} onChange={setMinutes} max={59} />
              <span className="spinner-label">Minutes</span>
            </div>
          </div>

          <label className="field-label">Notes</label>
          <textarea
            className="modal-input modal-textarea"
            rows="4"
            placeholder="Optional notes for this timer"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <label className="field-label">Image URL</label>
          <input
            className="modal-input"
            placeholder="Optional image URL"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value)
              setImageKey('')
            }}
          />

          <label className="field-label">
            Start Time
            <span className="field-hint"> — set this to the past to backfill progress</span>
          </label>
          <input
            className="modal-input"
            type="datetime-local"
            value={startInput}
            onChange={(e) => {
              setStartInput(e.target.value)
            }}
          />
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
