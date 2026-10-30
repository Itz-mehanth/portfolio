// Skill Town's world: a main island and a smaller one joined by a stone bridge,
// each with layered terracotta cliffs, a grass top, a sand ledge and waterfalls
// pouring into a bright sea. Grassy hills rise on the main island's back half. A
// winding grey road threads all nine districts (a house, a water tank and a sign
// each) and crosses the bridge; the car drives along it.
//
// Terrain is cheap procedural geometry. Props are the existing GLB models, each
// wrapped in <Grounded>, which measures the model's real bounding box once it has
// loaded and stands it exactly on the terrain (the models' own origins are
// inconsistent, which is what buried them before).
import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Billboard, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import House from './utils/models/House'
import WaterTank from './utils/models/WaterTank'
import Tree from './utils/models/Tree'
import WindMills from './utils/models/WIndMill'

export const GROUND_Y = 2.0          // walkable top of both islands
const SEA_Y = 0.02

export const DISTRICT_ORDER = ['languages', 'web', 'mobile', 'backend', 'database', 'arvr', 'uiux', 'tools', 'aiml']
const DISTRICT_LABELS = {
  languages: 'LANGUAGES', web: 'WEB', mobile: 'MOBILE', backend: 'BACKEND', database: 'DATABASE',
  arvr: 'AR/VR', uiux: 'UI/UX', tools: 'TOOLS', aiml: 'AI/ML',
}
// Roof-to-sign colour accents: restrained, so the selected (amber) one stands out.
const HOUSE_TINTS = ['#e0663a', '#3f86c4', '#e0a62f', '#c94b45', '#6a63c2', '#3f9a6c', '#d8678f', '#b8743c', '#2f9fa6']

// ---------- islands ----------
const ISLANDS = [
  { cx: -3.2, cz: 0, rx: 9.2, rz: 6.4, seed: 1.1 },
  { cx: 10.6, cz: 0.6, rx: 3.8, rz: 3.2, seed: 4.7 },
]
const HILLS = [
  { cx: -7.6, cz: -3.4, rx: 2.7, rz: 1.7, h: 0.95, seed: 2.3 },
  { cx: -1.6, cz: -3.9, rx: 2.4, rz: 1.45, h: 0.7, seed: 6.1 },
  { cx: 12.7, cz: -1.0, rx: 1.1, rz: 0.8, h: 0.55, seed: 3.9 },
]

const wobble = (t, seed) => 1 + 0.07 * Math.sin(3 * t + seed) + 0.045 * Math.sin(5 * t + seed * 2.1) + 0.03 * Math.sin(8 * t + seed * 0.7)
const radiusIn = (shape, x, z) => {
  const dx = (x - shape.cx) / shape.rx
  const dz = (z - shape.cz) / shape.rz
  return Math.hypot(dx, dz) / wobble(Math.atan2(dz, dx), shape.seed)
}

export function isOnIsland(x, z) {
  return ISLANDS.some((island) => radiusIn(island, x, z) < 0.97) || onBridge(x, z)
}

// Terrain height under (x, z): island top, plus any hill.
export function heightAt(x, z) {
  let y = GROUND_Y
  for (const hill of HILLS) if (radiusIn(hill, x, z) < 1) y = Math.max(y, GROUND_Y + hill.h)
  return y
}

// ---------- road ----------
const STOPS = {
  languages: [-10.6, 1.0],
  web: [-8.2, 3.6],
  mobile: [-5.4, 1.4],
  backend: [-2.6, 3.8],
  database: [0.2, 1.6],
  arvr: [2.6, 2.6],
  uiux: [9.2, 2.4],
  tools: [12.4, 1.2],
  aiml: [10.0, -1.4],
}
const ROAD_POINTS = [
  STOPS.languages, STOPS.web, STOPS.mobile, STOPS.backend, STOPS.database, STOPS.arvr,
  [5.0, 1.95], [7.7, 1.75],            // onto and off the bridge
  STOPS.uiux, STOPS.tools, STOPS.aiml,
]
const ROAD_Y = GROUND_Y + 0.02
export const ROAD = new THREE.CatmullRomCurve3(ROAD_POINTS.map(([x, z]) => new THREE.Vector3(x, ROAD_Y, z)), false, 'catmullrom', 0.5)
const STOP_T = Object.fromEntries(DISTRICT_ORDER.map((id) => [id, ROAD_POINTS.indexOf(STOPS[id]) / (ROAD_POINTS.length - 1)]))
const BRIDGE = { x0: 5.2, x1: 7.2, z: 1.85, halfWidth: 0.75 }
function onBridge(x, z) {
  return x > BRIDGE.x0 - 0.2 && x < BRIDGE.x1 + 0.2 && Math.abs(z - BRIDGE.z) < BRIDGE.halfWidth
}

export const DISTRICT_ROAD_POINTS = Object.fromEntries(DISTRICT_ORDER.map((id) => [id, ROAD.getPoint(STOP_T[id])]))
export const SPAWN_POINT = DISTRICT_ROAD_POINTS.languages.clone()

// The car drives the road between two stops, either direction.
export function pathBetween(fromId, toId) {
  if (!fromId || !toId || fromId === toId) return null
  const t0 = STOP_T[fromId]
  const t1 = STOP_T[toId]
  const steps = Math.max(8, Math.ceil(Math.abs(t1 - t0) * 120))
  const pts = Array.from({ length: steps + 1 }, (_, i) => ROAD.getPoint(t0 + ((t1 - t0) * i) / steps))
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)
}

// Houses stand beside the road, on whichever side is further inland.
export const DISTRICT_CENTERS = Object.fromEntries(
  DISTRICT_ORDER.map((id, i) => {
    const t = STOP_T[id]
    const p = ROAD.getPoint(t)
    const tan = ROAD.getTangent(t)
    const n = new THREE.Vector3(-tan.z, 0, tan.x).normalize()
    const island = ISLANDS.reduce((best, isl) => (radiusIn(isl, p.x, p.z) < radiusIn(best, p.x, p.z) ? isl : best))
    const sides = [1, -1].map((s) => p.clone().addScaledVector(n, s * 1.55))
    const preferred = i % 2 === 0 ? sides : sides.slice().reverse()
    const pick = preferred.find((c) => radiusIn(island, c.x, c.z) < 0.8 && heightAt(c.x, c.z) === GROUND_Y)
      || sides.reduce((a, b) => (radiusIn(island, a.x, a.z) < radiusIn(island, b.x, b.z) ? a : b))
    return [id, [pick.x, GROUND_Y, pick.z]]
  }),
)

// Obstacles for drive mode: houses, plus hills sampled as circles.
export const DRIVE_OBSTACLES = {
  ...DISTRICT_CENTERS,
  ...Object.fromEntries(
    HILLS.flatMap((hill, h) =>
      [-0.55, 0, 0.55].map((f, i) => [`hill${h}-${i}`, [hill.cx + f * hill.rx, GROUND_Y, hill.cz]]),
    ),
  ),
}

// ---------- scatter (deterministic) ----------
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
const distToRoad = (() => {
  const samples = ROAD.getSpacedPoints(160)
  return (x, z) => samples.reduce((m, p) => Math.min(m, Math.hypot(p.x - x, p.z - z)), Infinity)
})()
function scatter(count, seed, accept) {
  const rnd = seeded(seed)
  const out = []
  for (let tries = 0; out.length < count && tries < count * 60; tries++) {
    const island = rnd() < 0.82 ? ISLANDS[0] : ISLANDS[1]
    const a = rnd() * Math.PI * 2
    const r = Math.sqrt(rnd()) * 0.86
    const x = island.cx + Math.cos(a) * island.rx * r
    const z = island.cz + Math.sin(a) * island.rz * r
    if (radiusIn(island, x, z) > 0.86) continue
    if (distToRoad(x, z) < 1.0) continue
    if (Object.values(DISTRICT_CENTERS).some(([hx, , hz]) => Math.hypot(hx - x, hz - z) < 1.5)) continue
    if (out.some(([ox, oz]) => Math.hypot(ox - x, oz - z) < 0.95)) continue
    if (accept && !accept(x, z)) continue
    out.push([x, z])
  }
  return out
}
const TREES = scatter(46, 17)
const HILL_WINDMILLS = HILLS.slice(0, 2).map((hill) => [hill.cx + hill.rx * 0.25, hill.cz - hill.rz * 0.15])
const EXTRA_TANKS = [[-6.9, -0.9], [4.0, -1.2]]

// ---------- grounding wrapper ----------
// Measures its children once they've loaded, then shifts them so their footprint is
// centred on this group's (x, z) and their lowest point sits at world height `y`.
export function Grounded({ y, position = [0, 0, 0], rotationY = 0, scale = 1, children }) {
  const inner = useRef()
  const done = useRef(false)
  const fit = () => {
    if (done.current || !inner.current) return
    inner.current.position.set(0, 0, 0)
    inner.current.updateWorldMatrix(true, true)
    const box = new THREE.Box3().setFromObject(inner.current)
    if (box.isEmpty()) return
    const centre = box.getCenter(new THREE.Vector3())
    inner.current.position.set(position[0] - centre.x, y - box.min.y, position[2] - centre.z)
    done.current = true
  }
  useLayoutEffect(fit)
  useFrame(fit)
  return (
    <group rotation={[0, rotationY, 0]} scale={scale}>
      <group ref={inner}>{children}</group>
    </group>
  )
}

// ---------- terrain pieces ----------
function blobShape(shape, scale) {
  const s = new THREE.Shape()
  const n = 96
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2
    const r = wobble(t, shape.seed) * scale
    const x = shape.cx + Math.cos(t) * shape.rx * r
    const z = shape.cz + Math.sin(t) * shape.rz * r
    if (i === 0) s.moveTo(x, -z)
    else s.lineTo(x, -z)
  }
  return s
}

// The blob extruded downward from `top` by `depth`: cap colour on top, side colour around.
function Slab({ shape, scale = 1, top, depth, cap, side, bevel = 0.12 }) {
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(blobShape(shape, scale), {
      depth,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel * 1.2,
      bevelSegments: 1,
      curveSegments: 1,
    })
    g.rotateX(-Math.PI / 2)                 // shape (x, -z) -> world (x, z); extrusion goes up
    g.translate(0, top - depth - bevel, 0)  // so the cap ends exactly at `top`
    g.computeVertexNormals()
    return g
  }, [shape, scale, top, depth, bevel])
  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshToonMaterial attach="material-0" color={cap} />
      <meshToonMaterial attach="material-1" color={side} />
    </mesh>
  )
}

// Cliff strata: alternating terracotta bands down to a sandy ledge at the waterline.
function Island({ shape }) {
  return (
    <group>
      <Slab shape={shape} top={GROUND_Y} depth={0.2} cap="#8fcf6c" side="#6aa24f" />
      <Slab shape={shape} scale={1.005} top={GROUND_Y - 0.3} depth={0.55} cap="#cf7442" side="#cf7442" bevel={0.04} />
      <Slab shape={shape} scale={1.02} top={GROUND_Y - 0.86} depth={0.45} cap="#b9603a" side="#b9603a" bevel={0.04} />
      <Slab shape={shape} scale={1.035} top={GROUND_Y - 1.32} depth={0.55} cap="#d9864f" side="#d9864f" bevel={0.04} />
      <Slab shape={shape} scale={1.1} top={0.32} depth={0.55} cap="#ecd59b" side="#caa86d" bevel={0.08} />
    </group>
  )
}

function Hill({ hill }) {
  return (
    <group>
      <Slab shape={hill} top={GROUND_Y + hill.h} depth={0.18} cap="#9ad677" side="#77b15a" bevel={0.08} />
      <Slab shape={hill} scale={1.04} top={GROUND_Y + hill.h - 0.26} depth={hill.h - 0.2} cap="#cf7442" side="#c96c3d" bevel={0.04} />
    </group>
  )
}

// A ribbon along the road curve: grey stone with pale edge lines.
function Road() {
  const geometries = useMemo(() => {
    const ribbon = (offset, halfWidth, lift) => {
      const pts = ROAD.getSpacedPoints(220)
      const positions = []
      const index = []
      pts.forEach((p, i) => {
        const tan = ROAD.getTangentAt(i / (pts.length - 1))
        const n = new THREE.Vector3(-tan.z, 0, tan.x).normalize()
        const c = p.clone().addScaledVector(n, offset)
        const a = c.clone().addScaledVector(n, -halfWidth)
        const b = c.clone().addScaledVector(n, halfWidth)
        positions.push(a.x, ROAD_Y + lift, a.z, b.x, ROAD_Y + lift, b.z)
        if (i > 0) {
          const k = i * 2
          index.push(k - 2, k - 1, k, k - 1, k + 1, k)
        }
      })
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      g.setIndex(index)
      g.computeVertexNormals()
      return g
    }
    return { road: ribbon(0, 0.6, 0), left: ribbon(-0.52, 0.035, 0.004), right: ribbon(0.52, 0.035, 0.004), dash: ribbon(0, 0.03, 0.004) }
  }, [])
  return (
    <group>
      <mesh geometry={geometries.road} receiveShadow>
        <meshToonMaterial color="#c4bdb0" side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometries.left}><meshBasicMaterial color="#f6f2ea" side={THREE.DoubleSide} /></mesh>
      <mesh geometry={geometries.right}><meshBasicMaterial color="#f6f2ea" side={THREE.DoubleSide} /></mesh>
      <mesh geometry={geometries.dash}><meshBasicMaterial color="#e7dfcf" side={THREE.DoubleSide} transparent opacity={0.7} /></mesh>
    </group>
  )
}

// Stone arch bridge between the islands, under the road.
function Bridge() {
  const length = BRIDGE.x1 - BRIDGE.x0 + 0.8
  const cx = (BRIDGE.x0 + BRIDGE.x1) / 2
  return (
    <group position={[cx, 0, BRIDGE.z]}>
      <mesh position={[0, GROUND_Y - 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.26, 1.5]} />
        <meshToonMaterial color="#a39c90" />
      </mesh>
      {[-0.72, 0.72].map((z) => (
        <mesh key={z} position={[0, GROUND_Y + 0.14, z]} castShadow>
          <boxGeometry args={[length, 0.28, 0.12]} />
          <meshToonMaterial color="#8c857a" />
        </mesh>
      ))}
      {[-0.55, 0.55].map((z) => (
        <mesh key={`arch${z}`} position={[0, GROUND_Y - 0.28, z]} rotation={[0, 0, 0]}>
          <torusGeometry args={[length / 2 - 0.1, 0.16, 6, 20, Math.PI]} />
          <meshToonMaterial color="#958e82" />
        </mesh>
      ))}
    </group>
  )
}

// ---------- water ----------
function Sea() {
  const material = useMemo(() => {
    const ell = ISLANDS.map((i) => `length(vec2((vWorld.x - (${i.cx.toFixed(2)})) / ${(i.rx * 1.12).toFixed(2)}, (vWorld.z - (${i.cz.toFixed(2)})) / ${(i.rz * 1.12).toFixed(2)}))`)
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uDeep: { value: new THREE.Color('#2f8ccc') },
        uShallow: { value: new THREE.Color('#4fd0e6') },
        uFoam: { value: new THREE.Color('#f4fbff') },
      },
      vertexShader: /* glsl */ `
        varying vec3 vWorld;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vWorld = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uDeep, uShallow, uFoam;
        varying vec3 vWorld;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
        }
        void main() {
          float e = min(${ell[0]}, ${ell[1]});
          float n = noise(vWorld.xz * 0.55 + vec2(uTime * 0.12, uTime * 0.08));
          vec3 col = mix(uShallow, uDeep, smoothstep(1.0, 1.7, e));
          col += 0.05 * smoothstep(0.62, 0.92, n);
          float glint = smoothstep(0.9, 0.98, noise(vWorld.xz * 4.5 - vec2(uTime * 0.3, 0.0)));
          col += vec3(0.22) * glint * (1.0 - smoothstep(1.0, 1.6, e));
          float width = 0.05 + 0.03 * sin(uTime * 1.4 + n * 6.0);
          float foam = 1.0 - smoothstep(0.0, width, abs(e - 1.02 - 0.025 * n));
          col = mix(col, uFoam, foam * 0.85);
          float alpha = 1.0 - smoothstep(34.0, 52.0, length(vWorld.xz - vec2(0.5, 0.0)));
          gl_FragColor = vec4(col, alpha);
        }
      `,
    })
  }, [])
  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.5, SEA_Y, 0]} material={material} renderOrder={-1}>
      <planeGeometry args={[110, 110]} />
    </mesh>
  )
}

function Waterfall({ x, z, top, bottom = SEA_Y, width = 0.8, rotationY = 0 }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { uTime: { value: Math.random() * 10 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          varying vec2 vUv;
          float hash(float x) { return fract(sin(x * 91.7) * 43758.5453); }
          void main() {
            float lane = floor(vUv.x * 12.0);
            float streak = fract(vUv.y * 3.0 + uTime * (1.2 + hash(lane) * 0.8) + hash(lane + 3.0));
            float s = smoothstep(0.55, 1.0, streak);
            vec3 col = mix(vec3(0.6, 0.86, 0.97), vec3(1.0), s);
            float edge = smoothstep(0.0, 0.2, vUv.x) * (1.0 - smoothstep(0.8, 1.0, vUv.x));
            gl_FragColor = vec4(col, (0.6 + 0.4 * s) * edge);
          }
        `,
      }),
    [],
  )
  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta
  })
  const h = top - bottom
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <mesh material={material} position={[0, bottom + h / 2, 0.02]}>
        <planeGeometry args={[width, h]} />
      </mesh>
      <mesh position={[0, bottom + 0.02, 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[width * 0.75, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
      </mesh>
    </group>
  )
}

// A waterfall on the island's coast at angle t (0 = +x, pi/2 = front).
function CoastFall({ island, t, top = GROUND_Y - 0.05, width = 0.8 }) {
  const r = wobble(t, island.seed) * 1.025
  const x = island.cx + Math.cos(t) * island.rx * r
  const z = island.cz + Math.sin(t) * island.rz * r
  // Face outward from the island (normal of the ellipse at t).
  const nx = Math.cos(t) / island.rx
  const nz = Math.sin(t) / island.rz
  return <Waterfall x={x} z={z} top={top} width={width} rotationY={Math.atan2(nx, nz)} />
}

function Dock({ position, rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.38, 1.2]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.09, 2.8]} />
        <meshToonMaterial color="#9a6a3c" />
      </mesh>
      {[-0.34, 0.34].flatMap((x) => [0.2, 1.3, 2.4].map((zz) => (
        <mesh key={`${x}-${zz}`} position={[x, 0.12, zz]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 6]} />
          <meshToonMaterial color="#6e4524" />
        </mesh>
      )))}
    </group>
  )
}

function Boat({ position }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    ref.current.position.y = position[1] + Math.sin(t * 1.6) * 0.04
    ref.current.rotation.z = Math.sin(t * 1.2) * 0.05
  })
  return (
    <group ref={ref} position={position} rotation={[0, -0.35, 0]}>
      <mesh scale={[1.35, 0.5, 0.55]} castShadow>
        <sphereGeometry args={[0.55, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshToonMaterial color="#c4552f" side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.35, 0.55, 1]} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.53, 16]} />
        <meshToonMaterial color="#e8c48e" />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.1, 6]} />
        <meshToonMaterial color="#5a3a20" />
      </mesh>
      <mesh position={[0.04, 0.62, 0.02]}>
        <shapeGeometry args={[new THREE.Shape([new THREE.Vector2(0, -0.45), new THREE.Vector2(0, 0.5), new THREE.Vector2(0.5, -0.45)])]} />
        <meshToonMaterial color="#fffaf0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function Rocks() {
  const rocks = [
    [13.8, 2.6, 0.55], [-12.9, -2.2, 0.7], [7.5, 6.4, 0.45], [-9.2, 6.2, 0.5], [6.2, -3.6, 0.6], [-14.5, 2.6, 0.38],
  ]
  return rocks.map(([x, z, s], i) => (
    <mesh key={i} position={[x, SEA_Y + s * 0.35, z]} rotation={[i, i * 1.7, 0]} scale={s} castShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshToonMaterial color={i % 2 ? '#8d8a85' : '#a39e96'} />
    </mesh>
  ))
}

function Clouds() {
  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.008
  })
  const puffs = [[3, 6, -19, 1.3], [17, 5.5, -9, 1.0], [16, 6, 8, 0.8], [-8, 6.5, -17, 0.9], [-17, 5.5, -4, 0.8]]
  return (
    <group ref={ref}>
      {puffs.map(([x, y, z, s], i) => (
        <group key={i} position={[x, y, z]} scale={s}>
          {[[0, 0, 0, 1.1], [1.1, -0.2, 0.2, 0.8], [-1.1, -0.25, -0.1, 0.75], [0.4, 0.45, -0.2, 0.7]].map(([px, py, pz, r], j) => (
            <mesh key={j} position={[px, py, pz]}>
              <icosahedronGeometry args={[r, 1]} />
              <meshToonMaterial color="#ffffff" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// ---------- districts ----------
function District({ id, index, selected, onSelect }) {
  const [x, , z] = DISTRICT_CENTERS[id]
  const road = DISTRICT_ROAD_POINTS[id]
  // Houses face the road.
  const facing = Math.atan2(road.x - x, road.z - z)
  const tint = HOUSE_TINTS[index % HOUSE_TINTS.length]
  return (
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
      <Suspense fallback={null}>
        <Grounded y={GROUND_Y} position={[x, 0, z]} rotationY={0}>
          <group rotation={[0, facing, 0]} scale={[1.25, 1.45, 1.25]}>
            <House wallColor="#f6ead3" roofColor={tint} />
          </group>
        </Grounded>
        <Grounded y={GROUND_Y} position={[x + 0.95 * Math.cos(facing), 0, z - 0.95 * Math.sin(facing)]}>
          <group scale={0.85}>
            <WaterTank />
          </group>
        </Grounded>
      </Suspense>
      {/* A coloured base pad so each district reads at a glance */}
      <mesh position={[x, GROUND_Y + 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.05, 28]} />
        <meshToonMaterial color={selected ? '#ffd27a' : '#d8eec2'} />
      </mesh>
      <mesh position={[x, GROUND_Y + 0.016, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.07, 28]} />
        <meshBasicMaterial color={tint} />
      </mesh>
      {/* Sign on a post */}
      <mesh position={[x - 0.75, GROUND_Y + 0.85, z + 0.35]}>
        <cylinderGeometry args={[0.035, 0.035, 1.7, 6]} />
        <meshToonMaterial color="#4a3622" />
      </mesh>
      <Billboard position={[x - 0.75, GROUND_Y + 1.85, z + 0.35]}>
        <mesh position={[0, 0, -0.08]}>
          <planeGeometry args={[selected ? 2.25 : 1.9, selected ? 0.66 : 0.56]} />
          <meshBasicMaterial color={selected ? '#ffb51b' : '#16161a'} />
        </mesh>
        <mesh position={[0, 0, -0.04]}>
          <planeGeometry args={[selected ? 2.12 : 1.78, selected ? 0.54 : 0.44]} />
          <meshBasicMaterial color="#16161a" />
        </mesh>
        <Text position={[0, 0, 0.02]} fontSize={selected ? 0.32 : 0.27} color={selected ? '#ffb51b' : '#ffffff'} anchorX="center" anchorY="middle" font={undefined}>
          {DISTRICT_LABELS[id]}
        </Text>
      </Billboard>
    </group>
  )
}

// A flat amber ring that breathes under the selected district.
export function SelectionRing({ districtId }) {
  const ref = useRef()
  const center = DISTRICT_CENTERS[districtId]
  useFrame(({ clock }) => {
    if (!ref.current) return
    const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.06
    ref.current.scale.set(s, s, s)
  })
  if (!center) return null
  return (
    <mesh ref={ref} position={[center[0], GROUND_Y + 0.025, center[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.15, 1.38, 40]} />
      <meshBasicMaterial color="#ffb51b" transparent opacity={0.9} />
    </mesh>
  )
}

export default function SkillIsland({ lowPowerMode = false, selected, onSelect }) {
  const trees = lowPowerMode ? TREES.slice(0, 24) : TREES
  const main = ISLANDS[0]
  const small = ISLANDS[1]
  return (
    <group>
      {ISLANDS.map((island, i) => <Island key={i} shape={island} />)}
      {HILLS.map((hill, i) => <Hill key={i} hill={hill} />)}
      <Road />
      <Bridge />
      <Sea />

      {/* Waterfalls over the front cliffs, and one tumbling off the big hill */}
      <CoastFall island={main} t={Math.PI / 2 - 0.35} width={0.9} />
      <CoastFall island={main} t={Math.PI / 2 + 0.75} width={0.7} />
      <CoastFall island={small} t={Math.PI / 2 - 0.2} width={0.6} />
      <Waterfall x={HILLS[0].cx + 0.6} z={HILLS[0].cz + HILLS[0].rz * 1.0} top={GROUND_Y + HILLS[0].h - 0.05} bottom={GROUND_Y} width={0.45} />

      <Dock position={[small.cx + 1.6, SEA_Y, small.cz + small.rz * 0.95]} rotationY={0.5} />
      <Boat position={[small.cx + 3.0, 0.12, small.cz + small.rz + 2.2]} />
      <Rocks />
      {!lowPowerMode && <Clouds />}

      {/* Props, each stood on the terrain under it */}
      <Suspense fallback={null}>
        {trees.map(([x, z], i) => (
          <Grounded key={`t${i}`} y={heightAt(x, z)} position={[x, 0, z]}>
            <group scale={1.25 + ((i * 37) % 10) / 25}>
              <Tree />
            </group>
          </Grounded>
        ))}
        {HILL_WINDMILLS.map(([x, z], i) => (
          <Grounded key={`w${i}`} y={heightAt(x, z)} position={[x, 0, z]}>
            <group scale={2.6}>
              <WindMills />
            </group>
          </Grounded>
        ))}
        {EXTRA_TANKS.map(([x, z], i) => (
          <Grounded key={`k${i}`} y={heightAt(x, z)} position={[x, 0, z]}>
            <group scale={0.9}>
              <WaterTank />
            </group>
          </Grounded>
        ))}
      </Suspense>

      {DISTRICT_ORDER.map((id, i) => (
        <District key={id} id={id} index={i} selected={selected === id} onSelect={onSelect} />
      ))}
    </group>
  )
}
