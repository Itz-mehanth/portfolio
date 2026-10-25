import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, ArrowLeft, ArrowRight, ArrowUpRight, Github, MonitorPlay } from 'lucide-react'
import { PROJECTS } from './data/projects'
import './ProjectPages.css'

const TYPE_LABELS = { live: 'Live', github: 'Open source', linkedin: 'Showcase' }

// Focus the dialog when it opens, close on Escape, and hand focus back to
// whatever opened it when it closes.
function useDialog(onClose) {
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const previouslyFocused = document.activeElement
    dialogRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [])

  return dialogRef
}

function ProjectLinks({ project, onPreview, compact = false }) {
  const size = compact ? 14 : 16
  return (
    <div className={`pp-actions ${compact ? 'compact' : ''}`}>
      {project.type === 'live' && project.url && (
        <button type="button" className="pp-btn primary" onClick={() => onPreview(project.url)}>
          <MonitorPlay size={size} /> Preview
        </button>
      )}
      {project.url && (
        <a className="pp-btn" href={project.url} target="_blank" rel="noopener noreferrer">
          {project.type === 'linkedin' ? 'View post' : 'Live site'} <ArrowUpRight size={size} />
        </a>
      )}
      {project.repoUrl && (
        <a className="pp-btn" href={project.repoUrl} target="_blank" rel="noopener noreferrer">
          <Github size={size} /> Code
        </a>
      )}
    </div>
  )
}

export function ProjectIndex({ onClose, onOpenProject, onPreview }) {
  const dialogRef = useDialog(onClose)

  return (
    <motion.div
      className="pp-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div
        className="pp-page"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pp-index-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <header className="pp-topbar">
          <span className="pp-eyebrow">{PROJECTS.length} projects</span>
          <button type="button" className="pp-icon-btn" onClick={onClose} aria-label="Back to the flight">
            <X size={20} />
          </button>
        </header>

        <h1 id="pp-index-title" className="pp-title">All projects</h1>
        <p className="pp-lead">The same projects you fly past in the 3D world, all in one list.</p>

        <ul className="pp-grid">
          {PROJECTS.map((project, i) => (
            <motion.li
              key={project.slug}
              className="pp-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.4), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <button type="button" className="pp-card-main" onClick={() => onOpenProject(project.slug)}>
                <span className={`pp-tag ${project.type}`}>{TYPE_LABELS[project.type]}</span>
                <span className="pp-card-title">{project.title}</span>
                <span className="pp-card-desc">{project.description}</span>
                <span className="pp-card-more">Read more <ArrowRight size={14} /></span>
              </button>
              <ProjectLinks project={project} onPreview={onPreview} compact />
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export function ProjectCaseStudy({ project, onBack, onClose, onOpenProject, onPreview }) {
  const dialogRef = useDialog(onClose)
  const index = PROJECTS.findIndex((p) => p.slug === project.slug)
  const next = PROJECTS[(index + 1) % PROJECTS.length]
  const hasWriteUp = project.problem || project.built?.length || project.outcome

  useEffect(() => {
    dialogRef.current?.scrollTo?.({ top: 0 })
  }, [project.slug, dialogRef])

  return (
    <motion.div
      className="pp-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <article
        className="pp-page narrow"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pp-case-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <header className="pp-topbar">
          <button type="button" className="pp-text-btn" onClick={onBack}>
            <ArrowLeft size={16} /> All projects
          </button>
          <button type="button" className="pp-icon-btn" onClick={onClose} aria-label="Back to the flight">
            <X size={20} />
          </button>
        </header>

        <motion.div
          key={project.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="pp-eyebrow">
            {TYPE_LABELS[project.type]}{project.year ? ` · ${project.year}` : ''}{project.role ? ` · ${project.role}` : ''}
          </span>
          <h1 id="pp-case-title" className="pp-title">{project.title}</h1>
          <p className="pp-lead">{project.description}</p>
          <ProjectLinks project={project} onPreview={onPreview} />

          {project.image && (
            <img className="pp-hero-img" src={project.image} alt={`${project.title} screenshot`} loading="lazy" />
          )}

          {project.stack?.length > 0 && (
            <ul className="pp-stack" aria-label="Tech stack">
              {project.stack.map((tech) => <li key={tech}>{tech}</li>)}
            </ul>
          )}

          {project.problem && (
            <section className="pp-section">
              <h2>The problem</h2>
              <p>{project.problem}</p>
            </section>
          )}
          {project.built?.length > 0 && (
            <section className="pp-section">
              <h2>What I built</h2>
              <ul>{project.built.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          )}
          {project.outcome && (
            <section className="pp-section pp-outcome">
              <h2>Outcome</h2>
              <p>{project.outcome}</p>
            </section>
          )}

          {!hasWriteUp && import.meta.env.DEV && (
            <p className="pp-dev-hint">
              Dev only: add <code>problem</code>, <code>built</code>, <code>outcome</code>, <code>stack</code> and{' '}
              <code>image</code> for this project in <code>src/data/projects.js</code>.
            </p>
          )}
        </motion.div>

        <button type="button" className="pp-next" onClick={() => onOpenProject(next.slug)}>
          <span className="pp-eyebrow">Next project</span>
          <span className="pp-next-title">{next.title} <ArrowRight size={22} /></span>
        </button>
      </article>
    </motion.div>
  )
}
