// Seams: what sits between two sections instead of a straight border. Each seam is
// a zero-height strip placed between two sections (z-index above both), so its
// torn paper edge and props overlap the bottom of one section and the top of the
// next. Props parallax with scroll: App.jsx writes --seam (px from the viewport
// middle) on every .seam, and each prop moves by --seam × its --speed.
import './Seams.css'

// ---------- torn paper ----------
// Seeded random numbers, so every tear looks the same on every visit.
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

// Smooth 1D value noise in [-1, 1].
function noise1D(seed) {
  const rnd = seeded(seed)
  const lattice = Array.from({ length: 512 }, () => rnd() * 2 - 1)
  return (x) => {
    const i = Math.floor(x)
    const f = x - i
    const t = f * f * (3 - 2 * f)
    const a = lattice[((i % 512) + 512) % 512]
    const b = lattice[(((i + 1) % 512) + 512) % 512]
    return a + (b - a) * t
  }
}

// The tears are drawn in real pixels across a wide sheet and cropped to the
// screen (never stretched), so the fibres look the same on a phone and a monitor.
const SHEET_W = 2400

// A torn line: broad wander, medium lumps, small bites and fine jaggies, with the
// occasional sharp nick, like paper pulled apart by hand.
function tearLine(seed, y, amp = 1, step = 4) {
  const octaves = [[460, 22], [160, 11], [48, 5], [13, 2.2], [5, 0.9]].map(([len, a], k) => [len, a * amp, noise1D(seed + k * 101)])
  const rnd = seeded(seed + 7)
  const pts = []
  for (let x = -8; x <= SHEET_W + 8; x += step) {
    let dy = 0
    for (const [len, a, n] of octaves) dy += n(x / len) * a
    if (rnd() < 0.025) dy += (rnd() - 0.3) * 9 * amp
    pts.push([x, y + dy])
  }
  return pts
}

// A second line hugging the first: the white fibrous rim, wider in some places.
function rimLine(base, seed, dir, width = 7) {
  const wide = noise1D(seed + 3)
  const fine = noise1D(seed + 5)
  return base.map(([x, y]) => [x, y + dir * (width * (0.55 + 0.6 * Math.abs(wide(x / 90))) + fine(x / 3) * 1.4)])
}

const toPoints = (pts) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')
// Closed sheet: the torn line, then back along the flat side (y = flat).
const sheetPath = (pts, flat) => `M${toPoints(pts)} L${SHEET_W + 8},${flat} L-8,${flat} Z`
const linePath = (pts) => `M${toPoints(pts)}`

// SVG filters for one sheet: hair-like fibres for the rim, a finer roughness for
// the paper face, paper grain, and a soft blur for shadows and edge shading.
function PaperFilters({ id, seed }) {
  return (
    <defs>
      <filter id={`${id}-fibre`} x="-1%" y="-40%" width="102%" height="180%">
        <feTurbulence type="fractalNoise" baseFrequency="0.38 0.05" numOctaves="2" seed={seed} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id={`${id}-rough`} x="-1%" y="-20%" width="102%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9 0.12" numOctaves="1" seed={seed + 1} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed={seed + 2} stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0.9 -0.25" />
      </filter>
      <filter id={`${id}-soft`} x="-5%" y="-50%" width="110%" height="200%">
        <feGaussianBlur stdDeviation="3.2" />
      </filter>
    </defs>
  )
}

// One torn sheet: its own soft shadow, a white fibrous rim, the paper face with
// grain, and a little shading just inside the tear where the paper lifts.
function Sheet({ id, seed, pts, rim, flat, color, rimColor, shade = 'rgba(120, 96, 60, 0.22)', H }) {
  const face = sheetPath(pts, flat)
  return (
    <g>
      <PaperFilters id={id} seed={seed} />
      <path d={sheetPath(rim, flat)} fill="rgba(40, 30, 20, 0.22)" filter={`url(#${id}-soft)`} transform="translate(0 5)" />
      <path d={sheetPath(rim, flat)} fill={rimColor} filter={`url(#${id}-fibre)`} />
      <clipPath id={`${id}-face`}>
        <path d={face} />
      </clipPath>
      <path d={face} fill={color} filter={`url(#${id}-rough)`} />
      <g clipPath={`url(#${id}-face)`}>
        <rect x="0" y="0" width={SHEET_W} height={H} filter={`url(#${id}-grain)`} opacity="0.16" />
        <path d={linePath(pts)} fill="none" stroke={shade} strokeWidth="12" filter={`url(#${id}-soft)`} />
      </g>
    </g>
  )
}

// A sheet whose bottom (or top) edge is torn. `under` adds a second, darker sheet
// peeking out beneath, like stacked paper.
function TornEdge({ side = 'bottom', color = '#f4f1ea', rim = '#ffffff', seed = 7, height = 170, under = '#e4dccb', className = '' }) {
  const id = `tear-${side}-${seed}`
  const H = height
  const dir = side === 'bottom' ? 1 : -1
  const flat = side === 'bottom' ? -10 : H + 10
  // The tear sits 65px from the torn side's end; the rest of the height is flat
  // sheet that fades out (see Seams.css), well clear of the tear.
  const edgeY = side === 'bottom' ? H - 65 : 65
  const top = tearLine(seed, edgeY, 1)
  const lower = under ? tearLine(seed + 40, edgeY + dir * 18, 0.8) : null
  return (
    <svg
      className={`torn-edge torn-${side} ${className}`}
      viewBox={`0 0 ${SHEET_W} ${H}`}
      preserveAspectRatio={side === 'bottom' ? 'xMidYMax slice' : 'xMidYMin slice'}
      style={{ height }}
      aria-hidden="true"
    >
      {lower && (
        <Sheet id={`${id}-u`} seed={seed + 17} pts={lower} rim={rimLine(lower, seed + 9, dir, 5)} flat={flat} color={under} rimColor="#f7f2e8" H={H} shade="rgba(90, 70, 40, 0.2)" />
      )}
      <Sheet id={id} seed={seed} pts={top} rim={rimLine(top, seed, dir, 7)} flat={flat} color={color} rimColor={rim} H={H} />
    </svg>
  )
}

// A strip of paper torn along both edges, laid across a seam.
function TornStrip({ seed = 5, height = 100, color = '#fbf8f1', rim = '#ffffff' }) {
  const id = `strip-${seed}`
  const H = height
  // Both tears stay clear of the middle, so the strip always covers the seam line.
  const top = tearLine(seed, H * 0.24, 0.38)
  const bottom = tearLine(seed + 9, H * 0.76, 0.38)
  const topRim = rimLine(top, seed, -1, 6)
  const bottomRim = rimLine(bottom, seed + 4, 1, 6)
  const band = (a, b) => `M${toPoints(a)} L${toPoints(b.slice().reverse())} Z`
  return (
    <svg className="torn-strip" viewBox={`0 0 ${SHEET_W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ height }} aria-hidden="true">
      <PaperFilters id={id} seed={seed} />
      <path d={band(topRim, bottomRim)} fill="rgba(40, 30, 20, 0.25)" filter={`url(#${id}-soft)`} transform="translate(0 6)" />
      <path d={band(topRim, bottomRim)} fill={rim} filter={`url(#${id}-fibre)`} />
      <clipPath id={`${id}-face`}>
        <path d={band(top, bottom)} />
      </clipPath>
      <path d={band(top, bottom)} fill={color} filter={`url(#${id}-rough)`} />
      <g clipPath={`url(#${id}-face)`}>
        <rect x="0" y="0" width={SHEET_W} height={H} filter={`url(#${id}-grain)`} opacity="0.16" />
        <path d={linePath(top)} fill="none" stroke="rgba(120, 96, 60, 0.2)" strokeWidth="10" filter={`url(#${id}-soft)`} />
        <path d={linePath(bottom)} fill="none" stroke="rgba(120, 96, 60, 0.2)" strokeWidth="10" filter={`url(#${id}-soft)`} />
      </g>
    </svg>
  )
}

// A small torn scrap of paper drifting near a seam.
export function Scrap({ size = 34, seed = 3, style }) {
  const rnd = seeded(seed)
  const pts = Array.from({ length: 11 }, (_, i) => {
    const a = (i / 11) * Math.PI * 2
    const r = 15 + rnd() * 7
    return [24 + Math.cos(a) * r, 18 + Math.sin(a) * r * 0.62]
  })
  const d = `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')} Z`
  return (
    <svg className="seam-prop" viewBox="0 0 48 36" style={{ width: size, ...style }} aria-hidden="true">
      <path d={d} fill="#ffffff" />
      <path d={d} fill="#f4efe4" transform="translate(24 18) scale(0.86) translate(-24 -18)" />
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
      <TornEdge side="bottom" seed={11} className="edge-up" />
      <Prop x={22} y={18} speed={0.3} rot={-18}><Scrap size={30} seed={4} /></Prop>
      <Prop x={74} y={-8} speed={0.34} rot={24}><Scrap size={22} seed={9} /></Prop>
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
      <TornStrip seed={23} />
      <Prop x={44} y={-34} speed={0.3} rot={14}><Scrap size={26} seed={12} /></Prop>
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
      <TornEdge side="top" seed={47} className="edge-down" />
      <Prop x={56} y={-70} speed={0.32} rot={-22}><Scrap size={28} seed={21} /></Prop>
      <Prop x={2} y={-50} speed={0.16} rot={-12}><Rock variant={0} size={78} /></Prop>
      <Prop x={40} y={-30} speed={0.22} rot={-18}><PaperPlane size={96} /></Prop>
      <Prop x={70} y={-58} speed={0.12} rot={10}><Rock variant={1} size={54} /></Prop>
      <Prop x={83} y={-22} speed={0.26} rot={-8}><Coin size={44} /></Prop>
      <Prop x={94} y={-40} speed={0.1} rot={6}><Rock variant={2} size={38} /></Prop>
    </div>
  )
}

// Awards and Contact share one paper: no edge and no props (the 3D desk props
// in each section carry the transition).
export function SeamAwardsContact() {
  return <div className="seam" aria-hidden="true" />
}
