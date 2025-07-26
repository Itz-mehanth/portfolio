import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Shockwave({ position = [0, 0.05, 25], onComplete }) {
  const ringRef = useRef()
  const lightningGroup = useRef()
  const maxScale = 5
  let elapsed = 0

  useFrame((_, delta) => {
    elapsed += delta
    const scale = 1 + elapsed * 5
    if (ringRef.current) {
      ringRef.current.scale.set(scale, scale, scale)
      ringRef.current.material.opacity = Math.max(0, 1 - elapsed * 0.5)
    }

    if (lightningGroup.current) {
      lightningGroup.current.children.forEach((line) => {
        const dir = line.userData.dir
        line.scale.setScalar(1 + elapsed * 10)
        line.material.opacity = Math.max(0, 1 - elapsed * 1.2)
        line.position.set(
          position[0] + dir.x * elapsed * 5,
          position[1] + dir.y * elapsed * 5,
          position[2] + dir.z * elapsed * 5
        )
      })
    }

    if (elapsed > 1.5) {
      onComplete?.()
    }
  })

  // Generate radial lightning streaks
  const lightningLines = Array.from({ length: 250 }).map((_, i) => {
    const dir = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 0.4 + 1, // upward-ish
      Math.random() * 2 - 1
    ).normalize()

    const points = [new THREE.Vector3(0, 0, 0), dir.clone().multiplyScalar(1)]

    return (
      <line key={i} userData={{ dir }}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="aqua" transparent opacity={1} />
      </line>
    )
  })

  return (
    <group>
      {/* Expanding Ring */}
      <mesh ref={ringRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1, 1000]} />
        <meshBasicMaterial 
          color="cyan" 
          transparent 
          opacity={1}
          // emissive="cyan"
          // emissiveIntensity={5} 
          side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}