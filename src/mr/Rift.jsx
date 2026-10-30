// A section's world tearing into the room: a sphere around the viewer that opens
// in drifting, noisy patches onto that world's sky (gradient, clouds or nebula,
// stars, a sun or ringed planet), with burning edges. In passthrough it eats
// through the real room; at progress 1 it's the whole sky (VR).
// Ported from HandForge's Erasure (src/combat/erasure.ts). One draw call.
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const head = new THREE.Vector3()

export function useRiftMaterial() {
  return useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#F59E0B') },
      uTop: { value: new THREE.Color('#000000') },
      uHorizon: { value: new THREE.Color('#FF4FD8') },
      uGround: { value: new THREE.Color('#000000') },
      uCloud: { value: new THREE.Color('#3A0A3A') },
      uPlanet: { value: new THREE.Color('#FFFFFF') },
      uPlanetDir: { value: new THREE.Vector3(0, 0.5, -0.9).normalize() },
      uPlanetSize: { value: 0.03 },
      uRing: { value: 0 },
      uStars: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uProgress;
      uniform float uTime;
      uniform vec3 uColor, uTop, uHorizon, uGround, uCloud, uPlanet, uPlanetDir;
      uniform float uPlanetSize, uRing, uStars;
      varying vec3 vDir;
      float hash(vec3 p) {
        p = fract(p * 0.3183099 + 0.1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }
      float noise(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
                   mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
      }
      vec3 sky(vec3 d) {
        float h = d.y;
        vec3 col = mix(uHorizon, uTop, smoothstep(-0.02, 0.55, h));
        col = mix(col, uGround, smoothstep(0.0, -0.2, h));
        float n = noise(d * 2.2 + vec3(uTime * 0.015, 0.0, 0.0)) * 0.6 + noise(d * 6.0 - vec3(0.0, uTime * 0.02, 0.0)) * 0.4;
        col += uCloud * smoothstep(0.42, 0.85, n) * (1.0 - abs(h) * 0.8) * 0.9;
        vec3 cell = floor(d * 240.0);
        float star = step(1.0 - 0.012 * uStars, hash(cell)) * (0.6 + 0.4 * sin(uTime * 2.0 + hash(cell + 3.0) * 40.0));
        col += vec3(star) * smoothstep(-0.02, 0.15, h);
        float c = dot(d, uPlanetDir);
        float r = cos(uPlanetSize);
        float disc = smoothstep(r - 0.0015, r + 0.0015, c);
        vec3 side = normalize(d - uPlanetDir * c);
        float lit = 0.35 + 0.65 * smoothstep(-0.6, 0.8, dot(side, normalize(vec3(-0.6, 0.6, 0.2))));
        float bands = 0.85 + 0.15 * sin(dot(d, vec3(0.0, 1.0, 0.3)) * 260.0 / max(uPlanetSize, 0.02) * 0.02);
        col = mix(col, uPlanet * lit * bands, disc);
        float halo = smoothstep(r - 0.06, r, c) * (1.0 - disc);
        col += mix(uPlanet, uColor, 0.5) * halo * 0.45;
        if (uRing > 0.5) {
          vec3 axis = normalize(vec3(0.25, 1.0, 0.15));
          float a = acos(clamp(c, -1.0, 1.0));
          float tilt = abs(dot(side, axis));
          float band = smoothstep(0.02, 0.0, abs(a - uPlanetSize * 1.9)) * smoothstep(0.35, 0.0, tilt);
          col += uColor * band * (1.0 - disc * 0.9) * 1.5;
        }
        return col;
      }
      void main() {
        vec3 d = normalize(vDir);
        float n = noise(d * 3.0 + vec3(0.0, uTime * 0.06, 0.0)) * 0.65 + noise(d * 9.0 - vec3(uTime * 0.1)) * 0.35;
        float erased = uProgress >= 0.999 ? 1.0 : 1.0 - smoothstep(uProgress - 0.015, uProgress + 0.015, n);
        float edge = uProgress >= 0.999 ? 0.0 : (1.0 - smoothstep(0.0, 0.06, abs(n - uProgress))) * step(0.001, uProgress);
        vec3 color = mix(vec3(0.05), sky(d), erased) + uColor * edge * 1.8;
        float alpha = max(erased, edge * 0.9);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    toneMapped: false,
  }), [])
}

// look: a section's world (see sections.js); progress eases toward `target`.
export default function Rift({ look, target, animate = true }) {
  const material = useRiftMaterial()
  const mesh = useRef()
  const progress = useRef(0)
  useEffect(() => () => material.dispose(), [material])

  useEffect(() => {
    const u = material.uniforms
    u.uColor.value.set(look.accent)
    u.uTop.value.set(look.top)
    u.uHorizon.value.set(look.horizon)
    u.uGround.value.set(look.ground)
    u.uCloud.value.set(look.cloud)
    u.uPlanet.value.set(look.planet)
    u.uPlanetDir.value.set(...look.planetDir).normalize()
    u.uPlanetSize.value = look.planetSize
    u.uRing.value = look.ring ? 1 : 0
    u.uStars.value = look.stars
  }, [material, look])

  useFrame(({ camera, clock }, delta) => {
    const rate = target >= 0.999 ? 3 : 1.2
    progress.current += (target - progress.current) * Math.min(1, delta * rate)
    if (target >= 0.999 && progress.current > 0.98) progress.current = 1
    const u = material.uniforms
    u.uProgress.value = progress.current
    if (animate) u.uTime.value = clock.elapsedTime
    if (mesh.current) {
      camera.getWorldPosition(head)
      mesh.current.position.copy(head)
      mesh.current.visible = progress.current > 0.002
    }
  })

  return (
    <mesh ref={mesh} material={material} frustumCulled={false} renderOrder={-5}>
      <sphereGeometry args={[7, 48, 32]} />
    </mesh>
  )
}
