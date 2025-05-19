import { useFrame } from '@react-three/fiber'
import { Billboard, Image, useScroll, Sphere, Text3D } from '@react-three/drei'
import * as THREE from 'three'
import { useRef } from 'react'

export default function Enemy({ index, total, shockwave }) {
  const ref = useRef()
  var progress = useScroll().offset

  // Pre-compute initial X position (spread horizontally)
  const startX = (index - total / 2) * 2.5 // adjust spacing
  const startZ = -50

  useFrame(({ clock }) => {
    if (!ref.current) return

    const t = THREE.MathUtils.clamp(progress, 0, 1)

    // Move from (startX, 1, startZ) to (0, 1, -5)
    const start = new THREE.Vector3(startX, 1, startZ)
    const end = new THREE.Vector3(0, 1, -5)

    let position = new THREE.Vector3().lerpVectors(start, end, t)

    // If shockwave triggered, fly outward
    if (shockwave) {
      if (!ref.current.userData.flyOutDir) {
        ref.current.userData.flyOutDir = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random() * 2,
          (Math.random() - 0.5) * 2
        ).normalize()
      }
      position.addScaledVector(ref.current.userData.flyOutDir, (t - 0.8) * 20) // fly out fast after 80%
    }

    ref.current.position.copy(position)
  })

  return (
    <Billboard  ref={ref}>
      {/* <Text fontSize={0.5}>
        {`Enemy ${index + 1}`}
      </Text> */}
    </Billboard>
  )
}