// src/App.jsx
import React, { Suspense, useRef, useEffect, useState, lazy, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'
import './Navbar.css'
import './Contact.css'
import { useAudio } from './context/AudioProvider'
import { AnimatedChars, AnimatedWords } from './AnimatedText'
import MagneticButton from './MagneticButton'
import CockpitControls from './CockpitControls'
import DevicePreview from './DevicePreview'
import TourGuide from './TourGuide'
import { ProjectIndex, ProjectCaseStudy } from './ProjectPages'
import HomeHero from './HomeHero'
import DeskProps from './DeskProps'
import { SeamHomeSkills, SeamSkillsWork, SeamWorkAwards, SeamAwardsContact } from './Seams'
import Scribble from './Scribble'
import { MRButton, MRHost } from './mr/MRLauncher'
import './Motion.css'
import { getProjectBySlug } from './data/projects'
import { Mail, Linkedin, Github, Instagram, Download, ArrowRight, MapPin, Send, LayoutGrid, Plus, X } from 'lucide-react';
import { Joystick } from 'react-joystick-component';
import {
  isRoutePreloaded,
  preloadAssets,
  preloadRouteAssets,
  unsubscribePreloadProgress,
  warmRemainingAssets
} from './preloadAssets';

const loadProjectsStage = () => import('./ProjectsStage')
const loadSkills = () => import('./Skills')
const loadCertificates = () => import('./Certificates')

const ProjectsStage = lazy(loadProjectsStage)
const Skills = lazy(loadSkills)
const Certificates = lazy(loadCertificates)

const SCREEN_DEFINITIONS = [
  {
    id: 'lander',
    path: '/',
    title: 'Arrival Sequence',
    subtitle: 'Warming up the landing bay and intro world.',
    theme: 'light',
  },
  {
    id: 'skills',
    path: '/skills',
    title: 'Skill Town',
    subtitle: 'Loading the skill city and its interactive scene.',
    theme: 'light',
    preload: loadSkills,
  },
  {
    id: 'projects',
    path: '/projects',
    title: 'Project Orbit',
    subtitle: 'Spinning up the flight deck, arcade HUD, and project world.',
    theme: 'light',
    preload: loadProjectsStage,
  },
  {
    id: 'certificate',
    path: '/certificates',
    title: 'Achievement Vault',
    subtitle: 'Opening the certification archive.',
    theme: 'light',
    preload: loadCertificates,
  },
  {
    id: 'contact',
    path: '/contact',
    title: 'Contact Terminal',
    subtitle: 'Preparing the communication channel.',
    theme: 'light',
  },
]


const PAGE_NAVIGATION_SCROLL_THRESHOLD = 420;
const TRANSITION_RESET_DELAY_MS = 180;
// A wheel gesture (including trackpad inertia) counts as over once no wheel
// event has arrived for this long; each gesture moves at most one screen.
const WHEEL_RESET_DELAY_MS = 250;
const PROJECTS_SCREEN_INDEX = 2;
const BASE_DOCUMENT_TITLE = document.title;
// Screens whose 3D scene uses the arrow keys for movement.
const ARROW_KEY_SCREEN_IDS = new Set(['skills', 'projects']);

const findScreenIndexByPath = (pathname) => {
  // "/projects/medplant" belongs to the projects screen.
  const normalizedPath = `/${pathname.split('/')[1] || ''}`;
  const matchedIndex = SCREEN_DEFINITIONS.findIndex((screen) => screen.path === normalizedPath);
  return matchedIndex === -1 ? 0 : matchedIndex;
};

// Never hold a screen change hostage to a slow preload: show the next screen
// after this long even if its code or models are still arriving.
const NAVIGATION_PRELOAD_BUDGET_MS = 220;
// Navigation stays locked while the sheets travel, so a second flick can't stack moves.
const DECK_SETTLE_MS = 760;

// True when the target sits inside a scroll container that can still scroll in
// this direction, so the gesture should scroll that content, not change screens.
const canScrollWithin = (target, deltaY, boundary) => {
  let el = target instanceof Element ? target : null;
  while (el && el !== boundary) {
    const { overflowY } = window.getComputedStyle(el);
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 1) {
      if (deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
      if (deltaY < 0 && el.scrollTop > 0) return true;
    }
    el = el.parentElement;
  }
  return false;
};

const scheduleIdle = (task) =>
  'requestIdleCallback' in window ? window.requestIdleCallback(task, { timeout: 2500 }) : setTimeout(task, 700);

const getCaseStudySlugFromPath = (pathname) => {
  const match = pathname.match(/^\/projects\/([^/]+)\/?$/);
  return match && getProjectBySlug(match[1]) ? match[1] : null;
};

const ACCENT = '#f59e0b';

const NAV_ITEMS = [
  { id: 'lander', label: 'Home' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Work' },
  { id: 'certificate', label: 'Awards' },
  { id: 'contact', label: 'Contact' },
]
const NAV_LABELS = Object.fromEntries(NAV_ITEMS.map(({ id, label }) => [id, label]))

const Navbar = React.memo(({ fontBlack, activeScreenId, onNavigate, onEnterMR }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const handleNavigate = (screenId) => {
    setMenuOpen(false);
    onNavigate?.(screenId);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left" style={{ color: fontBlack ? 'black' : 'white', display: 'flex', alignItems: 'center', gap: '9px' }}>
        <span style={{
          width: '9px', height: '9px', borderRadius: '50%',
          background: ACCENT,
          boxShadow: '0 0 10px rgba(245,158,11,0.5)',
          flexShrink: 0,
        }} />
        <span className="nav-brand-name" style={{ letterSpacing: '-0.01em' }}>Mehanth</span>
      </div>

      {/* Desktop menu — glass pill with sliding active indicator */}
      <div
        className="desktop-menu"
        style={{
          gap: '2px',
          padding: '5px',
          borderRadius: '999px',
          background: fontBlack ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: `1px solid ${fontBlack ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.14)'}`,
          boxShadow: fontBlack ? '0 4px 20px rgba(0,0,0,0.06)' : '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        {NAV_ITEMS.map(({ id, label }) => {
          const active = activeScreenId === id;
          return (
            <button
              key={id}
              className="nav-pill"
              onClick={() => handleNavigate(id)}
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '0.82rem',
                fontWeight: active ? 600 : 500,
                color: active ? (fontBlack ? '#ffffff' : '#0a0a0a') : (fontBlack ? '#1a1a1a' : 'rgba(255,255,255,0.8)'),
                padding: '7px 16px',
                borderRadius: '999px',
                transition: 'color 0.25s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {active && (
                <motion.span
                  layoutId="navActivePill"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '999px',
                    background: fontBlack ? '#1a1a1a' : '#ffffff',
                    zIndex: -1,
                  }}
                />
              )}
              {label}
            </button>
          );
        })}
        <MRButton color={fontBlack ? '#1a1a1a' : 'rgba(255,255,255,0.8)'} onOpen={onEnterMR} />
        <button
          onClick={() => {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen();
            else if (document.exitFullscreen) document.exitFullscreen();
          }}
          aria-label="Toggle fullscreen"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', cursor: 'pointer',
            color: fontBlack ? '#1a1a1a' : 'rgba(255,255,255,0.8)',
            padding: '7px 12px', borderRadius: '999px',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Hamburger icon */}
      <button
        type="button"
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        aria-controls="mobile-nav"
      >
        <div style={{ backgroundColor: fontBlack ? 'black' : 'white' }} />
        <div style={{ backgroundColor: fontBlack ? 'black' : 'white' }} />
        <div style={{ backgroundColor: fontBlack ? 'black' : 'white' }} />
      </button>

      {/* Mobile menu overlay */}
      <div id="mobile-nav" style={{ backgroundColor: fontBlack ? 'black' : 'white' }} className={`mobile-menu ${menuOpen ? 'show' : ''}`}>
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
        <a style={{ color: fontBlack ? 'white' : 'black', cursor: 'pointer' }} onClick={() => {
          toggleMenu();
          onEnterMR?.();
        }}>Enter MR</a>
      </div>
    </nav>
  );
});

// Premium right-side section navigation — elongated active pill + label on hover
const NavDots = React.memo(({ activeIndex, fontBlack, onNavigate }) => {
  const [hovered, setHovered] = useState(null);
  const muted = fontBlack ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.35)';
  const labelText = fontBlack ? '#1a1a1a' : '#ffffff';
  const labelBg = fontBlack ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)';

  return (
    <div style={{
      position: 'fixed', right: '18px', top: '50%', transform: 'translateY(-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '14px', zIndex: 100,
    }}>
      {/* Current section number, rolling to the new one on every move */}
      <span aria-hidden="true" style={{ height: '16px', overflow: 'hidden', marginBottom: '2px' }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={activeIndex}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'block', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '13px',
              lineHeight: '16px', letterSpacing: '-0.02em', color: fontBlack ? '#111114' : '#ffffff',
            }}
          >
            {String(activeIndex + 1).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </span>
      {SCREEN_DEFINITIONS.map((screen, i) => {
        const active = activeIndex === i;
        const isHov = hovered === i;
        return (
          <button
            key={screen.id}
            onClick={() => onNavigate(screen.id)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            aria-label={`Go to ${NAV_LABELS[screen.id]}`}
            aria-current={active ? 'true' : undefined}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <motion.span
              initial={false}
              animate={{ opacity: isHov ? 1 : 0, x: isHov ? 0 : 8 }}
              transition={{ duration: 0.2 }}
              style={{
                fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px',
                fontFamily: "'Poppins', sans-serif", color: labelText,
                background: labelBg, backdropFilter: 'blur(6px)',
                padding: '3px 9px', borderRadius: '999px', whiteSpace: 'nowrap',
                textTransform: 'capitalize', pointerEvents: 'none',
              }}
            >
              {String(i + 1).padStart(2, '0')} · {NAV_LABELS[screen.id]}
            </motion.span>
            <motion.span
              animate={{
                height: active ? 26 : 8,
                backgroundColor: active ? (fontBlack ? '#111114' : '#ffffff') : (isHov ? (fontBlack ? '#1a1a1a' : '#ffffff') : muted),
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              style={{ width: '5px', borderRadius: '999px', display: 'block' }}
            />
          </button>
        );
      })}
    </div>
  );
});

function SkillsHeader() {
  return (
    <header className="sheet-header layer" style={{ '--d': 1 }}>
      <Scribble style={{ left: '-104px', top: '64px' }}>{'Different skills,\nsame destination'}</Scribble>
      <span className="section-eyebrow">02 · Skills</span>
      <h2 className="section-title">Skill Town</h2>
      <p className="sheet-lede">Explore the different areas I work with. Click any house or sign to see the skills in that district.</p>
    </header>
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
      <span style={{ color: textColor, fontSize: '11px', fontFamily: "var(--font-body)", letterSpacing: '1px' }}>{title}</span>
    </div>
  );
}


export default function App() {
  const rootRef = useRef(null)
  const initialScreenIndex = findScreenIndexByPath(window.location.pathname)
  const activeScreenIndexRef = useRef(initialScreenIndex)
  const journeyRef = useRef(null)   // the page's one scroll container

  const avatarRef = useRef()
  const [contactPage, setContactPage] = useState(false)
  const [fontBlack, setFontBlack] = useState(true)
  const [iframeUrl, setIframeUrl] = useState(null);
  const [showIframe, setShowIframe] = useState(false);
  const [projectIndexOpen, setProjectIndexOpen] = useState(false);
  const [caseStudySlug, setCaseStudySlug] = useState(() => getCaseStudySlugFromPath(window.location.pathname));
  const projectOverlayOpen = projectIndexOpen || caseStudySlug !== null;
  const [showCharacter, setShowCharacter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mrOpen, setMrOpen] = useState(false);
  const openMR = useCallback(() => setMrOpen(true), []);
  const closeMR = useCallback(() => setMrOpen(false), []);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeScreenIndex, setActiveScreenIndex] = useState(initialScreenIndex);
  // The 3D sections mount while within a screen of the viewport and unmount when far.
  const [nearScreens, setNearScreens] = useState(() => new Set([SCREEN_DEFINITIONS[initialScreenIndex].id]));
  // Sections reveal their content the first time they come into view.
  const [seenScreens, setSeenScreens] = useState(() => new Set([SCREEN_DEFINITIONS[initialScreenIndex].id]));
  const [workVisible, setWorkVisible] = useState(initialScreenIndex === PROJECTS_SCREEN_INDEX);
  const joystickDataRef = useRef({ x: 0, y: 0 });
  const verticalControlRef = useRef(0); // Add this ref
  const fireRef = useRef(false); // mobile/desktop fire signal for the blaster
  // Cockpit: hull color + camera view (view kept in a ref so the camera reads it without re-rendering the canvas)
  const [cockpitOpen, setCockpitOpen] = useState(false);
  const [planeColor, setPlaneColor] = useState('#eef2f7');
  const [planeView, setPlaneView] = useState('chase');
  const planeViewRef = useRef('chase');
  const setView = (v) => { planeViewRef.current = v; setPlaneView(v); };
  const [isMobile, setIsMobile] = useState(false);
  const [lowPowerMode, setLowPowerMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  // navigateToScreenIndex is captured by long-lived callbacks, so it reads this ref, not state.
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;
  /* Game State */
  const scoreValueRef = useRef(0);
  const scoreElement = useRef(null);

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
      setIsMobile(
        window.matchMedia('(pointer: coarse)').matches ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      );
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Friendly console easter egg instead of blocking devtools/right-click
  // (inspecting is how recruiters evaluate code — never block it).
  useEffect(() => {
    try {
      console.log('%cHey, fellow dev 👋  Poke around all you like — it\'s clean code and good vibes in here.', 'color:#8b5cf6;font-size:13px;font-weight:700');
    } catch (_) { /* noop */ }
  }, []);

  // Cursor parallax for every .layer and the 3D name: -1..1, eased, written as CSS
  // variables on the app root so no React state changes on mouse move.
  useEffect(() => {
    if (reducedMotion) return undefined;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    const tick = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      rootRef.current?.style.setProperty('--mx', current.x.toFixed(4));
      rootRef.current?.style.setProperty('--my', current.y.toFixed(4));
      frame = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateQualityMode = () => {
      const limitedMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
      const limitedCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 6;
      setLowPowerMode(mediaQuery.matches || limitedMemory || limitedCpu);
      setReducedMotion(mediaQuery.matches);
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

  const openIframe = (url) => {
    setIframeUrl(url);
    setShowIframe(true);
  };

  const closeIframe = () => {
    setShowIframe(false);
    setIframeUrl(null);
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
    // Warm the screen's models in idle time.
    scheduleIdle(() => preloadRouteAssets(screen.id));
    return Promise.allSettled(tasks);
  };

  const scrollToScreen = useCallback((screenIndex, behavior) => {
    const el = document.getElementById(SCREEN_DEFINITIONS[screenIndex]?.id);
    if (!el || !journeyRef.current) return;
    journeyRef.current.scrollTo({
      top: el.offsetTop,
      behavior: behavior || (reducedMotionRef.current ? 'auto' : 'smooth'),
    });
  }, []);

  const openProjectIndex = useCallback(() => {
    setCaseStudySlug(null);
    setProjectIndexOpen(true);
  }, []);

  const closeProjectOverlays = useCallback(() => {
    if (getCaseStudySlugFromPath(window.location.pathname)) {
      window.history.pushState({}, '', SCREEN_DEFINITIONS[PROJECTS_SCREEN_INDEX].path);
    }
    setProjectIndexOpen(false);
    setCaseStudySlug(null);
  }, []);

  const openCaseStudy = useCallback((slug) => {
    setProjectIndexOpen(false);
    setCaseStudySlug(slug);
    window.history.pushState({}, '', `/projects/${slug}`);
  }, []);

  const backToProjectIndex = useCallback(() => {
    window.history.pushState({}, '', SCREEN_DEFINITIONS[PROJECTS_SCREEN_INDEX].path);
    setCaseStudySlug(null);
    setProjectIndexOpen(true);
  }, []);

  const caseStudyProject = caseStudySlug ? getProjectBySlug(caseStudySlug) : null;
  const caseStudyOpenRef = useRef(false);
  caseStudyOpenRef.current = caseStudySlug !== null;

  useEffect(() => {
    document.title = caseStudyProject ? `${caseStudyProject.title} | Mehanth` : BASE_DOCUMENT_TITLE;
  }, [caseStudyProject]);

  // Navbar, rail, tour and buttons: glide to the section and record it in history.
  const navigateToScreen = useCallback((screenId) => {
    const targetIndex = SCREEN_DEFINITIONS.findIndex((screen) => screen.id === screenId);
    if (targetIndex === -1) return;
    setProjectIndexOpen(false);
    setCaseStudySlug(null);
    preloadScreen(targetIndex);
    const { path } = SCREEN_DEFINITIONS[targetIndex];
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    scrollToScreen(targetIndex);
  }, [scrollToScreen]);

  useEffect(() => {
    const currentScreen = SCREEN_DEFINITIONS[activeScreenIndex];
    setFontBlack(currentScreen?.theme !== 'dark');
    preloadScreen(activeScreenIndex + 1);
  }, [activeScreenIndex]);

  // Mounting and first reveal, from intersection with the scroll container.
  useEffect(() => {
    const root = journeyRef.current;
    if (!root) return undefined;
    const sections = SCREEN_DEFINITIONS.map((screen) => document.getElementById(screen.id)).filter(Boolean);
    const near = new IntersectionObserver((entries) => {
      setNearScreens((prev) => {
        const next = new Set(prev);
        for (const entry of entries) {
          if (entry.isIntersecting) next.add(entry.target.id);
          else next.delete(entry.target.id);
        }
        return next.size === prev.size && [...next].every((id) => prev.has(id)) ? prev : next;
      });
    }, { root, rootMargin: '100% 0px' });
    const seen = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target.id === 'projects') setWorkVisible(entry.isIntersecting);
      }
      const newlySeen = entries.filter((entry) => entry.intersectionRatio >= 0.15).map((entry) => entry.target.id);
      if (newlySeen.length) {
        setSeenScreens((prev) => (newlySeen.every((id) => prev.has(id)) ? prev : new Set([...prev, ...newlySeen])));
      }
    }, { root, threshold: [0, 0.15] });
    sections.forEach((section) => {
      near.observe(section);
      seen.observe(section);
    });
    return () => {
      near.disconnect();
      seen.disconnect();
    };
  }, []);

  // On scroll: which section holds the middle of the viewport (navbar, rail, URL),
  // and how far each seam is from the middle (its props parallax by that).
  useEffect(() => {
    const root = journeyRef.current;
    if (!root) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const mid = root.clientHeight / 2;
      let index = activeScreenIndexRef.current;
      SCREEN_DEFINITIONS.forEach((screen, i) => {
        const rect = document.getElementById(screen.id)?.getBoundingClientRect();
        if (rect && rect.top <= mid && rect.bottom > mid) index = i;
      });
      if (index !== activeScreenIndexRef.current) {
        activeScreenIndexRef.current = index;
        setActiveScreenIndex(index);
        const { path } = SCREEN_DEFINITIONS[index];
        if (!caseStudyOpenRef.current && window.location.pathname !== path) {
          window.history.replaceState({}, '', path);
        }
      }
      if (!reducedMotionRef.current) {
        root.querySelectorAll('.seam').forEach((seam) => {
          seam.style.setProperty('--seam', `${(seam.getBoundingClientRect().top - mid).toFixed(1)}px`);
        });
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    root.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      root.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Deep links land on their section; back/forward glide between sections.
  useEffect(() => {
    if (initialScreenIndex > 0) requestAnimationFrame(() => scrollToScreen(initialScreenIndex, 'auto'));
    const handlePopState = () => {
      const { pathname } = window.location;
      setProjectIndexOpen(false);
      setCaseStudySlug(getCaseStudySlugFromPath(pathname));
      scrollToScreen(findScreenIndexByPath(pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Open the CV directly — no friction for recruiters/judges.
  const handleDownloadCV = () => {
    window.open('https://drive.google.com/file/d/1YDWTQODu8_bxtFBOBagk-zH6UWAE9Ds4/view?usp=sharing', '_blank', 'noopener,noreferrer');
  }

  // Only the two WebGL sections mount and unmount with distance; the rest are light.
  const isMounted = (screenId) => !['skills', 'projects'].includes(screenId) || nearScreens.has(screenId);
  const projectsCanvasActive = workVisible && isMounted('projects');

  // Sections are stacked in one scrolling page. .is-active = has been seen (its
  // .layer blocks have revealed); .is-future = not reached yet (see Motion.css).
  const screenClass = (screenIndex, extra = '') =>
    `portfolio-screen ${seenScreens.has(SCREEN_DEFINITIONS[screenIndex].id) ? 'is-active' : 'is-future'} ${extra}`.trim();
  const getScreenStyle = (_screenIndex, baseStyle = {}) => ({ position: 'relative', ...baseStyle });

  return (
    <div className="portfolio-scroll-root" ref={rootRef}>
      {showIframe && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <DevicePreview show={showIframe} url={iframeUrl} onClose={closeIframe} />
        </div>
      )}
      <AnimatePresence>
        {projectIndexOpen && (
          <ProjectIndex
            key="project-index"
            onClose={closeProjectOverlays}
            onOpenProject={openCaseStudy}
            onPreview={openIframe}
          />
        )}
        {caseStudyProject && (
          <ProjectCaseStudy
            key="project-case-study"
            project={caseStudyProject}
            onBack={backToProjectIndex}
            onClose={closeProjectOverlays}
            onOpenProject={openCaseStudy}
            onPreview={openIframe}
          />
        )}
      </AnimatePresence>
      {/* On phones the Work joystick owns the bottom-left corner, so the tour button steps aside there */}
      {!loading && !projectOverlayOpen && !(isMobile && activeScreenIndex === 2) && (
        <TourGuide activeScreenIndex={activeScreenIndex} onNavigate={navigateToScreen} />
      )}
      {!loading && (
        <div className="journey" ref={journeyRef}>
          <Navbar
            fontBlack={fontBlack}
            activeScreenId={SCREEN_DEFINITIONS[activeScreenIndex].id}
            onNavigate={navigateToScreen}
            onEnterMR={openMR}
          />
          <MRHost open={mrOpen} onClose={closeMR} />
          {/* Premium section navigation rail */}
          {!isMobile && <NavDots activeIndex={activeScreenIndex} fontBlack={fontBlack} onNavigate={navigateToScreen} />}
          <section id='lander'
            className={screenClass(0, 'paper-sheet')}
            style={getScreenStyle(0, { overflow: 'hidden', height: '100vh', minHeight: '600px' })}
          >
            <HomeHero
              active={activeScreenIndex === 0}
              onViewWork={() => navigateToScreen('projects')}
              onDownloadCV={handleDownloadCV}
            />
          </section>

          <SeamHomeSkills />

          <section id='skills'
            className={screenClass(1)}
            style={getScreenStyle(1, { overflow: 'hidden', background: '#bfe3f2', height: '100vh', minHeight: '640px' })}
          >
            {isMounted('skills') ? (
              <Suspense fallback={<SectionPlaceholder title="Skill Town" />}>
                <Skills lowPowerMode={lowPowerMode} touch={isMobile} header={<SkillsHeader />} />
              </Suspense>
            ) : (
              <SectionPlaceholder title="Skill Town" />
            )}
          </section>


          <SeamSkillsWork />

          <section

            id="projects"
            className={screenClass(2, 'canvas-text-section hide-scrollbar')}
            style={getScreenStyle(2, { overflow: 'hidden', background: 'var(--ink)', height: '100vh', minHeight: '620px' })}
          >
            {/* Flight stage */}
            <div
              className="hide-scrollbar canvas-wrapper layer"
              data-gesture-zone
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: "var(--ink)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Editorial header over the scene's top-left corner. "All projects" is the
                    non-3D way to browse everything, so nobody has to fly. */}
                <div className="work-fade" aria-hidden="true" />
                <header className="sheet-header work-header layer" style={{ '--d': 1 }}>
                  <Scribble style={{ left: '-104px', top: '70px' }}>{'From ideas\nto real projects'}</Scribble>
                  <span className="section-eyebrow">03 · Work</span>
                  <h2 className="section-title">The flight world</h2>
                  <p className="sheet-lede">Fly through my projects. Each balloon is a project with its story and links.</p>
                  <div className="sheet-actions">
                    <button type="button" className="pill-btn ink" onClick={() => setCockpitOpen((o) => !o)} aria-pressed={cockpitOpen}>
                      {cockpitOpen ? <X size={15} strokeWidth={2.4} /> : <Plus size={15} strokeWidth={2.4} />}
                      {cockpitOpen ? 'Exit cockpit' : 'Enter cockpit'}
                    </button>
                    <button type="button" className="pill-btn" onClick={openProjectIndex}>
                      <LayoutGrid size={15} strokeWidth={2.2} /> All projects
                    </button>
                  </div>
                </header>

                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '25px',
                  zIndex: 10,
                  display: 'none',
                  fontFamily: "var(--font-mono)",
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
                </div>

                {isMounted('projects') ? (
                <Suspense fallback={<SectionPlaceholder title="Project Orbit" theme="dark" />}>
                  <ProjectsStage
                    active={projectsCanvasActive && !projectOverlayOpen}
                    lowPowerMode={lowPowerMode}
                    isMobile={isMobile}
                    contactPage={contactPage}
                    setContactPage={setContactPage}
                    avatarRef={avatarRef}
                    joystickDataRef={joystickDataRef}
                    verticalControlRef={verticalControlRef}
                    planeViewRef={planeViewRef}
                    planeColor={planeColor}
                    openIframe={openIframe}
                    scoreElement={scoreElement}
                    scoreValueRef={scoreValueRef}
                    fireRef={fireRef}
                  />
                </Suspense>
                ) : (
                  <SectionPlaceholder title="Project Orbit" theme="dark" />
                )}

                {/* Cockpit control room — hull color + camera view */}
                <CockpitControls
                  hideToggle
                  open={cockpitOpen}
                  setOpen={setCockpitOpen}
                  view={planeView}
                  setView={setView}
                  color={planeColor}
                  setColor={setPlaneColor}
                />

                {/* Controls legend + project hint (auto-fades) */}
                <div className="proj-hint">
                  {!isMobile && (
                    <span className="proj-hint-row"><b>WASD</b> fly · <b>Space/Shift</b> up/down · <b>F</b> fire</span>
                  )}
                  <span className="proj-hint-row proj-hint-accent">Fly up to a ✦ balloon to open a project</span>
                </div>

                {isMobile && (<>
                <div style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '20px',
                  zIndex: 9999,
                  touchAction: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}>
                  <Joystick
                    size={104}
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
                  touchAction: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}>
                  <button
                    onPointerDown={() => { fireRef.current = true }}
                    onPointerUp={() => { fireRef.current = false }}
                    onPointerLeave={() => { fireRef.current = false }}
                    aria-label="Fire"
                    style={{
                      width: '58px',
                      height: '58px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(39, 224, 255, 0.22)',
                      border: '2px solid rgba(39, 224, 255, 0.85)',
                      color: '#27e0ff',
                      fontSize: '13px',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none',
                      boxShadow: '0 0 14px rgba(39,224,255,0.5)'
                    }}
                  >
                    FIRE
                  </button>
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
                </>)}
              </div>
            </div>
          </section>

          <SeamWorkAwards />

          <section
            id='certificate'
            className={screenClass(3, 'paper-sheet')}
            style={getScreenStyle(3, { padding: '150px clamp(16px, 3vw, 48px) 90px 0' })}
          >
            <Suspense fallback={<SectionPlaceholder title="Achievement Vault" />}>
              <Certificates />
            </Suspense>
          </section>

          <SeamAwardsContact />

          {/* Contact Section */}
          <section id='contact'
            className={screenClass(4, 'paper-sheet')}
            style={getScreenStyle(4, { minHeight: '100vh', overflowX: 'hidden' })}
          >
            <ContactSection />
          </section>

        </div >
      )
      }

    </div >
  )
}


function ContactSection({ onSent }) {
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
      onSent?.();
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
    { href: "https://linkedin.com/in/mehanth-776892279", icon: Linkedin, label: "LinkedIn" },
    { href: "https://github.com/itz-mehanth", icon: Github, label: "GitHub" },
    { href: "https://instagram.com/itz_mehanth", icon: Instagram, label: "Instagram" },
  ];

  return (
    <>
      <section className="contact-section">
        <DeskProps scene="room" className="desk-right" />
        <div className="contact-container">
          <div className="contact-intro layer" style={{ '--d': 1 }}>
            <header className="contact-heading">
              <span className="section-eyebrow">05 · Contact</span>
              <h2 className="section-title contact-title">Let&rsquo;s build something <span className="grad">unforgettable.</span></h2>
              <p className="contact-lede">Got a project, a hackathon squad, or just want to say hi? I usually reply within a day.</p>
              <span className="contact-status"><span className="status-dot" />Available for opportunities</span>
            </header>

            <ul className="contact-list">
              <li>
                <a className="contact-item" href="mailto:mehanth362@gmail.com">
                  <span className="ci-icon"><Mail size={18} /></span>
                  <span className="ci-text"><small>Email</small>mehanth362@gmail.com</span>
                </a>
              </li>
              <li>
                <div className="contact-item static">
                  <span className="ci-icon"><MapPin size={18} /></span>
                  <span className="ci-text"><small>Based in</small>Bangalore, India &middot; SWE Intern @ VISA</span>
                </div>
              </li>
            </ul>

            <div className="social-links">
              {socialLinks.map(({ href, icon: IconComponent, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="social-link">
                  <IconComponent size={16} />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="contact-form-container layer" style={{ '--d': 2 }}>
              <form className="contact-form" onSubmit={handleSubmit}>
                {submitStatus === 'success' && (
                  <div className="form-banner success" role="status" aria-live="polite">Message sent! I&rsquo;ll get back to you soon.</div>
                )}
                {submitStatus === 'error' && (
                  <div className="form-banner error" role="alert">Something went wrong. Please try again.</div>
                )}

                <div className="form-row">
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
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    style={{
                      borderColor: errors.name ? '#c81e2c' : undefined
                    }}
                  />
                  {errors.name && (
                    <span id="name-error" style={{ color: '#c81e2c', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
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
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    style={{
                      borderColor: errors.email ? '#c81e2c' : undefined
                    }}
                  />
                  {errors.email && (
                    <span id="email-error" style={{ color: '#c81e2c', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors.email}
                    </span>
                  )}
                </div>

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
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    style={{
                      borderColor: errors.message ? '#c81e2c' : undefined
                    }}
                  />
                  {errors.message && (
                    <span id="message-error" style={{ color: '#c81e2c', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
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
                  {!isSubmitting && <Send size={18} />}
                </button>
              </form>
          </div>
        </div>
      </section>
    </>
  );
}
