// The Work flight scene. Lives in its own lazy chunk so the first page load
// ships no 3D code at all: three.js, R3F, drei and postprocessing arrive only
// when this (or another 3D screen) is actually needed.
import { Suspense, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls, Scroll, PerspectiveCamera, AdaptiveEvents } from '@react-three/drei'
import { EffectComposer, Vignette, Bloom } from '@react-three/postprocessing'
import Airplane from './Airplane'
import Projects from './Projects'

const CAMERA_CONFIG = { position: [0, 4, 15], fov: 100 }

export default function ProjectsStage({
  active,
  scrollEnabled,
  lowPowerMode,
  isMobile,
  contactPage,
  setContactPage,
  avatarRef,
  joystickDataRef,
  verticalControlRef,
  planeViewRef,
  planeColor,
  openIframe,
  scoreElement,
  scoreValueRef,
  fireRef,
}) {
  // WebGL context-loss recovery: recreate the canvas once the GPU frees memory.
  const [glKey, setGlKey] = useState(0)
  const handleCreated = useCallback(({ gl }) => {
    gl.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault()
      setTimeout(() => setGlKey((k) => k + 1), 450)
    })
  }, [])

  return (
    <Canvas
      key={glKey}
      onCreated={handleCreated}
      frameloop={active ? 'always' : 'never'}
      // Fixed resolution: adaptive DPR switched resolution mid-flight, which read as flicker.
      dpr={lowPowerMode ? 1 : [1, 1.5]}
      camera={CAMERA_CONFIG}
      style={{ width: '100%', height: '100%', display: 'block' }}
      gl={{ antialias: !lowPowerMode, alpha: false, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#121117']} />
      <AdaptiveEvents />
      <ambientLight intensity={5} />
      <PerspectiveCamera makeDefault position={[0, 4, 15]} fov={100} />
      <Suspense fallback={null}>
        <ScrollControls
          maxSpeed={0.25}
          distance={6}
          pages={1}
          damping={0.35}
          enabled={scrollEnabled}
          infinite={true}
          horizontal={false}
        >
          <Scroll>
            <Airplane
              contactPage={contactPage}
              setContactPage={setContactPage}
              ref={avatarRef}
              scale={7.5}
              position={[0, 0, 0]}
              rotation={[0, Math.PI, 0]}
              isMobile={isMobile}
              joystickDataRef={joystickDataRef}
              verticalControlRef={verticalControlRef}
              planeViewRef={planeViewRef}
              planeColor={planeColor}
              lowPowerMode={lowPowerMode}
            />
            {!contactPage && (
              <Projects
                openIframe={openIframe}
                contactPage={contactPage}
                avatarRef={avatarRef}
                scoreElement={scoreElement}
                scoreValueRef={scoreValueRef}
                fireRef={fireRef}
                lowPowerMode={lowPowerMode}
              />
            )}
          </Scroll>
        </ScrollControls>

        {/* Kept mounted for the canvas's whole life: mounting and unmounting the
            composer on screen changes swapped render paths and flashed the frame. */}
        {!lowPowerMode && (
          <EffectComposer multisampling={0} enableNormalPass={false}>
            <Bloom intensity={0.22} luminanceThreshold={0.82} luminanceSmoothing={0.3} mipmapBlur radius={0.5} />
            <Vignette eskil={false} offset={0.28} darkness={0.72} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  )
}
