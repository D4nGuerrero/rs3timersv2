import { useState, useEffect, useRef } from 'react'
import { X, ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react'
import './MobileCreateTimerSheet.css'
import { useTheme } from '../context/ThemeContext'
import {
  PRESET_TIMER_CATEGORIES,
  formatPresetDuration,
  totalMinutesToFields,
} from '../data/presetTimers'

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

export default function MobileCreateTimerSheet({ onClose, onAdd }) {
  const { theme } = useTheme()
  const [view, setView] = useState('create')
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [name, setName] = useState('')
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(2)
  const [minutes, setMinutes] = useState(0)
  const [notes, setNotes] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageKey, setImageKey] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const viewRef = useRef('create')
  const closeRequestedRef = useRef(false)
  const resetToCreateRef = useRef(false)
  const nameFieldRef = useRef(null)
  const durationFieldRef = useRef(null)

  useEffect(() => {
    document.getElementById('mobile-timer-name-input')?.focus()
  }, [])

  useEffect(() => {
    viewRef.current = view
  }, [view])

  useEffect(() => {
    const dialogState = {
      ...(window.history.state ?? {}),
      __mobileCreateTimerSheet: true,
      mobileCreateTimerSheetView: 'create',
    }
    window.history.pushState(dialogState, '')

    function handlePopState() {
      if (closeRequestedRef.current) {
        closeRequestedRef.current = false
        onClose()
        return
      }

      if (resetToCreateRef.current) {
        resetToCreateRef.current = false
        setSelectedCategoryId(null)
        setView('create')
        return
      }

      if (viewRef.current === 'presets') {
        setView('categories')
        return
      }

      if (viewRef.current === 'categories') {
        setSelectedCategoryId(null)
        setView('create')
        return
      }

      onClose()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [onClose])

  function closeSheet() {
    if (!saving) {
      closeRequestedRef.current = true
      const stepsToExit = viewRef.current === 'presets' ? 3 : viewRef.current === 'categories' ? 2 : 1
      window.history.go(-stepsToExit)
    }
  }

  function clearFieldError(field) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function focusFirstError(nextErrors) {
    const firstField = Object.keys(nextErrors)[0]
    const target = firstField === 'duration' ? durationFieldRef.current : nameFieldRef.current
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const input = target?.querySelector('input, textarea')
    input?.focus()
  }

  async function handleAdd(e) {
    e?.preventDefault()
    setError('')
    const nextErrors = {}

    if (!name.trim()) {
      nextErrors.name = 'Timer name is required.'
    }

    if ((days * 24 * 60 + hours * 60 + minutes) === 0) {
      nextErrors.duration = 'Timer duration must be greater than zero.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      focusFirstError(nextErrors)
      return
    }

    setFieldErrors({})

    try {
      setSaving(true)
      const added = await onAdd({ name, days, hours, minutes, notes, imageUrl, imageKey })
      if (!added) {
        setError('Could not save this timer to Supabase.')
        return
      }
      closeSheet()
    } catch (err) {
      console.error('[ui] create timer failed', err)
      setError('Could not save this timer to Supabase.')
    } finally {
      setSaving(false)
    }
  }

  const overlayRef = useRef(null)
  const selectedCategory = PRESET_TIMER_CATEGORIES.find((category) => category.id === selectedCategoryId) ?? null

  function openPresetCategories() {
    setSelectedCategoryId(null)
    window.history.pushState({
      ...(window.history.state ?? {}),
      __mobileCreateTimerSheet: true,
      mobileCreateTimerSheetView: 'categories',
    }, '')
    setView('categories')
  }

  function openPresetList(categoryId) {
    setSelectedCategoryId(categoryId)
    window.history.pushState({
      ...(window.history.state ?? {}),
      __mobileCreateTimerSheet: true,
      mobileCreateTimerSheetView: 'presets',
    }, '')
    setView('presets')
  }

  function applyPreset(preset) {
    const durationFields = totalMinutesToFields(preset.totalMinutes)
    setName(preset.name)
    setDays(durationFields.days)
    setHours(durationFields.hours)
    setMinutes(durationFields.minutes)
    setImageUrl('')
    setImageKey(preset.imageKey ?? '')
    setNotes(preset.notes)
    setError('')
    resetToCreateRef.current = true
    window.history.go(-2)
  }

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onMouseDown={(e) => { if (e.target === overlayRef.current) overlayRef.current._closeOnUp = true }}
      onMouseUp={(e) => { if (!saving && overlayRef.current._closeOnUp && e.target === overlayRef.current) closeSheet(); overlayRef.current._closeOnUp = false }}
    >
      <form className="modal mobile-create-sheet" onSubmit={handleAdd}>
        <div className="mobile-sheet-handle" />
        <div className="modal-header">
          <div className="modal-header-copy">
            <h3>
              {view === 'create'
                ? 'Create Timer'
                : view === 'categories'
                  ? 'Preset Timers'
                  : selectedCategory?.name ?? 'Preset Timers'}
            </h3>
            {view === 'categories' && (
              <p className="modal-subtitle">Choose a category to browse preset timers.</p>
            )}
            {view === 'presets' && selectedCategory && (
              <p className="modal-subtitle">{selectedCategory.description}</p>
            )}
          </div>
          {view === 'create' && (
            <button
              type="button"
              className="btn-preset-trigger"
              onClick={openPresetCategories}
              disabled={saving}
            >
              Use Preset
            </button>
          )}
          <button type="button" className="modal-close" onClick={closeSheet} disabled={saving}>
            {theme === 'runescape' ? <span style={{ display: 'block', width: 16, height: 16 }}></span> : <X size={18} />}
          </button>
        </div>
        {view === 'create' ? (
          <>
            <div className="modal-body">
              {error && <div className="edit-error" role="alert">{error}</div>}

              <div ref={nameFieldRef} className="field-group">
                <label className="field-label">Timer Name</label>
                <input
                  id="mobile-timer-name-input"
                  className={`modal-input${fieldErrors.name ? ' error' : ''}`}
                  placeholder="Timer Name"
                  value={name}
                  onChange={e => {
                    setName(e.target.value)
                    clearFieldError('name')
                  }}
                />
                {fieldErrors.name && <div className="field-error" role="alert">{fieldErrors.name}</div>}
              </div>

              <div ref={durationFieldRef} className="field-group">
                <label className="field-label">Duration</label>
                <div className={`duration-row${fieldErrors.duration ? ' error' : ''}`}>
                  <div className="spinner-group">
                    <Spinner value={days} onChange={(value) => {
                      setDays(value)
                      clearFieldError('duration')
                    }} max={365} />
                    <span className="spinner-label">Days</span>
                  </div>
                  <div className="spinner-group">
                    <Spinner value={hours} onChange={(value) => {
                      setHours(value)
                      clearFieldError('duration')
                    }} max={9999} />
                    <span className="spinner-label">Hours</span>
                  </div>
                  <div className="spinner-group">
                    <Spinner value={minutes} onChange={(value) => {
                      setMinutes(value)
                      clearFieldError('duration')
                    }} max={59} />
                    <span className="spinner-label">Minutes</span>
                  </div>
                </div>
                {fieldErrors.duration && <div className="field-error" role="alert">{fieldErrors.duration}</div>}
              </div>

              <label className="field-label">Notes</label>
              <textarea
                className="modal-input modal-textarea"
                rows="4"
                placeholder="Optional notes for this timer"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />

              <label className="field-label">Image URL</label>
              <input
                className="modal-input"
                placeholder="Optional image URL"
                value={imageUrl}
                onChange={e => {
                  setImageUrl(e.target.value)
                  setImageKey('')
                }}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={closeSheet} disabled={saving}>Cancel</button>
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? 'Saving...' : 'Add Timer'}
              </button>
            </div>
          </>
        ) : view === 'categories' ? (
          <>
            <div className="modal-body">
              <div className="preset-category-grid">
                {PRESET_TIMER_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className="preset-category-card"
                    onClick={() => openPresetList(category.id)}
                  >
                    <span className="preset-category-name">{category.name}</span>
                    <span className="preset-category-description">{category.description}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel btn-back-inline" onClick={() => window.history.back()}>
                <ArrowLeft size={14} /> Back
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-body">
              <div className="preset-entry-list">
                {selectedCategory?.presets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    className="preset-entry-card"
                    onClick={() => applyPreset(preset)}
                  >
                    <img className="preset-entry-image" src={preset.imageUrl} alt="" />
                    <span className="preset-entry-copy">
                      <span className="preset-entry-name">{preset.name}</span>
                      <span className="preset-entry-duration">
                        Duration: {formatPresetDuration(preset.totalMinutes)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel btn-back-inline" onClick={() => window.history.back()}>
                <ArrowLeft size={14} /> Back
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
