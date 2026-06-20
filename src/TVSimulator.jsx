import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TV_STATES = {
  BOOTING: 'booting',
  READY: 'ready',
};

export default function TVSimulator({ onReady, isReady }) {
  const [state, setState] = useState(isReady ? TV_STATES.READY : TV_STATES.BOOTING);

  // Auto-advance: show Google logo, then reveal the scene
  useEffect(() => {
    if (state === TV_STATES.BOOTING) {
      const timer = setTimeout(() => setState(TV_STATES.READY), 2200);
      return () => clearTimeout(timer);
    }
  }, [state]);

  useEffect(() => {
    if (state === TV_STATES.READY && onReady) onReady();
  }, [state]);

  if (state === TV_STATES.READY) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000', borderRadius: '14px', overflow: 'hidden',
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key="boot"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          style={{
            position: 'absolute', inset: 0, background: '#000',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '22px',
          }}
        >
          {/* Google colored dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {['#4285f4', '#ea4335', '#fbbc04', '#34a853'].map((c, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, y: 0 }}
                animate={{ scale: 1, y: [0, -8, 0] }}
                transition={{
                  scale: { delay: i * 0.12, type: 'spring', stiffness: 220 },
                  y: { delay: 0.6 + i * 0.12, duration: 0.9, repeat: Infinity, ease: 'easeInOut' },
                }}
                style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }}
              />
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontFamily: "'Poppins', sans-serif", letterSpacing: '3px' }}
          >
            Google TV
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
