import './ActionButton.css';

export default function ActionButton({ onClick, children, theme }) {
  return (
    <button className={`action-btn action-btn-${theme}`} onClick={onClick}>
      {children}
    </button>

  )
}