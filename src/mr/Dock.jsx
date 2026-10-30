// The section dock: six pills floating just below eye level, tilted up like a
// console: 01 Home … 05 Contact, then Exit. It follows the viewer lazily (it only
// glides back in front when they've turned or walked away), so it never swims in
// view. Press with a fingertip (poke), a pinch or a controller trigger.
import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { Button, INK } from './ui'
import { SECTIONS } from './sections'

const head = new THREE.Vector3()
const fwd = new THREE.Vector3()
const goal = new THREE.Vector3()

export default function Dock({ section, onGo, onExit, busy }) {
  const ref = useRef()
  const ready = useRef(false)
  const yaw = useRef(0)

  useFrame(({ camera }, delta) => {
    const g = ref.current
    if (!g) return
    camera.getWorldPosition(head)
    camera.getWorldDirection(fwd)
    const headYaw = Math.atan2(-fwd.x, -fwd.z)
    goal.set(head.x - Math.sin(headYaw) * 0.5, head.y - 0.36, head.z - Math.cos(headYaw) * 0.5)
    const off = Math.abs(Math.atan2(Math.sin(headYaw - yaw.current), Math.cos(headYaw - yaw.current)))
    if (!ready.current) {
      if (head.y < 0.3) return                   // no pose yet
      ready.current = true
      g.position.copy(goal)
      yaw.current = headYaw
    } else if (off > 0.75 || g.position.distanceTo(goal) > 0.45 || g.userData.gliding) {
      g.userData.gliding = off > 0.08 || g.position.distanceTo(goal) > 0.03
      g.position.x = THREE.MathUtils.damp(g.position.x, goal.x, 3, delta)
      g.position.y = THREE.MathUtils.damp(g.position.y, goal.y, 3, delta)
      g.position.z = THREE.MathUtils.damp(g.position.z, goal.z, 3, delta)
      yaw.current += Math.atan2(Math.sin(headYaw - yaw.current), Math.cos(headYaw - yaw.current)) * Math.min(1, delta * 3)
    }
    g.rotation.set(0, yaw.current, 0)
  })

  const n = SECTIONS.length + 1
  const spacing = 0.118
  return (
    <group ref={ref}>
      <group rotation={[-0.55, 0, 0]}>
        <Text position={[0, 0.05, 0]} fontSize={0.014} color={INK} outlineWidth={0.0025} outlineColor="#ffffff" anchorX="center" anchorY="middle" letterSpacing={0.12}>
          {busy ? 'TRAVELLING…' : 'MEHANTH · MIXED REALITY'}
        </Text>
        {SECTIONS.map((s, i) => (
          <Button
            key={s.id}
            position={[(i - (n - 1) / 2) * spacing, 0, 0]}
            width={0.108}
            label={`${s.number} ${s.label}`}
            size={0.0135}
            active={i === section}
            onPress={() => !busy && i !== section && onGo(i)}
          />
        ))}
        <Button position={[(n - 1 - (n - 1) / 2) * spacing, 0, 0]} width={0.108} label="Exit MR" size={0.0135} dark onPress={onExit} />
      </group>
    </group>
  )
}
