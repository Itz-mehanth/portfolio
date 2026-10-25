import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

// Scenes are framed for a landscape canvas. On narrower (portrait) canvases,
// widen the vertical FOV so the horizontal view stays what it was designed for.
export default function useResponsiveFov(baseFov, designAspect = 16 / 9, maxFov = 95) {
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)
  const aspect = width / Math.max(height, 1)
  if (aspect >= designAspect) return baseFov
  const halfWidth = Math.tan(THREE.MathUtils.degToRad(baseFov / 2)) * designAspect
  return Math.min(THREE.MathUtils.radToDeg(2 * Math.atan(halfWidth / aspect)), maxFov)
}
