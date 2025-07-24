import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function SplashParticles({ count = 50, position=[0,-35, 4.5], radius = 1 }) {
  const ref = useRef()

  // Store angle and radius for each particle
  const particles = useMemo(() => {
    const data = []
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = Math.random() * radius
      data.push({
        angle,
        radius: r,
        y: 0,
        speed: 0.02 + Math.random() * 0.02, // outward speed
        spin: 0.05 + Math.random() * 0.05,  // rotational speed
      })
    }
    return data
  }, [count, radius])

  const positions = useMemo(() => new Float32Array(count * 3), [count])
  const particleData = useRef(particles)

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const color = new THREE.Color(Math.random(), Math.random(), Math.random())
      arr[i * 3] = 255
      arr[i * 3 + 1] = 255
      arr[i * 3 + 2] = 255
    }
    return arr
  }, [count])

  useFrame(() => {
    const arr = positions
    particleData.current.forEach((p, i) => {
      p.radius += p.speed     // move outward
      p.angle += p.spin       // spin around

      const x = Math.cos(p.angle) * p.radius
      const z = Math.sin(p.angle) * p.radius
      const y = Math.sin(p.radius * 0.5) * 0.2 // slight wave on Y

      arr[i * 3] = x + position[0]
      arr[i * 3 + 1] = y + position[1]
      arr[i * 3 + 2] = z + position[2]
      // arr[i * 3 + 1] = y - 35
      // arr[i * 3 + 2] = z + 4.5

      // reset when too far
      if (p.radius > 3) {
        p.radius = Math.random() * radius
        p.angle = Math.random() * Math.PI * 2
      }
    })

    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={colors.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        sizeAttenuation
        transparent
        opacity={0.8}
        vertexColors
      />
    </points>
  )
}

