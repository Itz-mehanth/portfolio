// src/App.jsx
import { Canvas } from '@react-three/fiber'
import {
  ScrollControls,
  Scroll,
  Html,
  PerspectiveCamera,
  Hud,
  AdaptiveDpr,
  AdaptiveEvents
} from '@react-three/drei'
import React, { Suspense, useRef, useEffect, useState, lazy, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'
import './Navbar.css'
import './Contact.css'
// Razorpay script loader
function loadRazorpayScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
import SplashLoader from './SplashLoader'
import { useAudio } from './context/AudioProvider'
import { AnimatedChars, AnimatedWords } from './AnimatedText'
import MagneticButton from './MagneticButton'
import DevicePreview from './DevicePreview'
import TVSimulator from './TVSimulator'
import TourGuide from './TourGuide'
import { Mail, Linkedin, Github, Instagram } from 'lucide-react';
import { Joystick } from 'react-joystick-component';
import {
  isRoutePreloaded,
  preloadAssets,
  preloadRouteAssets,
  unsubscribePreloadProgress,
  warmRemainingAssets
} from './preloadAssets';

const loadAirplane = () => import('./Airplane')
const loadProjects = () => import('./Projects')
const loadIntroSection = () => import('./IntroSection')
const loadSkills = () => import('./Skills')
const loadCertificates = () => import('./Certificates')

const Airplane = lazy(loadAirplane)
const Projects = lazy(loadProjects)
const IntroSection = lazy(loadIntroSection)
const Skills = lazy(loadSkills)
const Certificates = lazy(loadCertificates)

const SCREEN_DEFINITIONS = [
  {
    id: 'lander',
    path: '/',
    title: 'Arrival Sequence',
    subtitle: 'Warming up the landing bay and intro world.',
    accent: '#0ea5e9',
    theme: 'light',
    preload: loadIntroSection,
  },
  {
    id: 'skills',
    path: '/skills',
    title: 'Skill Town',
    subtitle: 'Loading the skill city and its interactive scene.',
    accent: '#22c55e',
    theme: 'light',
    preload: loadSkills,
  },
  {
    id: 'projects',
    path: '/projects',
    title: 'Project Orbit',
    subtitle: 'Spinning up the flight deck, arcade HUD, and project world.',
    accent: '#fbbf24',
    theme: 'light',
    preload: () => Promise.all([loadProjects(), loadAirplane()]),
  },
  {
    id: 'certificate',
    path: '/certificates',
    title: 'Achievement Vault',
    subtitle: 'Opening the certification archive.',
    accent: '#a855f7',
    theme: 'light',
    preload: loadCertificates,
  },
  {
    id: 'contact',
    path: '/contact',
    title: 'Contact Terminal',
    subtitle: 'Preparing the communication channel.',
    accent: '#fb7185',
    theme: 'light',
  },
]


const CANVAS_CAMERA_CONFIG = { position: [0, 4, 15], fov: 100 };
const PAGE_NAVIGATION_SCROLL_THRESHOLD = 420;
const TRANSITION_RESET_DELAY_MS = 180;
const WHEEL_RESET_DELAY_MS = 250;
const findScreenIndexByPath = (pathname) => {
  const normalizedPath = pathname === '' ? '/' : pathname;
  const matchedIndex = SCREEN_DEFINITIONS.findIndex((screen) => screen.path === normalizedPath);
  return matchedIndex === -1 ? 0 : matchedIndex;
};

const NAV_ITEMS = [
  { id: 'lander', label: 'Lander' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'certificate', label: 'Certificate' },
  { id: 'contact', label: 'Contact' },
]

const Navbar = React.memo(({ fontBlack, activeScreenId, onNavigate }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const handleNavigate = (screenId) => {
    setMenuOpen(false);
    onNavigate?.(screenId);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left" style={{ color: fontBlack ? 'black' : 'white' }}>
        Mehanth
      </div>

      {/* Desktop menu */}
      <ul className="navbar-right desktop-menu">
        {NAV_ITEMS.map(({ id, label }) => (
          <li key={id}>
            <button
              onClick={() => handleNavigate(id)}
              style={{
                background: 'none',
                border: 'none',
                color: fontBlack ? 'black' : 'white',
                cursor: 'pointer',
                font: 'inherit',
                textDecoration: activeScreenId === id ? 'underline' : 'none'
              }}
            >
              {label}
            </button>
          </li>
        ))}
        <li><button onClick={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            }
          }
        }} style={{
          background: 'none',
          border: 'none',
          color: fontBlack ? 'black' : 'white',
          cursor: 'pointer',
          font: 'inherit',
          textDecoration: 'underline'
        }}>Fullscreen</button></li>
      </ul>

      {/* Hamburger icon */}
      <div className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div style={{ backgroundColor: fontBlack ? 'black' : 'white' }} />
        <div style={{ backgroundColor: fontBlack ? 'black' : 'white' }} />
        <div style={{ backgroundColor: fontBlack ? 'black' : 'white' }} />
      </div>

      {/* Mobile menu overlay */}
      <div style={{ backgroundColor: fontBlack ? 'black' : 'white' }} className={`mobile-menu ${menuOpen ? 'show' : ''}`}>
        {NAV_ITEMS.map(({ id, label }) => (
          <button
            key={id}
            style={{
              color: fontBlack ? 'white' : 'black',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              font: 'inherit',
              textDecoration: activeScreenId === id ? 'underline' : 'none'
            }}
            onClick={() => handleNavigate(id)}
          >
            {label}
          </button>
        ))}
        <a style={{ color: fontBlack ? 'white' : 'black', cursor: 'pointer' }} onClick={() => {
          toggleMenu();
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            }
          }
        }}>Fullscreen</a>
      </div>
    </nav>
  );
});

const ROLES = ['Full Stack Developer', '3D Web Artist', 'Hackathon Winner', 'AI Enthusiast', 'UI/UX Designer'];

function TypingRoles({ isVisible }) {
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setRoleIndex(i => (i + 1) % ROLES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div style={{ height: '28px', margin: '4px 0 10px', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={roleIndex}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.3 }}
          style={{
            display: 'inline-block',
            fontSize: '14px',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            color: '#f59e0b',
            letterSpacing: '0.5px',
          }}
        >
          {ROLES[roleIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function SectionPlaceholder({ title, theme = 'light' }) {
  const isDark = theme === 'dark';
  const barColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';

  return (
    <div className={`screen-loading-shell ${isDark ? 'dark' : ''}`}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '50%', maxWidth: '300px' }}>
        <div style={{ height: '14px', borderRadius: '7px', background: barColor, animation: 'skeleton-pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '10px', borderRadius: '5px', background: barColor, width: '70%', animation: 'skeleton-pulse 1.5s ease-in-out 0.2s infinite' }} />
        <div style={{ height: '10px', borderRadius: '5px', background: barColor, width: '45%', animation: 'skeleton-pulse 1.5s ease-in-out 0.4s infinite' }} />
      </div>
      <span style={{ color: textColor, fontSize: '11px', fontFamily: 'Quicksand, sans-serif', letterSpacing: '1px' }}>{title}</span>
    </div>
  );
}


export default function App() {
  const rootRef = useRef(null)
  const initialScreenIndex = findScreenIndexByPath(window.location.pathname)
  const activeScreenIndexRef = useRef(initialScreenIndex)
  const wheelAccumulatorRef = useRef(0)
  const wheelResetTimeoutRef = useRef(null)
  const transitionResetTimeoutRef = useRef(null)
  const touchStartYRef = useRef(null)
  const isNavigatingRef = useRef(false)
  const pendingNavigationRef = useRef(null)

  const avatarRef = useRef()
  const [scrollEnabled, setScrollEnabled] = useState(false)
  const [waves, setWaves] = useState([])
  const [startShockwave, setStartShockwave] = useState(false)
  const [startSpiralPortal, setStartSpiralPortal] = useState(false)
  const [teleported, setTeleported] = useState(false)
  const [contactPage, setContactPage] = useState(false)
  const [fontBlack, setFontBlack] = useState(true)
  const [iframeUrl, setIframeUrl] = useState(null);
  const [showIframe, setShowIframe] = useState(false);
  const [tvReady, setTvReady] = useState(false);
  const [showCharacter, setShowCharacter] = useState(false);
  const [visitorLocation, setVisitorLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeScreenIndex, setActiveScreenIndex] = useState(initialScreenIndex);
  const [mountedScreens, setMountedScreens] = useState(() => new Set([SCREEN_DEFINITIONS[initialScreenIndex].id]));
  const joystickDataRef = useRef({ x: 0, y: 0 });
  const verticalControlRef = useRef(0); // Add this ref
  const [isMobile, setIsMobile] = useState(false);
  const [lowPowerMode, setLowPowerMode] = useState(false);
  /* Game State */
  const scoreValueRef = useRef(0);
  const scoreElement = useRef(null);
  const [highScore, setHighScore] = useState({ score: 0, name: 'None' });

  const { crossfadeTo, isAudioEnabled } = useAudio();

  // Crossfade audio on section change
  const sectionTracks = { 0: 'background', 1: 'happy', 2: 'space' };
  useEffect(() => {
    if (!loading && isAudioEnabled) {
      const track = sectionTracks[activeScreenIndex];
      if (track) crossfadeTo(track);
    }
  }, [activeScreenIndex, loading]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Removed — SplashLoader fetches location and passes it up via visitorLocation prop sync

  // Devtools detection — fun anti-inspect message
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))
      ) {
        e.preventDefault();
        alert("What are you trying to look at, my friend? 👀\n\nNo secrets here — just clean code and good vibes. ✌️");
      }
    };
    const handleContextMenu = (e) => {
      e.preventDefault();
      alert("Nice try! 😏\n\nWhat are you trying to look at, my friend?");
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateQualityMode = () => {
      const limitedMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
      const limitedCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 6;
      setLowPowerMode(mediaQuery.matches || limitedMemory || limitedCpu);
    };

    updateQualityMode();
    mediaQuery.addEventListener('change', updateQualityMode);

    return () => {
      mediaQuery.removeEventListener('change', updateQualityMode);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const handlePreloadProgress = (progress) => {
      if (!isMounted) return;
      setLoadingProgress(progress);
    };

    preloadAssets(handlePreloadProgress).catch((error) => {
      console.error('Asset preloading failed:', error);
      if (isMounted) setLoadingProgress(100);
    });
    return () => {
      isMounted = false;
      unsubscribePreloadProgress(handlePreloadProgress);
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      warmRemainingAssets();
    }
  }, [loading]);

  useEffect(() => {
    if (!loading) return undefined;
    const watchdog = setTimeout(() => {
      setLoadingProgress((prev) => (prev >= 100 ? prev : 100));
    }, 12000);
    return () => clearTimeout(watchdog);
  }, [loading]);

  useEffect(() => {
    // Fetch High Score
    fetch('https://portfolio-ikm6.onrender.com/api/highscore')
      .then(res => res.json())
      .then(data => setHighScore(data))
      .catch(err => console.error("Failed to fetch high score:", err));
  }, []);

  const handleScoreSubmit = () => {
    const currentScore = scoreValueRef.current;
    // Safe access
    const safeHighScore = highScore && highScore.score !== undefined ? highScore.score : 0;
    const safeHighName = highScore && highScore.name ? highScore.name : 'None';

    if (currentScore > safeHighScore) {
      const name = prompt(`New High Score! (Current Best: ${safeHighScore} by ${safeHighName})\nEnter your name:`);
      if (name) {
        fetch('https://portfolio-ikm6.onrender.com/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, score: currentScore })
        })
          .then(res => res.json())
          .then(data => {
            alert("Score Saved!");
            setHighScore({ name, score: currentScore });
          })
          .catch(err => console.error("Error saving score:", err));
      }
    } else {
      alert(`Good run! But the high score is ${safeHighScore} by ${safeHighName}. Keep trying!`);
    }
  };

  const openIframe = (url) => {
    setIframeUrl(url);
    setShowIframe(true);
  };

  const closeIframe = () => {
    setShowIframe(false);
    setIframeUrl(null);
  };

  const mountScreen = (screenIndex) => {
    const screen = SCREEN_DEFINITIONS[screenIndex];
    if (!screen) return;

    setMountedScreens((prev) => {
      if (prev.has(screen.id)) {
        return prev;
      }

      const next = new Set(prev);
      next.add(screen.id);
      return next;
    });
  };

  const preloadScreen = (screenIndex) => {
    const screen = SCREEN_DEFINITIONS[screenIndex];
    if (!screen) return Promise.resolve();

    const tasks = [];

    if (screen.preload) {
      tasks.push(
        screen.preload().catch((error) => {
          console.warn(`Failed to preload screen "${screen.id}"`, error);
        })
      );
    }

    return Promise.allSettled(tasks);
  };

  const resetTransition = () => {
    if (transitionResetTimeoutRef.current) {
      clearTimeout(transitionResetTimeoutRef.current);
      transitionResetTimeoutRef.current = null;
    }

    isNavigatingRef.current = false;
    pendingNavigationRef.current = null;
  };

  const navigateToScreenIndex = async (targetIndex, historyMode = 'push') => {
    const targetScreen = SCREEN_DEFINITIONS[targetIndex];
    if (!targetScreen) return;
    if (targetIndex === activeScreenIndexRef.current && historyMode !== 'replace') return;
    if (isNavigatingRef.current) return;

    isNavigatingRef.current = true;
    const importTask = targetScreen.preload
      ? targetScreen.preload().catch((error) => {
          console.warn(`Failed to preload screen "${targetScreen.id}"`, error);
        })
      : Promise.resolve();

    const assetTask = preloadRouteAssets(targetScreen.id);

    mountScreen(targetIndex);

    await Promise.allSettled([importTask, assetTask]);
    preloadScreen(targetIndex + 1);

    activeScreenIndexRef.current = targetIndex;
    setActiveScreenIndex(targetIndex);

    if (historyMode === 'push') {
      window.history.pushState({}, '', targetScreen.path);
    } else if (historyMode === 'replace') {
      window.history.replaceState({}, '', targetScreen.path);
    }

    // Cinematic transition clears itself via onComplete
    resetTransition();
  };

  const commitPendingNavigation = () => {
    const pendingNavigation = pendingNavigationRef.current;
    if (!pendingNavigation || isNavigatingRef.current) return;
    pendingNavigationRef.current = null;
    navigateToScreenIndex(pendingNavigation.targetIndex, pendingNavigation.historyMode);
  };

  const updateScrollDrivenTransition = (delta, historyMode = 'push') => {
    if (!scrollEnabled || showIframe || isNavigatingRef.current || delta === 0) return false;

    wheelAccumulatorRef.current += Math.abs(delta);

    if (wheelAccumulatorRef.current >= PAGE_NAVIGATION_SCROLL_THRESHOLD) {
      wheelAccumulatorRef.current = 0;
      const direction = delta > 0 ? 1 : -1;
      const targetIndex = activeScreenIndexRef.current + direction;

      if (targetIndex < 0 || targetIndex >= SCREEN_DEFINITIONS.length) {
        return false;
      }

      navigateToScreenIndex(targetIndex, historyMode);
    }

    return true;
  };

  const navigateToScreen = useCallback((screenId) => {
    const targetIndex = SCREEN_DEFINITIONS.findIndex((screen) => screen.id === screenId);
    if (targetIndex === -1) return;
    navigateToScreenIndex(targetIndex, 'push');
  }, []);

  const triggerShockwave = (pos) => {
    setWaves((prev) => [...prev, { id: Date.now() + Math.random(), position: pos }])
  }

  useEffect(() => {
    if (startShockwave) {
      console.log('triggered shockwave')
      triggerShockwave([0, 0, 25])
      setStartShockwave(false)
      setTimeout(() => {
        setStartSpiralPortal(true)
      }, 1000)
    } else {
      setStartSpiralPortal(false)
    }
  }, [startShockwave])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const timeout = setTimeout(() => {
      avatarRef.current?.playSequence(['Landing', 'StandUp', 'Idle'])
      avatarRef.current?.playSequence(['Idle', 'Stretch'])
      setTimeout(() => {
        document.body.style.overflow = 'auto'
        setScrollEnabled(true)
      }, 5000)
    }, 2000)
    return () => {
      clearTimeout(timeout)
      document.body.style.overflow = 'auto'
    }
  }, [])

  useEffect(() => {
    activeScreenIndexRef.current = activeScreenIndex;
    const currentScreen = SCREEN_DEFINITIONS[activeScreenIndex];
    setFontBlack(currentScreen?.theme !== 'dark');
    mountScreen(activeScreenIndex);
    preloadScreen(activeScreenIndex + 1);
  }, [activeScreenIndex]);

  useEffect(() => {
    if (loading) return;

    window.history.replaceState({}, '', SCREEN_DEFINITIONS[activeScreenIndexRef.current].path);
    preloadScreen(activeScreenIndexRef.current + 1);

    const handlePopState = () => {
      const nextIndex = findScreenIndexByPath(window.location.pathname);
      navigateToScreenIndex(nextIndex, 'replace');
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [loading]);

  useEffect(() => {
    return () => {
      if (transitionResetTimeoutRef.current) {
        clearTimeout(transitionResetTimeoutRef.current);
      }
      if (wheelResetTimeoutRef.current) {
        clearTimeout(wheelResetTimeoutRef.current);
      }
    };
  }, []);


  // Razorpay fun payment before CV download
  const handleDownloadCV = async () => {
    // Load Razorpay script if not already loaded
    const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      alert('Razorpay SDK failed to load. Please check your connection.');
      return;
    }

    // Create Razorpay order options (for fun, not real)
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_1234567890abcdef', // Dummy key, not real
      amount: 20000000, // 2 million rupees in paise
      currency: 'INR',
      name: 'Mehanth Portfolio',
      description: 'Download CV',
      image: '/logo.jpg',
      handler: function (response) {
        // After payment, allow download
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = 'https://drive.google.com/file/d/1YDWTQODu8_bxtFBOBagk-zH6UWAE9Ds4/view?usp=sharing';
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 500);
      },
      prefill: {
        name: 'Mehanth',
        email: 'mehanth362@gmail.com',
      },
      theme: {
        color: '#FEC601',
      },
      modal: {
        ondismiss: function () {
          alert('Payment required to download CV!');
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  const isMounted = (screenId) => mountedScreens.has(screenId);
  const projectsCanvasActive = activeScreenIndex === 2 && isMounted('projects');

  const getScreenStyle = (screenIndex, baseStyle = {}) => {
    const isActive = activeScreenIndex === screenIndex;

    return {
      ...baseStyle,
      position: 'absolute',
      inset: 0,
      opacity: isActive ? 1 : 0,
      pointerEvents: isActive ? 'auto' : 'none',
      clipPath: isActive ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
      transition: 'opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), clip-path 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
      zIndex: isActive ? 1 : 0,
    };
  };

  const handleWheel = (event) => {
    if (!scrollEnabled || showIframe || isNavigatingRef.current) return;

    const isInsideProjectCanvas =
      activeScreenIndexRef.current === 2 &&
      typeof event.target?.closest === 'function' &&
      event.target.closest('.canvas-wrapper');

    if (isInsideProjectCanvas) return;

    if (wheelResetTimeoutRef.current) {
      clearTimeout(wheelResetTimeoutRef.current);
    }

    wheelResetTimeoutRef.current = setTimeout(() => {
      wheelAccumulatorRef.current = 0;
    }, WHEEL_RESET_DELAY_MS);

    updateScrollDrivenTransition(event.deltaY, 'push');
  };

  const handleTouchStart = (event) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (event) => {
    if (touchStartYRef.current == null || isNavigatingRef.current || showIframe) return;

    const nextY = event.touches[0]?.clientY;
    if (typeof nextY !== 'number') return;

    const delta = touchStartYRef.current - nextY;
    if (Math.abs(delta) >= 4) {
      touchStartYRef.current = nextY;
      updateScrollDrivenTransition(delta, 'push');
    }
  };

  const handleTouchEnd = () => {
    touchStartYRef.current = null;
    if (!isNavigatingRef.current) {
      resetTransition();
    }
  };

  return (
    <div
      className="portfolio-scroll-root"
      ref={rootRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {loading && <SplashLoader setLoading={setLoading} progress={loadingProgress} visitorLocation={visitorLocation} />}
      {showIframe && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <DevicePreview show={showIframe} url={iframeUrl} onClose={closeIframe} />
        </div>
      )}
      {!loading && (
        <TourGuide activeScreenIndex={activeScreenIndex} onNavigate={navigateToScreen} />
      )}
      {!loading && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}>
          <Navbar
            fontBlack={fontBlack}
            activeScreenId={SCREEN_DEFINITIONS[activeScreenIndex].id}
            onNavigate={navigateToScreen}
          />
          {/* Section navigation dots */}
          <div style={{
            position: 'fixed',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 100,
          }}>
            {SCREEN_DEFINITIONS.map((screen, i) => (
              <MagneticButton key={screen.id} strength={0.5}>
                <motion.button
                  onClick={() => navigateToScreen(screen.id)}
                  aria-label={`Go to ${screen.id}`}
                  animate={{
                    scale: activeScreenIndex === i ? 1.4 : 1,
                    opacity: activeScreenIndex === i ? 1 : 0.35,
                  }}
                  whileHover={{ scale: 1.6, opacity: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: activeScreenIndex === i
                      ? screen.accent
                      : (fontBlack ? '#1a1a1a' : '#ffffff'),
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                />
              </MagneticButton>
            ))}
          </div>
          <section id='lander'
            className="portfolio-screen"
            style={getScreenStyle(0, {
              padding: '40px 0',
              height: '100vh',
              width: '100vw',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              background: 'white',
              overflowX: 'hidden',
              scrollBehavior: 'smooth',
            })}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={activeScreenIndex === 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '90%',
              margin: '0 auto',
            }}>
              <div style={{ width: '70%', minWidth: '280px', flex: '1 1 280px' }}>
                <p className='Quicksand' style={{ margin: '30px 0 0 0px', fontSize: '16px', textAlign: 'left', color: 'grey' }}>
                  <AnimatedWords text="Hi, I'm" isVisible={activeScreenIndex === 0} style={{ fontSize: '16px', color: 'grey' }} />
                </p>
                <p className='Silkscreen' style={{ margin: '5px 0px', fontSize: 'clamp(32px, 8vw, 50px)', textAlign: 'left', color: 'black', perspective: '600px' }}>
                  <AnimatedChars text="Mehanth" isVisible={activeScreenIndex === 0} delay={0.2} style={{ fontSize: 'clamp(32px, 8vw, 50px)', color: 'black' }} />
                </p>
                <TypingRoles isVisible={activeScreenIndex === 0} />
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={activeScreenIndex === 0 ? { opacity: 1, x: 0 } : { opacity: 0 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '6px 14px', borderRadius: '20px',
                    background: 'rgba(26, 35, 126, 0.06)',
                    border: '1px solid rgba(26, 35, 126, 0.12)',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a237e', fontFamily: "'Poppins', sans-serif" }}>
                    Currently interning @ <strong>VISA</strong>, Bangalore
                  </span>
                </motion.div>
                <MagneticButton strength={0.2}>
                  <motion.button
                    onClick={handleDownloadCV}
                    whileHover={{ scale: 1.05, y: -3, boxShadow: '0 8px 25px rgba(255, 215, 0, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    style={{
                      width: '170px',
                      padding: '5px 10px',
                      backgroundColor: 'rgba(255, 215, 0, 0.9)',
                      color: 'black',
                      border: '2px solid rgba(0, 0, 0, 0.3)',
                      borderRadius: '25px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontFamily: 'Poppins',
                    }}
                  >
                    Download CV
                  </motion.button>
                </MagneticButton>
                <p className='Quicksand' style={{ margin: '10px 0px 5px', fontSize: 'clamp(16px, 4vw, 24px)', textAlign: 'left' }}>
                  <AnimatedWords text="a Computer Science Engineering student" isVisible={activeScreenIndex === 0} delay={0.5} style={{ fontSize: 'clamp(16px, 4vw, 24px)' }} />
                </p>
                <p className='Quicksand' style={{ margin: '5px 0px', fontSize: '16px', textAlign: 'left', color: 'grey' }}>
                  <AnimatedWords text="with a passion for creating wonders through code, creativity, and innovation." isVisible={activeScreenIndex === 0} delay={0.8} style={{ fontSize: '16px', color: 'grey' }} />
                </p>
              </div>

              {/* Right: Animated Image with rotating ring + character */}
              <div style={{ flex: '0 0 200px', textAlign: 'center', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ position: 'relative', width: '200px', height: '200px', cursor: 'pointer' }}
                  onClick={() => setShowCharacter(true)}
                >
                  {/* Rotating gradient ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute', inset: '-6px',
                      borderRadius: '18px',
                      background: 'conic-gradient(from 0deg, #fbbf24, #f59e0b, #ec4899, #8b5cf6, #3b82f6, #fbbf24)',
                      padding: '3px',
                    }}
                  >
                    <div style={{ width: '100%', height: '100%', borderRadius: '15px', background: 'white' }} />
                  </motion.div>
                  <img
                    src='/mehanth-developer.jpg'
                    alt='Mehanth - Full Stack Developer & 3D Artist'
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '15px',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  />
                </motion.div>

                {/* Character illustration that slides in */}
                <AnimatePresence>
                  {showCharacter && (
                    <motion.div
                      initial={{ x: 120, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 120, opacity: 0 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 120 }}
                      onClick={() => setShowCharacter(false)}
                      style={{
                        position: 'absolute', right: '0px', bottom: '-20px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      {/* Speech bubble */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', damping: 12 }}
                        style={{
                          background: 'white', borderRadius: '12px',
                          padding: '8px 14px', marginBottom: '6px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          border: '1px solid #e5e7eb',
                          position: 'relative',
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: "'Quicksand', sans-serif", color: '#1a1a1a' }}>
                          Hey there! 👋
                        </span>
                        {/* Bubble tail */}
                        <div style={{
                          position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%) rotate(45deg)',
                          width: '10px', height: '10px', background: 'white',
                          border: '1px solid #e5e7eb', borderTop: 'none', borderLeft: 'none',
                        }} />
                      </motion.div>

                      {/* SVG Character illustration */}
                      <svg width="80" height="100" viewBox="0 0 80 100" fill="none">
                        {/* Body */}
                        <rect x="25" y="45" width="30" height="35" rx="6" fill="#1a1a1a" />
                        {/* Head */}
                        <circle cx="40" cy="30" r="16" fill="#f5d0a9" />
                        {/* Hair */}
                        <path d="M24 26 C24 16 32 10 40 10 C48 10 56 16 56 26 C56 20 48 15 40 15 C32 15 24 20 24 26Z" fill="#1a1a1a" />
                        {/* Eyes */}
                        <circle cx="35" cy="30" r="2" fill="#1a1a1a" />
                        <circle cx="45" cy="30" r="2" fill="#1a1a1a" />
                        {/* Smile */}
                        <path d="M35 36 Q40 40 45 36" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        {/* Waving arm */}
                        <motion.g
                          animate={{ rotate: [0, -15, 15, -15, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                          style={{ originX: '55px', originY: '55px' }}
                        >
                          <rect x="55" y="48" width="8" height="25" rx="4" fill="#f5d0a9" transform="rotate(-30 55 48)" />
                          {/* Hand */}
                          <circle cx="62" cy="42" r="5" fill="#f5d0a9" />
                        </motion.g>
                        {/* Left arm */}
                        <rect x="17" y="50" width="8" height="22" rx="4" fill="#f5d0a9" />
                        {/* Legs */}
                        <rect x="30" y="78" width="8" height="18" rx="4" fill="#2563eb" />
                        <rect x="42" y="78" width="8" height="18" rx="4" fill="#2563eb" />
                        {/* Shoes */}
                        <rect x="28" y="93" width="12" height="5" rx="2.5" fill="#1a1a1a" />
                        <rect x="40" y="93" width="12" height="5" rx="2.5" fill="#1a1a1a" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
            {isMounted('lander') ? (
              <Suspense fallback={<SectionPlaceholder title="Arrival Sequence" />}>
                <IntroSection lowPowerMode={lowPowerMode} />
              </Suspense>
            ) : (
              <SectionPlaceholder title="Arrival Sequence" />
            )}

            {/* Scroll indicator */}
            {activeScreenIndex === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                style={{
                  position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                }}
              >
                <span style={{ color: 'rgba(0,0,0,0.35)', fontSize: '10px', fontFamily: "'Quicksand', sans-serif", letterSpacing: '1px' }}>
                  SCROLL
                </span>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12l7 7 7-7" stroke="rgba(0,0,0,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              </motion.div>
            )}
          </section>

          <section id='skills'
            className="portfolio-screen"
            style={getScreenStyle(1, {
              height: '100vh',
              padding: '60px 0px 6px 0',
              width: '100vw',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              background: 'white',
              overflowX: 'hidden',
              zIndex: 1, 
              position: 'relative', 
            })}
          >
            <h1 style={{ fontSize: '80px', fontWeight: '500' }} className='Barrio'>Skill Town</h1>
            {isMounted('skills') ? (
              <Suspense fallback={<SectionPlaceholder title="Skill Town" />}>
                <Skills lowPowerMode={lowPowerMode} />
              </Suspense>
            ) : (
              <SectionPlaceholder title="Skill Town" />
            )}
          </section>


          {/* 3D Section */}
          {/* 3D Section */}
          <section

            id="projects"
            className="portfolio-screen canvas-text-section hide-scrollbar"
            style={getScreenStyle(2, {
              margin: "0 auto",
              borderRadius: "30px",
              position: "relative",
              display: "flex",
              height: "100vh",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "76px 20px 28px",
              gap: "18px",
              width: "100vw",
              boxSizing: "border-box",
            })}
          >
            {/* Google TV Container */}
            <div
              className="hide-scrollbar canvas-wrapper"
              style={{
                flex: 1,
                backgroundColor: "#0a0a0a",
                borderRadius: "20px",
                height: "min(74vh, 780px)",
                width: "min(calc(100vw - 40px), 1500px)",
                maxWidth: "100%",
                boxShadow: "0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                position: "relative",
                padding: "8px",
              }}
            >
              {/* Screen area */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#000",
                  borderRadius: "14px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Google TV ambient glow strip at bottom */}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: "10%",
                  right: "10%",
                  height: "3px",
                  background: "linear-gradient(90deg, #4285f4, #ea4335, #fbbc04, #34a853)",
                  borderRadius: "2px",
                  zIndex: 5,
                  opacity: 0.8,
                }} />

                {/* TV Boot Simulator */}
                <TVSimulator onReady={() => setTvReady(true)} isReady={tvReady} />
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '25px',
                  zIndex: 10,
                  display: 'none',
                  fontFamily: "'Share Tech Mono', monospace",
                  color: '#fbbf24', // Gold color
                  textShadow: '0 0 5px #fbbf24',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  padding: '5px 15px',
                  borderRadius: '20px',
                  border: '2px solid #fbbf24',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '24px' }}>🪙</div>
                  <div ref={scoreElement} style={{ fontSize: '20px', fontWeight: 'bold' }}>0</div>
                  <button
                    onClick={handleScoreSubmit}
                    style={{
                      marginLeft: '10px',
                      background: 'transparent',
                      border: '1px solid #fbbf24',
                      color: '#fbbf24',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      padding: '2px 8px',
                      fontSize: '12px'
                    }}
                  >
                    SAVE
                  </button>
                  {/* High Score Display */}
                  <div style={{ marginLeft: '15px', borderLeft: '1px solid #fbbf24', paddingLeft: '15px', fontSize: '14px', color: '#fbbf24', whiteSpace: 'nowrap' }}>
                    Best: {highScore?.score || 0} ({highScore?.name || 'None'})
                  </div>
                </div>

                {isMounted('projects') ? (
                <Canvas
                  frameloop={projectsCanvasActive ? 'always' : 'never'}
                  dpr={lowPowerMode ? [0.75, 1.1] : [1, 1.5]}
                  camera={CANVAS_CAMERA_CONFIG}
                  style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    display: 'block' // Ensure proper display
                  }}
                  gl={{
                    antialias: !lowPowerMode,
                    alpha: false,
                    powerPreference: "high-performance"
                  }}
                >
                  <AdaptiveDpr pixelated />
                  <AdaptiveEvents />
                  <ambientLight intensity={5} />
                  <PerspectiveCamera makeDefault position={[0, 4, 15]} fov={100} />
                  <Suspense fallback={null}>

                    <ScrollControls
                      maxSpeed={0.25}
                      distance={6}
                      pages={1}
                      damping={0.35}
                      enabled={scrollEnabled && activeScreenIndex === 2}
                      infinite={true}
                      horizontal={false}
                    >
                      <Scroll>

                        <Airplane
                          contactPage={contactPage}
                          setContactPage={setContactPage}
                          setTeleported={setTeleported}
                          setStartShockwave={setStartShockwave}
                          scrollEnabled={scrollEnabled && activeScreenIndex === 2}
                          ref={avatarRef}
                          scale={7.5}
                          position={[0, 0, 0]}
                          rotation={[0, Math.PI, 0]}
                          static={false}
                          isMobile={isMobile}
                          joystickDataRef={joystickDataRef}
                          verticalControlRef={verticalControlRef}
                          lowPowerMode={lowPowerMode}
                        />

                        {!contactPage ? (
                          <Projects
                            openIframe={openIframe}
                            contactPage={contactPage}
                            avatarRef={avatarRef}
                            scoreElement={scoreElement}
                            scoreValueRef={scoreValueRef}
                            lowPowerMode={lowPowerMode}
                          />
                        ) : null}


                      </Scroll>
                    </ScrollControls>
                  </Suspense>
                </Canvas>
                ) : (
                  <SectionPlaceholder title="Project Orbit" theme="dark" />
                )}
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  zIndex: 9999
                }}>
                  <Joystick
                    size={80}
                    sticky={false}
                    baseColor="rgba(255, 255, 255, 0.2)"
                    stickColor="rgba(255, 255, 255, 0.5)"
                    move={(e) => {
                      joystickDataRef.current = { x: e.x / 2, y: e.y / 2 }
                    }}
                    stop={() => {
                      joystickDataRef.current = { x: 0, y: 0 }
                    }}
                  />
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '40px',
                  right: '20px',
                  zIndex: 9999,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}>
                  <button
                    onPointerDown={() => { verticalControlRef.current = 1 }}
                    onPointerUp={() => { verticalControlRef.current = 0 }}
                    onPointerLeave={() => { verticalControlRef.current = 0 }}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                      color: 'white',
                      fontSize: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none'
                    }}
                  >
                    ↑
                  </button>
                  <button
                    onPointerDown={() => { verticalControlRef.current = -1 }}
                    onPointerUp={() => { verticalControlRef.current = 0 }}
                    onPointerLeave={() => { verticalControlRef.current = 0 }}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                      color: 'white',
                      fontSize: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none'
                    }}
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
            {/* Google TV Stand */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-4px' }}>
              <div style={{ width: '4px', height: '20px', background: '#1a1a1a', borderRadius: '2px' }} />
              <div style={{ width: '120px', height: '6px', background: 'linear-gradient(180deg, #2a2a2a, #111)', borderRadius: '3px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
            </div>
          </section>

          <section
            id='certificate'
            className="portfolio-screen"
            style={getScreenStyle(3, {
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
              justifyContent: 'center',
              height: '100vh',
              padding: 'clamp(20px, 5vh, 80px) clamp(12px, 3vw, 40px)',
              scrollBehavior: 'smooth',
            })}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={activeScreenIndex === 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              style={{ width: '100%', height: '100%' }}
            >
              {isMounted('certificate') ? (
                <Suspense fallback={<SectionPlaceholder title="Achievement Vault" />}>
                  <Certificates />
                </Suspense>
              ) : (
                <SectionPlaceholder title="Achievement Vault" />
              )}
            </motion.div>
          </section>

          {/* Contact Section */}
          <section id='contact'
            className="portfolio-screen"
            style={getScreenStyle(4, {
              height: '100vh',
              width: '100vw',
              overflowX: 'hidden',
              scrollBehavior: 'smooth',
              background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
            })}
          >

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={activeScreenIndex === 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              style={{
                height: '100%',
                width: '100%',
                backgroundColor: 'transparent',
              }}
            >
              <ContactSection />
            </motion.div>
          </section>

        </div >
      )
      }

    </div >
  )
}


function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('');

    // IMPORTANT: Replace this with your actual Google Apps Script deployment URL
    // It should look like: https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzdWxMgLRjgkewx0pxxqcwu0swJ4TxEE6htZdW-Yagjo5vDb_sKHNs7YmSLD-2gA39R/exec';

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          timestamp: new Date().toISOString(),
          source: 'Portfolio Website'
        })
      });

      // With no-cors, we can't read the response, so we assume success
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setErrors({});

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('');
      }, 5000);

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { href: "mailto:mehanth362@gmail.com", icon: Mail, label: "Email", color: "#EA4335" },
    { href: "https://linkedin.com/in/mehanth-776892279", icon: Linkedin, label: "LinkedIn", color: "#0077B5" },
    { href: "https://github.com/itz-mehanth", icon: Github, label: "GitHub", color: "#333" },
    { href: "https://instagram.com/itz_mehanth", icon: Instagram, label: "Instagram", color: "#E4405F" }
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <section className="contact-section">
        <div className="contact-container">

          {/* Main Content */}
          <div className="contact-content">
            {/* Contact Form */}
            <div className="contact-form-container">
              <form className="contact-form" onSubmit={handleSubmit}>
                {submitStatus === 'success' && (
                  <div style={{
                    background: '#d4edda',
                    border: '1px solid #c3e6cb',
                    color: '#155724',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    ✅ Message sent successfully! I'll get back to you soon.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div style={{
                    background: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    color: '#721c24',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    ❌ Error sending message. Please try again.
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    style={{
                      borderColor: errors.name ? '#dc3545' : undefined
                    }}
                  />
                  {errors.name && (
                    <span style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your.email@example.com"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    style={{
                      borderColor: errors.email ? '#dc3545' : undefined
                    }}
                  />
                  {errors.email && (
                    <span style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="message">Project Details</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tell me about your project, timeline, and any specific requirements..."
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    style={{
                      borderColor: errors.message ? '#dc3545' : undefined
                    }}
                  />
                  {errors.message && (
                    <span style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                  style={{
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  {!isSubmitting && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info & Social */}
            <div className="contact-info">
              <div className="contact-details">
                <h3>Get in Touch</h3>
                <div className="contact-item">
                  <Mail size={20} />
                  <span>mehanth362@gmail.com</span>
                </div>
                <div className="contact-item">
                  <Linkedin size={20} />
                  <span>LinkedIn Profile</span>
                </div>
              </div>

              <div className="social-section">
                <h4>Follow Me</h4>
                <div className="social-links">
                  {socialLinks.map(({ href, icon: IconComponent, label, color }, index) => (
                    <a
                      key={index}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      style={{ '--brand-color': color }}
                    >
                      <IconComponent size={20} />
                      <span>{label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>
    </>
  );
}
