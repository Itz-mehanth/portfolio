// The navbar's "Enter MR" button and the host that lazy-loads the experience.
// This file stays tiny: the WebXR code only downloads when someone opens MR
// (or hovers the button, to get a head start).
import { lazy, Suspense } from 'react'

const loadMR = () => import('./MRExperience')
const MRExperience = lazy(loadMR)

export function MRButton({ color, onOpen, compact = false }) {
  return (
    <button
      type="button"
      className="mr-nav-button"
      onClick={onOpen}
      onPointerEnter={loadMR}
      onFocus={loadMR}
      aria-label="Enter mixed reality"
      title="Enter mixed reality"
      style={{ color }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3.5 7.5h17a1.5 1.5 0 0 1 1.5 1.5v6a2.5 2.5 0 0 1-2.5 2.5h-3.2a1.5 1.5 0 0 1-1.25-.67L13.9 15.2a2.3 2.3 0 0 0-3.8 0l-1.15 1.63A1.5 1.5 0 0 1 7.7 17.5H4.5A2.5 2.5 0 0 1 2 15V9a1.5 1.5 0 0 1 1.5-1.5Z"
          stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
        />
        <path d="M6.5 11.2h3M14.5 11.2h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      {!compact && <span className="mr-nav-label">MR</span>}
    </button>
  )
}

export function MRHost({ open, onClose }) {
  if (!open) return null
  return (
    <Suspense fallback={<div className="mr-loading" role="status">Opening mixed reality…</div>}>
      <MRExperience onClose={onClose} />
    </Suspense>
  )
}
