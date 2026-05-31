import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DEVICES = {
  iphone: {
    label: 'iPhone',
    screenWidth: 390,
    screenHeight: 680,
  },
  ipad: {
    label: 'iPad',
    screenWidth: 780,
    screenHeight: 540,
  },
  macbook: {
    label: 'MacBook',
    screenWidth: 1200,
    screenHeight: 520,
  },
};

export default function DevicePreview({ show, url, onClose }) {
  const [device, setDevice] = useState('iphone');

  if (!show) return null;

  const d = DEVICES[device];

  // Scale to fit within 80vh and 88vw
  const maxW = window.innerWidth * 0.88;
  const maxH = window.innerHeight * 0.8;
  const totalW = d.screenWidth + 2; // border
  const totalH = d.screenHeight + 44; // titlebar + border
  const scale = Math.min(1, maxW / totalW, maxH / totalH);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 30 }}
        transition={{ type: 'spring', damping: 22, stiffness: 200 }}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* macOS Window */}
        <motion.div
          key={device}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          style={{
            width: `${d.screenWidth}px`,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
            background: '#1e1e1e',
          }}
        >
          {/* macOS Title Bar */}
          <div style={{
            height: '44px',
            background: 'linear-gradient(180deg, #3c3c3c 0%, #2a2a2a 100%)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: '12px',
            borderBottom: '1px solid #1a1a1a',
          }}>
            {/* Traffic lights */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
              <button
                onClick={onClose}
                style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: '#ff5f57', border: '1px solid #e0443e',
                  cursor: 'pointer', padding: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', color: 'transparent',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#4a0000'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'transparent'}
              >
                ✕
              </button>
              <div style={{
                width: '14px', height: '14px', borderRadius: '50%',
                background: '#febc2e', border: '1px solid #dea123',
              }} />
              <div style={{
                width: '14px', height: '14px', borderRadius: '50%',
                background: '#28c840', border: '1px solid #1aab29',
              }} />
            </div>

            {/* Device switcher - takes remaining space, centered */}
            <div style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
            }}>
              <div style={{
                display: 'flex',
                gap: '2px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                padding: '3px',
              }}>
                {Object.entries(DEVICES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setDevice(key)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 600,
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                      background: device === key ? 'rgba(255,255,255,0.15)' : 'transparent',
                      color: device === key ? '#fff' : 'rgba(255,255,255,0.5)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content area */}
          <div style={{
            width: `${d.screenWidth}px`,
            height: `${d.screenHeight}px`,
            background: '#fff',
          }}>
            <iframe
              src={url}
              title="Live Site Preview"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
