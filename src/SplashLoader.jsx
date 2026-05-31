import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashLoader({ setLoading, progress = 0, visitorLocation }) {
  const [showMap, setShowMap] = useState(false);
  const [localLocation, setLocalLocation] = useState(null);

  // Fetch location on mount — try multiple APIs
  useEffect(() => {
    let cancelled = false;

    const tryFetch = async () => {
      // Try ip-api.com first (http only, but very reliable)
      try {
        const res = await fetch('http://ip-api.com/json/?fields=city,country,countryCode,lat,lon,query');
        const data = await res.json();
        if (!cancelled && data.city) {
          setLocalLocation({ city: data.city, country: data.country, flag: data.countryCode, lat: data.lat, lon: data.lon, ip: data.query });
          return;
        }
      } catch (e) {}

      // Fallback to ipwho.is
      try {
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();
        if (!cancelled && data.success !== false && data.city) {
          setLocalLocation({ city: data.city, country: data.country, flag: data.country_code || '', lat: data.latitude, lon: data.longitude, ip: data.ip });
          return;
        }
      } catch (e) {}

      // Last fallback
      try {
        const res = await fetch('https://freeipapi.com/api/json');
        const data = await res.json();
        if (!cancelled && data.cityName) {
          setLocalLocation({ city: data.cityName, country: data.countryName, flag: data.countryCode || '', lat: data.latitude, lon: data.longitude, ip: data.ipAddress });
        }
      } catch (e) {}
    };

    tryFetch();
    return () => { cancelled = true; };
  }, []);

  // Also sync from parent prop if it arrives
  useEffect(() => {
    if (visitorLocation && !localLocation) {
      setLocalLocation(visitorLocation);
    }
  }, [visitorLocation]);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [activeApp, setActiveApp] = useState('terminal'); // 'terminal' | 'files' | 'spotify' | 'chrome' | 'vscode' | 'assistant' | null
  const [assistantMessages, setAssistantMessages] = useState([
    { role: 'assistant', text: "Hey! I'm your portfolio guide. Press Enter in the Terminal to launch, or ask me anything about Mehanth!" },
  ]);
  const [assistantInput, setAssistantInput] = useState('');
  const assistantInputRef = useRef(null);
  const [typed, setTyped] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [time, setTime] = useState('');
  const inputRef = useRef(null);

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
    if (typed && progress >= 100) {
      const timer = setTimeout(() => setFadeOut(true), 500);
      return () => clearTimeout(timer);
    }
  }, [typed, progress]);

  useEffect(() => {
    if (fadeOut) {
      const timer = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [fadeOut, setLoading]);

  useEffect(() => {
    if (activeApp === 'terminal' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeApp]);

  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    setTyped(true);
  };

  const openApp = (app) => {
    setActiveApp(app);
  };

  const desktopIcons = [
    { id: 'files', label: 'Files', svg: <svg viewBox="0 0 48 48" width="36" height="36"><rect x="6" y="12" width="36" height="28" rx="3" fill="#5c6bc0"/><rect x="6" y="8" width="16" height="8" rx="2" fill="#7986cb"/></svg> },
    { id: 'terminal', label: 'Terminal', svg: <svg viewBox="0 0 48 48" width="36" height="36"><rect x="4" y="6" width="40" height="36" rx="4" fill="#2e2e2e"/><rect x="4" y="6" width="40" height="8" rx="4" fill="#4a4a4a"/><circle cx="10" cy="10" r="2" fill="#ff5f57"/><circle cx="16" cy="10" r="2" fill="#febc2e"/><circle cx="22" cy="10" r="2" fill="#28c840"/><path d="M12 22 L18 26 L12 30" stroke="#34d399" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/><line x1="20" y1="30" x2="32" y2="30" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/></svg> },
    { id: 'chrome', label: 'Chrome', svg: <svg viewBox="0 0 48 48" width="36" height="36"><circle cx="24" cy="24" r="18" fill="#4285f4"/><circle cx="24" cy="24" r="8" fill="white"/><path d="M24 6 A18 18 0 0 1 39.6 15 L28 20" fill="#ea4335"/><path d="M39.6 15 A18 18 0 0 1 30 41 L26 28" fill="#fbbc04"/><path d="M30 41 A18 18 0 0 1 8.4 15 L20 20" fill="#34a853"/><circle cx="24" cy="24" r="5" fill="#4285f4"/></svg> },
    { id: 'vscode', label: 'VS Code', svg: <svg viewBox="0 0 48 48" width="36" height="36"><path d="M36 6 L36 42 L12 36 L12 12 Z" fill="#2196f3"/><path d="M12 12 L28 24 L12 36" fill="#1565c0"/><path d="M36 6 L28 12 L28 36 L36 42 Z" fill="#42a5f5"/></svg> },
    { id: 'spotify', label: 'Spotify', svg: <svg viewBox="0 0 48 48" width="36" height="36"><circle cx="24" cy="24" r="18" fill="#1db954"/><path d="M15 19 C22 17 32 18 36 21" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/><path d="M17 26 C22 24 30 25 34 27" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M19 32 C23 30 29 31 32 33" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></svg> },
    { id: 'assistant', label: 'Guide', svg: <svg viewBox="0 0 48 48" width="36" height="36"><circle cx="24" cy="24" r="18" fill="#10a37f"/><path d="M16 20 C16 16 20 13 24 13 C28 13 32 16 32 20 C32 24 28 26 26 27 L26 29" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="24" cy="34" r="2" fill="white"/></svg> },
  ];

  const dockItems = [
    { id: 'terminal', svg: <svg viewBox="0 0 48 48" width="28" height="28"><rect x="4" y="6" width="40" height="36" rx="4" fill="#2e2e2e"/><path d="M14 20 L20 24 L14 28" stroke="#34d399" strokeWidth="2.5" fill="none" strokeLinecap="round"/><line x1="22" y1="28" x2="32" y2="28" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/></svg> },
    { id: 'files', svg: <svg viewBox="0 0 48 48" width="28" height="28"><rect x="6" y="12" width="36" height="28" rx="3" fill="#5c6bc0"/><rect x="6" y="8" width="16" height="8" rx="2" fill="#7986cb"/></svg> },
    { id: 'chrome', svg: <svg viewBox="0 0 48 48" width="28" height="28"><circle cx="24" cy="24" r="16" fill="#4285f4"/><circle cx="24" cy="24" r="6" fill="white"/><circle cx="24" cy="24" r="4" fill="#4285f4"/></svg> },
    { id: 'vscode', svg: <svg viewBox="0 0 48 48" width="28" height="28"><path d="M36 6 L36 42 L12 36 L12 12 Z" fill="#2196f3"/><path d="M12 12 L28 24 L12 36" fill="#1565c0"/><path d="M36 6 L28 12 L28 36 L36 42 Z" fill="#42a5f5"/></svg> },
    { id: 'spotify', svg: <svg viewBox="0 0 48 48" width="28" height="28"><circle cx="24" cy="24" r="16" fill="#1db954"/><path d="M16 20 C22 18 30 19 34 22" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M18 26 C22 24 28 25 32 27" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/><path d="M20 32 C23 30 27 31 30 32" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></svg> },
    { id: 'assistant', svg: <svg viewBox="0 0 48 48" width="28" height="28"><circle cx="24" cy="24" r="16" fill="#10a37f"/><path d="M17 20 C17 17 20 14 24 14 C28 14 31 17 31 20 C31 23 28 25 26 26 L26 28" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="24" cy="33" r="1.5" fill="white"/></svg> },
    { id: 'settings', svg: <svg viewBox="0 0 48 48" width="28" height="28"><circle cx="24" cy="24" r="16" fill="#616161"/><circle cx="24" cy="24" r="7" fill="#424242" stroke="#9e9e9e" strokeWidth="2"/>{[0,60,120,180,240,300].map(a=><rect key={a} x="22" y="6" width="4" height="7" rx="2" fill="#9e9e9e" transform={`rotate(${a} 24 24)`}/>)}</svg> },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      opacity: fadeOut ? 0 : 1, transition: 'opacity 0.5s ease',
    }}>
      {/* White wallpaper */}
      <div style={{ position: 'absolute', inset: 0, background: '#ffffff' }} />

      {/* Top Bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '28px',
        background: 'rgba(0,0,0,0.03)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px', zIndex: 100, borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <span style={{ color: 'rgba(0,0,0,0.7)', fontSize: '11px', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>Activities</span>
        <span style={{ color: 'rgba(0,0,0,0.7)', fontSize: '11px', fontFamily: "'Poppins', sans-serif" }}>{time}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" stroke="#333" strokeWidth="2" strokeLinecap="round"/></svg>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="1" y="6" width="18" height="12" rx="2" stroke="#333" strokeWidth="2"/><rect x="3" y="8" width="10" height="8" fill="#333" opacity="0.5"/><line x1="23" y1="10" x2="23" y2="14" stroke="#333" strokeWidth="2" strokeLinecap="round"/></svg>
        </div>
      </div>

      {/* Desktop Icons */}
      <div style={{ position: 'absolute', top: '44px', left: '24px', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 10 }}>
        {desktopIcons.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onDoubleClick={() => openApp(item.id)}
            onClick={() => openApp(item.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              cursor: 'pointer', padding: '6px', borderRadius: '8px',
            }}
            whileHover={{ background: 'rgba(0,0,0,0.04)' }}
          >
            {item.svg}
            <span style={{ color: '#333', fontSize: '9px', fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>{item.label}</span>
          </motion.div>
        ))}
      </div>

      {/* App Windows */}
      <AnimatePresence>
        {/* Terminal */}
        {activeApp === 'terminal' && (
          <AppWindow key="terminal" title="visitor@mehanth: ~" onClose={() => setActiveApp(null)} defaultPos={{ x: -300, y: -160 }} width={660} height={320}>
            <div onClick={() => inputRef.current?.focus()} style={{ background: '#0e0e0e', padding: '20px 24px', height: '100%', cursor: 'text', fontFamily: "'Courier New', monospace" }}>
              <p style={{ color: '#34d399', fontSize: '12px', margin: '0 0 4px' }}>Welcome to Mehanth's Portfolio v3.0</p>
              <div style={{ margin: '0 0 4px', fontSize: '11px' }}>
                <span style={{ color: '#f59e0b' }}>[SCAN] </span>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {localLocation
                    ? <>Visitor detected from <span style={{ color: '#60a5fa', fontWeight: 600 }}>{localLocation.city}, {localLocation.country}</span> ({localLocation.flag})</>
                    : <>Scanning network...</>
                  }
                </span>
              </div>
              {localLocation && localLocation.lat && (
                <div style={{ margin: '0 0 4px', fontSize: '11px' }}>
                  <span style={{ color: '#f59e0b' }}>[GEO]  </span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>lat: {localLocation.lat?.toFixed(4)} | lon: {localLocation.lon?.toFixed(4)} </span>
                  {!showMap && <span onClick={() => setShowMap(true)} style={{ color: '#34d399', cursor: 'pointer', textDecoration: 'underline' }}>[open map]</span>}
                </div>
              )}
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: '0 0 10px' }}>
                {progress < 100 ? `Loading assets... ${Math.floor(progress)}%` : 'All systems ready.'}
              </p>
              {!typed ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#a78bfa', fontSize: '13px' }}>$ </span>
                    <span style={{ color: '#e2e8f0', fontSize: '13px' }}>./launch-portfolio</span>
                  </div>
                  <form onSubmit={handleTerminalSubmit} style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ color: '#a78bfa', fontSize: '13px' }}>$ </span>
                    <input ref={inputRef} type="text" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleTerminalSubmit(e); }}
                      placeholder="press enter to launch..."
                      style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fbbf24', fontSize: '13px', fontFamily: "'Courier New', monospace", flex: 1, caretColor: '#fbbf24' }}
                    />
                  </form>
                </>
              ) : (
                <>
                  <p style={{ color: '#e2e8f0', fontSize: '13px', margin: '0 0 4px' }}>$ ./launch-portfolio</p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#34d399', fontSize: '13px', margin: 0 }}>
                    {progress >= 100 ? '[OK] Launching...' : `[...] Loading ${Math.floor(progress)}%`}
                  </motion.p>
                </>
              )}
            </div>
          </AppWindow>
        )}

        {/* Files */}
        {activeApp === 'files' && (
          <AppWindow key="files" title="Files" onClose={() => setActiveApp(null)} defaultPos={{ x: -250, y: -120 }} width={520} height={320}>
            <div style={{ background: '#fafafa', height: '100%', display: 'flex' }}>
              {/* Sidebar */}
              <div style={{ width: '140px', background: '#f0f0f0', padding: '12px 8px', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {['Home', 'Desktop', 'Documents', 'Downloads', 'Projects'].map((f, i) => (
                  <div key={f} style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '11px', color: '#333', fontFamily: "'Poppins', sans-serif", background: i === 0 ? 'rgba(0,0,0,0.06)' : 'transparent', cursor: 'pointer' }}>{f}</div>
                ))}
              </div>
              {/* Content */}
              <div style={{ flex: 1, padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 80px)', gap: '12px', alignContent: 'start' }}>
                {['portfolio/', 'resume.pdf', 'projects/', 'skills.json', '.config/', 'README.md', 'package.json', 'node_modules/'].map(f => (
                  <div key={f} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 4px', borderRadius: '8px', cursor: 'pointer' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: f.endsWith('/') ? '#5c6bc0' : '#90a4ae', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontSize: '10px', fontWeight: 700 }}>{f.endsWith('/') ? 'D' : 'F'}</span>
                    </div>
                    <span style={{ fontSize: '9px', color: '#555', textAlign: 'center', fontFamily: 'monospace', wordBreak: 'break-all' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </AppWindow>
        )}

        {/* Chrome */}
        {activeApp === 'chrome' && (
          <AppWindow key="chrome" title="Chrome" onClose={() => setActiveApp(null)} defaultPos={{ x: -280, y: -130 }} width={580} height={360}>
            <div style={{ background: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* URL bar */}
              <div style={{ padding: '8px 12px', background: '#f8f8f8', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#666' }}>←</div>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#ccc' }}>→</div>
                </div>
                <div style={{ flex: 1, background: '#eff1f3', borderRadius: '20px', padding: '6px 14px', fontSize: '11px', color: '#333', fontFamily: 'monospace' }}>
                  mehanth.site
                </div>
              </div>
              {/* Page content */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a', fontFamily: "'Poppins', sans-serif" }}>mehanth.site</div>
                <p style={{ color: '#888', fontSize: '12px', fontFamily: "'Quicksand', sans-serif" }}>Portfolio loading... use Terminal to launch</p>
              </div>
            </div>
          </AppWindow>
        )}

        {/* VS Code */}
        {activeApp === 'vscode' && (
          <AppWindow key="vscode" title="Visual Studio Code" onClose={() => setActiveApp(null)} defaultPos={{ x: -300, y: -150 }} width={620} height={380}>
            <div style={{ background: '#1e1e1e', height: '100%', display: 'flex' }}>
              {/* Activity bar */}
              <div style={{ width: '40px', background: '#333', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: '14px' }}>
                {['📄', '🔍', '🌿', '🐛', '📦'].map((icon, i) => (
                  <div key={i} style={{ fontSize: '14px', opacity: i === 0 ? 1 : 0.5, cursor: 'pointer' }}>{icon}</div>
                ))}
              </div>
              {/* Sidebar */}
              <div style={{ width: '160px', background: '#252526', padding: '10px 8px', borderRight: '1px solid #333' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', margin: '0 0 8px' }}>EXPLORER</p>
                {['src/', '  App.jsx', '  main.jsx', '  Skills.jsx', '  Projects.jsx', 'package.json', 'vite.config.js'].map((f, i) => (
                  <div key={i} style={{ padding: '3px 6px', fontSize: '11px', color: f.startsWith('  ') ? '#d4d4d4' : '#cccccc', fontFamily: 'monospace', cursor: 'pointer', borderRadius: '3px' }}>
                    {f}
                  </div>
                ))}
              </div>
              {/* Editor */}
              <div style={{ flex: 1, padding: '12px 16px' }}>
                <p style={{ color: '#569cd6', fontSize: '11px', fontFamily: 'monospace', margin: '0 0 4px' }}>{'// src/App.jsx'}</p>
                <p style={{ color: '#c586c0', fontSize: '11px', fontFamily: 'monospace', margin: '0 0 2px' }}>{'import'} <span style={{ color: '#9cdcfe' }}>React</span> <span style={{ color: '#c586c0' }}>from</span> <span style={{ color: '#ce9178' }}>'react'</span></p>
                <p style={{ color: '#c586c0', fontSize: '11px', fontFamily: 'monospace', margin: '0 0 2px' }}>{'import'} <span style={{ color: '#9cdcfe' }}>{'{ Canvas }'}</span> <span style={{ color: '#c586c0' }}>from</span> <span style={{ color: '#ce9178' }}>'@react-three/fiber'</span></p>
                <p style={{ color: '#6a9955', fontSize: '11px', fontFamily: 'monospace', margin: '8px 0 2px' }}>{'// Mehanth\'s 3D Portfolio'}</p>
                <p style={{ color: '#dcdcaa', fontSize: '11px', fontFamily: 'monospace', margin: '0' }}>{'export default function '}<span style={{ color: '#4ec9b0' }}>App</span>{'() {'}</p>
              </div>
            </div>
          </AppWindow>
        )}

        {/* Spotify */}
        {activeApp === 'spotify' && (
          <AppWindow key="spotify" title="Spotify" onClose={() => setActiveApp(null)} defaultPos={{ x: -240, y: -130 }} width={520} height={340}>
            <div style={{ background: '#121212', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Sidebar */}
              <div style={{ display: 'flex', height: '100%' }}>
                <div style={{ width: '160px', background: '#000', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></svg><span style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>Home</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2" fill="none"/><path d="M21 21l-4.35-4.35" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg><span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Search</span></div>
                  <div style={{ marginTop: '12px', color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 600 }}>PLAYLISTS</div>
                  {['Coding Focus', 'Lo-Fi Beats', 'React & Chill'].map(p => (
                    <div key={p} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', cursor: 'pointer', padding: '2px 0' }}>{p}</div>
                  ))}
                </div>
                {/* Main */}
                <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ color: 'white', fontSize: '16px', fontWeight: 700, margin: 0 }}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {['Coding Focus', 'Lo-Fi Beats', 'Deep Work', 'Synthwave'].map(p => (
                      <div key={p} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#1db954' }} />
                        <span style={{ color: 'white', fontSize: '11px', fontWeight: 600 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Player bar */}
              <div style={{ height: '56px', background: '#181818', borderTop: '1px solid #282828', display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#1db954' }} />
                  <div>
                    <p style={{ color: 'white', fontSize: '11px', margin: 0, fontWeight: 600 }}>Coding Mode</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', margin: 0 }}>Lo-Fi Producer</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ color: 'white', fontSize: '16px', cursor: 'pointer' }}>⏮</span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <span style={{ fontSize: '12px', marginLeft: '2px' }}>▶</span>
                  </div>
                  <span style={{ color: 'white', fontSize: '16px', cursor: 'pointer' }}>⏭</span>
                </div>
                <div style={{ width: '80px', height: '3px', background: '#4a4a4a', borderRadius: '2px' }}>
                  <div style={{ width: '35%', height: '100%', background: '#1db954', borderRadius: '2px' }} />
                </div>
              </div>
            </div>
          </AppWindow>
        )}
        {/* Assistant */}
        {activeApp === 'assistant' && (
          <AppWindow key="assistant" title="Portfolio Guide" onClose={() => setActiveApp(null)} defaultPos={{ x: -260, y: -150 }} width={400} height={420}>
            <div style={{ background: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Messages */}
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {assistantMessages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '80%',
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: msg.role === 'user' ? '#10a37f' : '#f0f0f0',
                      color: msg.role === 'user' ? 'white' : '#1a1a1a',
                      fontSize: '12px', lineHeight: 1.5,
                      fontFamily: "'Quicksand', sans-serif",
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!assistantInput.trim()) return;
                  const userMsg = assistantInput.trim();
                  setAssistantMessages(prev => [...prev, { role: 'user', text: userMsg }]);
                  setAssistantInput('');

                  // Generate response based on keywords
                  setTimeout(() => {
                    let reply = "Interesting question! For now, press Enter in the Terminal to launch the portfolio and explore everything interactively.";
                    const q = userMsg.toLowerCase();
                    if (q.includes('who') || q.includes('mehanth')) reply = "Mehanth is a CS student at SSN College of Engineering. He builds 3D web experiences, wins hackathons, and loves React Three Fiber!";
                    else if (q.includes('skill') || q.includes('tech')) reply = "Mehanth knows React, Three.js, Flutter, Python, Node.js, TensorFlow, and many more. Launch the portfolio and visit Skill Town to see them all!";
                    else if (q.includes('project')) reply = "There are 17+ projects! From AI platforms to 3D games. Launch the portfolio and fly through Project Orbit to explore them.";
                    else if (q.includes('hackathon') || q.includes('win') || q.includes('award')) reply = "3 hackathon wins! Data Sprint 3.0, TechathonX (Best Performance), and Impact Nexus. Check the Achievements section!";
                    else if (q.includes('contact') || q.includes('hire') || q.includes('reach')) reply = "You can reach Mehanth via the Contact section — there's a form, or connect on LinkedIn/GitHub/Instagram.";
                    else if (q.includes('how') || q.includes('launch') || q.includes('start') || q.includes('enter')) reply = "Just open the Terminal (it should already be open) and press Enter. That's it!";
                    else if (q.includes('hello') || q.includes('hi') || q.includes('hey')) reply = "Hey there! Welcome to Mehanth's portfolio. Press Enter in Terminal to explore, or ask me anything!";
                    setAssistantMessages(prev => [...prev, { role: 'assistant', text: reply }]);
                  }, 600);
                }}
                style={{
                  padding: '12px', borderTop: '1px solid #eee',
                  display: 'flex', gap: '8px',
                }}
              >
                <input
                  ref={assistantInputRef}
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  placeholder="Ask me anything..."
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: '10px',
                    border: '1px solid #e0e0e0', outline: 'none', fontSize: '12px',
                    fontFamily: "'Quicksand', sans-serif",
                  }}
                />
                <button type="submit" style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: '#10a37f', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </form>
            </div>
          </AppWindow>
        )}

        {/* Map Window */}
        {showMap && localLocation?.lat && (
          <AppWindow key="map" title={`Location — ${localLocation?.city || ''}`} onClose={() => setShowMap(false)} defaultPos={{ x: 50, y: -100 }} width={380} height={320}>
            <div style={{ background: '#1a1a1a', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {/* Map via OSM iframe */}
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${localLocation.lon - 0.05},${localLocation.lat - 0.03},${localLocation.lon + 0.05},${localLocation.lat + 0.03}&layer=mapnik&marker=${localLocation.lat},${localLocation.lon}`}
                  style={{ width: '100%', height: '100%', border: 'none', filter: 'saturate(0.2) brightness(0.55) contrast(1.4) hue-rotate(80deg)' }}
                  title="Location map"
                />

                {/* Overlay HUD */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  {/* Crosshair */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ position: 'absolute', inset: '-18px', borderRadius: '50%', border: '2px solid #ef4444' }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      style={{ position: 'absolute', inset: '-28px', borderRadius: '50%', border: '1px solid #ef4444' }}
                    />
                  </div>

                  {/* Corner brackets */}
                  <div style={{ position: 'absolute', top: '8px', left: '8px', width: '20px', height: '20px', borderTop: '2px solid #4ade80', borderLeft: '2px solid #4ade80' }} />
                  <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', borderTop: '2px solid #4ade80', borderRight: '2px solid #4ade80' }} />
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '20px', height: '20px', borderBottom: '2px solid #4ade80', borderLeft: '2px solid #4ade80' }} />
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '20px', height: '20px', borderBottom: '2px solid #4ade80', borderRight: '2px solid #4ade80' }} />

                  {/* Top label */}
                  <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', padding: '3px 10px', borderRadius: '4px' }}>
                    <span style={{ color: '#4ade80', fontSize: '9px', fontFamily: 'monospace', fontWeight: 700 }}>TARGET ACQUIRED</span>
                  </div>
                </div>
              </div>

              {/* Info bar */}
              <div style={{
                padding: '10px 14px', background: '#111',
                borderTop: '1px solid #222',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ color: '#4ade80', fontSize: '10px', margin: '0 0 2px', fontFamily: 'monospace', fontWeight: 700 }}>
                    {localLocation.city}, {localLocation.country}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', margin: 0, fontFamily: 'monospace' }}>
                    {localLocation.lat?.toFixed(4)}°N, {localLocation.lon?.toFixed(4)}°E
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 4px #4ade80' }} />
                  <span style={{ color: '#4ade80', fontSize: '9px', fontFamily: 'monospace' }}>LIVE</span>
                </div>
              </div>
            </div>
          </AppWindow>
        )}
      </AnimatePresence>

      {/* Bottom Dock */}
      <div style={{
        position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
        height: '52px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
        borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', padding: '0 10px', gap: '4px', zIndex: 50,
      }}>
        {dockItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.25, y: -6 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => openApp(item.id)}
            style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: activeApp === item.id ? 'rgba(0,0,0,0.06)' : 'transparent',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, position: 'relative',
            }}
          >
            {item.svg}
            {activeApp === item.id && (
              <div style={{ position: 'absolute', bottom: '-2px', width: '6px', height: '3px', borderRadius: '2px', background: '#333' }} />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Draggable window component — responsive positioning
function AppWindow({ children, title, onClose, defaultPos = { x: 0, y: 0 }, width = 600, height = 300 }) {
  const isMobileView = window.innerWidth < 768;
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 200 }}
      style={{
        position: 'absolute',
        top: isMobileView ? '50%' : `calc(50% + ${defaultPos.y}px)`,
        left: isMobileView ? '50%' : `calc(50% + ${defaultPos.x}px)`,
        transform: isMobileView ? 'translate(-50%, -50%)' : undefined,
        width: `min(${width}px, 92vw)`,
        height: `min(${height}px, 70vh)`,
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)',
        zIndex: 80,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Title bar */}
      <div style={{
        height: '36px', background: '#e8e8e8', flexShrink: 0,
        display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px',
        cursor: 'grab', userSelect: 'none', borderBottom: '1px solid #d0d0d0',
      }}>
        <div onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57', cursor: 'pointer' }} />
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' }} />
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }} />
        <span style={{ color: 'rgba(0,0,0,0.5)', fontSize: '11px', marginLeft: '10px', fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>
          {title}
        </span>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </div>
    </motion.div>
  );
}
