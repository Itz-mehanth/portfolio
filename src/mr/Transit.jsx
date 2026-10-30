// The jump between sections: for a few seconds the viewer is wrapped in a travel
// tunnel streaming toward a bright destination ahead, then a flash drops them
// into the next world. Styles: hyperspace warp, wormhole, black hole, jet flight
// through clouds, fire. Ported from HandForge's Transit (src/combat/transit.ts).
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const STYLE_INDEX = { warp: 0, wormhole: 1, blackhole: 2, sky: 3, fire: 4 }
export const TRANSIT_SECONDS = 2.6       // shorter than the game's: a portfolio jump
const head = new THREE.Vector3()

const Transit = forwardRef(function Transit(_, ref) {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uStyle: { value: 0 },
      uSpeed: { value: 1 },
      uFade: { value: 0 },
      uFlash: { value: 0 },
      uForward: { value: new THREE.Vector3(0, 0, -1) },
      uA: { value: new THREE.Color('#3DF5FF') },
      uB: { value: new THREE.Color('#FF2D9A') },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime, uStyle, uSpeed, uFade, uFlash;
      uniform vec3 uForward, uA, uB;
      varying vec3 vDir;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
      }
      void main() {
        vec3 d = normalize(vDir);
        vec3 f = normalize(uForward);
        float z = dot(d, f);
        vec3 side = normalize(cross(f, vec3(0.0, 1.0, 0.0)));
        vec3 up = cross(side, f);
        float a = atan(dot(d, up), dot(d, side));
        float depth = 1.0 / max(0.04, 1.0 - z);
        float s = uTime * uSpeed;
        vec3 col = vec3(0.0);
        float core = pow(max(z, 0.0), 40.0);
        if (uStyle < 0.5) {
          float lane = floor(a * 40.0);
          float h = hash(vec2(lane, 3.0));
          float streak = smoothstep(0.92, 1.0, fract(depth * 0.35 - s * (0.6 + h) + h * 9.0));
          streak *= step(0.55, hash(vec2(lane, 7.0)));
          col = mix(uA, vec3(1.0), 0.6) * streak * 1.6 + uB * 0.06 * (1.0 - z);
        } else if (uStyle < 1.5) {
          float swirl = sin(a * 6.0 + depth * 1.6 - s * 6.0) * 0.5 + 0.5;
          float rings = sin(depth * 3.0 - s * 9.0) * 0.5 + 0.5;
          col = mix(uA, uB, swirl) * (0.35 + 0.65 * rings) * (0.4 + 0.6 * smoothstep(-1.0, 1.0, z));
        } else if (uStyle < 2.5) {
          float spiral = sin(a * 3.0 + log(depth) * 6.0 - s * 4.0) * 0.5 + 0.5;
          float disc = smoothstep(0.55, 0.95, spiral) * smoothstep(0.98, 0.3, z);
          col = mix(uB, uA, spiral) * disc * 1.4;
          col *= 1.0 - smoothstep(0.85, 0.995, z);
          col += uA * smoothstep(0.93, 0.97, z) * smoothstep(0.995, 0.97, z) * 2.0;
        } else if (uStyle < 3.5) {
          float h = dot(d, vec3(0.0, 1.0, 0.0));
          col = mix(uB, uA, smoothstep(-0.2, 0.6, h));
          vec2 uv = vec2(a * 2.0, depth * 0.5 - s * 1.5);
          float cloud = noise(uv * 3.0) * 0.6 + noise(uv * 7.0) * 0.4;
          col = mix(col, vec3(1.0), smoothstep(0.5, 0.8, cloud) * (1.0 - smoothstep(0.1, 0.5, h)) * 0.9);
        } else {
          vec2 uv = vec2(a * 3.0, depth * 0.6 - s * 2.0);
          float n = noise(uv * 2.5) * 0.6 + noise(uv * 6.0) * 0.4;
          col = mix(uB, uA, n) * (0.4 + n);
        }
        col += mix(uA, vec3(1.0), 0.5) * core * 3.0;
        col = mix(col, vec3(1.0), uFlash);
        gl_FragColor = vec4(col, uFade);
      }
    `,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.BackSide,
    toneMapped: false,
  }), [])
  useEffect(() => () => material.dispose(), [material])

  const mesh = useRef()
  const state = useRef({ active: false, t: 0, done: null })

  useImperativeHandle(ref, () => ({
    // Starts a jump in `style`; `done` runs at the flash (swap the world there).
    start(style, [a, b], forward, done) {
      const u = material.uniforms
      u.uStyle.value = STYLE_INDEX[style] ?? 0
      u.uA.value.set(a)
      u.uB.value.set(b)
      u.uForward.value.set(forward.x, 0, forward.z).normalize()
      Object.assign(state.current, { active: true, t: 0, done })
    },
    get active() {
      return state.current.active
    },
  }), [material])

  useFrame(({ camera }, delta) => {
    const s = state.current
    if (!mesh.current) return
    mesh.current.visible = s.active
    if (!s.active) return
    s.t += delta
    const t = s.t
    const u = material.uniforms
    u.uTime.value = t
    u.uSpeed.value = 0.6 + Math.min(1, t / (TRANSIT_SECONDS - 0.6)) * 2.4
    const out = t > TRANSIT_SECONDS ? Math.max(0, 1 - (t - TRANSIT_SECONDS) / 0.6) : 1
    u.uFade.value = Math.min(1, t / 0.35) * out
    u.uFlash.value = t > TRANSIT_SECONDS - 0.3 ? Math.min(1, (t - (TRANSIT_SECONDS - 0.3)) / 0.3) * out : 0
    camera.getWorldPosition(head)
    mesh.current.position.copy(head)
    if (t >= TRANSIT_SECONDS && s.done) {
      const done = s.done
      s.done = null
      done()
    }
    if (t > TRANSIT_SECONDS + 0.6) s.active = false
  })

  return (
    <mesh ref={mesh} material={material} frustumCulled={false} renderOrder={50} visible={false}>
      <sphereGeometry args={[5, 48, 32]} />
    </mesh>
  )
})

export default Transit
