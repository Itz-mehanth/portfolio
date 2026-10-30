// The mixed-reality portfolio: the current section's world tearing into the room,
// the dock to travel between sections, and the tunnel that carries you there.
// The stage (where the worlds stand) is set where the viewer is standing and
// facing when the session starts.
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useXR } from '@react-three/xr'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import Rift from './Rift'
import Transit from './Transit'
import Dock from './Dock'
import { SECTIONS } from './sections'
import { WORLDS } from './worlds'

const head = new THREE.Vector3()
const fwd = new THREE.Vector3()

// Soft studio reflections (gold, glaze) and a warm key light; no shadows (Quest).
function Lights() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.6
    return () => {
      scene.environment = null
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#fff6e8', '#8a7a66', 0.7]} />
      <directionalLight position={[1.5, 3, 1]} intensity={1.5} color="#fff1dc" />
    </>
  )
}

// Places its children where the viewer stood at the start, facing where they faced.
function Stage({ children }) {
  const ref = useRef()
  const placed = useRef(false)
  useFrame(({ camera }) => {
    if (placed.current || !ref.current) return
    camera.getWorldPosition(head)
    if (head.y < 0.3) return
    camera.getWorldDirection(fwd)
    ref.current.position.set(head.x, 0, head.z)
    ref.current.rotation.set(0, Math.atan2(-fwd.x, -fwd.z), 0)
    ref.current.visible = true
    placed.current = true
  })
  return <group ref={ref} visible={false}>{children}</group>
}

export default function MRScene({ start = 0, onLink, onExit }) {
  const mode = useXR((s) => s.mode)
  const [section, setSection] = useState(start)
  const [busy, setBusy] = useState(false)
  const transit = useRef()
  const camera = useThree((s) => s.camera)
  const passthrough = mode === 'immersive-ar'
  const current = SECTIONS[section]
  const World = WORLDS[section]

  const go = (i) => {
    if (busy || !transit.current) return
    setBusy(true)
    camera.getWorldDirection(fwd)
    transit.current.start(SECTIONS[i].transit, SECTIONS[i].colors, fwd, () => {
      setSection(i)
      setBusy(false)
    })
  }

  // In the on-screen preview, automated checks can travel the way the dock does.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.__mrEmulator) return undefined
    window.__mrGo = go
    return () => { delete window.__mrGo }
  })

  return (
    <>
      <Lights />
      {/* A fresh tear opens with each world (remounted per section). */}
      <Rift key={current.id} look={current.look} target={passthrough ? current.rift : 1} />
      <Stage>
        <Suspense fallback={null}>
          <World animate onLink={onLink} />
        </Suspense>
      </Stage>
      <Dock section={section} onGo={go} onExit={onExit} busy={busy} />
      <Transit ref={transit} />
    </>
  )
}
