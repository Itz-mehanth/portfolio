// Desk props for the paper sections (Awards, Contact): real 3D objects rendered by
// Desk3D.jsx. This wrapper stays light: the 3D code only downloads on wide screens,
// once the section comes within ~800px, and the scene only renders while visible.
// Decorative only, hidden from assistive tech.
import { lazy, Suspense, useEffect, useRef, useState } from 'react'

const Desk3D = lazy(() => import('./Desk3D'))

const matches = (query) => typeof window !== 'undefined' && window.matchMedia(query).matches

export default function DeskProps({ scene, className = '', style }) {
  const ref = useRef(null)
  const [wide] = useState(() => matches('(min-width: 1000px)'))
  const [reducedMotion] = useState(() => matches('(prefers-reduced-motion: reduce)'))
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!wide || !el) return undefined
    const nearby = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '800px 0px' })
    const onScreen = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    nearby.observe(el)
    onScreen.observe(el)
    return () => {
      nearby.disconnect()
      onScreen.disconnect()
    }
  }, [wide])

  if (!wide) return null
  return (
    <div ref={ref} className={`desk3d ${className}`} style={style} aria-hidden="true">
      {near && (
        <Suspense fallback={null}>
          <Desk3D scene={scene} active={visible} reducedMotion={reducedMotion} />
        </Suspense>
      )}
    </div>
  )
}
