import { motion, AnimatePresence } from 'framer-motion'

const NARRATIVES = [
  {
    line: "I started with curiosity\u2026",
    sub: "and a terminal that never closed.",
    position: "bottom-left",
  },
  {
    line: "Curiosity became obsession.",
    sub: "every language a new superpower.",
    position: "bottom-right",
  },
  {
    line: "Every project became a universe.",
    sub: "built from scratch, flown with passion.",
    position: "top-left",
  },
  {
    line: "The world started noticing.",
    sub: "certifications, competitions, recognition.",
    position: "bottom-left",
  },
  {
    line: "Now I\u2019m looking for the next adventure.",
    sub: "let\u2019s build something extraordinary.",
    position: "bottom-right",
  },
]

const positionStyles = {
  "bottom-left": { bottom: '80px', left: '40px', textAlign: 'left' },
  "bottom-right": { bottom: '80px', right: '40px', textAlign: 'right' },
  "top-left": { top: '100px', left: '40px', textAlign: 'left' },
  "top-right": { top: '100px', right: '40px', textAlign: 'right' },
}

export default function NarrativeLayer({ activeIndex, fontBlack = true }) {
  const narrative = NARRATIVES[activeIndex]
  if (!narrative) return null

  const pos = positionStyles[narrative.position]
  const isDark = fontBlack // fontBlack means dark text = light background

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          zIndex: 90,
          pointerEvents: 'none',
          maxWidth: '360px',
          ...pos,
        }}
      >
        <p style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: '1.3rem',
          fontWeight: 600,
          color: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.85)',
          margin: 0,
          lineHeight: 1.4,
          textShadow: isDark ? 'none' : '0 2px 20px rgba(0,0,0,0.5)',
        }}>
          {narrative.line}
        </p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            fontFamily: "'Quicksand', sans-serif",
            fontSize: '0.85rem',
            fontWeight: 400,
            color: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)',
            margin: '6px 0 0 0',
            lineHeight: 1.4,
            fontStyle: 'italic',
          }}
        >
          {narrative.sub}
        </motion.p>
      </motion.div>
    </AnimatePresence>
  )
}
