import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import './CreateTimerBar.css'

function Spinner({ value, onChange, min = 0, max = 99 }) {
  return (
    <div className="spinner">
      <button onClick={() => onChange(Math.min(max, value + 1))}><ChevronUp size={14} /></button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
      />
      <button onClick={() => onChange(Math.max(min, value - 1))}><ChevronDown size={14} /></button>
    </div>
  )
}

export default function CreateTimerBar({ onAdd }) {
  const [name, setName] = useState('')
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(2)
  const [minutes, setMinutes] = useState(0)

  function handleAdd() {
    onAdd({ name, days, hours, minutes })
    setName('')
    setDays(0)
    setHours(2)
    setMinutes(0)
  }

  return (
    <div className="create-bar-wrapper">
      <h2 className="create-title">Create New Timer</h2>
      <div className="create-bar">
        <input
          id="timer-name-input"
          className="name-input"
          placeholder="Timer Name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
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
        <button className="add-btn" onClick={handleAdd}>Add Timer</button>
      </div>
    </div>
  )
}
