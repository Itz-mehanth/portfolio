// Skill Town's island: a terraced, cliff-edged island in a bright sea, with a ring
// road whose outer edge holds the nine skill districts. Everything here is cheap
// procedural geometry (one extrude per terrace, one shader for the water and one
// for the waterfall); the town's props are the existing GLB models placed by the
// layout helpers exported below.
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

export const GROUND_Y = 1.55                 // walkable top of the island (the car drives here)
const ISLAND_RX = 10
const ISLAND_RZ = 7
const ROAD_RX = 6.3
const ROAD_RZ = 4.1
const ROAD_HALF_WIDTH = 0.55

export const DISTRICT_ORDER = ['languages', 'web', 'mobile', 'backend', 'database', 'arvr', 'uiux', 'tools', 'aiml']

// Irregular coastline: an ellipse with a little low-frequency wobble.
const coast = (t) => 1 + 0.07 * Math.sin(3 * t + 1.1) + 0.045 * Math.sin(5 * t + 2.3) + 0.03 * Math.sin(8 * t)

// Districts sit evenly around the ring road, starting at the front right.
const districtAngle = (id) => -0.35 + (DISTRICT_ORDER.indexOf(id) / DISTRICT_ORDER.length) * Math.PI * 2

export const roadPoint = (angle, y = GROUND_Y + 0.05) =>
  new THREE.Vector3(Math.cos(angle) * ROAD_RX, y, Math.sin(angle) * ROAD_RZ)

// Where each district's house visually stands: just outside the road.
export const DISTRICT_CENTERS = Object.fromEntries(
  DISTRICT_ORDER.map((id) => {
    const a = districtAngle(id)
    return [id, [Math.cos(a) * (ROAD_RX + 1.7), GROUND_Y, Math.sin(a) * (ROAD_RZ + 1.55)]]
  }),
)

// The City component draws its house 2.41 units in front (+z) of its group origin,
// so the group goes that far behind the visual centre.
export const DISTRICT_POSITIONS = Object.fromEntries(
  Object.entries(DISTRICT_CENTERS).map(([id, [x, y, z]]) => [id, [x, y, z - 2.41]]),
)

export const DISTRICT_ROAD_POINTS = Object.fromEntries(DISTRICT_ORDER.map((id) => [id, roadPoint(districtAngle(id))]))

// Drive along the ring road the shorter way round.
export function pathBetween(fromId, toId) {
  if (!fromId || !toId || fromId === toId) return null
  const a0 = districtAngle(fromId)
  let a1 = districtAngle(toId)
  while (a1 - a0 > Math.PI) a1 -= Math.PI * 2
  while (a1 - a0 < -Math.PI) a1 += Math.PI * 2
  const steps = Math.max(4, Math.ceil(Math.abs(a1 - a0) / 0.18))
  const pts = Array.from({ length: steps + 1 }, (_, i) => roadPoint(a0 + ((a1 - a0) * i) / steps))
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)
}

// Drive mode: solid ground anywhere inside the coastline (with a small margin).
export function isOnIsland(x, z) {
  const t = Math.atan2(z / ISLAND_RZ, x / ISLAND_RX)
  const r = Math.hypot(x / ISLAND_RX, z / ISLAND_RZ)
  return r < coast(t) * 0.97
}

export const SPAWN_POINT = DISTRICT_ROAD_POINTS.languages.clone().setY(GROUND_Y)

// Decorative props, in world space; model origin offsets are compensated where they're placed.
const ring = (n, rx, rz, phase = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = phase + (i / n) * Math.PI * 2
    return [Math.cos(a) * rx, Math.sin(a) * rz]
  })
export const PARK_TREES = [
  ...ring(7, 3.2, 1.9, 0.3),
  [0.4, 0.2], [-1.2, -0.5], [1.6, 0.8], [-2.6, 1.0], [2.8, -0.4],
  ...ring(10, ROAD_RX + 3.15, ROAD_RZ + 2.55, 0.05),
]
// Two windmills on the back edge, where they silhouette against the sea.
export const PARK_WINDMILLS = [[-2.6, -5.7], [3.2, -5.5]]
export const PARK_TANKS = [[0.1, -0.2], [-2.2, -1.5]]

function islandShape(scale) {
  const shape = new THREE.Shape()
  const n = 96
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2
    const r = coast(t) * scale
    const x = Math.cos(t) * ISLAND_RX * r
    const z = Math.sin(t) * ISLAND_RZ * r
    if (i === 0) shape.moveTo(x, z)
    else shape.lineTo(x, z)
  }
  return shape
}

// One terrace: the coastline extruded downward from `top`, grass on top, cliff on the sides.
function Terrace({ scale, top, depth, grass, cliff }) {
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(islandShape(scale), {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.22,
      bevelSize: 0.28,
      bevelSegments: 2,
      curveSegments: 1,
    })
    g.rotateX(Math.PI / 2)        // shape y -> world z; extrusion runs downward
    g.translate(0, top - 0.22, 0) // the bevel raises the top face by bevelThickness
    g.computeVertexNormals()
    return g
  }, [scale, top, depth])
  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshToonMaterial attach="material-0" color={grass} />
      <meshToonMaterial attach="material-1" color={cliff} />
    </mesh>
  )
}

function RingRoad() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.absellipse(0, 0, ROAD_RX + ROAD_HALF_WIDTH, ROAD_RZ + ROAD_HALF_WIDTH, 0, Math.PI * 2, false)
    const hole = new THREE.Path()
    hole.absellipse(0, 0, ROAD_RX - ROAD_HALF_WIDTH, ROAD_RZ - ROAD_HALF_WIDTH, 0, Math.PI * 2, true)
    shape.holes.push(hole)
    const g = new THREE.ShapeGeometry(shape, 64)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  return (
    <mesh geometry={geometry} position={[0, GROUND_Y + 0.012, 0]} receiveShadow>
      <meshToonMaterial color="#e9d6ae" />
    </mesh>
  )
}

// The sea: shallow turquoise near the cliffs, deep blue further out, a foam line that
// breathes at the shore, drifting glints, and a soft fade into the sky at the far edge.
function Sea() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uDeep: { value: new THREE.Color('#3a95cf') },
          uShallow: { value: new THREE.Color('#48c6e3') },
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
            float e = length(vec2(vWorld.x / ${(ISLAND_RX * 1.08).toFixed(2)}, vWorld.z / ${(ISLAND_RZ * 1.08).toFixed(2)}));
            float n = noise(vWorld.xz * 0.55 + vec2(uTime * 0.12, uTime * 0.08));
            vec3 col = mix(uShallow, uDeep, smoothstep(1.0, 1.9, e));
            col += 0.05 * smoothstep(0.62, 0.92, n);
            float glint = smoothstep(0.9, 0.98, noise(vWorld.xz * 4.5 - vec2(uTime * 0.3, 0.0)));
            col += vec3(0.22) * glint * (1.0 - smoothstep(1.0, 1.6, e));
            float width = 0.07 + 0.035 * sin(uTime * 1.4 + n * 6.0);
            float foam = 1.0 - smoothstep(0.0, width, abs(e - 1.06 - 0.03 * n));
            col = mix(col, uFoam, foam * 0.85);
            float dist = length(vWorld.xz);
            float alpha = 1.0 - smoothstep(30.0, 46.0, dist);
            gl_FragColor = vec4(col, alpha);
          }
        `,
      }),
    [],
  )
  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} material={material} renderOrder={-1}>
      <planeGeometry args={[100, 100]} />
    </mesh>
  )
}

// A waterfall pouring over the front cliff: scrolling white streaks fading at the foot.
function Waterfall({ position, rotationY = 0 }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          varying vec2 vUv;
          float hash(float x) { return fract(sin(x * 91.7) * 43758.5453); }
          void main() {
            float lane = floor(vUv.x * 14.0);
            float streak = fract(vUv.y * 3.0 + uTime * (1.2 + hash(lane) * 0.8) + hash(lane + 3.0));
            float s = smoothstep(0.55, 1.0, streak);
            vec3 col = mix(vec3(0.62, 0.86, 0.97), vec3(1.0), s);
            float edge = smoothstep(0.0, 0.18, vUv.x) * (1.0 - smoothstep(0.82, 1.0, vUv.x));
            gl_FragColor = vec4(col, (0.55 + 0.45 * s) * edge);
          }
        `,
      }),
    [],
  )
  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta
  })
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh material={material} position={[0, -0.75, 0]}>
        <planeGeometry args={[0.9, 1.6]} />
      </mesh>
      <mesh position={[0, -1.52, 0.18]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

function Dock({ position, rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.32, 1.1]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.08, 2.6]} />
        <meshToonMaterial color="#9a6a3c" />
      </mesh>
      {[-0.32, 0.32].flatMap((x) => [0.2, 1.2, 2.2].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, 0.05, z]}>
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
    ref.current.rotation.x = Math.sin(t * 0.9) * 0.03
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
  const rocks = useMemo(
    () => [
      [11.4, -0.1, 2.2, 0.55], [-11.2, -0.1, -1.8, 0.7], [7.5, -0.1, 8.0, 0.4],
      [-8.8, -0.1, 6.8, 0.5], [2.4, GROUND_Y, -1.6, 0.22], [-4.4, GROUND_Y, 1.9, 0.18],
    ],
    [],
  )
  return rocks.map(([x, y, z, s], i) => (
    <mesh key={i} position={[x, y + s * 0.4, z]} rotation={[i, i * 1.7, 0]} scale={s} castShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshToonMaterial color={i % 2 ? '#8d8a85' : '#a39e96'} />
    </mesh>
  ))
}

// A few low-poly clouds drifting slowly around the island.
function Clouds() {
  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.01
  })
  const puffs = [
    [3, 5.5, -19, 1.3], [16, 5, -8, 1.0], [14, 5.5, 7, 0.8], [-6, 6, -17, 0.9],
  ]
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
    <mesh ref={ref} position={[center[0], GROUND_Y + 0.03, center[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.05, 1.3, 40]} />
      <meshBasicMaterial color="#ffb51b" transparent opacity={0.9} />
    </mesh>
  )
}

export default function SkillIsland({ lowPowerMode = false }) {
  // Front of the island (+z) faces the camera: the waterfall and dock go there.
  const fall = useMemo(() => {
    const t = Math.PI / 2 - 0.15
    const r = coast(t) * 1.02
    return [Math.cos(t) * ISLAND_RX * r, GROUND_Y, Math.sin(t) * ISLAND_RZ * r]
  }, [])
  const dock = useMemo(() => {
    const t = Math.PI / 2 - 0.85
    const r = coast(t) * 1.06
    return [Math.cos(t) * ISLAND_RX * r, 0, Math.sin(t) * ISLAND_RZ * r]
  }, [])

  return (
    <group>
      <Terrace scale={1} top={GROUND_Y} depth={2.2} grass="#86c96a" cliff="#d07a45" />
      <Terrace scale={1.09} top={0.35} depth={1.4} grass="#e3c98f" cliff="#a95b33" />
      <RingRoad />
      <Sea />
      <Waterfall position={fall} rotationY={-0.25} />
      <Dock position={dock} rotationY={-0.6} />
      <Boat position={[dock[0] + 1.6, 0.12, dock[2] + 2.6]} />
      <Rocks />
      {!lowPowerMode && <Clouds />}
    </group>
  )
}
