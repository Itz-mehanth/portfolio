// Seams: what sits between two sections instead of a straight border. Each seam is
// a zero-height strip placed between two sections (z-index above both), so its
// torn paper edge and props overlap the bottom of one section and the top of the
// next. Props parallax with scroll: App.jsx writes --seam (px from the viewport
// middle) on every .seam, and each prop moves by --seam × its --speed.
import './Seams.css'

// Deterministic jagged edge: a torn-paper line across a 1440-wide viewBox.
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function tornPoints(seed, y, amp, step = 26) {
  const rnd = seeded(seed)
  const pts = []
  let drift = 0
  for (let x = 0; x < 1440; x += step * (0.6 + rnd() * 0.9)) {
    drift = drift * 0.7 + (rnd() - 0.5) * amp * 0.6        // slow wander, like a hand tear
    const nick = rnd() < 0.1 ? (rnd() - 0.5) * amp * 0.9 : 0
    pts.push([x, y + drift + (rnd() - 0.5) * amp * 0.35 + nick])
  }
  pts.push([1440, y + (rnd() - 0.5) * amp])
  return pts
}

// Closed shape: the straight edge of the sheet (y = 0 for 'bottom', y = H for 'top'),
// then the torn edge traced back from right to left.
function sheetPath(side, H, seed, y, amp, step) {
  const pts = tornPoints(seed, y, amp, step)
  const flat = side === 'bottom' ? 0 : H
  const torn = pts
    .slice()
    .reverse()
    .map(([x, py]) => `L${x.toFixed(1)},${py.toFixed(1)}`)
    .join(' ')
  return `M0,${flat} L1440,${flat} ${torn} Z`
}

// A sheet of paper whose bottom (or top) edge is torn, with a white fibrous rim.
function TornEdge({ side = 'bottom', color = '#f4f1ea', rim = '#fffefa', seed = 7, height = 90, className = '' }) {
  const H = 120
  const edgeY = side === 'bottom' ? 70 : H - 70
  const rimY = side === 'bottom' ? edgeY + 6 : edgeY - 6
  return (
    <svg
      className={`torn-edge torn-${side} ${className}`}
      viewBox={`0 0 1440 ${H}`}
      preserveAspectRatio="none"
      style={{ height }}
      aria-hidden="true"
    >
      <path d={sheetPath(side, H, seed + 3, rimY, 22, 16)} fill={rim} />
      <path d={sheetPath(side, H, seed, edgeY, 20, 34)} fill={color} />
    </svg>
  )
}

// A strip of paper torn along both edges, laid across a seam.
function TornStrip({ seed = 5, height = 70, color = '#fffefa', rim = '#e9e2d4' }) {
  const H = 100
  const top = tornPoints(seed, 26, 18, 30)
  const bottom = tornPoints(seed + 9, 74, 18, 30).reverse()
  const toPath = (a, b) => `M${a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')} L${b.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')} Z`
  const rimTop = tornPoints(seed + 4, 22, 22, 16)
  const rimBottom = tornPoints(seed + 13, 78, 22, 16).reverse()
  return (
    <svg className="torn-strip" viewBox={`0 0 1440 ${H}`} preserveAspectRatio="none" style={{ height }} aria-hidden="true">
      <path d={toPath(rimTop, rimBottom)} fill={rim} />
      <path d={toPath(top, bottom)} fill={color} />
    </svg>
  )
}

// Low-poly rock: an outline plus three facets in light, mid and dark stone.
const ROCKS = [
  { outline: '6,40 18,12 44,4 70,14 80,38 62,58 26,60', facets: ['18,12 44,4 46,30 24,34', '44,4 70,14 80,38 46,30', '6,40 24,34 46,30 62,58 26,60', '46,30 80,38 62,58'] },
  { outline: '4,30 20,8 50,6 66,26 56,48 22,52', facets: ['20,8 50,6 40,26 18,28', '50,6 66,26 40,26', '4,30 18,28 40,26 56,48 22,52', '40,26 66,26 56,48'] },
  { outline: '2,22 14,6 34,2 46,18 38,36 12,38', facets: ['14,6 34,2 28,18 12,20', '34,2 46,18 28,18', '2,22 12,20 28,18 38,36 12,38', '28,18 46,18 38,36'] },
]
const STONE = ['#d8d2c6', '#bdb6aa', '#9d968b', '#8a8379']

export function Rock({ variant = 0, size = 80, style }) {
  const r = ROCKS[variant % ROCKS.length]
  return (
    <svg className="seam-prop" viewBox="0 0 84 64" style={{ width: size, ...style }} aria-hidden="true">
      {r.facets.map((f, i) => (
        <polygon key={i} points={f} fill={STONE[i]} stroke={STONE[i]} strokeWidth="0.6" strokeLinejoin="round" />
      ))}
      <polygon points={r.outline} fill="none" stroke="rgba(17,17,20,0.16)" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  )
}

export function Cloud({ size = 180, style }) {
  return (
    <svg className="seam-prop" viewBox="0 0 200 100" style={{ width: size, ...style }} aria-hidden="true">
      <g fill="#ffffff">
        <circle cx="62" cy="62" r="30" />
        <circle cx="100" cy="46" r="38" />
        <circle cx="140" cy="60" r="28" />
        <circle cx="170" cy="72" r="18" />
        <circle cx="34" cy="74" r="18" />
        <rect x="30" y="70" width="150" height="20" rx="10" />
      </g>
      <path d="M30 82 Q100 96 180 82 L180 90 Q100 100 30 90 Z" fill="#e3edf5" />
    </svg>
  )
}

export function Coin({ size = 46, style }) {
  return (
    <svg className="seam-prop" viewBox="0 0 48 48" style={{ width: size, ...style }} aria-hidden="true">
      <circle cx="24" cy="25" r="20" fill="#a77514" />
      <circle cx="24" cy="23" r="20" fill="#e4ac2f" />
      <circle cx="24" cy="23" r="15" fill="none" stroke="#fff1c2" strokeOpacity="0.6" strokeWidth="1.5" />
      <path d="M24 13 l3 6.4 7 .8 -5.2 4.8 1.4 7 -6.2-3.5 -6.2 3.5 1.4-7 -5.2-4.8 7-.8z" fill="#fff1c2" fillOpacity="0.85" />
    </svg>
  )
}

export function PaperPlane({ size = 110, style }) {
  return (
    <svg className="seam-prop" viewBox="0 0 120 70" style={{ width: size, ...style }} aria-hidden="true">
      <path d="M2 38 L118 4 L58 66 L50 44 Z" fill="#fffefa" stroke="#111114" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M50 44 L118 4 L42 40 Z" fill="#e6e1d6" stroke="#111114" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

// A leafy plant spray: a few long leaves fanning from one base.
export function Leaves({ size = 160, flip = false, style }) {
  const leaves = [
    ['M60 140 C40 100 30 60 52 18', '#4f8a4b'],
    ['M60 140 C70 100 96 70 120 52', '#5f9e57'],
    ['M60 140 C46 110 14 92 0 86', '#3f7a3f'],
    ['M60 140 C64 104 70 74 88 30', '#6aa95f'],
  ]
  return (
    <svg className="seam-prop" viewBox="0 0 130 150" style={{ width: size, transform: flip ? 'scaleX(-1)' : undefined, ...style }} aria-hidden="true">
      {leaves.map(([d, c], i) => (
        <g key={i}>
          <path d={d} stroke={c} strokeWidth="14" strokeLinecap="round" fill="none" />
          <path d={d} stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" fill="none" />
        </g>
      ))}
    </svg>
  )
}

// Props are positioned in % of the page width and px from the seam line.
function Prop({ x, y, speed = 0.08, rot = 0, children }) {
  return (
    <span className="seam-slot" style={{ left: `${x}%`, top: `${y}px`, '--speed': speed, '--rot': `${rot}deg` }}>
      {children}
    </span>
  )
}

// Home (paper) tears open onto Skill Town's sky. Rocks and the plane cross it.
export function SeamHomeSkills() {
  return (
    <div className="seam" aria-hidden="true">
      <TornEdge side="bottom" seed={11} height={110} className="edge-up" />
      <Prop x={3} y={-10} speed={0.12} rot={-8}><Cloud size={190} /></Prop>
      <Prop x={30} y={-36} speed={0.2} rot={12}><Rock variant={2} size={46} /></Prop>
      <Prop x={58} y={-62} speed={0.06} rot={-4}><Rock variant={0} size={86} /></Prop>
      <Prop x={64} y={6} speed={0.24} rot={20}><Rock variant={2} size={34} /></Prop>
      <Prop x={86} y={-18} speed={0.1}><Cloud size={230} /></Prop>
      <Prop x={92} y={-74} speed={0.18} rot={-14}><Rock variant={1} size={60} /></Prop>
    </div>
  )
}

// Skill Town's sea gives way to the flight world's sky across a torn paper strip.
export function SeamSkillsWork() {
  return (
    <div className="seam" aria-hidden="true">
      <TornStrip seed={23} height={74} />
      <Prop x={6} y={-30} speed={0.16} rot={-10}><Rock variant={1} size={58} /></Prop>
      <Prop x={18} y={-20} speed={0.08}><Cloud size={200} /></Prop>
      <Prop x={72} y={-40} speed={0.1}><Cloud size={260} /></Prop>
      <Prop x={90} y={-8} speed={0.22} rot={16}><Rock variant={2} size={40} /></Prop>
    </div>
  )
}

// Awards' paper rises over the flight world: rocks, a gold coin and the plane cross it.
export function SeamWorkAwards() {
  return (
    <div className="seam" aria-hidden="true">
      <TornEdge side="top" seed={47} height={110} className="edge-down" />
      <Prop x={2} y={-50} speed={0.16} rot={-12}><Rock variant={0} size={78} /></Prop>
      <Prop x={40} y={-30} speed={0.22} rot={-18}><PaperPlane size={96} /></Prop>
      <Prop x={70} y={-58} speed={0.12} rot={10}><Rock variant={1} size={54} /></Prop>
      <Prop x={83} y={-22} speed={0.26} rot={-8}><Coin size={44} /></Prop>
      <Prop x={94} y={-40} speed={0.1} rot={6}><Rock variant={2} size={38} /></Prop>
    </div>
  )
}

// Awards and Contact share one paper: no edge, just plants reaching across.
export function SeamAwardsContact() {
  return (
    <div className="seam" aria-hidden="true">
      <Prop x={-2} y={-120} speed={0.06} rot={8}><Leaves size={170} /></Prop>
      <Prop x={94} y={-40} speed={0.1} rot={-6}><Leaves size={130} flip /></Prop>
    </div>
  )
}
