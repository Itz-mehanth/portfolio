// The way into mixed reality: a lobby over the site that explains what's inside
// and starts the session (passthrough AR on a Quest, VR where there's no
// passthrough, or an emulated Quest 3 on this screen when there's no headset).
// Loaded only when the visitor opens it (MRLauncher.jsx).
import { useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import MRScene from './MRScene'
import { SECTIONS } from './sections'
import './mr.css'

// The emulator is installed separately (emulator.js), so the store never injects one.
const storeOptions = () => ({
  emulate: false,
  offerSession: false,
  enterGrantedSession: false,
  handTracking: true,
  hitTest: false,
  anchors: false,
  planeDetection: false,
  meshDetection: false,
  layers: false,
  domOverlay: false,
  depthSensing: false,
  bodyTracking: false,
  frameRate: 'high',
})

export default function MRExperience({ onClose }) {
  const [support, setSupport] = useState({ ar: null, vr: null })
  const [preview, setPreview] = useState(false)
  const [inSession, setInSession] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const [pendingLink, setPendingLink] = useState(null)
  const [start, setStart] = useState(0)          // the world the session opens in
  const [sessions, setSessions] = useState(0)    // remounts the scene for each session

  useEffect(() => {
    const xr = navigator.xr
    if (!xr) {
      setSupport({ ar: false, vr: false })
      return
    }
    // Some browsers never answer when there's no XR runtime: give up after 2 s.
    const ask = (mode) => Promise.race([
      xr.isSessionSupported(mode).catch(() => false),
      new Promise((resolve) => setTimeout(() => resolve(false), 2000)),
    ])
    Promise.all([ask('immersive-ar'), ask('immersive-vr')]).then(([ar, vr]) => setSupport({ ar, vr }))
  }, [])

  // A fresh store once the emulator has replaced navigator.xr.
  const [emulatorReady, setEmulatorReady] = useState(false)
  const store = useMemo(() => createXRStore(storeOptions()), [emulatorReady])  // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => store.destroy?.(), [store])

  // Follow the session: hide the lobby inside it, bring it back after.
  useEffect(() => store.subscribe((state, prev) => {
    if (state.session && !prev.session) {
      setSessions((n) => n + 1)
      setInSession(true)
      setStarting(false)
    }
    if (!state.session && prev.session) setInSession(false)
  }), [store])

  // The emulated headset loads in the background; like a real one, it then needs
  // a click to start the session ("Start preview").
  useEffect(() => {
    if (!preview) return undefined
    let live = true
    import('./emulator')
      .then(({ installEmulator }) => installEmulator())
      .then(() => {
        if (!live) return
        setEmulatorReady(true)
        setStarting(false)
      })
      .catch((e) => {
        if (!live) return
        setStarting(false)
        setError(e?.message || 'The emulator could not load.')
      })
    return () => { live = false }
  }, [preview])

  // While the preview runs, the site steps out of the way of the emulated view.
  useEffect(() => {
    document.body.classList.toggle('mr-preview-live', inSession && emulatorReady)
    return () => document.body.classList.remove('mr-preview-live')
  }, [inSession, emulatorReady])

  // Escape closes the lobby (outside a session).
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !inSession && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inSession, onClose])

  const enter = () => {
    setError('')
    setStarting(true)
    const request = support.ar ? store.enterAR() : store.enterVR()
    request.catch((e) => {
      setStarting(false)
      setError(e?.message || 'Mixed reality could not start on this device.')
    })
  }
  const startPreview = () => {
    setError('')
    if (!preview) {
      setStarting(true)
      setPreview(true)        // loads the emulator; the button then becomes "Start preview"
      return
    }
    if (!emulatorReady) return
    setStarting(true)
    store.enterAR().catch((e) => {
      setStarting(false)
      setError(e?.message || 'The preview could not start.')
    })
  }
  const exit = () => store.getState().session?.end()
  // Links can't open inside an immersive session: leave it, then offer the link.
  const openLink = (url) => {
    setPendingLink(url)
    exit()
  }
  const followLink = () => {
    if (pendingLink.startsWith('mailto:')) window.location.href = pendingLink
    else window.open(pendingLink, '_blank', 'noopener')
    setPendingLink(null)
  }

  const headset = support.ar || support.vr
  const linkName = pendingLink?.startsWith('mailto:') ? 'your email app' : pendingLink?.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]

  return (
    <div className={`mr-root${inSession ? ' is-live' : ''}`}>
      <div className="mr-canvas" aria-hidden={!inSession}>
        <Canvas
          key={emulatorReady ? 'preview' : 'device'}
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [0, 1.6, 0], fov: 70, near: 0.01, far: 100 }}
          frameloop={inSession ? 'always' : 'demand'}
        >
          <XR store={store}>
            <MRScene key={sessions} start={start} onLink={openLink} onExit={exit} />
          </XR>
        </Canvas>
      </div>

      {inSession && preview && (
        <button type="button" className="mr-exit-preview" onClick={exit}>Exit preview</button>
      )}

      {!inSession && (
        <div className="mr-lobby" role="dialog" aria-modal="true" aria-labelledby="mr-title">
          <button type="button" className="mr-close" onClick={onClose} aria-label="Close mixed reality">✕</button>
          <span className="mr-eyebrow">Mixed reality</span>
          <h2 id="mr-title" className="mr-title">Step into the portfolio</h2>
          <p className="mr-lede">
            Each section tears open its own world in your room. Travel between them from a dock at your fingertips.
          </p>
          <ol className="mr-worlds" aria-label="Choose the world to start in">
            {SECTIONS.map((s, i) => (
              <li key={s.id} style={{ '--a': s.colors[0], '--b': s.colors[1] }}>
                <button type="button" className={`mr-world${i === start ? ' is-start' : ''}`} aria-pressed={i === start} onClick={() => setStart(i)}>
                  <span className="mr-world-dot" />
                  <span className="mr-world-num">{s.number}</span>
                  <span className="mr-world-label">{s.label}</span>
                  <span className="mr-world-desc">{WORLD_LINES[s.id]}</span>
                </button>
              </li>
            ))}
          </ol>
          <p className="mr-pick">Tap a world to start there. You can travel to the others from inside.</p>

          {pendingLink && (
            <div className="mr-link">
              <span>You asked to open {linkName}.</span>
              <button type="button" className="mr-btn mr-btn-primary" onClick={followLink}>Open it now</button>
            </div>
          )}

          <div className="mr-actions">
            {headset && (
              <button type="button" className="mr-btn mr-btn-primary" onClick={enter} disabled={starting}>
                {starting ? 'Starting…' : support.ar ? 'Enter mixed reality' : 'Enter VR'}
              </button>
            )}
            {support.ar === false && support.vr === false && (
              <button type="button" className="mr-btn mr-btn-primary" onClick={startPreview} disabled={starting}>
                {!preview ? 'Preview on this screen' : !emulatorReady ? 'Loading the emulator…' : starting ? 'Starting…' : 'Start preview'}
              </button>
            )}
            <button type="button" className="mr-btn" onClick={onClose}>Back to the site</button>
          </div>

          <p className="mr-note">
            {support.ar === null
              ? 'Checking this device…'
              : headset
                ? 'Use your hands (poke or pinch the dock) or controllers (point and pull the trigger).'
                : 'No headset here. Open mehanth.site in the Meta Quest browser to step in for real, or preview it with an emulated Quest 3: drag to look around, and use the emulator panel to move the controllers.'}
          </p>
          {error && <p className="mr-error" role="alert">{error}</p>}
        </div>
      )}
    </div>
  )
}

const WORLD_LINES = {
  home: 'Deep space tears into your room; my name floats in front of a ringed planet.',
  skills: 'Skill Town as a tabletop island: tap a district to see its skills.',
  work: 'Project balloons drift around you; tap one for its story and links.',
  awards: 'A shelf of trophies under a golden sky, with every win around it.',
  contact: 'A sunlit corner with a window, my mug and a card to say hi.',
}
