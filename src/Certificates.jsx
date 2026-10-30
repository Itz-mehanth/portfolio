import { ArrowUpRight, Trophy, Award, Medal, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Scribble from './Scribble';
import DeskProps from './DeskProps';
import { HACKATHONS as hackathonPages, CERTIFICATIONS as certPages } from './data/awards';
import './Awards.css';

// A small, restrained gold mark per win: a trophy for every first place, a medal
// for best performance, an award ribbon otherwise.
const markFor = (badge) => (/1st/i.test(badge) ? Trophy : /best/i.test(badge) ? Medal : Award);


const reveal = (i) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.12 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
});

export default function Certificates() {
  return (
    <div className="awards">
      <header className="sheet-header awards-heading layer" style={{ '--d': 1 }}>
        <Scribble style={{ left: '-104px', top: '58px' }}>{'Recognitions that\npush me forward'}</Scribble>
        <span className="section-eyebrow">04 · Awards</span>
        <h2 className="section-title">Proof of work</h2>
        <p className="sheet-lede">Four hackathon wins in 2026, and the certifications behind the fundamentals.</p>
      </header>

      {/* 3D desk props at the top right, like trophies on a shelf */}
      <div className="awards-props layer" style={{ '--d': 4 }} aria-hidden="true">
        <DeskProps scene="awards" />
      </div>

      <section className="awards-group layer" style={{ '--d': 2 }} aria-labelledby="awards-hackathons">
        <h3 id="awards-hackathons" className="awards-group-title"><Trophy size={16} /> Hackathons</h3>
        <ol className="awards-wins">
          {hackathonPages.map((win, i) => {
            const Mark = markFor(win.badge);
            return (
            <motion.li key={win.title} className="award-card win" {...reveal(i)}>
              <span className="award-index">{String(i + 1).padStart(2, '0')}</span>
              <span className="award-head">
                <Mark className="award-mark" size={20} strokeWidth={1.8} aria-hidden="true" />
                <span className="award-badge">{win.badge}</span>
              </span>
              <h4 className="award-title">{win.title}</h4>
              <p className="award-meta">{win.venue} · {win.date}</p>
              <p className="award-story">{win.story}</p>
            </motion.li>
            );
          })}
        </ol>
      </section>

      <section className="awards-group layer" style={{ '--d': 3 }} aria-labelledby="awards-certs">
        <h3 id="awards-certs" className="awards-group-title"><Award size={16} /> Certifications</h3>
        <ul className="awards-certs">
          {certPages.map((cert, i) => (
            <motion.li key={cert.title} className="award-card cert" {...reveal(i + 3)}>
              <Star className="cert-star" size={18} strokeWidth={1.8} aria-hidden="true" />
              <div className="cert-main">
                <h4 className="award-title">{cert.title}</h4>
                <p className="award-meta">{cert.issuer} · {cert.date} · {cert.story}</p>
              </div>
              <span className="cert-score">{cert.score}</span>
              {cert.url && (
                <a className="cert-link" href={cert.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${cert.title} certificate`}>
                  View <ArrowUpRight size={14} />
                </a>
              )}
            </motion.li>
          ))}
        </ul>
      </section>
    </div>
  );
}
