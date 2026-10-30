// Skill Town world: camera rig + lighting + terrain + town. The layout module is
// re-exported so Skills.jsx (selection state, car, drive mode) can use it.
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { PerspectiveCamera } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import Terrain from './Terrain'
import Town from './Town'

export {
  DISTRICT_ROAD_POINTS, DRIVE_OBSTACLES, GROUND_Y, SPAWN_POINT, isOnIsland, pathBetween,
} from './layout'

const TARGET = new THREE.Vector3(0.6, 1.4, 0.4)
// Desktop: elevated three-quarter view, slightly from the right. Phones: further and higher.
const DESKTOP = { azimuth: THREE.MathUtils.degToRad(-12), elevation: THREE.MathUtils.degToRad(34), distance: 48, fov: 32 }
const PORTRAIT = { azimuth: THREE.MathUtils.degToRad(-8), elevation: THREE.MathUtils.degToRad(46), distance: 62, fov: 40 }

// A designed camera, not a free orbit: fixed framing, an arrival ease, and a gentle
// pointer parallax within a few degrees. Yields to the car while driving.
function CameraRig({ enabled, animate }) {
  const cam = useRef()
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)
  const pointer = useThree((s) => s.pointer)
  const portrait = width / Math.max(height, 1) < 0.95
  const preset = portrait ? PORTRAIT : DESKTOP
  const arrival = useRef(animate ? 0 : 1)
  const smooth = useRef({ x: 0, y: 0 })

  // On wide screens, shift the view so the island sits right of the text column.
  useEffect(() => {
    const c = cam.current
    if (!c) return undefined
    if (!portrait) c.setViewOffset(width, height, -width * 0.17, -height * 0.02, width, height)
    else c.clearViewOffset()
    c.updateProjectionMatrix()
    return () => c.clearViewOffset()
  }, [width, height, portrait])

  useFrame((_, delta) => {
    const c = cam.current
    if (!c || !enabled) return
    arrival.current = Math.min(1, arrival.current + delta / 2.2)
    const k = 1 - Math.pow(1 - arrival.current, 3)
    if (animate) {
      smooth.current.x += (pointer.x - smooth.current.x) * Math.min(1, delta * 2)
      smooth.current.y += (pointer.y - smooth.current.y) * Math.min(1, delta * 2)
    }
    const az = preset.azimuth + smooth.current.x * THREE.MathUtils.degToRad(3.5)
    const el = preset.elevation + smooth.current.y * THREE.MathUtils.degToRad(1.8) + (1 - k) * THREE.MathUtils.degToRad(14)
    // Back off far enough that the island's full width (~30 units) fits the screen's
    // horizontal field of view, so narrow screens never clip it.
    const aspect = width / Math.max(height, 1)
    const hHalf = Math.atan(Math.tan(THREE.MathUtils.degToRad(preset.fov / 2)) * aspect)
    const fitDistance = 14 / Math.tan(hHalf)
    const dist = Math.max(preset.distance, portrait ? fitDistance : 0) * (1 + (1 - k) * 0.35)
    const desired = new THREE.Vector3(
      TARGET.x + Math.sin(az) * Math.cos(el) * dist,
      TARGET.y + Math.sin(el) * dist,
      TARGET.z + Math.cos(az) * Math.cos(el) * dist,
    )
    // Ease back smoothly after leaving drive mode.
    c.position.lerp(desired, arrival.current < 1 ? 1 : Math.min(1, delta * 3))
    c.lookAt(TARGET)
  })
  return <PerspectiveCamera ref={cam} makeDefault fov={preset.fov} near={0.5} far={600} />
}

function Lighting({ lowPowerMode }) {
  return (
    <>
      <fog attach="fog" args={['#cfeefc', 90, 210]} />
      <hemisphereLight args={['#cdeeff', '#f1d7a6', 0.95]} />
      <ambientLight intensity={0.22} />
      <directionalLight
        castShadow
        position={[-14, 24, 14]}
        intensity={2.3}
        color="#fff0d2"
        shadow-mapSize-width={lowPowerMode ? 1024 : 2048}
        shadow-mapSize-height={lowPowerMode ? 1024 : 2048}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
    </>
  )
}

export default function SkillTownWorld({ selected, onSelect, driveMode = false, lowPowerMode = false, reducedMotion = false }) {
  const animate = !reducedMotion
  return (
    <group>
      <Lighting lowPowerMode={lowPowerMode} />
      <CameraRig enabled={!driveMode} animate={animate} />
      <Terrain animate={animate} lowPowerMode={lowPowerMode} />
      <Town selected={selected} onSelect={onSelect} animate={animate} lowPowerMode={lowPowerMode} />
    </group>
  )
}
