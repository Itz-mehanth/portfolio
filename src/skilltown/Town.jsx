// Skill Town's town: road network and plaza, the buildings (see Buildings.jsx),
// instanced trees, bushes and flowers, wind turbines, teal tanks and the district
// signs. Materials are shared through a small cache.
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Billboard, Text } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import {
  BUSHES, DISTRICT_LABELS, DISTRICT_ORDER, DISTRICTS, FLOWERS, GROUND_Y, PLAZA, ROAD_Y, ROADS, SIGNS,
  TANKS, TREES, TURBINES, heightAt,
} from './layout'
import Buildings from './Buildings'

// ---------- shared materials ----------
const materialCache = new Map()
function mat(color, { roughness = 0.82, metalness = 0, flat = false } = {}) {
  const key = `${color}|${roughness}|${metalness}|${flat}`
  if (!materialCache.has(key)) {
    materialCache.set(key, new THREE.MeshStandardMaterial({ color, roughness, metalness, flatShading: flat }))
  }
  return materialCache.get(key)
}

// ---------- roads ----------
function ribbon(curve, halfWidth, y, samples = 200) {
  const pts = curve.getSpacedPoints(samples)
  const positions = []
  const index = []
  pts.forEach((p, i) => {
    const tan = curve.getTangentAt(Math.min(i / samples, 1))
    const n = new THREE.Vector3(-tan.z, 0, tan.x).normalize()
    positions.push(p.x - n.x * halfWidth, y, p.z - n.z * halfWidth, p.x + n.x * halfWidth, y, p.z + n.z * halfWidth)
    if (i > 0) {
      const k = i * 2
      index.push(k - 2, k, k - 1, k - 1, k, k + 1)
    }
  })
  // Make sure the ribbon faces up (it's single-sided).
  const p0 = new THREE.Vector3(...positions.slice(index[0] * 3, index[0] * 3 + 3))
  const p1 = new THREE.Vector3(...positions.slice(index[1] * 3, index[1] * 3 + 3))
  const p2 = new THREE.Vector3(...positions.slice(index[2] * 3, index[2] * 3 + 3))
  if (p1.sub(p0).cross(p2.sub(p0)).y < 0) {
    for (let i = 0; i < index.length; i += 3) [index[i + 1], index[i + 2]] = [index[i + 2], index[i + 1]]
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  g.setIndex(index)
  g.computeVertexNormals()
  return g
}

function Roads() {
  const geometries = useMemo(
    () =>
      ROADS.flatMap(({ curve, width }) => [
        { g: ribbon(curve, width / 2 + 0.12, ROAD_Y - 0.008), m: mat('#e9dcc1', { roughness: 0.95 }) },  // sandy shoulder
        { g: ribbon(curve, width / 2, ROAD_Y), m: mat('#cfc6b6', { roughness: 0.9 }) },                   // paving
      ]),
    [],
  )
  useEffect(() => () => geometries.forEach(({ g }) => g.dispose()), [geometries])
  return (
    <group>
      {geometries.map(({ g, m }, i) => (
        <mesh key={i} geometry={g} material={m} receiveShadow />
      ))}
      {/* Central plaza with a fountain */}
      <mesh position={[PLAZA.x, ROAD_Y - 0.004, PLAZA.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={mat('#e9dcc1', { roughness: 0.95 })}>
        <circleGeometry args={[PLAZA.r + 0.12, 40]} />
      </mesh>
      <mesh position={[PLAZA.x, ROAD_Y + 0.002, PLAZA.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={mat('#d8cfbf', { roughness: 0.9 })}>
        <circleGeometry args={[PLAZA.r, 40]} />
      </mesh>
      <group position={[PLAZA.x, ROAD_Y, PLAZA.z]}>
        <mesh position={[0, 0.12, 0]} castShadow material={mat('#bdb3a3')}>
          <cylinderGeometry args={[0.55, 0.6, 0.24, 24]} />
        </mesh>
        <mesh position={[0, 0.245, 0]} material={mat('#56c2e2', { roughness: 0.2 })}>
          <cylinderGeometry args={[0.47, 0.47, 0.02, 24]} />
        </mesh>
        <mesh position={[0, 0.42, 0]} castShadow material={mat('#bdb3a3')}>
          <cylinderGeometry args={[0.08, 0.12, 0.42, 10]} />
        </mesh>
        <mesh position={[0, 0.66, 0]} material={mat('#8fdaf0', { roughness: 0.2 })}>
          <sphereGeometry args={[0.12, 12, 8]} />
        </mesh>
      </group>
    </group>
  )
}

// ---------- vegetation (instanced) ----------
const LOBES = [[0, 0.62, 0, 0.36], [0.2, 0.5, 0.1, 0.27], [-0.18, 0.52, -0.08, 0.26], [0.04, 0.82, -0.05, 0.24], [-0.06, 0.48, 0.2, 0.22]]
const GREENS = ['#5fae4a', '#6dbb52', '#4f9d42', '#7cc45a', '#59a948']

function Trees({ items, lowPowerMode }) {
  const trunks = useRef()
  const crowns = useRef()
  const lobes = lowPowerMode ? LOBES.slice(0, 3) : LOBES
  const trunkGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.05, 0.08, 1, 6)
    g.translate(0, 0.5, 0)
    return g
  }, [])
  const crownGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 1), [])
  useEffect(() => () => { trunkGeo.dispose(); crownGeo.dispose() }, [trunkGeo, crownGeo])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const c = new THREE.Color()
    items.forEach(([x, z, r1, r2], i) => {
      const s = 0.85 + r1 * 0.55
      const y = heightAt(x, z)
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r2 * Math.PI * 2)
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s * 0.55, s))
      trunks.current.setMatrixAt(i, m)
      lobes.forEach(([lx, ly, lz, lr], j) => {
        const off = new THREE.Vector3(lx, ly, lz).applyQuaternion(q).multiplyScalar(s)
        const k = i * lobes.length + j
        const ls = lr * s * (0.9 + ((i + j) % 3) * 0.08)
        m.compose(new THREE.Vector3(x + off.x, y + off.y + 0.12 * s, z + off.z), q, new THREE.Vector3(ls, ls * 0.92, ls))
        crowns.current.setMatrixAt(k, m)
        crowns.current.setColorAt(k, c.set(GREENS[(i + j * 2) % GREENS.length]).multiplyScalar(0.92 + j * 0.03))
      })
    })
    trunks.current.instanceMatrix.needsUpdate = true
    crowns.current.instanceMatrix.needsUpdate = true
    if (crowns.current.instanceColor) crowns.current.instanceColor.needsUpdate = true
  }, [items, lobes])
  return (
    <group>
      <instancedMesh ref={trunks} args={[trunkGeo, mat('#8a5a35'), items.length]} castShadow />
      <instancedMesh ref={crowns} args={[crownGeo, undefined, items.length * lobes.length]} castShadow receiveShadow>
        <meshStandardMaterial flatShading roughness={0.9} />
      </instancedMesh>
    </group>
  )
}

function Bushes({ items, flowers }) {
  const bushes = useRef()
  const blooms = useRef()
  const g = useMemo(() => new THREE.IcosahedronGeometry(1, 1), [])
  useEffect(() => () => g.dispose(), [g])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const c = new THREE.Color()
    const q = new THREE.Quaternion()
    items.forEach(([x, z, r1], i) => {
      const s = 0.16 + r1 * 0.12
      m.compose(new THREE.Vector3(x, heightAt(x, z) + s * 0.6, z), q, new THREE.Vector3(s * 1.3, s, s * 1.3))
      bushes.current.setMatrixAt(i, m)
      bushes.current.setColorAt(i, c.set(GREENS[i % GREENS.length]).multiplyScalar(0.85))
    })
    const palette = ['#f6a6c1', '#ffd55c', '#ffffff', '#c9a7f2', '#ff8c6b']
    let k = 0
    flowers.forEach(([x, z, r1, r2], i) => {
      for (let j = 0; j < 5; j++) {
        const a = j * 1.26 + r2 * 6
        const fx = x + Math.cos(a) * 0.18 * (0.5 + r1)
        const fz = z + Math.sin(a) * 0.18 * (0.5 + r1)
        m.compose(new THREE.Vector3(fx, heightAt(fx, fz) + 0.05, fz), q, new THREE.Vector3(0.05, 0.05, 0.05))
        blooms.current.setMatrixAt(k, m)
        blooms.current.setColorAt(k, c.set(palette[(i + j) % palette.length]))
        k++
      }
    })
    bushes.current.instanceMatrix.needsUpdate = true
    blooms.current.instanceMatrix.needsUpdate = true
    if (bushes.current.instanceColor) bushes.current.instanceColor.needsUpdate = true
    if (blooms.current.instanceColor) blooms.current.instanceColor.needsUpdate = true
  }, [items, flowers])
  return (
    <group>
      <instancedMesh ref={bushes} args={[g, undefined, items.length]} castShadow receiveShadow>
        <meshStandardMaterial flatShading roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={blooms} args={[g, undefined, flowers.length * 5]}>
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
    </group>
  )
}

// ---------- turbines and tanks ----------
function Turbine({ t, animate, index }) {
  const rotor = useRef()
  useFrame((_, delta) => {
    if (animate && rotor.current) rotor.current.rotation.z += delta * (0.55 + (index % 3) * 0.12)
  })
  const white = mat('#f7f7f4', { roughness: 0.55 })
  const bladeLen = t.h * 0.36
  return (
    <group position={[t.x, t.y - 0.05, t.z]} rotation={[0, -0.35 + index * 0.08, 0]}>
      <mesh position={[0, t.h / 2, 0]} material={white} castShadow>
        <cylinderGeometry args={[0.035, 0.075, t.h, 10]} />
      </mesh>
      <mesh position={[0, t.h, -0.08]} material={white} castShadow>
        <boxGeometry args={[0.13, 0.13, 0.34]} />
      </mesh>
      <group ref={rotor} position={[0, t.h, 0.2]} rotation={[0, 0, index * 0.7]}>
        <mesh material={white}>
          <sphereGeometry args={[0.08, 12, 8]} />
        </mesh>
        {[0, 1, 2].map((k) => (
          <group key={k} rotation={[0, 0, (k * Math.PI * 2) / 3]}>
            <mesh position={[0, bladeLen / 2 + 0.08, 0]} material={white} castShadow>
              <boxGeometry args={[0.07, bladeLen, 0.02]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

function Tank({ x, z }) {
  const y = heightAt(x, z)
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.42, 0]} castShadow material={mat('#2fb3b6', { roughness: 0.4, metalness: 0.1 })}>
        <cylinderGeometry args={[0.26, 0.26, 0.84, 18]} />
      </mesh>
      <mesh position={[0, 0.84, 0]} castShadow material={mat('#5fd1d0', { roughness: 0.35 })}>
        <sphereGeometry args={[0.26, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {[0.25, 0.6].map((h) => (
        <mesh key={h} position={[0, h, 0]} material={mat('#e9f3f2')}>
          <torusGeometry args={[0.265, 0.018, 6, 24]} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- district signs + selection ----------
function roundedRect(w, h, r) {
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
  return new THREE.ShapeGeometry(s, 6)
}

function DistrictSign({ id, selected, onSelect, animate }) {
  const label = DISTRICT_LABELS[id]
  const width = 0.62 + label.length * 0.27
  const ref = useRef()
  const [x, y, z] = SIGNS[id]
  // Portrait screens show the island smaller, so signs grow to stay readable.
  const portrait = useThree((s) => s.size.width / Math.max(s.size.height, 1) < 0.95)
  const shapes = useMemo(() => ({
    shadow: roundedRect(width, 0.66, 0.16),
    border: roundedRect(width + 0.12, 0.78, 0.2),
    face: roundedRect(width, 0.66, 0.16),
  }), [width])
  useEffect(() => () => Object.values(shapes).forEach((g) => g.dispose()), [shapes])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const target = (selected ? 1.12 : 1) * (portrait ? 1.55 : 1)
    ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, target, 0.15))
    ref.current.position.y = y + (selected && animate ? Math.sin(clock.elapsedTime * 2.2) * 0.06 : 0)
  })
  return (
    <group ref={ref} position={[x, y, z]}>
      <Billboard>
        <group
          onClick={(e) => {
            e.stopPropagation()
            onSelect(id)
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = ''
          }}
        >
          <mesh geometry={shapes.shadow} position={[0.07, -0.08, -0.06]}>
            <meshBasicMaterial color="#000000" transparent opacity={0.22} depthWrite={false} />
          </mesh>
          {selected && (
            <mesh geometry={shapes.border} position={[0, 0, -0.03]}>
              <meshBasicMaterial color="#ffb51b" />
            </mesh>
          )}
          <mesh geometry={shapes.face}>
            <meshBasicMaterial color="#1b1b20" />
          </mesh>
          <Text position={[0, -0.01, 0.03]} fontSize={0.34} letterSpacing={0.04} color={selected ? '#ffc54a' : '#ffffff'} anchorX="center" anchorY="middle" font={undefined}>
            {label}
          </Text>
        </group>
      </Billboard>
    </group>
  )
}

// A soft amber ground ring around the selected district's buildings.
function SelectionHalo({ id, animate }) {
  const ref = useRef()
  const d = DISTRICTS[id]
  useFrame(({ clock }) => {
    if (!ref.current) return
    const s = 1 + (animate ? Math.sin(clock.elapsedTime * 2.4) * 0.04 : 0)
    ref.current.scale.set(s, s, s)
  })
  if (!d) return null
  return (
    <mesh ref={ref} position={[d.center[0], GROUND_Y + 0.045, d.center[1]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[d.extent + 0.15, d.extent + 0.38, 48]} />
      <meshBasicMaterial color="#ffb51b" transparent opacity={0.75} depthWrite={false} />
    </mesh>
  )
}

export default function Town({ selected, onSelect, animate = true, lowPowerMode = false }) {
  const trees = lowPowerMode ? TREES.slice(0, 80) : TREES
  return (
    <group>
      <Roads />
      <Buildings selected={selected} onSelect={onSelect} />
      <Trees items={trees} lowPowerMode={lowPowerMode} />
      <Bushes items={lowPowerMode ? BUSHES.slice(0, 30) : BUSHES} flowers={FLOWERS} />
      {TURBINES.map((t, i) => <Turbine key={i} t={t} index={i} animate={animate} />)}
      {TANKS.map(([x, z], i) => <Tank key={i} x={x} z={z} />)}
      <SelectionHalo id={selected} animate={animate} />
      {DISTRICT_ORDER.map((id) => (
        <DistrictSign key={id} id={id} selected={id === selected} onSelect={onSelect} animate={animate} />
      ))}
    </group>
  )
}
