// Small hand-drawn desk props for the paper sections (Awards, Contact): pure SVG,
// decorative only, hidden from assistive tech, and scaled down / dropped on phones.

export function FramedCertificate({ width = 210, style }) {
  return (
    <svg className="desk-prop" viewBox="0 0 220 170" style={{ width, ...style }} aria-hidden="true">
      <rect x="6" y="8" width="208" height="156" rx="6" fill="#8a5a2b" />
      <rect x="16" y="18" width="188" height="136" rx="3" fill="#c9962b" />
      <rect x="22" y="24" width="176" height="124" rx="2" fill="#fbf6ea" />
      <text x="110" y="52" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight="800" fontSize="15" fill="#3c3d45">CERTIFICATE</text>
      <rect x="62" y="62" width="96" height="3" rx="1.5" fill="#c9962b" />
      {[78, 90, 102].map((y, i) => (
        <rect key={y} x={50 + i * 4} y={y} width={120 - i * 8} height="4" rx="2" fill="#d9d1c0" />
      ))}
      <circle cx="160" cy="128" r="12" fill="#c9962b" />
      <circle cx="160" cy="128" r="7" fill="#e7c25e" />
      <rect x="44" y="126" width="56" height="3" rx="1.5" fill="#9b9488" />
    </svg>
  )
}

export function MedalProp({ width = 86, style }) {
  return (
    <svg className="desk-prop" viewBox="0 0 90 130" style={{ width, ...style }} aria-hidden="true">
      <path d="M22 0 L44 52 L32 58 L10 4 Z" fill="#2f5f9e" />
      <path d="M68 0 L46 52 L58 58 L80 4 Z" fill="#c64a3a" />
      <circle cx="45" cy="88" r="34" fill="#a77514" />
      <circle cx="45" cy="85" r="34" fill="#e4ac2f" />
      <circle cx="45" cy="85" r="25" fill="none" stroke="#fff1c2" strokeOpacity="0.55" strokeWidth="2" />
      <path d="M45 66 l5.5 11.6 12.7 1.5 -9.4 8.7 2.5 12.6 -11.3-6.3 -11.3 6.3 2.5-12.6 -9.4-8.7 12.7-1.5z" fill="#fff1c2" fillOpacity="0.85" />
    </svg>
  )
}

export function MugAndBooks({ width = 230, style }) {
  return (
    <svg className="desk-prop" viewBox="0 0 240 200" style={{ width, ...style }} aria-hidden="true">
      {/* books */}
      <rect x="8" y="150" width="200" height="22" rx="3" fill="#2f4a6e" />
      <rect x="8" y="156" width="200" height="3" fill="#d8c58f" />
      <rect x="20" y="128" width="180" height="22" rx="3" fill="#c3532f" />
      <rect x="20" y="134" width="180" height="3" fill="#f3e3c3" />
      <rect x="2" y="172" width="214" height="20" rx="3" fill="#e9dfc8" />
      {/* mug */}
      <path d="M150 76 c34 0 34 40 0 40" fill="none" stroke="#18181c" strokeWidth="11" />
      <rect x="78" y="54" width="82" height="76" rx="10" fill="#18181c" />
      <ellipse cx="119" cy="56" rx="41" ry="7" fill="#2a2a30" />
      <ellipse cx="119" cy="57" rx="34" ry="4.5" fill="#5b3a22" />
      <circle cx="96" cy="94" r="3.4" fill="#ffb51b" />
      <text x="102" y="98" fontFamily="Syne, sans-serif" fontWeight="800" fontSize="10" fill="#f4f1ea">Mehanth.</text>
      {/* steam */}
      <path d="M104 44 c-8 -10 8 -16 0 -28 M124 42 c-8 -10 8 -16 0 -28" fill="none" stroke="#c9c2b4" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

// A potted plant: terracotta pot with a fan of leaves.
export function PottedPlant({ width = 150, style }) {
  const leaves = [
    ['M75 120 C60 80 40 50 30 10', '#4f8a4b'],
    ['M75 120 C80 80 100 50 128 30', '#5f9e57'],
    ['M75 120 C58 96 22 84 4 82', '#3f7a3f'],
    ['M75 120 C76 84 82 50 96 6', '#6aa95f'],
    ['M75 120 C92 98 126 88 148 92', '#4f8a4b'],
  ]
  return (
    <svg className="desk-prop" viewBox="0 0 150 190" style={{ width, ...style }} aria-hidden="true">
      {leaves.map(([d, c], i) => (
        <g key={i}>
          <path d={d} stroke={c} strokeWidth="13" strokeLinecap="round" fill="none" />
          <path d={d} stroke="rgba(255,255,255,0.32)" strokeWidth="1.3" fill="none" />
        </g>
      ))}
      <path d="M44 120 H106 L98 184 H52 Z" fill="#c76b3e" />
      <rect x="40" y="114" width="70" height="14" rx="4" fill="#d9804f" />
    </svg>
  )
}
