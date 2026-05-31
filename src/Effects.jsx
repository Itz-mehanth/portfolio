import { EffectComposer, GodRays, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { useRef, useEffect, useState } from 'react'

export default function Effects() {
  const sunRef = useRef()
  const [sunReady, setSunReady] = useState(false)

  useEffect(() => {
    if (sunRef.current) {
      setSunReady(true)
    }
  }, [])

  return (
    <>
      {/* Sun mesh: GodRays samples this as the light source */}
      <mesh ref={sunRef} position={[0, 0, 248]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="yellow" toneMapped={false} />
      </mesh>

      <directionalLight color={'white'} intensity={5} position={[0, 5, -15]} />

      {sunReady && (
        <EffectComposer>
          <GodRays
            sun={sunRef}
            blendFunction={BlendFunction.ADD}
            samples={60}
            density={0.96}
            decay={0.95}
            weight={0.6}
            exposure={0.7}
            clampMax={1}
          />
          <Bloom
            luminanceThreshold={0.4}
            luminanceSmoothing={0.9}
            intensity={0.4}
            blendFunction={BlendFunction.ADD}
          />
          <Vignette
            offset={0.5}
            darkness={0.5}
            blendFunction={BlendFunction.NORMAL}
          />
        </EffectComposer>
      )}
    </>
  )
}