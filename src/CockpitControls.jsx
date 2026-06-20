// Cockpit control room — an "Enter Cockpit" button that opens a sci-fi HUD panel
// to pick the hull color and camera view. Purely presentational; state lives in App.
import { motion, AnimatePresence } from 'framer-motion';

const VIEWS = [
  { id: 'cockpit', label: 'COCKPIT', icon: '⌂' },
  { id: 'chase', label: 'CHASE', icon: '▣' },
  { id: 'top', label: 'TOP', icon: '▲' },
  { id: 'left', label: 'LEFT', icon: '◀' },
  { id: 'right', label: 'RIGHT', icon: '▶' },
  { id: 'front', label: 'FRONT', icon: '◆' },
];

const COLORS = [
  { name: 'Titanium', hex: '#eef2f7' },
  { name: 'Crimson', hex: '#e63946' },
  { name: 'Ion Blue', hex: '#1f7bff' },
  { name: 'Solar Gold', hex: '#f4a300' },
  { name: 'Emerald', hex: '#2ec4b6' },
  { name: 'Plasma', hex: '#ff4fa3' },
  { name: 'Lime', hex: '#a3e635' },
  { name: 'Stealth', hex: '#2b3242' },
];

const CYAN = '#27e0ff';

export default function CockpitControls({ open, setOpen, view, setView, color, setColor }) {
  return (
    <>
      {/* Enter / Exit button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'absolute', top: '74px', left: '20px', zIndex: 10001,
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '9px 16px', cursor: 'pointer',
          fontFamily: "ui-monospace, 'SF Mono', 'Courier New', monospace",
          fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px',
          color: open ? '#0a0e14' : CYAN,
          background: open ? CYAN : 'rgba(8,14,22,0.7)',
          border: `1px solid ${CYAN}`,
          borderRadius: '6px',
          backdropFilter: 'blur(8px)',
          boxShadow: `0 0 18px -4px ${CYAN}`,
          textTransform: 'uppercase',
          clipPath: 'polygon(0 0, 100% 0, 100% 70%, 92% 100%, 0 100%)',
        }}
      >
        <span style={{ fontSize: '14px' }}>{open ? '✕' : '⌖'}</span>
        {open ? 'Exit Cockpit' : 'Enter Cockpit'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="cockpit-panel"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            style={{
              position: 'absolute', top: '120px', left: '20px', zIndex: 10001,
              width: 'min(290px, 78vw)',
              padding: '18px 18px 20px',
              fontFamily: "ui-monospace, 'SF Mono', 'Courier New', monospace",
              color: '#cfe9f5',
              background: 'linear-gradient(160deg, rgba(10,16,24,0.92), rgba(8,12,20,0.88))',
              border: `1px solid ${CYAN}55`,
              borderRadius: '12px',
              backdropFilter: 'blur(12px)',
              boxShadow: `0 0 0 1px rgba(39,224,255,0.08), 0 24px 60px -24px rgba(0,0,0,0.8), inset 0 0 40px rgba(39,224,255,0.04)`,
              clipPath: 'polygon(0 0, 100% 0, 100% 94%, 95% 100%, 0 100%)',
              overflow: 'hidden',
            }}
          >
            {/* scanline overlay */}
            <div aria-hidden style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
              background: 'repeating-linear-gradient(0deg, rgba(39,224,255,0.05) 0px, rgba(39,224,255,0.05) 1px, transparent 1px, transparent 4px)',
            }} />

            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '2px', color: CYAN, textShadow: `0 0 10px ${CYAN}99` }}>◢ FLIGHT DECK</span>
              <span style={{ fontSize: '9px', color: '#10b981' }}>● SYS ONLINE</span>
            </div>
            <div style={{ fontSize: '9px', letterSpacing: '1px', color: '#5b7488', marginBottom: '16px' }}>AVIONICS // MK-III AVATAR</div>

            {/* VIEW selector */}
            <SectionLabel>Viewport</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '18px' }}>
              {VIEWS.map((v) => {
                const active = view === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setView(v.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                      padding: '8px 4px', cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.5px',
                      color: active ? '#0a0e14' : CYAN,
                      background: active ? CYAN : 'rgba(39,224,255,0.06)',
                      border: `1px solid ${active ? CYAN : 'rgba(39,224,255,0.25)'}`,
                      borderRadius: '6px',
                      boxShadow: active ? `0 0 14px -2px ${CYAN}` : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '13px' }}>{v.icon}</span>
                    {v.label}
                  </button>
                );
              })}
            </div>

            {/* HULL color */}
            <SectionLabel>Hull Finish</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px', marginBottom: '8px' }}>
              {COLORS.map((c) => {
                const active = color === c.hex;
                return (
                  <button
                    key={c.hex}
                    title={c.name}
                    onClick={() => setColor(c.hex)}
                    style={{
                      width: '100%', aspectRatio: '1', cursor: 'pointer',
                      background: c.hex,
                      border: active ? `2px solid ${CYAN}` : '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '5px',
                      boxShadow: active ? `0 0 12px -2px ${CYAN}` : 'inset 0 -3px 6px rgba(0,0,0,0.3)',
                      transform: active ? 'scale(1.12)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                    }}
                  />
                );
              })}
            </div>
            <div style={{ fontSize: '9px', color: '#5b7488', marginBottom: '14px' }}>
              FINISH: <span style={{ color: CYAN }}>{(COLORS.find((c) => c.hex === color) || {}).name || 'CUSTOM'}</span>
            </div>

            {/* fake telemetry strip for flavor */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', gap: '6px',
              paddingTop: '12px', borderTop: '1px solid rgba(39,224,255,0.15)',
              fontSize: '9px', color: '#5b7488',
            }}>
              <span>THRUST <b style={{ color: CYAN }}>NOMINAL</b></span>
              <span>HULL <b style={{ color: '#10b981' }}>100%</b></span>
              <span>NAV <b style={{ color: CYAN }}>LOCK</b></span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
      <span style={{ color: '#f4a300', fontSize: '8px' }}>◢</span>
      <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', color: '#8fb3c7' }}>{children}</span>
      <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(39,224,255,0.3), transparent)' }} />
    </div>
  );
}
