import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Arrival move for a 3D screen: the camera starts pulled back (and raised) along
// its line of sight to `target`, then glides into its resting framing. Runs once
// per mount; each screen remounts its canvas on arrival, so it plays every visit.
// Works alongside OrbitControls, which re-reads the camera position every frame.
export default function CameraEntrance({ target = [0, 0, 0], distanceFactor = 2.6, lift = 3, duration = 1.6 }) {
  const camera = useThree((state) => state.camera)
  const anim = useRef({ camera: null, from: new THREE.Vector3(), to: new THREE.Vector3(), t: 0, done: false })

  useFrame((_, delta) => {
    const a = anim.current
    if (a.done) return
    if (prefersReducedMotion()) {
      a.done = true
      return
    }
    // (Re)start whenever the default camera changes, e.g. once a makeDefault camera mounts.
    if (a.camera !== camera) {
      a.camera = camera
      a.t = 0
      const focus = new THREE.Vector3(...target)
      a.to.copy(camera.position)
      a.from.copy(a.to).sub(focus).multiplyScalar(distanceFactor).add(focus)
      a.from.y += lift
    }
    a.t = Math.min(1, a.t + delta / duration)
    const eased = 1 - Math.pow(1 - a.t, 4)
    camera.position.lerpVectors(a.from, a.to, eased)
    camera.lookAt(...target)
    if (a.t >= 1) a.done = true
  })

  return null
}
