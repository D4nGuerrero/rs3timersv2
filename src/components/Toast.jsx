import { useEffect, useState } from 'react'
import './Toast.css'

export default function Toast({ message, visible }) {
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (visible) setAnimating(true)
  }, [visible])

  if (!animating && !visible) return null

  return (
    <div
      className={`toast ${visible ? 'toast-enter' : 'toast-exit'}`}
      onAnimationEnd={() => { if (!visible) setAnimating(false) }}
    >
      {message}
    </div>
  )
}
