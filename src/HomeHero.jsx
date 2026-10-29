import { lazy, Suspense, useEffect, useState } from 'react'
import { Download, ArrowRight, Github, Linkedin, Instagram, Mail } from 'lucide-react'
import Scribble from './Scribble'
import './Home.css'

// Home: editorial paper sheet. Left: the hero copy around a 3D extruded name
// (twelve CSS type slices in a preserve-3d stage, tilted by the cursor via
// --mx/--my). Right: a torn-paper cutaway into a small space scene (HeroRift,
// raw WebGL, no three.js) with a paper airplane drifting out of it.
// Blocks marked .layer take part in the depth-deck transition (Motion.css).

const HeroRift = lazy(() => import('./HeroRift'))

const NAME = 'Mehanth'
const SLICES = 12

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/itz-mehanth', Icon: Github },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/mehanth-776892279', Icon: Linkedin },
  { label: 'Instagram', href: 'https://instagram.com/itz_mehanth', Icon: Instagram },
  { label: 'Email', href: 'mailto:mehanth362@gmail.com', Icon: Mail },
]

// The cutaway waits for the browser to go idle, so the HTML hero paints first.
function useIdle() {
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    const done = () => setIdle(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(done, { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(done, 600)
    return () => clearTimeout(id)
  }, [])
  return idle
}

export default function HomeHero({ active, onViewWork, onDownloadCV }) {
  const idle = useIdle()

  return (
    <div className="home">
      <div className="home-grid layer" style={{ '--d': 4 }} aria-hidden="true" />

      {idle && (
        <Suspense fallback={null}>
          <HeroRift active={active} />
        </Suspense>
      )}

      {/* A paper airplane drifting out of the cutaway, toward the Work section */}
      <svg className="home-plane layer" style={{ '--d': 5 }} viewBox="0 0 120 70" aria-hidden="true">
        <path d="M2 38 L118 4 L58 66 L50 44 Z" fill="#fffefa" stroke="#111114" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M50 44 L118 4 L42 40 Z" fill="#e6e1d6" stroke="#111114" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M50 44 L58 66" stroke="#111114" strokeWidth="1.4" strokeLinecap="round" />
      </svg>

      <Scribble style={{ left: 'clamp(8px, 1.6vw, 30px)', top: '46%' }}>{'Welcome\nto my world'}</Scribble>

      <div className="home-copy">
        <span className="section-eyebrow layer" style={{ '--d': 0 }}>01 · Home</span>
        <span className="home-hi layer" style={{ '--d': 1 }}>Hi, I&rsquo;m</span>

        <h1 className="home-name" aria-label={NAME}>
          <span className="home-name-enter">
            <span className="home-name-stage">
              {Array.from({ length: SLICES }, (_, i) => (
                <span key={i} className="home-name-slice" aria-hidden="true" style={{ '--i': SLICES - i }}>
                  {NAME}
                </span>
              ))}
              <span className="home-name-face" aria-hidden="true">{NAME}</span>
            </span>
          </span>
        </h1>

        <p className="home-role layer" style={{ '--d': 1 }}>Full-stack &amp; 3D web developer</p>
        <p className="home-lede layer" style={{ '--d': 2 }}>
          I build fast, interactive 3D experiences for the web. Software Engineer Intern at VISA, Computer Science at SSN.
        </p>

        <span className="home-status layer" style={{ '--d': 2 }}>
          <i aria-hidden="true" />
          <span>Currently interning @ <strong>VISA</strong>, Bangalore</span>
        </span>

        <div className="home-actions layer" style={{ '--d': 3 }}>
          <button type="button" className="pill-btn amber" onClick={onDownloadCV}>
            <Download size={16} strokeWidth={2.2} /> Download CV
          </button>
          <button type="button" className="pill-btn" onClick={onViewWork}>
            View work <ArrowRight size={16} strokeWidth={2.2} />
          </button>
        </div>

        <nav className="home-socials layer" style={{ '--d': 3 }} aria-label="Social links">
          {SOCIALS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              title={label}
              target={href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
            >
              <Icon size={18} strokeWidth={1.9} />
            </a>
          ))}
        </nav>
      </div>

      <div className="home-scroll layer" style={{ '--d': 1 }} aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </div>
  )
}
