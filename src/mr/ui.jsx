// Small 3D interface kit for the MR worlds: paper-white rounded panels (the site's
// cards, in the room), pressable buttons that work with hands (poke or pinch)
// and controllers (ray + trigger), chip rows, and the paper plane.
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

export const INK = '#18181c'
export const PAPER = '#fbf8f1'
export const AMBER = '#ffb51b'

const shapeCache = new Map()
// A rounded-rectangle face, cached by size.
export function roundedRect(w, h, r) {
  const key = `${w.toFixed(3)}|${h.toFixed(3)}|${r.toFixed(3)}`
  if (shapeCache.has(key)) return shapeCache.get(key)
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  const g = new THREE.ShapeGeometry(s, 8)
  shapeCache.set(key, g)
  return g
}

// A card: a soft shadow, an edge and the face. Children sit just in front.
export function Panel({ width, height, radius = 0.025, color = PAPER, edge = '#e7e1d4', children, ...props }) {
  return (
    <group {...props}>
      <mesh geometry={roundedRect(width + 0.012, height + 0.012, radius + 0.006)} position={[0.006, -0.01, -0.006]}>
        <meshBasicMaterial color="#000000" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh geometry={roundedRect(width + 0.004, height + 0.004, radius + 0.002)} position={[0, 0, -0.002]}>
        <meshBasicMaterial color={edge} />
      </mesh>
      <mesh geometry={roundedRect(width, height, radius)}>
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <group position={[0, 0, 0.003]}>{children}</group>
    </group>
  )
}

// A label. Sizes are in metres (0.02 reads well at arm's length).
export function Label({ children, size = 0.02, color = INK, weight = 'normal', ...props }) {
  return (
    <Text fontSize={size} color={color} anchorX="left" anchorY="top" fontWeight={weight} lineHeight={1.25} {...props}>
      {children}
    </Text>
  )
}

// A pill button: grows when hovered by a ray or fingertip, dips when pressed.
// Fires once per press; a short cooldown stops a poke from double-firing.
export function Button({ label, width = 0.12, height = 0.042, onPress, active = false, dark = false, size = 0.016, ...props }) {
  const ref = useRef()
  const [hover, setHover] = useState(false)
  const last = useRef(0)
  const press = (e) => {
    e.stopPropagation()
    const now = performance.now()
    if (now - last.current < 450) return
    last.current = now
    onPress?.()
  }
  useFrame((_, delta) => {
    if (!ref.current) return
    const s = hover ? 1.06 : 1
    ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x, s, 14, delta))
  })
  const face = active ? AMBER : dark ? INK : PAPER
  const text = active ? INK : dark ? PAPER : INK
  return (
    <group ref={ref} {...props}>
      <mesh
        geometry={roundedRect(width, height, height / 2)}
        onClick={press}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <meshStandardMaterial color={face} roughness={0.7} emissive={hover ? '#ffb51b' : '#000000'} emissiveIntensity={hover ? 0.12 : 0} />
      </mesh>
      <mesh geometry={roundedRect(width + 0.004, height + 0.004, height / 2 + 0.002)} position={[0, 0, -0.002]}>
        <meshBasicMaterial color={active ? '#c98a00' : '#d9d2c4'} />
      </mesh>
      <Text position={[0, 0, 0.003]} fontSize={size} color={text} anchorX="center" anchorY="middle" fontWeight="bold">
        {label}
      </Text>
    </group>
  )
}

// Chips laid out in rows inside `width` (approximate text widths: fine for labels).
export function Chips({ items, width, size = 0.016, gap = 0.008, ...props }) {
  const layout = useMemo(() => {
    const rows = []
    let x = 0
    let y = 0
    const h = size * 2
    for (const item of items) {
      const w = item.length * size * 0.56 + size * 1.4
      if (x + w > width && x > 0) {
        x = 0
        y -= h + gap
      }
      rows.push({ item, x: x + w / 2, y: y - h / 2, w, h })
      x += w + gap
    }
    return rows
  }, [items, width, size, gap])
  return (
    <group {...props}>
      {layout.map(({ item, x, y, w, h }) => (
        <group key={item} position={[x, y, 0]}>
          <mesh geometry={roundedRect(w, h, h / 2)}>
            <meshStandardMaterial color="#ffffff" roughness={0.8} />
          </mesh>
          <mesh geometry={roundedRect(w + 0.003, h + 0.003, h / 2 + 0.0015)} position={[0, 0, -0.001]}>
            <meshBasicMaterial color="#ddd6c8" />
          </mesh>
          <Text position={[0, 0, 0.002]} fontSize={size} color={INK} anchorX="center" anchorY="middle">
            {item}
          </Text>
        </group>
      ))}
    </group>
  )
}

// A folded paper plane (like the site's), about 30 cm nose to tail, pointing -z.
export function PaperPlane(props) {
  const geometry = useMemo(() => {
    const v = (x, y, z) => [x, y, z]
    const nose = v(0, 0, -0.16)
    const tl = v(-0.11, 0.015, 0.14)
    const tr = v(0.11, 0.015, 0.14)
    const keel = v(0, -0.035, 0.12)
    const spine = v(0, 0.005, 0.13)
    const tris = [nose, tl, spine, nose, spine, tr, nose, keel, spine, nose, spine, keel]
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(tris.flat(), 3))
    g.computeVertexNormals()
    return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh geometry={geometry} {...props}>
      <meshStandardMaterial color="#fffdf8" roughness={0.75} side={THREE.DoubleSide} />
    </mesh>
  )
}

// A paper plane looping around a centre, banking into the turn.
export function OrbitingPlane({ center = [0, 1.5, -1], radius = 1.2, speed = 0.35, height = 0.25, animate = true, phase = 0 }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = (animate ? clock.elapsedTime : 0) * speed + phase
    const x = center[0] + Math.cos(t) * radius
    const z = center[2] + Math.sin(t) * radius
    const y = center[1] + Math.sin(t * 2) * height * 0.5
    ref.current.position.set(x, y, z)
    // Heading along the circle (counter-clockwise), banked inward.
    ref.current.rotation.set(0, -t + Math.PI, 0)
    ref.current.rotateZ(-0.45)
  })
  return (
    <group ref={ref}>
      <PaperPlane />
    </group>
  )
}
