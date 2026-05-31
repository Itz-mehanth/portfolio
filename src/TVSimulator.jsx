import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Power, Home, Wifi, Globe, Settings, ChevronLeft, ChevronRight, Lock, Unlock, Check, Search, Clock } from 'lucide-react';

const TV_STATES = {
  OFF: 'off',
  BOOTING: 'booting',
  HOME: 'home',
  WIFI: 'wifi',
  CONNECTING: 'connecting',
  CHROME: 'chrome',
  READY: 'ready',
};

export default function TVSimulator({ onReady, isReady }) {
  const [state, setState] = useState(isReady ? TV_STATES.READY : TV_STATES.OFF);
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (state === TV_STATES.BOOTING) {
      const timer = setTimeout(() => setState(TV_STATES.HOME), 2200);
      return () => clearTimeout(timer);
    }
    if (state === TV_STATES.CONNECTING) {
      const timer = setTimeout(() => setState(TV_STATES.CHROME), 1500);
      return () => clearTimeout(timer);
    }
    if (state === TV_STATES.CHROME) {
      const timer = setTimeout(() => setState(TV_STATES.READY), 1800);
      return () => clearTimeout(timer);
    }
  }, [state]);

  useEffect(() => {
    if (state === TV_STATES.READY && onReady) onReady();
  }, [state]);

  if (state === TV_STATES.READY) return null;

  const handlePower = () => {
    if (state === TV_STATES.OFF) setState(TV_STATES.BOOTING);
    else setState(TV_STATES.OFF);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000', borderRadius: '14px', overflow: 'hidden',
    }}>
      <AnimatePresence mode="wait">
        {/* OFF */}
        {state === TV_STATES.OFF && (
          <motion.div
            key="off"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}
          >
            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff3b30' }}
            />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', fontFamily: "'Quicksand', sans-serif", letterSpacing: '0.5px' }}>
              Press power to turn on
            </p>
          </motion.div>
        )}

        {/* BOOTING */}
        {state === TV_STATES.BOOTING && (
          <motion.div
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, background: '#000',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px',
            }}
          >
            {/* Google TV logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {['#4285f4', '#ea4335', '#fbbc04', '#34a853'].map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.15, type: 'spring', stiffness: 200 }}
                  style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }}
                />
              ))}
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontFamily: "'Poppins', sans-serif", letterSpacing: '2px' }}
            >
              Google TV
            </motion.p>
          </motion.div>
        )}

        {/* HOME */}
        {state === TV_STATES.HOME && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0,
              background: '#1a1a1a',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Status bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 24px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {['#4285f4', '#ea4335', '#fbbc04', '#34a853'].map((c, i) => (
                    <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 500, fontFamily: "'Poppins', sans-serif" }}>
                  For You
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Search size={16} color="rgba(255,255,255,0.5)" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} color="rgba(255,255,255,0.4)" />
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{time}</span>
                </div>
                <Wifi size={14} color="#ea4335" style={{ opacity: 0.7 }} />
              </div>
            </div>

            {/* Highlight card - the guide */}
            <div style={{
              margin: '0 24px 16px', padding: '14px 18px',
              background: 'linear-gradient(135deg, rgba(66,133,244,0.1), rgba(52,168,83,0.1))',
              borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontFamily: "'Quicksand', sans-serif", margin: 0, lineHeight: 1.5 }}>
                Connect to WiFi to browse your projects in Chrome
              </p>
            </div>

            {/* Apps row */}
            <div style={{ padding: '0 24px' }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 600, letterSpacing: '1px', marginBottom: '12px', fontFamily: "'Poppins', sans-serif" }}>
                YOUR APPS
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                {/* WiFi */}
                <TVAppButton
                  icon={<Wifi size={22} />}
                  label="WiFi"
                  color="#667eea"
                  onClick={() => setState(TV_STATES.WIFI)}
                />
                {/* Chrome - disabled */}
                <TVAppButton
                  icon={<Globe size={22} />}
                  label="Chrome"
                  color="#4285f4"
                  disabled
                />
                {/* Settings */}
                <TVAppButton
                  icon={<Settings size={22} />}
                  label="Settings"
                  color="#6b7280"
                />
              </div>
            </div>

            {/* Recommended row */}
            <div style={{ padding: '20px 24px 0' }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 600, letterSpacing: '1px', marginBottom: '12px', fontFamily: "'Poppins', sans-serif" }}>
                RECOMMENDED
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['Projects', 'Portfolio', 'Skills'].map((name) => (
                  <div key={name} style={{
                    flex: 1, height: '60px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', fontFamily: "'Poppins', sans-serif" }}>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* WIFI */}
        {state === TV_STATES.WIFI && (
          <motion.div
            key="wifi"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            style={{
              position: 'absolute', inset: 0,
              background: '#1a1a1a',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <motion.button
                whileHover={{ background: 'rgba(255,255,255,0.12)' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setState(TV_STATES.HOME)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px',
                  padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                }}
              >
                <ChevronLeft size={16} color="rgba(255,255,255,0.7)" />
              </motion.button>
              <Wifi size={18} color="rgba(255,255,255,0.7)" />
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>
                Network & Internet
              </span>
            </div>

            {/* Networks list */}
            <div style={{ padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 600, letterSpacing: '1px', margin: '0 0 8px', fontFamily: "'Poppins', sans-serif" }}>
                AVAILABLE NETWORKS
              </p>

              <NetworkItem
                name="Mehanth_5G"
                strength={3}
                secured
                highlight
                onClick={() => setState(TV_STATES.CONNECTING)}
              />
              <NetworkItem name="Neighbors_Network" strength={2} secured />
              <NetworkItem name="CoffeeShop_Free" strength={1} />
              <NetworkItem name="AndroidAP_guest" strength={1} secured />

              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', textAlign: 'center', marginTop: '12px', fontFamily: "'Quicksand', sans-serif" }}>
                Select "Mehanth_5G" to continue
              </p>
            </div>
          </motion.div>
        )}

        {/* CONNECTING */}
        {state === TV_STATES.CONNECTING && (
          <motion.div
            key="connecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, background: '#1a1a1a',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            >
              <Wifi size={28} color="#4285f4" />
            </motion.div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 500, fontFamily: "'Poppins', sans-serif" }}>
              Connecting to Mehanth_5G...
            </p>
          </motion.div>
        )}

        {/* CHROME - connected, opening */}
        {state === TV_STATES.CHROME && (
          <motion.div
            key="chrome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, background: '#1a1a1a',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
            >
              <Check size={32} color="#34a853" />
            </motion.div>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>
              Connected
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <Globe size={16} color="rgba(255,255,255,0.5)" />
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>
                Launching Chrome...
              </p>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '120px' }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              style={{ height: '2px', background: 'linear-gradient(90deg, #4285f4, #34a853)', borderRadius: '1px', marginTop: '6px' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Physical TV Buttons */}
      <div style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 30,
      }}>
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          onClick={handlePower}
          title="Power"
          style={{
            width: '26px', height: '26px', borderRadius: '50%',
            background: state === TV_STATES.OFF ? 'rgba(255,255,255,0.05)' : 'rgba(255,59,48,0.15)',
            border: `1.5px solid ${state === TV_STATES.OFF ? 'rgba(255,255,255,0.1)' : 'rgba(255,59,48,0.4)'}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
          }}
        >
          <Power size={12} color={state === TV_STATES.OFF ? 'rgba(255,255,255,0.3)' : '#ff3b30'} />
        </motion.button>

        {state !== TV_STATES.OFF && state !== TV_STATES.BOOTING && state !== TV_STATES.READY && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => setState(TV_STATES.HOME)}
            title="Home"
            style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '1.5px solid rgba(255,255,255,0.1)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
            }}
          >
            <Home size={12} color="rgba(255,255,255,0.4)" />
          </motion.button>
        )}
      </div>
    </div>
  );
}

// App button component for the home screen
function TVAppButton({ icon, label, color, onClick, disabled }) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.08, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={disabled ? undefined : onClick}
      style={{
        width: '72px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', padding: 0,
        opacity: disabled ? 0.3 : 1,
      }}
    >
      <div style={{
        width: '52px', height: '52px', borderRadius: '14px',
        background: disabled ? 'rgba(255,255,255,0.04)' : `${color}18`,
        border: `1px solid ${disabled ? 'rgba(255,255,255,0.06)' : color + '30'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: disabled ? 'rgba(255,255,255,0.2)' : color,
      }}>
        {icon}
      </div>
      <span style={{
        color: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
        fontSize: '10px', fontWeight: 500, fontFamily: "'Poppins', sans-serif",
      }}>
        {label}
      </span>
    </motion.button>
  );
}

// WiFi network list item
function NetworkItem({ name, strength, secured, highlight, onClick }) {
  return (
    <motion.button
      whileHover={{ background: 'rgba(255,255,255,0.08)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px', borderRadius: '10px', width: '100%',
        background: highlight ? 'rgba(66,133,244,0.08)' : 'rgba(255,255,255,0.03)',
        border: highlight ? '1px solid rgba(66,133,244,0.2)' : '1px solid transparent',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Wifi size={16} color={highlight ? '#4285f4' : 'rgba(255,255,255,0.3)'} />
        <span style={{
          color: highlight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
          fontSize: '13px', fontWeight: highlight ? 600 : 400, fontFamily: "'Poppins', sans-serif",
        }}>
          {name}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {secured ? <Lock size={12} color="rgba(255,255,255,0.25)" /> : <Unlock size={12} color="rgba(255,255,255,0.15)" />}
        {highlight && <ChevronRight size={14} color="rgba(255,255,255,0.3)" />}
      </div>
    </motion.button>
  );
}
