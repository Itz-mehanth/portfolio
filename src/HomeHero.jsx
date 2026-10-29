import { ArrowRight, ArrowUpRight } from 'lucide-react'
import './Home.css'

// Home: an editorial, near-monochrome composition. The name is real 3D type:
// twelve stacked slices in a preserve-3d stage, extruded back into the page and
// tilted by the cursor (--mx/--my, set once on the app root). No WebGL.
// Blocks marked .layer take part in the depth-deck screen transition.

const NAME = 'Mehanth'
const SLICES = 12

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/itz-mehanth' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/mehanth-776892279' },
  { label: 'Instagram', href: 'https://instagram.com/itz_mehanth' },
  { label: 'Email', href: 'mailto:mehanth362@gmail.com' },
]

export default function HomeHero({ onViewWork, onDownloadCV }) {
  return (
    <div className="home">
      <div className="home-grid layer" style={{ '--d': 4 }} aria-hidden="true" />
      <span className="home-index layer" style={{ '--d': 5 }} aria-hidden="true">01</span>

      <header className="home-top layer" style={{ '--d': 1 }}>
        <span>Mehanth — Portfolio 2026</span>
        <span>Full-stack &amp; 3D web developer</span>
        <span>Chennai · Bangalore</span>
      </header>

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

      <div className="home-bottom">
        <p className="home-lede layer" style={{ '--d': 2 }}>
          I build fast, interactive 3D experiences for the web. Software Engineer Intern at VISA, Computer Science at SSN.
        </p>
        <div className="home-actions layer" style={{ '--d': 3 }}>
          <button type="button" className="home-btn primary" onClick={onViewWork}>
            View work <ArrowRight size={16} strokeWidth={2.2} />
          </button>
          <button type="button" className="home-btn" onClick={onDownloadCV}>
            Download CV
          </button>
        </div>
        <nav className="home-socials layer" style={{ '--d': 3 }} aria-label="Social links">
          {SOCIALS.map(({ label, href }) => (
            <a key={label} href={href} target={href.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer">
              {label} <ArrowUpRight size={13} />
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
