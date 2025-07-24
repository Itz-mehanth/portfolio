import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending } from 'three'

export default function Portal({ count = 150, delay = 0, end = false }) {
  const meshRef = useRef()
  const [start, setStart] = useState(false)
  const [opacity, setOpacity] = useState(0)

  // Delay activation
  useEffect(() => {
    const timeout = setTimeout(() => {
      setStart(true)
    }, delay)
    return () => clearTimeout(timeout)
  }, [delay])

  const particles = useMemo(() => {
    const positions = []
    const speeds = []
    const directions = []

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 3
      const y = Math.random() * 100
      const z = (Math.random() - 0.5) * 3

      positions.push(x, y, z)
      speeds.push(Math.random() * 0.5 + 1)
      directions.push({ x: (Math.random() - 0.5) * 0.2, z: (Math.random() - 0.5) * 0.2 })
    }

    return {
      positions: new Float32Array(positions),
      speeds,
      directions
    }
  }, [count])

  useFrame((_, delta) => {
    if(!start) setOpacity(0) // reset opacity when not started
    else if(!end) setOpacity(1) // set opacity to 1 when started
    if (!start || !meshRef.current) return

    if (end) {
        setOpacity((prev) => Math.max(0, prev - delta * 0.7)) // fade out over ~2 seconds
        if (opacity === 0) return // stop updating particles
    }

    const positions = meshRef.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
        const i3 = i * 3
        positions[i3 + 1] -= particles.speeds[i] * delta * 10

        if (positions[i3 + 1] <= 0) {
        positions[i3 + 1] = Math.random() * 100 + 50
        positions[i3 + 0] += particles.directions[i].x * 10
        positions[i3 + 2] += particles.directions[i].z * 10

        if (Math.abs(positions[i3 + 0]) > 2 || Math.abs(positions[i3 + 2]) > 2) {
            positions[i3 + 0] = (Math.random() - 0.5) * 10
            positions[i3 + 2] = (Math.random() - 0.5) * 10
        }
        }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true
 })

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = Math.random()
      arr[i * 3 + 1] = Math.random()
      arr[i * 3 + 2] = 1
    }
    return arr
  }, [count])

  return (
    <points ref={meshRef} frustumCulled={false}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          array={particles.positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.8}
        vertexColors
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={AdditiveBlending}
    />

    </points>
  )
}
