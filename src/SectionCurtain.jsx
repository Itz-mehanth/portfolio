// Signature screen transition: two tilted paper sheets (amber, then ink) sweep
// across in the direction of travel, the next screen's number and name flash on
// the ink sheet, and the sheets peel away to reveal it. The screen swap happens
// while the viewport is covered, which also hides any 3D scene spinning up.
import { AnimatePresence, motion } from 'framer-motion'

export const CURTAIN_COVER_MS = 420   // until the viewport is fully covered
export const CURTAIN_HOLD_MS = 260    // label holds before the reveal starts

const EASE = [0.76, 0, 0.24, 1]

// direction 1 = moving down the page (sheets rise from the bottom), -1 = moving up
const sheet = (direction, delay) => ({
  initial: { y: direction > 0 ? '115%' : '-115%' },
  animate: { y: '0%', transition: { duration: CURTAIN_COVER_MS / 1000 - delay, delay, ease: EASE } },
  exit: { y: direction > 0 ? '-115%' : '115%', transition: { duration: 0.5, delay: 0.08 - delay, ease: EASE } },
})

export default function SectionCurtain({ curtain, onCovered }) {
  return (
    <AnimatePresence>
      {curtain && (
        <div
          key={curtain.key}
          aria-hidden="true"
          style={{ position: 'fixed', inset: 0, zIndex: 1100, pointerEvents: 'none', overflow: 'hidden' }}
        >
          <motion.div
            {...sheet(curtain.direction, 0)}
            style={{ ...sheetStyle(curtain.direction), background: 'var(--accent)' }}
          />
          <motion.div
            {...sheet(curtain.direction, 0.07)}
            onAnimationComplete={(definition) => {
              if (definition === 'animate' || definition?.y === '0%') onCovered?.()
            }}
            style={{ ...sheetStyle(curtain.direction), background: 'var(--ink)' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 26 * curtain.direction }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.22, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              style={{ ...labelStyle, skewY: curtain.direction > 0 ? 5 : -5 }}
            >
              <span style={numberStyle}>{curtain.number}</span>
              <span style={nameStyle}>{curtain.label}</span>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Taller than the viewport and skewed, so the leading edge sweeps in at an angle.
const sheetStyle = (direction) => ({
  position: 'absolute',
  left: '-10vw',
  width: '120vw',
  top: '-15vh',
  height: '130vh',
  skewY: direction > 0 ? -5 : 5,  // motion value, so it composes with the animated y
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const labelStyle = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 'clamp(12px, 2vw, 24px)',
  padding: '0 24px',
}

const numberStyle = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: 'clamp(14px, 1.6vw, 18px)',
  letterSpacing: '0.14em',
  color: 'var(--accent)',
}

const nameStyle = {
  fontFamily: 'var(--font-display)',
  fontWeight: 800,
  fontSize: 'clamp(48px, 11vw, 160px)',
  lineHeight: 1,
  letterSpacing: '-0.04em',
  color: '#fff',
}
