// The paper-plane courier: one plane that carries the visitor through the site.
// A transparent, click-through canvas sits above every screen. The plane rests
// beside each screen's anchor element ([data-plane-anchor="<screen id>"]), flies
// a banked arc to the next anchor on navigation, dives into the projects stage,
// and carries the contact message away when the form is sent.
//
// World units are CSS pixels: an orthographic camera with zoom 1 makes
// (0, 0) the viewport centre, x to the right and y up.
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_URL = '/models/paper_airplane.glb'
const TRAIL_MAX_DOTS = 40
const TRAIL_SPACING_PX = 18      // distance travelled between dots of the flight path
const TRAIL_LIFETIME = 0.9       // seconds a dot takes to fade out
const TRAIL_RGB = [245 / 255, 158 / 255, 11 / 255]
const FLY_DURATION = 1.15        // seconds per hop between screens
const LAUNCH_DURATION = 1.4      // contact "message sent" take-off
const RETURN_DELAY = 2.2         // seconds before it glides back after a launch
const DIVE_SCREEN_ID = 'projects'
const PLANE_LENGTH_PX = 130      // on-screen nose-to-tail length at desktop width

// Rotate the model (nose along local -z, wings along local x, top along +y)
// so the nose points +x on screen, wings spread along y and the top faces the camera.
// (A proper rotation: the basis keeps a determinant of +1.)
const MODEL_BASIS = new THREE.Quaternion().setFromRotationMatrix(
  new THREE.Matrix4().makeBasis(
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(-1, 0, 0),
  ),
)

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeIn = (t) => t * t * t

function bezier(out, p0, p1, p2, p3, t) {
  const u = 1 - t
  out.x = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x
  out.y = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
  return out
}

// Where the plane should rest on a screen, in world (pixel) coordinates.
function readAnchor(screenId, size) {
  const el = document.querySelector(`[data-plane-anchor="${screenId}"]`)
  const margin = 70
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width === 0 && r.height === 0) return null
  const placement = el.getAttribute('data-plane-placement') || 'right'
  let x
  let y
  if (placement === 'perch') {
    // Sitting on top of the element, towards its right edge.
    x = r.right - Math.min(80, r.width * 0.25)
    y = r.top - 30
  } else if (placement === 'center') {
    x = r.left + r.width / 2
    y = r.top + r.height / 2
  } else if (r.right + 64 > size.width - margin) {
    // No room to the right (phones): hover just above the element's end.
    x = r.right - 50
    y = r.top - 26
  } else {
    x = r.right + 64
    y = r.top + r.height * 0.3
  }
  x = THREE.MathUtils.clamp(x, margin, size.width - margin)
  y = THREE.MathUtils.clamp(y, margin + 40, size.height - margin)
  return new THREE.Vector2(x - size.width / 2, size.height / 2 - y)
}

function PaperPlane({ activeScreenId, launchSignal, hidden }) {
  const { scene } = useGLTF(MODEL_URL)
  // Clone, give it fadeable materials, and recentre it: the GLB's root node is
  // offset, which would otherwise make the plane pivot around a point off its body.
  const { model, length } = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((o) => {
      if (o.isMesh) {
        o.material = o.material.clone()
        o.material.side = THREE.DoubleSide
        o.material.transparent = true
      }
    })
    const box = new THREE.Box3().setFromObject(clone)
    const center = box.getCenter(new THREE.Vector3())
    const dims = box.getSize(new THREE.Vector3())
    clone.position.sub(center)
    const centred = new THREE.Group()
    centred.add(clone)
    return { model: centred, length: Math.max(dims.x, dims.y, dims.z) || 1 }
  }, [scene])

  const root = useRef()       // position on screen
  const heading = useRef()    // rotation around the view axis (direction of travel)
  const bank = useRef()       // roll around the plane's own long axis

  // Dotted flight path left behind the tail, like the dashes in a paper-plane icon.
  const trail = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL_MAX_DOTS * 3), 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(TRAIL_MAX_DOTS * 4), 4))
    geometry.setDrawRange(0, 0)
    const dotCanvas = document.createElement('canvas')
    dotCanvas.width = dotCanvas.height = 32
    const ctx = dotCanvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(16, 16, 15, 0, Math.PI * 2)
    ctx.fill()
    const material = new THREE.PointsMaterial({
      size: 6,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      map: new THREE.CanvasTexture(dotCanvas),
    })
    return { geometry, material, dots: [], last: null }
  }, [])
  useEffect(() => () => {
    trail.geometry.dispose()
    trail.material.map.dispose()
    trail.material.dispose()
  }, [trail])

  const state = useRef({
    mode: 'enter',            // enter | rest | fly | dive | launch | away | hidden
    t: 0,
    from: new THREE.Vector2(),
    c1: new THREE.Vector2(),
    c2: new THREE.Vector2(),
    to: new THREE.Vector2(),
    pos: new THREE.Vector2(),
    prev: new THREE.Vector2(),
    angle: 0,
    roll: 0,
    scale: 0,
    opacity: 0,
    target: activeScreenId,
    awayTimer: 0,
    initialised: false,
  })

  const startHop = (to, size, mode = 'fly') => {
    const s = state.current
    s.from.copy(s.pos)
    s.to.copy(to)
    const dx = to.x - s.from.x
    const lift = Math.max(120, Math.abs(dx) * 0.35) * (size.height > size.width ? 0.6 : 1)
    s.c1.set(s.from.x + dx * 0.25, Math.max(s.from.y, to.y) + lift)
    s.c2.set(s.from.x + dx * 0.75, Math.max(s.from.y, to.y) + lift * 0.6)
    s.t = 0
    s.mode = mode
  }

  // Screen changes start a hop (or a dive into the projects stage).
  useEffect(() => {
    const s = state.current
    s.target = activeScreenId
    if (!s.initialised) return
    s.mode = s.mode === 'hidden' ? 'enter' : 'pending'
  }, [activeScreenId])

  // Contact form sent: carry the message away, then come back.
  useEffect(() => {
    if (!launchSignal) return
    const s = state.current
    if (s.mode === 'rest' || s.mode === 'fly') {
      s.from.copy(s.pos)
      s.t = 0
      s.mode = 'launch'
    }
  }, [launchSignal])

  useFrame((frame, delta) => {
    const s = state.current
    const { size, clock } = frame
    const dt = Math.min(delta, 0.1)
    const unit = THREE.MathUtils.clamp(size.width / 1440, 0.55, 1)
    const restScale = (PLANE_LENGTH_PX * unit) / length
    const time = clock.elapsedTime
    s.prev.copy(s.pos)

    const anchor = readAnchor(s.target, size)

    if (hidden) {
      s.opacity = THREE.MathUtils.damp(s.opacity, 0, 10, dt)
    } else if (s.mode !== 'away' && s.mode !== 'hidden' && s.mode !== 'dive') {
      s.opacity = THREE.MathUtils.damp(s.opacity, 1, 6, dt)
    }

    if (!s.initialised && anchor) {
      // First appearance: glide in from the left edge.
      s.initialised = true
      s.pos.set(-size.width / 2 - 120, anchor.y + 160)
      s.prev.copy(s.pos)
      s.scale = restScale
      if (s.target === DIVE_SCREEN_ID) {
        s.mode = 'hidden'
      } else {
        startHop(anchor, size)
      }
    }

    switch (s.mode) {
      case 'pending':
      case 'enter': {
        if (s.target === DIVE_SCREEN_ID) {
          const stage = readAnchor(DIVE_SCREEN_ID, size) || new THREE.Vector2(0, 0)
          startHop(stage, size, 'dive')
        } else if (anchor) {
          if (s.mode === 'enter' && s.opacity < 0.05) {
            s.pos.set(-size.width / 2 - 120, anchor.y + 160)
            s.scale = restScale
          }
          startHop(anchor, size)
        }
        break
      }
      case 'fly': {
        s.t = Math.min(1, s.t + dt / FLY_DURATION)
        if (anchor) s.to.copy(anchor)  // track the anchor while the screen animates in
        bezier(s.pos, s.from, s.c1, s.c2, s.to, easeInOut(s.t))
        s.scale = THREE.MathUtils.damp(s.scale, restScale, 6, dt)
        if (s.t >= 1) s.mode = 'rest'
        break
      }
      case 'rest': {
        if (anchor) {
          s.pos.set(anchor.x, anchor.y + Math.sin(time * 1.6) * 5)
        }
        s.scale = THREE.MathUtils.damp(s.scale, restScale, 6, dt)
        break
      }
      case 'dive': {
        s.t = Math.min(1, s.t + dt / FLY_DURATION)
        bezier(s.pos, s.from, s.c1, s.c2, s.to, easeInOut(s.t))
        // Shrinks away into the stage, as if flying into the 3D world.
        s.scale = restScale * (1 - 0.85 * easeIn(s.t))
        s.opacity = 1 - easeIn(s.t)
        if (s.t >= 1) s.mode = 'hidden'
        break
      }
      case 'launch': {
        s.t = Math.min(1, s.t + dt / LAUNCH_DURATION)
        const k = easeIn(s.t)
        s.pos.set(s.from.x + k * (size.width * 0.75), s.from.y + k * (size.height * 0.7) - Math.sin(s.t * Math.PI) * 30)
        s.scale = restScale * (1 - 0.4 * k)
        if (s.t >= 1) {
          s.mode = 'away'
          s.awayTimer = RETURN_DELAY
          s.opacity = 0
        }
        break
      }
      case 'away': {
        s.awayTimer -= dt
        if (s.awayTimer <= 0) s.mode = 'enter'
        break
      }
      default:
        break
    }

    if (!root.current) return

    // Face the direction of travel; bank into turns; level out at rest.
    const vx = s.pos.x - s.prev.x
    const vy = s.pos.y - s.prev.y
    const speed = Math.hypot(vx, vy)
    let targetAngle = s.mode === 'rest' ? 0.08 + Math.sin(time * 0.9) * 0.05 : s.angle
    if (speed > 0.5) targetAngle = Math.atan2(vy, vx)
    let diff = targetAngle - s.angle
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    s.angle += diff * Math.min(1, dt * 8)
    const turnRate = diff / Math.max(dt, 1e-3)
    const targetRoll = THREE.MathUtils.clamp(-turnRate * 0.12, -0.9, 0.9) - 0.55
    s.roll = THREE.MathUtils.damp(s.roll, s.mode === 'rest' ? -0.55 + Math.sin(time * 1.3) * 0.08 : targetRoll, 5, dt)

    root.current.position.set(s.pos.x, s.pos.y, 0)
    root.current.visible = s.opacity > 0.01 && s.mode !== 'hidden' && s.mode !== 'away'
    heading.current.rotation.z = s.angle
    bank.current.rotation.x = s.roll
    bank.current.scale.setScalar(s.scale)
    model.traverse((o) => {
      if (o.isMesh) o.material.opacity = s.opacity
    })

    // Drop a dot behind the tail every TRAIL_SPACING_PX of travel, then fade them out.
    const moving = s.mode === 'fly' || s.mode === 'launch' || s.mode === 'dive'
    const tailX = s.pos.x - Math.cos(s.angle) * s.scale * length * 0.5
    const tailY = s.pos.y - Math.sin(s.angle) * s.scale * length * 0.5
    if (moving && root.current.visible) {
      if (!trail.last || Math.hypot(tailX - trail.last.x, tailY - trail.last.y) >= TRAIL_SPACING_PX) {
        trail.dots.push({ x: tailX, y: tailY, age: 0 })
        trail.last = { x: tailX, y: tailY }
        if (trail.dots.length > TRAIL_MAX_DOTS) trail.dots.shift()
      }
    } else {
      trail.last = null
    }
    for (const dot of trail.dots) dot.age += dt
    while (trail.dots.length && trail.dots[0].age > TRAIL_LIFETIME) trail.dots.shift()
    const positions = trail.geometry.attributes.position.array
    const colors = trail.geometry.attributes.color.array
    trail.dots.forEach((dot, i) => {
      positions[i * 3] = dot.x
      positions[i * 3 + 1] = dot.y
      positions[i * 3 + 2] = -1
      colors[i * 4] = TRAIL_RGB[0]
      colors[i * 4 + 1] = TRAIL_RGB[1]
      colors[i * 4 + 2] = TRAIL_RGB[2]
      colors[i * 4 + 3] = Math.pow(1 - dot.age / TRAIL_LIFETIME, 1.5) * 0.85
    })
    trail.geometry.setDrawRange(0, trail.dots.length)
    trail.geometry.attributes.position.needsUpdate = true
    trail.geometry.attributes.color.needsUpdate = true
  })

  return (
    <>
      <points geometry={trail.geometry} material={trail.material} frustumCulled={false} />
      <group ref={root}>
        <group ref={heading}>
          <group ref={bank}>
            <primitive object={model} quaternion={MODEL_BASIS} />
          </group>
        </group>
      </group>
    </>
  )
}

export default function FlightLayer({ activeScreenId, launchSignal = 0, hidden = false }) {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 1200, pointerEvents: 'none' }}
    >
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1000], near: 1, far: 4000 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={1.4} />
        <directionalLight position={[300, 600, 900]} intensity={2.2} />
        <Suspense fallback={null}>
          <PaperPlane activeScreenId={activeScreenId} launchSignal={launchSignal} hidden={hidden} />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload(MODEL_URL)
