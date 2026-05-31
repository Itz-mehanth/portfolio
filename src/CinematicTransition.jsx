import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

const TRANSITION_EFFECTS = {
  '0-1': {
    // Lander → Skills: Zoom dive into the city
    overlay: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.95) 70%)',
    scale: [1, 1.8],
    opacity: [0, 1, 1, 0],
    blur: ['0px', '0px', '3px', '0px'],
    label: 'ENTERING SKILL TOWN',
    duration: 0.9,
  },
  '1-2': {
    // Skills → Projects: Launch into the sky
    overlay: 'linear-gradient(180deg, rgba(10,10,40,0.95) 0%, rgba(0,0,0,0.8) 100%)',
    scale: [1, 0.8],
    opacity: [0, 1, 1, 0],
    blur: ['0px', '0px', '2px', '0px'],
    label: 'LAUNCHING INTO ORBIT',
    duration: 0.9,
  },
  '2-3': {
    // Projects → Certificates: Portal warp
    overlay: 'radial-gradient(ellipse at 50% 50%, rgba(0,200,255,0.15) 0%, rgba(0,0,0,0.9) 60%)',
    scale: [0.9, 1],
    opacity: [0, 1, 1, 0],
    blur: ['4px', '0px', '0px', '0px'],
    label: 'ACHIEVEMENT UNLOCKED',
    duration: 0.8,
  },
  '3-4': {
    // Certificates → Contact: Gentle resolve
    overlay: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%)',
    scale: [1, 1],
    opacity: [0, 1, 1, 0],
    blur: ['0px', '0px', '0px', '0px'],
    label: "LET'S CONNECT",
    duration: 0.7,
  },
}

// Reverse transitions (going back)
const REVERSE_EFFECTS = {
  '1-0': { ...TRANSITION_EFFECTS['0-1'], label: 'RETURNING HOME', scale: [1.8, 1] },
  '2-1': { ...TRANSITION_EFFECTS['1-2'], label: 'BACK TO BASE', scale: [0.8, 1] },
  '3-2': { ...TRANSITION_EFFECTS['2-3'], label: 'RESUMING FLIGHT', scale: [1, 0.9] },
  '4-3': { ...TRANSITION_EFFECTS['3-4'], label: 'REVIEWING ACHIEVEMENTS' },
}

export default function CinematicTransition({ fromIndex, toIndex, onComplete }) {
  const [phase, setPhase] = useState('enter') // enter → hold → exit
  const key = `${fromIndex}-${toIndex}`
  const effect = TRANSITION_EFFECTS[key] || REVERSE_EFFECTS[key] || null
  const completedRef = useRef(false)

  useEffect(() => {
    if (!effect) {
      onComplete?.()
      return
    }

    completedRef.current = false

    const holdTimer = setTimeout(() => {
      setPhase('exit')
    }, effect.duration * 500)

    const exitTimer = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true
        onComplete?.()
      }
    }, effect.duration * 1000)

    return () => {
      clearTimeout(holdTimer)
      clearTimeout(exitTimer)
    }
  }, [fromIndex, toIndex])

  if (!effect) return null

  const isDark = key !== '3-4' && key !== '4-3'

  return (
    <motion.div
      key={`${fromIndex}-${toIndex}`}
      initial={{ opacity: 0, scale: effect.scale[0] }}
      animate={{
        opacity: phase === 'enter' ? 1 : 0,
        scale: phase === 'enter' ? effect.scale[1] : effect.scale[1],
      }}
      transition={{
        duration: effect.duration * 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: effect.overlay,
        pointerEvents: 'none',
      }}
    >
      {/* Speed lines */}
      {(key === '1-2' || key === '2-1') && (
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          opacity: 0.3,
        }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ height: '0%', opacity: 0 }}
              animate={{ height: '100%', opacity: [0, 0.6, 0] }}
              transition={{ duration: 0.6, delay: i * 0.03 }}
              style={{
                position: 'absolute',
                width: '1px',
                left: `${8 + i * 7.5}%`,
                top: 0,
                background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.8), transparent)',
              }}
            />
          ))}
        </div>
      )}

      {/* Warp rings for portal transition */}
      {(key === '2-3' || key === '3-2') && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: [0, 2.5], opacity: [0.8, 0] }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                border: '2px solid rgba(0, 200, 255, 0.5)',
              }}
            />
          ))}
        </div>
      )}

      {/* Label */}
      <motion.span
        initial={{ opacity: 0, y: 10, letterSpacing: '2px' }}
        animate={{ opacity: 1, y: 0, letterSpacing: '6px' }}
        transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
        style={{
          fontFamily: "'Silkscreen', monospace",
          fontSize: '0.7rem',
          color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
          textTransform: 'uppercase',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {effect.label}
      </motion.span>
    </motion.div>
  )
}
