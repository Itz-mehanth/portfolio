

// SpiralPortal.js
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function SpiralPortal({ position = [0, 0, 0], scale = 1 }) {
  const spiralRef = useRef()

  useFrame((_, delta) => {
    if (spiralRef.current) {
      spiralRef.current.rotation.z += delta * 0.5 // slow spin
    }
  })

  return (
    <mesh ref={spiralRef} position={position} rotation={[0, 0, 0]} scale={scale}>
      <ringGeometry args={[1.1, 1, 25, 10]} />
      <meshBasicMaterial
        color="aqua"
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
