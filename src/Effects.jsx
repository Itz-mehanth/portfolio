import { EffectComposer, GodRays } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useRef, useEffect, useState } from 'react'

export default function Effects() {
  const sunRef = useRef()
  const [sunReady, setSunReady] = useState(false)

  // Wait until the sun mesh is available
  useEffect(() => {
    if (sunRef.current) {
      setSunReady(true)
    }
  }, [])

  return (
    <>
      {/* Sun mesh: This is what GodRays will sample */}
      <mesh ref={sunRef} position={[0, 0, 248]}>
        <sphereGeometry args={[0.3, 520, 520]} />
        <meshBasicMaterial color="yellow" toneMapped={false} />
      </mesh>

      {/* Actual light source for the scene (optional) */}
      <directionalLight color={'white'} intensity={5} position={[0, 5, -15]} />

      {/* Only render GodRays once the sun mesh is mounted */}
      {sunReady && (
        <EffectComposer>
          <GodRays
            sun={sunRef}
            blendFunction={THREE.AdditiveBlending}
            samples={100}
            density={0.96}
            decay={0.95}
            weight={10}
            exposure={15}
            clampMax={50}
          />
        </EffectComposer>
      )}
    </>
  )
}