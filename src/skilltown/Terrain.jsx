// Skill Town terrain: the island (faceted cliff strata under a grass cap), rolling
// mounds, sky dome, ocean, waterfalls with their creeks, docks, a boat, sea rocks
// and clouds. All procedural; geometry is built once per mount and disposed.
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { DOCKS, GROUND_Y, MOUNDS, RX, RZ, SEA_Y, WATERFALLS, coastPoint, moundHeight, outline } from './layout'

const useDispose = (...things) => useEffect(() => () => things.forEach((t) => t?.dispose?.()), things)

// ---------- island ----------
// Rings from the grass lip down to below the waterline: [y, radius scale, colour, jitter].
const STRATA = [
  [GROUND_Y, 1.0, '#7fc35d', 0.0],
  [GROUND_Y - 0.16, 1.006, '#6fb04f', 0.004],
  [GROUND_Y - 0.3, 1.012, '#e7b866', 0.008],
  [GROUND_Y - 0.62, 1.0, '#dca357', 0.014],
  [GROUND_Y - 0.95, 1.02, '#d97c45', 0.02],
  [GROUND_Y - 1.4, 0.996, '#cc6c3e', 0.026],
  [GROUND_Y - 1.85, 1.028, '#c05e37', 0.028],
  [GROUND_Y - 2.3, 1.012, '#b05834', 0.03],
  [GROUND_Y - 2.75, 1.05, '#a14f30', 0.028],
  [SEA_Y - 0.6, 1.085, '#93482d', 0.02],
]
const SEGMENTS = 200

// Smooth, deterministic rock jitter per ring.
const jitter = (t, k, amp) =>
  1 + amp * (Math.sin(t * 7 + k * 1.3) * 0.5 + Math.sin(t * 13 + k * 2.7) * 0.32 + Math.sin(t * 29 + k * 0.9) * 0.18)

function buildCliff() {
  const rings = STRATA.map(([y, scale, , amp], k) =>
    Array.from({ length: SEGMENTS }, (_, i) => {
      const t = (i / SEGMENTS) * Math.PI * 2
      const r = outline(t) * scale * jitter(t, k, amp)
      return new THREE.Vector3(Math.cos(t) * RX * r, y, Math.sin(t) * RZ * r)
    }),
  )
  const positions = []
  const colors = []
  const c = new THREE.Color()
  for (let k = 0; k < rings.length - 1; k++) {
    const top = rings[k]
    const bottom = rings[k + 1]
    const base = new THREE.Color(STRATA[k][2])
    for (let i = 0; i < SEGMENTS; i++) {
      const j = (i + 1) % SEGMENTS
      // Faces take their band's colour with a touch of variation, so strata read as layers.
      const v = 0.92 + ((i * 7919 + k * 104729) % 97) / 97 * 0.14
      c.copy(base).multiplyScalar(v)
      for (const p of [top[i], bottom[i], top[j], top[j], bottom[i], bottom[j]]) {
        positions.push(p.x, p.y, p.z)
        colors.push(c.r, c.g, c.b)
      }
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  g.computeVertexNormals()
  return { geometry: g, top: rings[0] }
}

function Island() {
  const { cliff, cap } = useMemo(() => {
    const { geometry, top } = buildCliff()
    const shape = new THREE.Shape(top.map((p) => new THREE.Vector2(p.x, -p.z)))
    const capGeo = new THREE.ShapeGeometry(shape, 1)
    capGeo.rotateX(-Math.PI / 2)
    capGeo.translate(0, GROUND_Y, 0)
    return { cliff: geometry, cap: capGeo }
  }, [])
  useDispose(cliff, cap)
  return (
    <group>
      <mesh geometry={cliff} castShadow receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={cap} receiveShadow>
        <meshStandardMaterial color="#8ccf68" roughness={0.95} />
      </mesh>
    </group>
  )
}

// Gentle grassy mounds: a polar grid lifted by the same function the layout uses.
function Mound({ m }) {
  const geometry = useMemo(() => {
    const rings = 9
    const segs = 32
    const positions = []
    const index = []
    positions.push(m.x, GROUND_Y + m.h, m.z)
    for (let r = 1; r <= rings; r++) {
      const rr = (r / rings) * m.r
      for (let s = 0; s < segs; s++) {
        const a = (s / segs) * Math.PI * 2
        const x = m.x + Math.cos(a) * rr
        const z = m.z + Math.sin(a) * rr
        positions.push(x, GROUND_Y + moundHeight(m, x, z) - (r === rings ? 0.02 : 0), z)
      }
    }
    for (let s = 0; s < segs; s++) index.push(0, 1 + ((s + 1) % segs), 1 + s)
    for (let r = 1; r < rings; r++) {
      const a0 = 1 + (r - 1) * segs
      const a1 = 1 + r * segs
      for (let s = 0; s < segs; s++) {
        const s1 = (s + 1) % segs
        index.push(a0 + s, a0 + s1, a1 + s, a1 + s, a0 + s1, a1 + s1)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.setIndex(index)
    g.computeVertexNormals()
    return g
  }, [m])
  useDispose(geometry)
  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial color="#86c963" roughness={0.95} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ---------- sky + sea ----------
function Sky() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uTop: { value: new THREE.Color('#3fa6e6') },
          uHorizon: { value: new THREE.Color('#d8f2ff') },
        },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uTop, uHorizon;
          varying vec3 vDir;
          void main() {
            float h = clamp(vDir.y, 0.0, 1.0);
            gl_FragColor = vec4(mix(uHorizon, uTop, pow(h, 0.55)), 1.0);
          }
        `,
      }),
    [],
  )
  useDispose(material)
  return (
    <mesh material={material} renderOrder={-10}>
      <sphereGeometry args={[220, 24, 12]} />
    </mesh>
  )
}

function Ocean({ animate }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uNear: { value: new THREE.Color('#3fd3df') },
          uMid: { value: new THREE.Color('#1fa6d8') },
          uDeep: { value: new THREE.Color('#1677c2') },
          uHorizon: { value: new THREE.Color('#bfe9fb') },
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
          uniform vec3 uNear, uMid, uDeep, uHorizon;
          varying vec3 vWorld;
          float outline(float t) {
            return 1.0 + 0.085 * sin(2.0 * t + 0.6) + 0.06 * sin(3.0 * t + 2.1) + 0.04 * sin(5.0 * t + 0.4) + 0.022 * sin(9.0 * t + 1.7);
          }
          float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float noise(vec2 p) {
            vec2 i = floor(p), f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
          }
          void main() {
            vec2 q = vec2(vWorld.x / ${RX.toFixed(1)}, vWorld.z / ${RZ.toFixed(1)});
            float e = length(q) / outline(atan(q.y, q.x));          // 1 = the cliff line
            vec3 col = mix(uNear, uMid, smoothstep(1.05, 1.45, e));
            col = mix(col, uDeep, smoothstep(1.45, 2.6, e));
            // Broad, slow light swells rather than busy ripples.
            float swell = noise(vWorld.xz * 0.12 + vec2(uTime * 0.03, uTime * 0.02));
            col += vec3(0.06) * smoothstep(0.55, 0.9, swell);
            float glint = smoothstep(0.82, 0.96, noise(vWorld.xz * 0.9 + vec2(uTime * 0.12, -uTime * 0.05)));
            col += vec3(0.18) * glint * (1.0 - smoothstep(1.2, 2.2, e));
            // Foam hugging the cliffs, breathing slowly.
            float foamW = 0.035 + 0.02 * sin(uTime * 1.1 + swell * 6.0);
            float foam = 1.0 - smoothstep(0.0, foamW, abs(e - 1.1));
            foam += 0.35 * (1.0 - smoothstep(0.0, 0.05, abs(e - 1.18 - 0.02 * sin(uTime * 0.8))));
            col = mix(col, vec3(1.0), clamp(foam, 0.0, 1.0) * 0.8);
            float dist = length(vWorld.xz);
            col = mix(col, uHorizon, smoothstep(30.0, 78.0, dist));
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [],
  )
  useDispose(material)
  useFrame((_, delta) => {
    if (animate) material.uniforms.uTime.value += delta
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SEA_Y, 0]} material={material} receiveShadow>
      <planeGeometry args={[300, 300]} />
    </mesh>
  )
}

// ---------- water details ----------
const fallMaterial = () =>
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
        float lane = floor(vUv.x * 10.0);
        float streak = fract(vUv.y * 2.2 + uTime * (0.9 + hash(lane) * 0.6) + hash(lane + 3.0));
        float s = smoothstep(0.45, 1.0, streak);
        vec3 col = mix(vec3(0.56, 0.86, 0.98), vec3(1.0), s * 0.85);
        float edge = smoothstep(0.0, 0.22, vUv.x) * (1.0 - smoothstep(0.78, 1.0, vUv.x));
        float foamTop = smoothstep(0.88, 1.0, vUv.y) * 0.3;
        gl_FragColor = vec4(col + foamTop, (0.62 + 0.38 * s) * edge);
      }
    `,
  })

function Waterfall({ fall, animate }) {
  const material = useMemo(fallMaterial, [])
  useDispose(material)
  useFrame((_, delta) => {
    if (animate) material.uniforms.uTime.value += delta
  })
  const [ex, ez] = fall.edge
  const [ix, iz] = fall.inner
  const nx = Math.cos(fall.t) / RX
  const nz = Math.sin(fall.t) / RZ
  const facing = Math.atan2(nx, nz)
  const out = 0.45 / Math.hypot(nx * RX, nz * RZ)       // clear of the cliff's rock jitter
  const h = GROUND_Y - SEA_Y
  const creekLen = Math.hypot(ex - ix, ez - iz)
  return (
    <group>
      {/* Creek across the grass to the lip */}
      <mesh position={[(ex + ix) / 2, GROUND_Y + 0.02, (ez + iz) / 2]} rotation={[-Math.PI / 2, 0, -Math.atan2(ez - iz, ex - ix)]}>
        <planeGeometry args={[creekLen + 0.4, fall.width * 0.55]} />
        <meshStandardMaterial color="#5cc6e6" roughness={0.25} />
      </mesh>
      <group position={[ex + nx * RX * out, 0, ez + nz * RZ * out]} rotation={[0, facing, 0]}>
        {/* Lip curling over the edge */}
        <mesh position={[0, GROUND_Y + 0.02, -0.2]} rotation={[-0.9, 0, 0]} material={material}>
          <planeGeometry args={[fall.width * 0.8, 0.5]} />
        </mesh>
        <mesh position={[0, SEA_Y + h / 2, 0]} material={material}>
          <planeGeometry args={[fall.width, h]} />
        </mesh>
        {/* Splash and foam at the foot */}
        <mesh position={[0, SEA_Y + 0.03, 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[fall.width * 0.85, 18]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, SEA_Y + 0.025, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[fall.width * 0.95, fall.width * 1.25, 22]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.45} />
        </mesh>
      </group>
    </group>
  )
}

function Dock({ dock }) {
  return (
    <group position={[dock.x, SEA_Y, dock.z]} rotation={[0, dock.rot, 0]}>
      <mesh position={[0, 0.34, 1.0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.09, 2.4]} />
        <meshStandardMaterial color="#a0703f" roughness={0.9} />
      </mesh>
      {[0.25, 0.85, 1.45, 2.05].map((z) => (
        <mesh key={z} position={[0, 0.395, z]}>
          <boxGeometry args={[0.82, 0.015, 0.05]} />
          <meshStandardMaterial color="#7d5530" roughness={0.9} />
        </mesh>
      ))}
      {[-0.34, 0.34].flatMap((x) => [0.15, 1.15, 2.15].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, 0.15, z]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 6]} />
          <meshStandardMaterial color="#6e4524" roughness={0.9} />
        </mesh>
      )))}
    </group>
  )
}

function Boat({ position, animate }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current || !animate) return
    const t = clock.elapsedTime
    ref.current.position.y = position[1] + Math.sin(t * 1.4) * 0.035
    ref.current.rotation.z = Math.sin(t * 1.1) * 0.04
  })
  return (
    <group ref={ref} position={position} rotation={[0, -0.5, 0]}>
      <mesh scale={[1.3, 0.48, 0.52]} castShadow>
        <sphereGeometry args={[0.5, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#d2563a" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.3, 0.52, 1]} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.48, 16]} />
        <meshStandardMaterial color="#e9c896" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 1.0, 6]} />
        <meshStandardMaterial color="#5a3a20" />
      </mesh>
      <mesh position={[0.03, 0.56, 0]}>
        <shapeGeometry args={[new THREE.Shape([new THREE.Vector2(0, -0.4), new THREE.Vector2(0, 0.46), new THREE.Vector2(0.46, -0.4)])]} />
        <meshStandardMaterial color="#fffaf0" side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
    </group>
  )
}

function SeaRocks() {
  const rocks = useMemo(() => {
    const out = []
    ;[0.5, 1.3, 2.4, 3.2, 3.9, 4.7, 5.5].forEach((t, i) => {
      const [x, z] = coastPoint(t, 1.18 + (i % 3) * 0.06)
      out.push([x, z, 0.35 + (i % 4) * 0.12, i])
    })
    return out
  }, [])
  return rocks.map(([x, z, s, i]) => (
    <mesh key={i} position={[x, SEA_Y + s * 0.3, z]} rotation={[i, i * 1.7, i * 0.3]} scale={[s, s * 0.8, s]} castShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={i % 2 ? '#a96543' : '#bb7349'} flatShading roughness={0.95} />
    </mesh>
  ))
}

// Soft clouds framing the island: clusters of lobes, drifting very slowly.
const CLOUD_SPOTS = [
  [-22, 7.5, -10, 1.6], [-25, 4.6, 5, 1.1], [22, 8.5, -8, 1.5], [24, 4.8, 8, 1.05], [3, 10, -24, 1.9], [-8, 9.5, -22, 1.3],
]
function Clouds({ animate }) {
  const refs = useRef([])
  // Each cloud sways around its own spot, so none ever drifts in front of the town.
  useFrame(({ clock }) => {
    if (!animate) return
    refs.current.forEach((g, i) => {
      if (g) g.position.x = CLOUD_SPOTS[i][0] + Math.sin(clock.elapsedTime * 0.06 + i * 1.7) * 1.6
    })
  })
  const lobes = [[0, 0, 0, 1.15], [1.25, -0.25, 0.2, 0.85], [-1.2, -0.3, -0.1, 0.8], [0.45, 0.5, -0.25, 0.75], [-0.4, 0.35, 0.3, 0.7], [2.1, -0.45, 0, 0.55]]
  return CLOUD_SPOTS.map(([x, y, z, s], i) => (
    <group key={i} ref={(g) => { refs.current[i] = g }} position={[x, y, z]} scale={s}>
      {lobes.map(([lx, ly, lz, r], j) => (
        <mesh key={j} position={[lx, ly, lz]}>
          <icosahedronGeometry args={[r, 2]} />
          <meshStandardMaterial color="#ffffff" roughness={1} emissive="#eaf6ff" emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  ))
}

export default function Terrain({ animate = true, lowPowerMode = false }) {
  return (
    <group>
      <Sky />
      <Ocean animate={animate} />
      <Island />
      {MOUNDS.map((m, i) => <Mound key={i} m={m} />)}
      {WATERFALLS.map((f, i) => <Waterfall key={i} fall={f} animate={animate} />)}
      {DOCKS.map((d, i) => <Dock key={i} dock={d} />)}
      <Boat position={[DOCKS[0].x - 1.4, SEA_Y + 0.12, DOCKS[0].z + 2.6]} animate={animate} />
      <SeaRocks />
      {!lowPowerMode && <Clouds animate={animate} />}
    </group>
  )
}
