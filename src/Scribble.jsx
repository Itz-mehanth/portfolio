// A handwritten margin note with a small drawn arrow, like a pencil annotation on
// the page. Decorative only (aria-hidden) and hidden below 1100px wide.
export default function Scribble({ children, style }) {
  return (
    <span className="scribble" aria-hidden="true" style={style}>
      {children}
      <svg width="34" height="30" viewBox="0 0 34 30" fill="none">
        <path d="M4 3c3 9 9 17 22 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M20 26l7-1.5-3-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
