// Real 3D desk props for the paper sections: the Awards shelf (framed certificate,
// medal, trophy, coins), the Contact room corner (a sunlit window with a sill
// plant above a wooden desk carrying a mug with steam on a stack of books, light
// shafts and dust in the sun),
// and the greenery down the left edge that ties Awards and Contact together (leaf
// sprays growing in from off the page, a rock pile and a potted plant). Everything is procedural: lathe-turned cups, pots and
// mugs, extruded stars, folded leaves, canvas-drawn certificate and mug label.
// Gold and glaze reflect a generated studio environment (no downloaded HDR), and
// soft shadows land on an invisible shadow catcher, so the props sit on the paper.
// Loaded lazily by DeskProps.jsx, only on wide screens and only near the section.
// The props are also exported for the MR world (src/mr), which reuses them life-size.
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const DISPLAY_FONT = "'Syne', 'Poppins', system-ui, sans-serif"

// ---------- shared materials ----------
// Gold is not fully metallic, so it still reads as gold if reflections are missing.
const GOLD = new THREE.MeshStandardMaterial({ color: '#f0b84c', metalness: 0.82, roughness: 0.26 })
const GOLD_SOFT = new THREE.MeshStandardMaterial({ color: '#e2a93e', metalness: 0.8, roughness: 0.42 })
const WOOD = new THREE.MeshStandardMaterial({ color: '#7a4a26', roughness: 0.55 })
const WOOD_DARK = new THREE.MeshStandardMaterial({ color: '#3b281c', roughness: 0.5 })
const GLAZE_BLACK = new THREE.MeshPhysicalMaterial({ color: '#151518', roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.2 })
const COFFEE = new THREE.MeshStandardMaterial({ color: '#4a2c17', roughness: 0.12 })
const PAGES = new THREE.MeshStandardMaterial({ color: '#f3ead6', roughness: 0.9 })
const TERRACOTTA = new THREE.MeshStandardMaterial({ color: '#c8693c', roughness: 0.82 })
const TERRACOTTA_DARK = new THREE.MeshStandardMaterial({ color: '#a9542f', roughness: 0.85 })
const SOIL = new THREE.MeshStandardMaterial({ color: '#4a3426', roughness: 1 })
// Glossy leaves: the studio reflections give them a waxy sheen.
const LEAF = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3, side: THREE.DoubleSide })
const STEM = new THREE.MeshStandardMaterial({ color: '#3f7a33', roughness: 0.5 })
const ROCK = new THREE.MeshStandardMaterial({ color: '#b9b0a2', roughness: 0.92, flatShading: true })
const ROCK_DARK = new THREE.MeshStandardMaterial({ color: '#8e867a', roughness: 0.92, flatShading: true })

// ---------- studio: light, reflections, shadow catcher ----------
// catcher: 'floor' (props standing on a desk) or 'wall' (leaves in front of the
// page, shadows falling on the paper behind them).
function Studio({ catcher = 'floor', extent = 4, light = [-3, 6, 5], mapSize = 1024, fill = 0 }) {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.75
    return () => {
      scene.environment = null
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return (
    <>
      <ambientLight intensity={0.3} />
      <hemisphereLight args={['#fff4e2', '#d9c7a8', 0.55]} />
      <directionalLight
        position={light}
        intensity={2.1}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[mapSize, mapSize]}
        shadow-camera-left={-extent}
        shadow-camera-right={extent}
        shadow-camera-top={extent}
        shadow-camera-bottom={-extent}
        shadow-camera-far={60}
        shadow-radius={6}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[4, 3, -3]} intensity={0.7} color="#dfeaff" />
      {fill > 0 && <directionalLight position={[-3, 2, 8]} intensity={fill} color="#ffe9cf" />}
      {catcher === 'none' ? null : catcher === 'floor' ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[12, 12]} />
          <shadowMaterial transparent opacity={0.2} />
        </mesh>
      ) : (
        <mesh position={[0, 0, -0.7]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <shadowMaterial transparent opacity={0.15} />
        </mesh>
      )}
    </>
  )
}

// The whole arrangement turns a few degrees toward the mouse.
const pointer = { x: 0, y: 0 }
if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1
  }, { passive: true })
}
function Parallax({ children, animate, base = 0 }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current || !animate) return
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, base + pointer.x * 0.14, 3, delta)
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, pointer.y * 0.05, 3, delta)
  })
  return <group ref={ref} rotation={[0, base, 0]}>{children}</group>
}

// ---------- canvas textures ----------
function canvasTexture(width, height, draw) {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  draw(c.getContext('2d'), width, height)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function useCertificateTexture() {
  const tex = useMemo(() => canvasTexture(1024, 740, (g, w, h) => {
    g.fillStyle = '#fbf6ea'
    g.fillRect(0, 0, w, h)
    g.strokeStyle = '#c9962b'
    g.lineWidth = 10
    g.strokeRect(34, 34, w - 68, h - 68)
    g.lineWidth = 3
    g.strokeRect(56, 56, w - 112, h - 112)
    g.fillStyle = '#3c3d45'
    g.textAlign = 'center'
    g.font = `800 82px ${DISPLAY_FONT}`
    g.fillText('CERTIFICATE', w / 2, 210)
    g.font = `600 30px ${DISPLAY_FONT}`
    g.fillStyle = '#8b7a5a'
    g.fillText('O F   A C H I E V E M E N T', w / 2, 262)
    g.fillStyle = '#c9962b'
    g.fillRect(w / 2 - 150, 292, 300, 5)
    g.fillStyle = '#d6cdb9'
    ;[350, 392, 434].forEach((y, i) => g.fillRect(200 + i * 30, y, w - 400 - i * 60, 12))
    g.fillStyle = '#9b9488'
    g.fillRect(150, 590, 220, 4)
    g.fillRect(w - 370, 590, 220, 4)
    // Gold seal with a star
    g.fillStyle = '#c9962b'
    g.beginPath()
    g.arc(w / 2, 560, 62, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#e8c463'
    g.beginPath()
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 22 : 46
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2
      g.lineTo(w / 2 + Math.cos(a) * r, 560 + Math.sin(a) * r)
    }
    g.fill()
  }), [])
  useEffect(() => () => tex.dispose(), [tex])
  return tex
}

function useMugLabel() {
  const tex = useMemo(() => canvasTexture(512, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h)
    g.fillStyle = '#ffb51b'
    g.beginPath()
    g.arc(70, h / 2 + 2, 13, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#f4f1ea'
    g.font = `800 64px ${DISPLAY_FONT}`
    g.textBaseline = 'middle'
    g.fillText('Mehanth.', 100, h / 2 + 4)
  }), [])
  useEffect(() => () => tex.dispose(), [tex])
  return tex
}

function useSoftDot() {
  const tex = useMemo(() => canvasTexture(64, 64, (g, w) => {
    const grad = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2)
    grad.addColorStop(0, 'rgba(255,255,255,0.9)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, w, w)
  }), [])
  useEffect(() => () => tex.dispose(), [tex])
  return tex
}

// ---------- geometry helpers ----------
function starShape(outer, inner) {
  const s = new THREE.Shape()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) s.moveTo(x, y)
    else s.lineTo(x, y)
  }
  s.closePath()
  return s
}

const lathe = (pts, segments = 48) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), segments)

// A rock: a finely divided sphere pushed in and out by layered waves, squashed and
// flattened underneath, then flat-shaded so every small facet catches the light.
export function rockGeometry(seed, r) {
  const g = new THREE.IcosahedronGeometry(r, 3)
  const pos = g.attributes.position
  const n = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    n.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize()
    const k = 1
      + 0.16 * Math.sin(n.x * 3.1 + seed) * Math.cos(n.y * 2.7 + seed * 0.7)
      + 0.08 * Math.sin(n.z * 7.3 + seed * 1.3) * Math.sin(n.x * 6.1)
      + 0.035 * Math.sin(n.y * 15 + seed) * Math.cos(n.z * 13)
    let y = n.y * r * k * 0.72
    if (y < -r * 0.32) y = -r * 0.32 - (y + r * 0.32) * 0.15
    pos.setXYZ(i, n.x * r * k, y, n.z * r * k)
  }
  g.computeVertexNormals()
  return g
}

// A monstera-style leaf: a broad, pointed blade with deep splits running in from
// the edge, folded slightly along the midrib and curled back toward the tip. The
// halves are two deep greens.
function leafGeometry(length, width, curl, tone = 1) {
  const SPLITS = [0.3, 0.47, 0.63, 0.78]
  const blade = (t) => width * Math.pow(Math.sin(Math.PI * Math.min(t * 1.03, 1)), 0.6) * (1 - 0.2 * t)
  const half = (side) => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    const N = 140
    for (let i = 1; i <= N; i++) {
      const t = i / N
      let x = blade(t)
      // Each split: the edge dives toward the midrib in a narrow V that leans to the tip.
      for (const s of SPLITS) {
        const d = t - s
        if (d > -0.04 && d < 0.012) {
          const v = d < -0.004 ? (d + 0.04) / 0.036 : 1 - (d + 0.004) / 0.016
          x *= 1 - 0.62 * Math.max(0, Math.min(1, v))
        }
      }
      shape.lineTo(side * x, t * length)
    }
    shape.lineTo(0, length)
    shape.closePath()
    const g = new THREE.ShapeGeometry(shape, 1)
    g.rotateY(side * 0.26)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      pos.setZ(i, pos.getZ(i) - curl * (y / length) ** 2)
    }
    const color = new THREE.Color(side > 0 ? '#2f7d34' : '#256a2b').multiplyScalar(tone)
    const colors = new Float32Array(pos.count * 3)
    for (let i = 0; i < pos.count; i++) color.toArray(colors, i * 3)
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    g.deleteAttribute('uv')
    return g
  }
  const a = half(1)
  const b = half(-1)
  const g = mergeGeometries([a, b])
  a.dispose()
  b.dispose()
  g.computeVertexNormals()
  return g
}

// ---------- awards: certificate, medal, trophy, coins ----------
export function FramedCertificate(props) {
  const tex = useCertificateTexture()
  const W = 2.3
  const H = 1.66
  const t = 0.13
  return (
    <group {...props}>
      {/* Frame: four mitred-looking rails and a back board */}
      {[[0, H / 2, W + t, t], [0, -H / 2, W + t, t]].map(([x, y, w, h], i) => (
        <mesh key={`h${i}`} position={[x, y, 0]} material={WOOD} castShadow>
          <boxGeometry args={[w, h, 0.12]} />
        </mesh>
      ))}
      {[[-W / 2, 0], [W / 2, 0]].map(([x, y], i) => (
        <mesh key={`v${i}`} position={[x, y, 0]} material={WOOD} castShadow>
          <boxGeometry args={[t, H + t, 0.12]} />
        </mesh>
      ))}
      <mesh position={[0, 0, -0.03]} material={GOLD_SOFT}>
        <boxGeometry args={[W - 0.02, H - 0.02, 0.04]} />
      </mesh>
      <mesh position={[0, 0, 0.0]}>
        <planeGeometry args={[W - 0.16, H - 0.16]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
      {/* Glass */}
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[W - 0.06, H - 0.06]} />
        <meshPhysicalMaterial transparent opacity={0.12} roughness={0.05} metalness={0} clearcoat={1} color="#ffffff" />
      </mesh>
      {/* Stand behind it */}
      <mesh position={[0, -0.25, -0.42]} rotation={[0.42, 0, 0]} material={WOOD_DARK} castShadow>
        <boxGeometry args={[0.12, 1.2, 0.05]} />
      </mesh>
    </group>
  )
}

export function Medal({ animate, ...props }) {
  const ref = useRef()
  const star = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(starShape(0.24, 0.1), { depth: 0.04, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2 })
    g.center()
    return g
  }, [])
  useEffect(() => () => star.dispose(), [star])
  useFrame(({ clock }) => {
    if (ref.current && animate) ref.current.rotation.z = Math.sin(clock.elapsedTime * 1.1) * 0.05
  })
  return (
    <group {...props}>
      <group ref={ref}>
        {/* Ribbon: two straps meeting at the ring */}
        {[[-1, '#2f5f9e'], [1, '#c64a3a']].map(([s, color]) => (
          <group key={s} position={[s * 0.15, 0.95, -0.03]} rotation={[0, 0, -s * 0.3]}>
            <mesh castShadow>
              <boxGeometry args={[0.24, 0.95, 0.015]} />
              <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
            <mesh position={[0, 0, 0.009]}>
              <boxGeometry args={[0.05, 0.95, 0.004]} />
              <meshStandardMaterial color="#f4efe4" roughness={0.6} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.47, 0]} rotation={[0, Math.PI / 2, 0]} material={GOLD}>
          <torusGeometry args={[0.07, 0.022, 10, 24]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={GOLD} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.07, 56]} />
        </mesh>
        <mesh position={[0, 0, 0.035]} material={GOLD_SOFT}>
          <torusGeometry args={[0.36, 0.028, 10, 56]} />
        </mesh>
        <mesh geometry={star} position={[0, 0, 0.06]} material={GOLD} />
      </group>
    </group>
  )
}

export function Trophy(props) {
  const cup = useMemo(() => lathe([
    [0, 0.62], [0.08, 0.62], [0.1, 0.66], [0.06, 0.78], [0.07, 0.92], [0.14, 0.98],
    [0.3, 1.06], [0.42, 1.24], [0.47, 1.46], [0.48, 1.62], [0.45, 1.63], [0.43, 1.48], [0.38, 1.28], [0.0, 1.12],
  ]), [])
  const handle = useMemo(() => new THREE.TorusGeometry(0.2, 0.035, 10, 24, Math.PI * 1.2), [])
  useEffect(() => () => { cup.dispose(); handle.dispose() }, [cup, handle])
  return (
    <group {...props}>
      <mesh position={[0, 0.14, 0]} material={WOOD_DARK} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.28, 0.8]} />
      </mesh>
      <mesh position={[0, 0.36, 0]} material={WOOD_DARK} castShadow>
        <boxGeometry args={[0.56, 0.16, 0.56]} />
      </mesh>
      <mesh position={[0, 0.15, 0.405]} material={GOLD_SOFT}>
        <boxGeometry args={[0.46, 0.13, 0.01]} />
      </mesh>
      <mesh position={[0, 0.5, 0]} material={GOLD} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 0.12, 32]} />
      </mesh>
      <mesh geometry={cup} material={GOLD} castShadow />
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={handle} material={GOLD} position={[s * 0.44, 1.32, 0]} rotation={[0, 0, s > 0 ? -Math.PI * 0.6 : Math.PI * 0.4]} castShadow />
      ))}
    </group>
  )
}

export function Coin(props) {
  const star = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(starShape(0.1, 0.045), { depth: 0.012, bevelEnabled: false })
    g.center()
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  useEffect(() => () => star.dispose(), [star])
  return (
    <group {...props}>
      <mesh material={GOLD} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.05, 40]} />
      </mesh>
      <mesh position={[0, 0.026, 0]} rotation={[Math.PI / 2, 0, 0]} material={GOLD_SOFT}>
        <torusGeometry args={[0.18, 0.012, 6, 40]} />
      </mesh>
      <mesh geometry={star} position={[0, 0.03, 0]} material={GOLD_SOFT} />
    </group>
  )
}

function AwardsScene({ animate }) {
  return (
    <Parallax animate={animate} base={-0.12}>
      <FramedCertificate position={[0.25, 0.86, -0.4]} rotation={[-0.1, -0.22, 0.05]} />
      <Medal animate={animate} position={[-1.05, 0.3, 0.55]} rotation={[0.05, 0.3, -0.18]} />
      <Trophy position={[1.45, -0.02, 0.45]} scale={0.62} rotation={[0, -0.4, 0]} />
      <Coin position={[0.2, 0.01, 0.95]} rotation={[0, 0.4, 0]} />
      <Coin position={[0.62, 0.03, 1.1]} rotation={[0.18, 0, 0.12]} />
      <Coin position={[-0.3, 0.2, 1.05]} rotation={[1.25, 0.2, 0]} />
    </Parallax>
  )
}

// ---------- contact: plant, rocks, mug, books ----------
export function Plant({ animate, ...props }) {
  const pot = useMemo(() => lathe([
    [0, 0], [0.4, 0], [0.44, 0.04], [0.52, 0.86], [0.6, 0.88], [0.62, 1.04], [0.56, 1.06], [0.54, 0.96], [0, 0.96],
  ]), [])
  const leaves = useMemo(() => {
    const out = []
    // Broad leaves fanning out on stems: upright in the middle, arching outside.
    for (let i = 0; i < 12; i++) {
      const outer = i % 3 !== 0
      const length = (outer ? 0.75 : 0.95) + ((i * 37) % 10) / 10 * 0.35
      out.push({
        geometry: leafGeometry(length, 0.3 + ((i * 13) % 5) * 0.03, outer ? 0.45 : 0.22),
        yaw: i * 2.39996,
        tilt: outer ? 0.75 + ((i * 7) % 5) * 0.1 : 0.2 + ((i * 7) % 4) * 0.08,
        stem: outer ? 0.35 + (i % 4) * 0.06 : 0.25,
      })
    }
    return out
  }, [])
  useEffect(() => () => { pot.dispose(); leaves.forEach((l) => l.geometry.dispose()) }, [pot, leaves])
  const crown = useRef()
  useFrame(({ clock }) => {
    if (!crown.current || !animate) return
    crown.current.children.forEach((leaf, i) => {
      leaf.rotation.z = Math.sin(clock.elapsedTime * 0.9 + i) * 0.025
    })
  })
  return (
    <group {...props}>
      <mesh geometry={pot} material={TERRACOTTA} castShadow receiveShadow />
      <mesh position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]} material={TERRACOTTA_DARK}>
        <torusGeometry args={[0.585, 0.025, 8, 48]} />
      </mesh>
      <mesh position={[0, 0.94, 0]} rotation={[-Math.PI / 2, 0, 0]} material={SOIL}>
        <circleGeometry args={[0.54, 32]} />
      </mesh>
      <group ref={crown} position={[0, 0.94, 0]}>
        {leaves.map((l, i) => (
          <group key={i} rotation={[0, l.yaw, 0]}>
            <group rotation={[l.tilt, 0, 0]}>
              <mesh position={[0, l.stem / 2, 0]} material={STEM}>
                <cylinderGeometry args={[0.018, 0.026, l.stem, 6]} />
              </mesh>
              <mesh geometry={l.geometry} material={LEAF} position={[0, l.stem, 0]} castShadow />
            </group>
          </group>
        ))}
      </group>
    </group>
  )
}

export function Rocks(props) {
  const geos = useMemo(() => [rockGeometry(3, 0.5), rockGeometry(11, 0.34), rockGeometry(29, 0.24)], [])
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos])
  return (
    <group {...props}>
      <mesh geometry={geos[0]} material={ROCK} position={[0, 0.3, 0]} rotation={[0.2, 0.5, 0.1]} castShadow />
      <mesh geometry={geos[1]} material={ROCK_DARK} position={[0.62, 0.2, 0.25]} rotation={[0.1, 1.2, -0.2]} castShadow />
      <mesh geometry={geos[2]} material={ROCK} position={[-0.5, 0.14, 0.35]} rotation={[0.4, 0.2, 0.3]} castShadow />
    </group>
  )
}

export function Book({ size: [w, h, d], color, band = '#d8c58f', ...props }) {
  const cover = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.62 }), [color])
  useEffect(() => () => cover.dispose(), [cover])
  const c = 0.03
  return (
    <group {...props}>
      <mesh position={[0, h / 2 - c / 2, 0]} material={cover} castShadow receiveShadow>
        <boxGeometry args={[w, c, d]} />
      </mesh>
      <mesh position={[0, -h / 2 + c / 2, 0]} material={cover} castShadow receiveShadow>
        <boxGeometry args={[w, c, d]} />
      </mesh>
      <mesh position={[0, 0, -d / 2 + c / 2]} material={cover} castShadow>
        <boxGeometry args={[w, h, c]} />
      </mesh>
      <mesh position={[0, 0, 0.01]} material={PAGES}>
        <boxGeometry args={[w - 0.05, h - 2 * c, d - c - 0.04]} />
      </mesh>
      {[-0.32, 0.32].map((f) => (
        <mesh key={f} position={[w * f, 0, -d / 2 - 0.002]}>
          <boxGeometry args={[0.05, h * 0.82, 0.006]} />
          <meshStandardMaterial color={band} metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
    </group>
  )
}

function Steam({ animate, texture }) {
  const refs = useRef([])
  useFrame(({ clock }) => {
    refs.current.forEach((sprite, i) => {
      if (!sprite) return
      const t = animate ? (clock.elapsedTime * 0.32 + i / 3) % 1 : 0.35 + i * 0.2
      sprite.position.set(Math.sin(t * 5 + i * 2) * 0.08, 1.1 + t * 1.2, 0)
      sprite.scale.setScalar(0.3 + t * 0.5)
      sprite.material.opacity = Math.sin(t * Math.PI) * 0.4
    })
  })
  return [0, 1, 2].map((i) => (
    <sprite key={i} ref={(s) => { refs.current[i] = s }}>
      <spriteMaterial map={texture} transparent depthWrite={false} opacity={0.3} />
    </sprite>
  ))
}

export function Mug({ animate, ...props }) {
  const label = useMugLabel()
  const dot = useSoftDot()
  const body = useMemo(() => lathe([
    [0, 0], [0.42, 0], [0.46, 0.04], [0.47, 0.96], [0.445, 1.0], [0.415, 0.98], [0.405, 0.1], [0, 0.1],
  ], 56), [])
  useEffect(() => () => body.dispose(), [body])
  return (
    <group {...props}>
      <mesh geometry={body} material={GLAZE_BLACK} castShadow receiveShadow />
      <mesh position={[0, 0.84, 0]} rotation={[-Math.PI / 2, 0, 0]} material={COFFEE}>
        <circleGeometry args={[0.405, 40]} />
      </mesh>
      <mesh position={[0.47, 0.5, 0]} rotation={[0, 0, -Math.PI / 2]} material={GLAZE_BLACK} castShadow>
        <torusGeometry args={[0.24, 0.06, 14, 28, Math.PI]} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.474, 0.474, 0.24, 40, 1, true, -0.75, 1.5]} />
        <meshStandardMaterial map={label} transparent roughness={0.4} />
      </mesh>
      <Steam animate={animate} texture={dot} />
    </group>
  )
}

// ---------- the greenery strip down the left edge ----------
// Sizes are in page pixels (the strip uses an orthographic camera at 100px per
// unit). Each spray grows from a point just beyond the left edge: a leaf per stem,
// `angle` in degrees (0 = pointing right), `reach` from the origin to the leaf.
const SPRAY_UPPER = [
  { angle: 74, reach: 50, length: 165, width: 66, tilt: 0.3 },
  { angle: 40, reach: 64, length: 145, width: 62, tilt: -0.2 },
  { angle: 8, reach: 66, length: 105, width: 50, tilt: 0.5, tone: 0.88 },
  { angle: -30, reach: 58, length: 140, width: 60, tilt: -0.4, tone: 1.1 },
  { angle: -66, reach: 44, length: 155, width: 60, tilt: 0.2 },
]
const SPRAY_MIDDLE = [
  { angle: 84, reach: 40, length: 190, width: 76, tilt: 0.2, tone: 1.08 },
  { angle: 52, reach: 68, length: 175, width: 74, tilt: -0.3, tone: 0.9 },
  { angle: 16, reach: 80, length: 145, width: 64, tilt: 0.4 },
  { angle: -22, reach: 74, length: 165, width: 70, tilt: -0.2, tone: 1.12 },
  { angle: -62, reach: 54, length: 175, width: 68, tilt: 0.3 },
]
const SPRAY_LOWER = [
  { angle: 58, reach: 46, length: 110, width: 50 },
  { angle: 14, reach: 52, length: 96, width: 46, tone: 0.9 },
  { angle: -38, reach: 46, length: 110, width: 50, tone: 1.1 },
]

function Spray({ animate, phase = 0, leaves }) {
  const items = useMemo(() => leaves.map((l) => {
    const a = THREE.MathUtils.degToRad(l.angle)
    const reach = l.reach / 100
    const z = 0.25
    const mid = new THREE.Vector3(Math.cos(a) * reach * 0.5, Math.sin(a) * reach * 0.5 - reach * 0.14, z * 0.5)
    const base = new THREE.Vector3(Math.cos(a) * reach, Math.sin(a) * reach, z)
    const stem = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), mid, base]), 12, 0.022, 5, false)
    const leaf = leafGeometry(l.length / 100, l.width / 100, 0.35, l.tone ?? 1)
    const dir = base.clone().sub(mid)
    return { stem, leaf, base, rotZ: Math.atan2(dir.y, dir.x) - Math.PI / 2, tilt: l.tilt ?? 0 }
  }), [leaves])
  useEffect(() => () => items.forEach(({ stem, leaf }) => { stem.dispose(); leaf.dispose() }), [items])
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!animate || !ref.current) return
    ref.current.children.forEach((g, i) => {
      g.rotation.z = Math.sin(clock.elapsedTime * 0.8 + i * 1.3 + phase) * 0.018
    })
  })
  return (
    <group ref={ref}>
      {items.map((it, i) => (
        <group key={i}>
          <mesh geometry={it.stem} material={STEM} castShadow />
          <group position={it.base} rotation={[0, 0, it.rotZ]}>
            <group rotation={[0.35, it.tilt, 0]}>
              <mesh geometry={it.leaf} material={LEAF} castShadow />
            </group>
          </group>
        </group>
      ))}
    </group>
  )
}

// Where the Awards → Contact line falls in the strip (top: -70vh, height: 170vh
// in Seams.css).
const SEAM_AT = 70 / 170

function FoliageScene({ animate }) {
  const { size } = useThree()
  const W = size.width / 100
  const H = size.height / 100
  // Pixels from the strip's left edge, and a fraction of its height from the top.
  const at = (px, frac, z = 0) => [-W / 2 + px / 100, (0.5 - frac) * H, z]
  return (
    <group>
      <group position={at(-62, SEAM_AT - 0.2)}><Spray animate={animate} leaves={SPRAY_UPPER} /></group>
      <group position={at(-40, SEAM_AT + 0.01)}><Spray animate={animate} phase={2} leaves={SPRAY_MIDDLE} /></group>
      <group position={at(-30, SEAM_AT + 0.24)}><Spray animate={animate} phase={4} leaves={SPRAY_LOWER} /></group>
      <group position={at(150, 0.99, 0.3)} rotation={[0.3, 0, 0]}>
        <Rocks scale={0.85} />
      </group>
      <group position={at(64, 0.985, 0.45)} rotation={[0.3, 0.4, 0]}>
        <Plant animate={animate} scale={0.78} />
      </group>
    </group>
  )
}

// ---------- sunlight: shafts, dust, glow ----------
function useBeamTexture() {
  const tex = useMemo(() => canvasTexture(64, 256, (g, w, h) => {
    // Bright at the source (top), fading along the shaft; soft at both sides.
    for (let x = 0; x < w; x++) {
      const side = Math.sin((x / (w - 1)) * Math.PI) ** 1.6
      const grad = g.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, `rgba(255,255,255,${0.95 * side})`)
      grad.addColorStop(0.55, `rgba(255,255,255,${0.35 * side})`)
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = grad
      g.fillRect(x, 0, 1, h)
    }
  }), [])
  useEffect(() => () => tex.dispose(), [tex])
  return tex
}

// Light shafts: each starts at `from` and runs `length` along `angle` (radians,
// 0 = straight down, negative = down-left), additive and gently breathing.
function Beams({ beams, animate, color = '#ffd99a' }) {
  const tex = useBeamTexture()
  const refs = useRef([])
  useFrame(({ clock }) => {
    if (!animate) return
    refs.current.forEach((m, i) => {
      if (m) m.material.opacity = beams[i].opacity * (0.8 + 0.2 * Math.sin(clock.elapsedTime * 0.7 + i * 1.9))
    })
  })
  return beams.map((b, i) => {
    const dx = Math.sin(b.angle)
    const dy = -Math.cos(b.angle)
    return (
      <mesh
        key={i}
        ref={(m) => { refs.current[i] = m }}
        position={[b.from[0] + (dx * b.length) / 2, b.from[1] + (dy * b.length) / 2, b.from[2] ?? 0.2]}
        rotation={[0, 0, b.angle]}
      >
        <planeGeometry args={[b.width, b.length]} />
        <meshBasicMaterial map={tex} color={color} transparent opacity={b.opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    )
  })
}

// Dust motes drifting slowly upward through the light.
function Motes({ count = 40, area: [x, y, w, h], animate }) {
  const dot = useSoftDot()
  const ref = useRef()
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3)
    let s = 7
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280
      return s / 233280
    }
    for (let i = 0; i < count; i++) {
      p[i * 3] = x + rnd() * w
      p[i * 3 + 1] = y + rnd() * h
      p[i * 3 + 2] = 0.4 + rnd() * 0.6
    }
    return p
  }, [count, x, y, w, h])
  useFrame(({ clock }, delta) => {
    if (!animate || !ref.current) return
    const attr = ref.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      let py = attr.getY(i) + delta * 0.08
      if (py > y + h) py = y
      attr.setY(i, py)
      attr.setX(i, attr.getX(i) + Math.sin(clock.elapsedTime * 0.5 + i) * delta * 0.03)
    }
    attr.needsUpdate = true
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial map={dot} size={5} sizeAttenuation={false} color="#fff1c8" transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

// ---------- the room corner around the tea ----------
function useSkyTexture() {
  const tex = useMemo(() => canvasTexture(256, 384, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h)
    sky.addColorStop(0, '#ffd48a')
    sky.addColorStop(0.6, '#ffe9bf')
    sky.addColorStop(1, '#fff6df')
    g.fillStyle = sky
    g.fillRect(0, 0, w, h)
    // Soft garden greens outside, low in the window.
    g.filter = 'blur(10px)'
    g.fillStyle = 'rgba(126, 178, 104, 0.55)'
    ;[[30, 340, 70], [120, 360, 80], [220, 330, 70]].forEach(([cx, cy, r]) => {
      g.beginPath()
      g.arc(cx, cy, r, 0, Math.PI * 2)
      g.fill()
    })
    g.filter = 'none'
    // The sun, high and to the right.
    const sun = g.createRadialGradient(w * 0.72, h * 0.22, 0, w * 0.72, h * 0.22, w * 0.6)
    sun.addColorStop(0, 'rgba(255,255,255,1)')
    sun.addColorStop(0.25, 'rgba(255,248,220,0.8)')
    sun.addColorStop(1, 'rgba(255,240,200,0)')
    g.fillStyle = sun
    g.fillRect(0, 0, w, h)
  }), [])
  useEffect(() => () => tex.dispose(), [tex])
  return tex
}

const PAINTED_WOOD = new THREE.MeshStandardMaterial({ color: '#efe4cf', roughness: 0.6 })
const DESK_WOOD = new THREE.MeshStandardMaterial({ color: '#c08c55', roughness: 0.55 })
const DESK_EDGE = new THREE.MeshStandardMaterial({ color: '#9c6b3c', roughness: 0.6 })

export function Window({ w = 1.6, h = 2.3, ...props }) {
  const sky = useSkyTexture()
  const glow = useSoftDot()
  const t = 0.12
  return (
    <group {...props}>
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={sky} toneMapped={false} />
      </mesh>
      {/* Frame, mullion cross, sill */}
      {[[0, h / 2, w + t, t], [0, -h / 2, w + t, t]].map(([x, y, fw, fh], i) => (
        <mesh key={`h${i}`} position={[x, y, 0]} material={PAINTED_WOOD} castShadow>
          <boxGeometry args={[fw, fh, 0.16]} />
        </mesh>
      ))}
      {[-w / 2, w / 2].map((x) => (
        <mesh key={x} position={[x, 0, 0]} material={PAINTED_WOOD} castShadow>
          <boxGeometry args={[t, h + t, 0.16]} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0]} material={PAINTED_WOOD}>
        <boxGeometry args={[0.06, h, 0.1]} />
      </mesh>
      <mesh position={[0, h * 0.12, 0]} material={PAINTED_WOOD}>
        <boxGeometry args={[w, 0.06, 0.1]} />
      </mesh>
      <mesh position={[0, -h / 2 - 0.1, 0.2]} material={PAINTED_WOOD} castShadow receiveShadow>
        <boxGeometry args={[w + 0.5, 0.1, 0.55]} />
      </mesh>
      {/* Warm bloom around the bright glass */}
      <sprite position={[w * 0.1, h * 0.15, 0.3]} scale={[w * 1.5, h * 1.4, 1]}>
        <spriteMaterial map={glow} color="#ffd38a" transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </group>
  )
}

// A sheer curtain: a pleated, translucent panel hanging at the window's edge.
function Curtain({ height = 3.2, width = 0.7, ...props }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height, 28, 1)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin((pos.getX(i) / width) * Math.PI * 7) * 0.05)
    g.computeVertexNormals()
    return g
  }, [width, height])
  useEffect(() => () => geo.dispose(), [geo])
  return (
    <mesh geometry={geo} {...props}>
      <meshStandardMaterial color="#fffaf0" roughness={0.9} transparent opacity={0.72} side={THREE.DoubleSide} />
    </mesh>
  )
}

function RoomScene({ animate }) {
  const { size } = useThree()
  const W = size.width / 100
  const H = size.height / 100
  // Pixels from the right edge, and from the bottom edge.
  const fromRight = (px) => W / 2 - px / 100
  const fromBottom = (px) => -H / 2 + px / 100
  const sill = fromBottom(56)
  const sillLeft = fromRight(430)
  const sillRight = fromRight(-20)
  const winW = 2.7
  const winH = 2.9
  const win = [fromRight(165), sill + winH / 2 + 0.08, -0.55]
  const softShadow = useSoftDot()
  return (
    <group>
      {/* The windowsill: a painted board with a lip and a soft shadow under it */}
      <mesh position={[(sillLeft + sillRight) / 2, sill - 0.07, 0.05]} material={PAINTED_WOOD} castShadow receiveShadow>
        <boxGeometry args={[sillRight - sillLeft, 0.14, 1.3]} />
      </mesh>
      <mesh position={[(sillLeft + sillRight) / 2, sill - 0.2, 0.68]} material={PAINTED_WOOD}>
        <boxGeometry args={[sillRight - sillLeft + 0.06, 0.14, 0.08]} />
      </mesh>
      <mesh position={[(sillLeft + sillRight) / 2 + 0.2, sill - 0.45, -0.5]}>
        <planeGeometry args={[(sillRight - sillLeft) * 0.95, 0.9]} />
        <meshBasicMaterial map={softShadow} color="#5a4630" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <Window position={win} w={winW} h={winH} />
      <Curtain position={[win[0] + winW / 2 + 0.15, win[1] + 0.1, -0.3]} height={winH + 0.5} />
      <Beams
        animate={animate}
        beams={[
          { from: [win[0] - 0.6, win[1] + 1.1, 0.0], angle: -0.95, length: 2.6, width: 1.0, opacity: 0.3 },
          { from: [win[0] + 0.2, win[1] + 0.8, 0.1], angle: -1.0, length: 2.4, width: 0.7, opacity: 0.24 },
          { from: [win[0] - 0.9, win[1] + 0.2, 0.2], angle: -0.9, length: 1.9, width: 0.55, opacity: 0.22 },
        ]}
      />
      <Motes animate={animate} area={[win[0] - 2.2, sill + 0.4, 2.6, 2.6]} />
      {/* On the sill: a small plant, then the books and the mug in the sun */}
      <Plant animate={animate} position={[fromRight(360), sill, 0.1]} scale={0.4} />
      <group position={[fromRight(195), sill, 0.25]} rotation={[0, -0.25, 0]} scale={0.74}>
        <Book size={[2.1, 0.26, 1.45]} color="#2f4a6e" position={[0, 0.13, 0]} />
        <Book size={[1.9, 0.24, 1.35]} color="#c3532f" band="#f3e3c3" position={[0.05, 0.38, 0.02]} rotation={[0, 0.09, 0]} />
        <Book size={[1.7, 0.2, 1.2]} color="#e2d6bb" band="#9a7b4f" position={[-0.06, 0.6, 0]} rotation={[0, -0.07, 0]} />
        <Mug animate={animate} position={[0.12, 0.7, 0.1]} rotation={[0, -0.35, 0]} scale={0.95} />
      </group>
    </group>
  )
}

// Camera framing per scene: [position, look-at target, fov]. The foliage strip
// uses a straight-on orthographic camera instead, so it lines up with the page.
const SCENES = {
  awards: { Scene: AwardsScene, camera: [[0.1, 1.9, 7.4], [0.1, 0.62, 0], 30] },
  foliage: { Scene: FoliageScene, ortho: true },
  // The room is seen straight on but from a little above, so the desk top shows.
  room: { Scene: RoomScene, ortho: true, tilt: 5 },
}

function LookAtOrigin() {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

function Framing({ position, target, fov }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(...position)
    camera.fov = fov
    camera.lookAt(...target)
    camera.updateProjectionMatrix()
  }, [camera, position, target, fov])
  return null
}

export default function Desk3D({ scene = 'awards', active = true, reducedMotion = false }) {
  const { Scene, camera, ortho, tilt } = SCENES[scene]
  const [position, target, fov] = camera || []
  return (
    <Canvas
      shadows="soft"
      dpr={ortho ? [1, 1.5] : [1, 1.75]}
      frameloop={reducedMotion ? 'demand' : active ? 'always' : 'never'}
      resize={{ offsetSize: true, scroll: false }}
      gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
      orthographic={!!ortho}
      camera={ortho ? { zoom: 100, position: [0, tilt || 0, 20], near: 0.1, far: 100 } : { position, fov, near: 0.1, far: 50 }}
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      {!ortho && <Framing position={position} target={target} fov={fov} />}
      {ortho && tilt ? <LookAtOrigin /> : null}
      {scene === 'room' ? (
        // The sun comes in through the window, behind and to the right: shadows fall forward and left.
        <Studio catcher="none" extent={8} light={[4, 6, -5]} mapSize={2048} fill={1.2} />
      ) : ortho ? (
        <Studio catcher="wall" extent={10} light={[-2.5, 3, 10]} mapSize={2048} />
      ) : (
        <Studio />
      )}
      <Scene animate={!reducedMotion} />
    </Canvas>
  )
}
