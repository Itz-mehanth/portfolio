import { Billboard, Clouds, Sparkles } from '@react-three/drei'
import { Cloud, Stars } from '@react-three/drei'
import * as THREE from 'three'
import './App.css'
import Asteroid from './Astroid'
import { useState, useMemo, memo, useRef, useEffect } from "react"
import { Text } from "@react-three/drei"
import { Balloon } from './utils/models/Balloon'

import CoinField from './CoinField';
import Blaster from './Blaster';
import { useFrame, useThree } from '@react-three/fiber';

// ---- The cinematic worlds the plane flies through (anchored along +Z) ----
const WORLDS = [
  { z: 0,   name: 'dawn',   bg: '#f9c89b', fog: '#ffe4c4', near: 28, far: 230, amb: ['#fff0e0', 0.75], dir: ['#fff1cf', 1.7], hemi: ['#cfe8ff', '#e8c39a', 0.65] },
  { z: 120, name: 'ocean',  bg: '#36b3d6', fog: '#bdeaf3', near: 22, far: 200, amb: ['#e2faff', 0.7],  dir: ['#ffffff', 1.9], hemi: ['#86e2ff', '#1f6e8c', 0.7] },
  { z: 250, name: 'desert', bg: '#dd8a40', fog: '#f0c188', near: 24, far: 210, amb: ['#ffe2b3', 0.65], dir: ['#ffd79a', 1.8], hemi: ['#ffba6b', '#7a3b1a', 0.6] },
  { z: 380, name: 'city',   bg: '#0d1130', fog: '#171c45', near: 26, far: 230, amb: ['#8f86ff', 0.45], dir: ['#b6a6ff', 1.1], hemi: ['#3b3a8c', '#0a0a1e', 0.55] },
  { z: 520, name: 'space',  bg: '#050310', fog: '#0a0618', near: 40, far: 280, amb: ['#6d5cff', 0.4],  dir: ['#a78bfa', 1.2], hemi: ['#1a1a3e', '#05030f', 0.45] },
];

// Ref-driven environment that morphs sky/fog/lights between worlds as the plane flies
const ProjectEnvironment = memo(function ProjectEnvironment({ avatarRef, lowPowerMode = false }) {
  const { scene } = useThree();
  const ambRef = useRef(); const dirRef = useRef(); const hemiRef = useRef();
  const tmp = useMemo(() => new THREE.Color(), []);
  const bgColor = useMemo(() => new THREE.Color(WORLDS[0].bg), []);

  useEffect(() => {
    scene.background = bgColor;
    scene.fog = new THREE.Fog(WORLDS[0].fog, WORLDS[0].near, WORLDS[0].far);
    return () => { scene.fog = null; };
  }, [scene, bgColor]);

  useFrame(() => {
    const z = avatarRef?.current?.position?.z ?? 0;
    let i = 0;
    while (i < WORLDS.length - 1 && z > WORLDS[i + 1].z) i++;
    const a = WORLDS[i];
    const b = WORLDS[Math.min(i + 1, WORLDS.length - 1)];
    const t = a === b ? 0 : THREE.MathUtils.clamp((z - a.z) / (b.z - a.z), 0, 1);
    const L = THREE.MathUtils.lerp;

    if (scene.background) scene.background.set(a.bg).lerp(tmp.set(b.bg), t);
    if (scene.fog) {
      scene.fog.color.set(a.fog).lerp(tmp.set(b.fog), t);
      scene.fog.near = L(a.near, b.near, t);
      scene.fog.far = L(a.far, b.far, t);
    }
    if (ambRef.current) {
      ambRef.current.color.set(a.amb[0]).lerp(tmp.set(b.amb[0]), t);
      ambRef.current.intensity = L(a.amb[1], b.amb[1], t);
    }
    if (dirRef.current) {
      dirRef.current.color.set(a.dir[0]).lerp(tmp.set(b.dir[0]), t);
      dirRef.current.intensity = L(a.dir[1], b.dir[1], t);
    }
    if (hemiRef.current) {
      hemiRef.current.color.set(a.hemi[0]).lerp(tmp.set(b.hemi[0]), t);
      hemiRef.current.groundColor.set(a.hemi[1]).lerp(tmp.set(b.hemi[1]), t);
      hemiRef.current.intensity = L(a.hemi[2], b.hemi[2], t);
    }
  });

  return (
    <group>
      {/* Stars — naturally show in the dark night/space worlds, washed out in bright skies */}
      <Stars radius={220} depth={90} count={lowPowerMode ? 1500 : 4000} factor={5} saturation={0} fade speed={0.6} />
      {/* Golden dust along the corridor */}
      <Sparkles count={lowPowerMode ? 60 : 140} scale={[44, 22, 520]} size={2.4} speed={0.4} opacity={0.6} color="#fff2cf" />
      <ambientLight ref={ambRef} />
      <directionalLight ref={dirRef} position={[10, 18, -6]} />
      <hemisphereLight ref={hemiRef} />
    </group>
  );
});

// ===== Detailed cinematic worlds (drafted in parallel, integrated) =====

export function OceanWorld({ lowPowerMode = false, avatarRef }) {
  const waterRef = useRef();
  const foamRefs = useRef([]);
  const boatRefs = useRef([]);
  const islandRefs = useRef([]);

  // Zone: Z 95..215, center Z=155
  const ZONE_Z = 155;
  const ZONE_W = 120; // half-width of zone span

  // Water geometry parameters
  const waterSegs = useMemo(() => lowPowerMode ? [24, 18] : [48, 32], [lowPowerMode]);

  // Island data
  const islands = useMemo(() => {
    const count = lowPowerMode ? 5 : 8;
    const seed = [
      { x: -28, z: 105, side: -1 },
      { x:  32, z: 118, side:  1 },
      { x: -42, z: 138, side: -1 },
      { x:  26, z: 152, side:  1 },
      { x: -30, z: 170, side: -1 },
      { x:  46, z: 185, side:  1 },
      { x: -24, z: 200, side: -1 },
      { x:  38, z: 210, side:  1 },
    ];
    return seed.slice(0, count).map((s, i) => ({
      ...s,
      scale: 0.8 + (i % 3) * 0.25,
      phaseOffset: i * 1.3,
      palmCount: lowPowerMode ? 1 : (1 + (i % 2)),
    }));
  }, [lowPowerMode]);

  // Foam ring positions (near islands)
  const foamData = useMemo(() => {
    return islands.map((isl, i) => ({
      x: isl.x + (i % 2 === 0 ? 1.5 : -1.5),
      z: isl.z + (i % 3 === 0 ? 2 : -2),
      radius: 3.5 + (i % 3) * 0.8,
      phase: i * 0.7,
    }));
  }, [islands]);

  // Boat data
  const boats = useMemo(() => {
    const count = lowPowerMode ? 2 : 4;
    return [
      { x: -22, z: 125 },
      { x:  36, z: 163 },
      { x: -38, z: 193 },
      { x:  24, z: 207 },
    ].slice(0, count).map((b, i) => ({ ...b, phase: i * 1.7 }));
  }, [lowPowerMode]);

  // Store wave time
  const timeRef = useRef(0);
  const waveAccum = useRef(0);

  useFrame((state, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    // Animate water surface vertices — throttled to ~25 Hz so the CPU loop +
    // computeVertexNormals don't run every frame (cuts JS-thread cost ~2-3×).
    waveAccum.current += delta;
    if (waterRef.current && waveAccum.current >= 0.04) {
      waveAccum.current = 0;
      const geo = waterRef.current.geometry;
      const pos = geo.attributes.position;
      const countV = pos.count;
      for (let i = 0; i < countV; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        // layered sine waves for rolling ocean feel
        const y =
          Math.sin(x * 0.18 + t * 0.9) * 0.45 +
          Math.sin(z * 0.12 + t * 0.7) * 0.35 +
          Math.sin((x + z) * 0.09 + t * 1.1) * 0.2 +
          Math.cos(x * 0.23 - z * 0.08 + t * 0.5) * 0.15;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }

    // Gentle foam ring pulse (scale)
    foamRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const d = foamData[i];
      if (!d) return;
      const pulse = 1 + Math.sin(t * 0.8 + d.phase) * 0.04;
      ref.scale.set(pulse, 1, pulse);
    });

    // Bob boats
    boatRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const b = boats[i];
      if (!b) return;
      ref.position.y = -12.3 + Math.sin(t * 0.6 + b.phase) * 0.18;
      ref.rotation.z = Math.sin(t * 0.5 + b.phase) * 0.04;
    });

    // Bob islands slightly
    islandRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const isl = islands[i];
      if (!isl) return;
      ref.position.y = -12.5 + Math.sin(t * 0.4 + isl.phaseOffset) * 0.12;
    });
  });

  // Palm tree component (inline, no imports)
  function PalmTree({ position, tiltX = 0.15, tiltZ = 0.1, scale = 1 }) {
    return (
      <group position={position} scale={scale}>
        {/* Trunk: thin cylinder, slightly tilted */}
        <mesh
          position={[0, 2.2, 0]}
          rotation={[tiltX, 0, tiltZ]}
          castShadow={false}
        >
          <cylinderGeometry args={[0.08, 0.13, 4.4, 6]} />
          <meshStandardMaterial color="#7a4f1e" roughness={0.9} />
        </mesh>
        {/* Fronds: 4 flattened ellipsoids fanning out from top */}
        {[0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((angle, fi) => (
          <mesh
            key={fi}
            position={[
              Math.sin(angle) * 0.9 + Math.sin(tiltZ) * 4.4,
              4.4 + Math.cos(tiltX) * 4.4 * 0.1,
              Math.cos(angle) * 0.9 + Math.sin(tiltX) * 4.4,
            ]}
            rotation={[
              -0.5 + tiltX,
              angle,
              0.3,
            ]}
          >
            <sphereGeometry args={[0.65, 5, 4]} />
            <meshStandardMaterial color="#2d8f3c" roughness={0.8} />
          </mesh>
        ))}
        {/* Extra central frond cluster */}
        <mesh
          position={[
            Math.sin(tiltZ) * 4.4,
            4.6 + Math.cos(tiltX) * 4.4 * 0.1,
            Math.sin(tiltX) * 4.4,
          ]}
        >
          <sphereGeometry args={[0.5, 5, 4]} />
          <meshStandardMaterial color="#3fa34d" roughness={0.8} />
        </mesh>
      </group>
    );
  }

  // Sailboat component
  function Sailboat({ boatRef, position, phase }) {
    return (
      <group ref={boatRef} position={[position.x, -12.3, position.z]}>
        {/* Hull */}
        <mesh>
          <boxGeometry args={[1.2, 0.4, 2.2]} />
          <meshStandardMaterial color="#8b4a1c" roughness={0.7} />
        </mesh>
        {/* Mast */}
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 2.2, 4]} />
          <meshStandardMaterial color="#c8a87a" roughness={0.8} />
        </mesh>
        {/* Sail: a triangle via buffer geometry */}
        <mesh position={[0.05, 1.6, -0.1]}>
          <coneGeometry args={[0.7, 1.6, 3]} />
          <meshStandardMaterial color="#f5f0e6" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      {/* === WATER SURFACE === */}
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -13, ZONE_Z]}
        receiveShadow={false}
      >
        <planeGeometry args={[200, 150, waterSegs[0], waterSegs[1]]} />
        <meshStandardMaterial
          color="#1f8fb0"
          roughness={0.15}
          metalness={0.1}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Deep water tint underlayer */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -13.3, ZONE_Z]}
      >
        <planeGeometry args={[210, 160, 2, 2]} />
        <meshStandardMaterial color="#0d4f6e" roughness={1} metalness={0} />
      </mesh>

      {/* === ISLANDS === */}
      {islands.map((isl, i) => (
        <group
          key={i}
          ref={el => { islandRefs.current[i] = el; }}
          position={[isl.x, -12.5, isl.z]}
          scale={isl.scale}
        >
          {/* Sandy base mound */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[3.5, 4.2, 1.2, 10]} />
            <meshStandardMaterial color="#c2a06a" roughness={0.9} />
          </mesh>
          {/* Slightly darker rocky base */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[4.2, 4.8, 0.7, 10]} />
            <meshStandardMaterial color="#a0845a" roughness={1} />
          </mesh>
          {/* Green dome / vegetation hill */}
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[2.2, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color="#3fa34d" roughness={0.85} />
          </mesh>
          {/* Palm trees */}
          {Array.from({ length: isl.palmCount }).map((_, pi) => (
            <PalmTree
              key={pi}
              position={[
                pi === 0 ? 0.5 : -0.8,
                1.2,
                pi === 0 ? 0.3 : -0.4,
              ]}
              tiltX={pi === 0 ? 0.2 : -0.15}
              tiltZ={pi === 0 ? 0.12 : -0.18}
              scale={0.55}
            />
          ))}
        </group>
      ))}

      {/* === FOAM RINGS near islands === */}
      {foamData.map((fd, i) => (
        <mesh
          key={i}
          ref={el => { foamRefs.current[i] = el; }}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[fd.x, -12.8, fd.z]}
        >
          <torusGeometry args={[fd.radius, 0.18, 4, 32]} />
          <meshBasicMaterial
            color="#e8f4f8"
            transparent
            opacity={0.45}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* === SAILBOATS === */}
      {boats.map((b, i) => (
        <Sailboat
          key={i}
          boatRef={el => { boatRefs.current[i] = el; }}
          position={b}
          phase={b.phase}
        />
      ))}

      {/* === SUBTLE HORIZON HAZE at zone edges === */}
      <mesh position={[0, -8, ZONE_Z - ZONE_W + 2]} rotation={[0, 0, 0]}>
        <planeGeometry args={[200, 14, 1, 1]} />
        <meshBasicMaterial color="#a8d8ea" transparent opacity={0.18} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -8, ZONE_Z + ZONE_W - 2]} rotation={[0, 0, 0]}>
        <planeGeometry args={[200, 14, 1, 1]} />
        <meshBasicMaterial color="#a8d8ea" transparent opacity={0.18} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}


export function DesertWorld({ lowPowerMode = false, avatarRef }) {
  const duneGeoRef = useRef();
  const heatRef = useRef();
  const heatRef2 = useRef();
  const dustRef = useRef();

  // Zone: Z ~198..322, centered at Z=260 (widened so the desert reads as a real expanse)
  const ZONE_Z = 260;
  const ZONE_HALF = 62;

  // --- Sand dune ground geometry vertex displacement ---
  useEffect(() => {
    const geo = duneGeoRef.current;
    if (!geo) return;
    const pos = geo.attributes.position;
    const col = new Float32Array(pos.count * 3);
    const color1 = new THREE.Color('#d9a566');
    const color2 = new THREE.Color('#caa35f');
    const color3 = new THREE.Color('#b8955a');
    for (let i = 0; i < pos.count; i++) {
      // On a fresh planeGeometry the verts live in local XY (local Z = 0).
      // After the mesh's rotation.x = -PI/2, local X stays world X and local Y
      // becomes world depth, while local Z becomes world *height*. So we vary the
      // noise by (x, y) and displace local Z to get real rolling dunes.
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Layered sines for big rolling dunes (taller relief so it reads as real terrain)
      const h =
        4.6 * Math.sin(x * 0.045 + y * 0.035) +          // broad primary dunes
        2.8 * Math.sin(x * 0.085 - y * 0.07 + 1.2) +     // secondary ridges
        1.4 * Math.sin(x * 0.17 + y * 0.13 + 2.5) +      // medium ripples
        0.6 * Math.sin(x * 0.4 - y * 0.33 + 0.8) +       // fine sand texture
        // wind-blown crest sharpening on the big dunes
        1.6 * Math.pow(Math.abs(Math.sin(x * 0.045 + y * 0.035)), 0.5);
      pos.setZ(i, h);
      // Color: blend warm sand tones by height
      const t = Math.max(0, Math.min(1, (h + 4) / 11));
      const c = t > 0.5 ? color1.clone().lerp(color3, (t - 0.5) * 2) : color2.clone().lerp(color1, t * 2);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    pos.needsUpdate = true;
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
  }, []);

  // --- Mesa / butte positions ---
  const mesaData = useMemo(() => {
    const segs = lowPowerMode ? 4 : 6;
    return [
      // left side
      { x: -38, z: ZONE_Z - 30, w: 9, h: 18, d: 11, color: '#c1672f', stacked: true, topW: 6, topH: 6, topD: 8 },
      { x: -48, z: ZONE_Z + 5,  w: 7, h: 14, d: 9,  color: '#b8551f', stacked: false },
      { x: -28, z: ZONE_Z + 25, w: 11, h: 12, d: 13, color: '#d97b3a', stacked: true, topW: 7, topH: 5, topD: 9 },
      { x: -42, z: ZONE_Z - 8,  w: 5, h: 20, d: 6,  color: '#c1672f', stacked: false },
      // right side
      { x: 35,  z: ZONE_Z - 20, w: 10, h: 16, d: 12, color: '#d97b3a', stacked: true, topW: 7, topH: 6, topD: 9 },
      { x: 50,  z: ZONE_Z + 10, w: 8,  h: 22, d: 10, color: '#c1672f', stacked: false },
      { x: 27,  z: ZONE_Z + 30, w: 12, h: 10, d: 14, color: '#b8551f', stacked: true, topW: 8, topH: 4, topD: 10 },
      { x: 44,  z: ZONE_Z - 38, w: 6,  h: 18, d: 7,  color: '#d97b3a', stacked: false },
    ];
  }, [lowPowerMode]);

  // --- Cacti positions ---
  const cactiData = useMemo(() => {
    const base = lowPowerMode ? 5 : 10;
    const result = [];
    const rng = (seed) => {
      let s = seed * 1.7312 + 3.14159;
      return ((Math.sin(s) * 43758.5453) % 1 + 1) % 1;
    };
    for (let i = 0; i < base; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const xBase = side * (20 + rng(i * 3.1) * 18);
      const z = ZONE_Z - ZONE_HALF + 8 + rng(i * 5.7) * (ZONE_HALF * 2 - 16);
      const arms = rng(i * 7.3) > 0.4 ? 2 : 1;
      result.push({ x: xBase, z, scale: 0.7 + rng(i * 2.3) * 0.8, arms });
    }
    return result;
  }, [lowPowerMode]);

  // --- Scattered boulder positions ---
  const boulderData = useMemo(() => {
    const count = lowPowerMode ? 6 : 12;
    const items = [];
    const rng = (seed) => ((Math.sin(seed * 12.9898 + 4.1414) * 43758.5453) % 1 + 1) % 1;
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      items.push({
        x: side * (14 + rng(i * 4.1) * 22),
        z: ZONE_Z - ZONE_HALF + 5 + rng(i * 9.3) * (ZONE_HALF * 2 - 10),
        scale: 0.5 + rng(i * 6.7) * 1.2,
        rotY: rng(i * 3.3) * Math.PI * 2,
      });
    }
    return items;
  }, [lowPowerMode]);

  // --- Dust particle positions ---
  const dustPositions = useMemo(() => {
    const count = lowPowerMode ? 60 : 140;
    const arr = new Float32Array(count * 3);
    const rng = (i, off) => ((Math.sin(i * 13.37 + off) * 53758.5453) % 1 + 1) % 1;
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (rng(i, 1) * 100) - 50;
      arr[i * 3 + 1] = -13 + rng(i, 2) * 14;
      arr[i * 3 + 2] = ZONE_Z - ZONE_HALF + rng(i, 3) * ZONE_HALF * 2;
    }
    return arr;
  }, [lowPowerMode]);

  // Heat shimmer oscillation (cheap: just y-offset on invisible planes — skip; use subtle flicker on emissive)
  const heatFlicker = useRef({ t: 0 });
  useFrame((_, delta) => {
    heatFlicker.current.t += delta;
    const t = heatFlicker.current.t;
    if (heatRef.current) {
      heatRef.current.material.opacity = 0.04 + 0.025 * Math.sin(t * 2.3 + 1.0);
    }
    if (heatRef2.current) {
      heatRef2.current.material.opacity = 0.03 + 0.02 * Math.sin(t * 1.7 + 2.5);
    }
  });

  return (
    <group position={[0, 0, 0]}>

      {/* SAND DUNE GROUND — large, high-resolution rolling terrain.
          Sits a touch above the ocean water plane (y -14) so it cleanly occludes
          it through the ocean→desert overlap instead of z-fighting. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -13.6, ZONE_Z + 8]}>
        <planeGeometry ref={duneGeoRef} args={[300, 210, lowPowerMode ? 48 : 96, lowPowerMode ? 32 : 64]} />
        <meshLambertMaterial vertexColors flatShading side={THREE.DoubleSide} />
      </mesh>

      {/* AMBIENT HEAT SHIMMER PLANES (subtle additive glow near horizon) */}
      <mesh ref={heatRef} position={[0, -8, ZONE_Z]} rotation={[-Math.PI * 0.18, 0, 0]}>
        <planeGeometry args={[180, 8]} />
        <meshBasicMaterial
          color="#ffb86c"
          transparent
          opacity={0.05}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={heatRef2} position={[0, -10, ZONE_Z + 15]} rotation={[-Math.PI * 0.15, 0, 0]}>
        <planeGeometry args={[160, 5]} />
        <meshBasicMaterial
          color="#ffd59e"
          transparent
          opacity={0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* DUST PARTICLES */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[dustPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#e8c07a"
          size={0.28}
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          toneMapped={false}
        />
      </points>

      {/* MESAS / BUTTES */}
      {mesaData.map((m, i) => (
        <group key={i} position={[m.x, -13.5, m.z]}>
          {/* Base box */}
          <mesh position={[0, m.h / 2, 0]} castShadow>
            <boxGeometry args={[m.w, m.h, m.d]} />
            <meshLambertMaterial color={m.color} flatShading />
          </mesh>
          {/* Stacked top layer */}
          {m.stacked && (
            <mesh position={[0, m.h + m.topH / 2, 0]} castShadow>
              <boxGeometry args={[m.topW, m.topH, m.topD]} />
              <meshLambertMaterial color="#c57a45" flatShading />
            </mesh>
          )}
          {/* Subtle warm rim glow at base */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[m.w * 0.72, m.w * 0.9, 0.3, 6]} />
            <meshBasicMaterial color="#e8965a" transparent opacity={0.18} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* SANDSTONE ARCH — left side hero landmark, ~mid zone */}
      <group position={[-32, -13.5, ZONE_Z + 2]}>
        {/* Left pillar */}
        <mesh position={[-5, 9, 0]} castShadow>
          <boxGeometry args={[3.2, 18, 3.5]} />
          <meshLambertMaterial color="#c97a40" flatShading />
        </mesh>
        {/* Right pillar */}
        <mesh position={[5, 9, 0]} castShadow>
          <boxGeometry args={[3.2, 18, 3.5]} />
          <meshLambertMaterial color="#c1672f" flatShading />
        </mesh>
        {/* Top span (keystone) */}
        <mesh position={[0, 19, 0]} castShadow>
          <boxGeometry args={[13.5, 3.5, 3.5]} />
          <meshLambertMaterial color="#d98a52" flatShading />
        </mesh>
        {/* Arch inner curve approximated by a smaller box cutout look — add a darker inner face */}
        <mesh position={[0, 16.5, 1.8]}>
          <boxGeometry args={[5.5, 7.5, 0.4]} />
          <meshLambertMaterial color="#7a3d18" flatShading />
        </mesh>
        {/* Warm glow at base */}
        <mesh position={[0, 0.2, 0]}>
          <planeGeometry args={[14, 6]} />
          <meshBasicMaterial color="#e8965a" transparent opacity={0.15} depthWrite={false} rotation={[-Math.PI / 2, 0, 0]} toneMapped={false} />
        </mesh>
      </group>

      {/* SECOND SMALLER ARCH — right side */}
      <group position={[38, -13.5, ZONE_Z - 15]}>
        <mesh position={[-3.5, 7, 0]} castShadow>
          <boxGeometry args={[2.5, 14, 2.8]} />
          <meshLambertMaterial color="#b8551f" flatShading />
        </mesh>
        <mesh position={[3.5, 7, 0]} castShadow>
          <boxGeometry args={[2.5, 14, 2.8]} />
          <meshLambertMaterial color="#c1672f" flatShading />
        </mesh>
        <mesh position={[0, 15, 0]} castShadow>
          <boxGeometry args={[10, 3, 2.8]} />
          <meshLambertMaterial color="#d97b3a" flatShading />
        </mesh>
        <mesh position={[0, 12.5, 1.5]}>
          <boxGeometry args={[4, 6, 0.3]} />
          <meshLambertMaterial color="#6b3010" flatShading />
        </mesh>
      </group>

      {/* CACTI */}
      {cactiData.map((c, i) => (
        <group key={i} position={[c.x, -13.5, c.z]} scale={[c.scale, c.scale, c.scale]}>
          {/* Trunk */}
          <mesh position={[0, 3, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.35, 6, lowPowerMode ? 5 : 7]} />
            <meshLambertMaterial color="#3e7d3a" flatShading />
          </mesh>
          {/* Arm 1 — left, bent up */}
          <group position={[-0.3, 4.2, 0]} rotation={[0, 0, Math.PI * 0.38]}>
            <mesh position={[0, 1, 0]}>
              <cylinderGeometry args={[0.18, 0.22, 2.2, lowPowerMode ? 5 : 6]} />
              <meshLambertMaterial color="#3e7d3a" flatShading />
            </mesh>
            <mesh position={[0, 2.4, 0]} rotation={[0, 0, -Math.PI * 0.38]}>
              <cylinderGeometry args={[0.16, 0.18, 1.8, lowPowerMode ? 5 : 6]} />
              <meshLambertMaterial color="#4a8f45" flatShading />
            </mesh>
          </group>
          {/* Arm 2 — right, bent up (optional) */}
          {c.arms >= 2 && (
            <group position={[0.3, 3.5, 0]} rotation={[0, 0, -Math.PI * 0.35]}>
              <mesh position={[0, 0.9, 0]}>
                <cylinderGeometry args={[0.18, 0.22, 1.8, lowPowerMode ? 5 : 6]} />
                <meshLambertMaterial color="#3e7d3a" flatShading />
              </mesh>
              <mesh position={[0, 2.1, 0]} rotation={[0, 0, Math.PI * 0.35]}>
                <cylinderGeometry args={[0.15, 0.18, 1.6, lowPowerMode ? 5 : 6]} />
                <meshLambertMaterial color="#4a8f45" flatShading />
              </mesh>
            </group>
          )}
          {/* Cactus top dome */}
          <mesh position={[0, 6.2, 0]}>
            <sphereGeometry args={[0.3, lowPowerMode ? 5 : 7, lowPowerMode ? 4 : 5]} />
            <meshLambertMaterial color="#2e6b2a" flatShading />
          </mesh>
        </group>
      ))}

      {/* STEPPED PYRAMID — far left */}
      <group position={[-52, -13.5, ZONE_Z + 38]}>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[20, 3, 20]} />
          <meshLambertMaterial color="#c9883a" flatShading />
        </mesh>
        <mesh position={[0, 4.5, 0]}>
          <boxGeometry args={[14, 3, 14]} />
          <meshLambertMaterial color="#bf7830" flatShading />
        </mesh>
        <mesh position={[0, 7.5, 0]}>
          <boxGeometry args={[9, 3, 9]} />
          <meshLambertMaterial color="#b56d28" flatShading />
        </mesh>
        <mesh position={[0, 10.5, 0]}>
          <boxGeometry args={[5, 3, 5]} />
          <meshLambertMaterial color="#a86224" flatShading />
        </mesh>
        <mesh position={[0, 13, 0]}>
          <boxGeometry args={[2.5, 2, 2.5]} />
          <meshLambertMaterial color="#9a5820" flatShading />
        </mesh>
      </group>

      {/* BOULDERS (low icosahedrons / dodecahedrons) */}
      {boulderData.map((b, i) => (
        <mesh
          key={i}
          position={[b.x, -13.5 + b.scale * 0.5, b.z]}
          rotation={[0.3 * b.rotY, b.rotY, 0.2 * b.rotY]}
          scale={[b.scale, b.scale * 0.75, b.scale]}
          castShadow
        >
          <icosahedronGeometry args={[1, 0]} />
          <meshLambertMaterial
            color={i % 3 === 0 ? '#b8793a' : i % 3 === 1 ? '#a06830' : '#c08545'}
            flatShading
          />
        </mesh>
      ))}

      {/* DISTANT SAND RIDGE (silhouette) */}
      <mesh position={[0, -10, ZONE_Z + 58]} rotation={[0, 0, 0]}>
        <boxGeometry args={[200, 8, 4]} />
        <meshLambertMaterial color="#c49050" flatShading />
      </mesh>
      <mesh position={[0, -11.5, ZONE_Z + 60]}>
        <boxGeometry args={[200, 5, 3]} />
        <meshLambertMaterial color="#b8804a" flatShading />
      </mesh>

      {/* WARM SUNSET AMBIENT LIGHT for zone */}
      <pointLight position={[0, 20, ZONE_Z]} color="#ff9a5c" intensity={lowPowerMode ? 0.6 : 1.1} distance={160} decay={2} />
      <pointLight position={[-45, 15, ZONE_Z + 20]} color="#ffb86c" intensity={lowPowerMode ? 0.3 : 0.55} distance={100} decay={2} />
      <pointLight position={[40, 12, ZONE_Z - 20]} color="#e87a40" intensity={lowPowerMode ? 0.25 : 0.45} distance={90} decay={2} />
    </group>
  );
}

export function CityWorld({ lowPowerMode = false, avatarRef }) {
  const droneRefs = useRef([]);
  const spireBlinkRefs = useRef([]);
  const frameTimeRef = useRef(0);

  // Build a shared window canvas texture once
  const windowTexture = useMemo(() => {
    const W = 128, H = 256;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, W, H);

    const cols = 8, rows = 16;
    const padX = 4, padY = 6;
    const cellW = (W - padX * 2) / cols;
    const cellH = (H - padY * 2) / rows;
    const warmColors = ['#ffe9a0', '#ffd580', '#ffcc66', '#fff0c0'];
    const coolColors = ['#a0d8ff', '#80cfff', '#60b8ff', '#c0e8ff'];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lit = Math.random() > 0.35;
        if (!lit) continue;
        const palette = Math.random() > 0.4 ? warmColors : coolColors;
        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
        const wx = padX + c * cellW + 1;
        const wy = padY + r * cellH + 1;
        ctx.fillRect(wx, wy, cellW - 2, cellH - 2);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  // Building definitions: both sides, varied heights/widths
  const buildings = useMemo(() => {
    const rng = (seed) => {
      let s = seed * 9301 + 49297;
      return ((s % 233280) / 233280);
    };
    const count = lowPowerMode ? 16 : 28;
    const list = [];
    const zStart = 335, zEnd = 478;
    const zRange = zEnd - zStart;

    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const r0 = rng(i * 7 + 1);
      const r1 = rng(i * 7 + 2);
      const r2 = rng(i * 7 + 3);
      const r3 = rng(i * 7 + 4);
      const r4 = rng(i * 7 + 5);
      const r5 = rng(i * 7 + 6);

      const width = 6 + r0 * 10;
      const depth = 6 + r1 * 10;
      const height = 16 + r2 * 34; // total height from Y=-14 to top (taller skyline)
      const xOffset = (15 + r3 * 36) * side; // tighter inner edge → canyon to fly through
      const zPos = zStart + r4 * zRange;
      const baseY = -14;
      const centerY = baseY + height / 2;

      // Window texture repeat based on building size
      const repX = Math.max(1, Math.round(width / 8));
      const repY = Math.max(1, Math.round(height / 10));

      // Neon accent color for trim
      const neonPick = Math.floor(r5 * 3);
      const neonColors = ['#00ffe0', '#ff00cc', '#ffd700'];
      const neonColor = neonColors[neonPick];

      list.push({ id: i, side, width, depth, height, xOffset, zPos, centerY, baseY, repX, repY, neonColor });
    }
    return list;
  }, [lowPowerMode]);

  // Rooftop beacons/signs
  const beacons = useMemo(() => {
    const list = [];
    const picked = buildings.slice(0, lowPowerMode ? 4 : 8);
    picked.forEach((b, idx) => {
      const top = b.baseY + b.height;
      list.push({
        id: idx,
        pos: [b.xOffset, top + 1.2, b.zPos],
        color: b.neonColor,
        isSpire: idx % 3 === 0,
        blinkSpeed: 1.2 + idx * 0.4,
      });
    });
    return list;
  }, [buildings, lowPowerMode]);

  // Drone lights
  const drones = useMemo(() => {
    const count = lowPowerMode ? 3 : 6;
    const list = [];
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      list.push({
        id: i,
        baseX: (22 + i * 5) * side,
        baseY: 2 + i * 1.5,
        baseZ: 345 + i * 18,
        speed: 0.3 + i * 0.1,
        phase: i * 1.1,
        color: i % 3 === 0 ? '#00ffe0' : i % 3 === 1 ? '#ff00cc' : '#ffffff',
      });
    }
    return list;
  }, [lowPowerMode]);

  // Street grid lines: Z-running and X-crossing
  const streetLines = useMemo(() => {
    const lines = [];
    // Along Z (2 lanes each side)
    const zLineXs = [-8, -4, 4, 8];
    zLineXs.forEach((x, i) => {
      lines.push({ axis: 'z', x, y: -13.92, z: 406, lenZ: 150, lenX: 0.18, color: i < 2 ? '#00ffe0' : '#ff00cc' });
    });
    // Cross streets (along X)
    for (let z = 338; z <= 478; z += 20) {
      lines.push({ axis: 'x', x: 0, y: -13.92, z, lenZ: 0.18, lenX: 90, color: '#a020f0' });
    }
    return lines;
  }, []);

  // Flying-car traffic streams (the lights you actually pass while flying through)
  const Z0 = 335, Z1 = 478, ZLEN = Z1 - Z0;
  const traffic = useMemo(() => {
    const rng = (s) => ((Math.sin(s * 12.9898) * 43758.5453) % 1 + 1) % 1;
    const count = lowPowerMode ? 16 : 34;
    const list = [];
    for (let i = 0; i < count; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      // Lanes hug the corridor edges; opposite directions on opposite sides
      const lane = dir > 0 ? -(5 + rng(i) * 7) : (5 + rng(i * 2.1) * 7);
      const y = -11 + rng(i * 3.3) * 17;            // spread across the flight band
      const z = Z0 + rng(i * 5.7) * ZLEN;
      const speed = 16 + rng(i * 7.1) * 30;
      const warm = rng(i * 9.3) > 0.5;
      list.push({ dir, lane, y, z, speed, head: warm ? '#fff1c0' : '#bfe9ff' });
    }
    return list;
  }, [lowPowerMode]);
  const carRefs = useRef([]);

  // Street lamps lining the corridor
  const lamps = useMemo(() => {
    const list = [];
    for (let z = Z0 + 6; z <= Z1; z += 22) {
      list.push({ x: -13, z });
      list.push({ x: 13, z });
    }
    return list;
  }, []);

  // init drone refs
  useEffect(() => {
    droneRefs.current = droneRefs.current.slice(0, drones.length);
    spireBlinkRefs.current = spireBlinkRefs.current.slice(0, beacons.length);
  }, [drones.length, beacons.length]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    // Drone drift
    drones.forEach((d, i) => {
      const ref = droneRefs.current[i];
      if (!ref) return;
      ref.position.x = d.baseX + Math.sin(t * d.speed + d.phase) * 4;
      ref.position.y = d.baseY + Math.cos(t * d.speed * 0.7 + d.phase) * 1.5;
      ref.position.z = d.baseZ + Math.sin(t * d.speed * 0.5 + d.phase * 2) * 6;
    });

    // Flying-car traffic — loop along the corridor
    traffic.forEach((c, i) => {
      const ref = carRefs.current[i];
      if (!ref) return;
      let z = ref.position.z + c.dir * c.speed * dt;
      if (z > Z1) z = Z0;
      else if (z < Z0) z = Z1;
      ref.position.z = z;
    });

    // Spire blink
    beacons.forEach((b, i) => {
      if (!b.isSpire) return;
      const ref = spireBlinkRefs.current[i];
      if (!ref) return;
      const blink = Math.sin(t * b.blinkSpeed * Math.PI) > 0.4 ? 1 : 0.05;
      ref.material.opacity = blink;
    });
  });

  // Window textures: cloned ONCE per building (memoized) and disposed on cleanup,
  // instead of re-cloning 2× per building on every render (was leaking CanvasTextures).
  const buildingTex = useMemo(() => buildings.map((b) => {
    const texClone = windowTexture.clone();
    texClone.repeat.set(b.repX, b.repY);
    texClone.needsUpdate = true;
    const repZ = Math.max(1, Math.round(b.depth / 8));
    const sideTex = windowTexture.clone();
    sideTex.repeat.set(repZ, b.repY);
    sideTex.needsUpdate = true;
    return { texClone, sideTex };
  }), [buildings, windowTexture]);
  useEffect(() => () => { buildingTex.forEach(({ texClone, sideTex }) => { texClone.dispose(); sideTex.dispose(); }); }, [buildingTex]);

  return (
    <group position={[0, 0, 0]}>
      {/* Dark ground base */}
      <mesh position={[0, -14, 406]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[260, 200]} />
        <meshStandardMaterial color="#06060f" roughness={0.15} metalness={0.6} />
      </mesh>

      {/* Reflective wet-asphalt road down the central corridor */}
      <mesh position={[0, -13.97, 406]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[26, 150]} />
        <meshStandardMaterial color="#0a0a1e" roughness={0.04} metalness={0.95} transparent opacity={0.7} />
      </mesh>
      {/* Reflective ground overlay (subtle) */}
      <mesh position={[0, -13.98, 406]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[260, 200]} />
        <meshStandardMaterial color="#08082a" roughness={0.05} metalness={0.9} transparent opacity={0.35} />
      </mesh>

      {/* Street grid lines */}
      {streetLines.map((line, i) => (
        <mesh
          key={i}
          position={[line.x, line.y, line.z]}
        >
          <boxGeometry args={[line.lenX || 0.18, 0.04, line.lenZ || 100]} />
          <meshBasicMaterial color={line.color} toneMapped={false} />
        </mesh>
      ))}

      {/* Buildings */}
      {buildings.map((b, idx) => {
        const { texClone, sideTex } = buildingTex[idx];
        const innerX = b.xOffset > 0 ? -1 : 1; // which side faces the central flight corridor
        return (
          <group key={b.id} position={[b.xOffset, b.centerY, b.zPos]}>
            {/* Main building body */}
            <mesh castShadow>
              <boxGeometry args={[b.width, b.height, b.depth]} />
              <meshStandardMaterial color="#0b0b1a" roughness={0.8} metalness={0.2} />
            </mesh>
            {/* Window face front (+Z) */}
            <mesh position={[0, 0, b.depth / 2 + 0.02]}>
              <planeGeometry args={[b.width, b.height]} />
              <meshBasicMaterial map={texClone} toneMapped={false} transparent opacity={0.92} />
            </mesh>
            {/* Window face back (-Z) */}
            <mesh position={[0, 0, -(b.depth / 2 + 0.02)]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[b.width, b.height]} />
              <meshBasicMaterial map={texClone} toneMapped={false} transparent opacity={0.85} />
            </mesh>
            {/* Window face inner side (faces the flight corridor — the wall you actually see) */}
            <mesh position={[innerX * (b.width / 2 + 0.02), 0, 0]} rotation={[0, innerX * Math.PI / 2, 0]}>
              <planeGeometry args={[b.depth, b.height]} />
              <meshBasicMaterial map={sideTex} toneMapped={false} transparent opacity={0.95} />
            </mesh>
            {/* Window face outer side */}
            <mesh position={[-innerX * (b.width / 2 + 0.02), 0, 0]} rotation={[0, -innerX * Math.PI / 2, 0]}>
              <planeGeometry args={[b.depth, b.height]} />
              <meshBasicMaterial map={sideTex} toneMapped={false} transparent opacity={0.8} />
            </mesh>
            {/* Neon rooftop trim strip */}
            <mesh position={[0, b.height / 2 + 0.1, 0]}>
              <boxGeometry args={[b.width + 0.3, 0.25, b.depth + 0.3]} />
              <meshBasicMaterial color={b.neonColor} toneMapped={false} />
            </mesh>
            {/* Vertical neon edge accent on the corridor-facing corner */}
            <mesh position={[innerX * (b.width / 2 + 0.05), 0, b.depth / 2]}>
              <boxGeometry args={[0.12, b.height, 0.12]} />
              <meshBasicMaterial color={b.neonColor} toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* Rooftop beacons / spires */}
      {beacons.map((b, i) => (
        <group key={b.id} position={b.pos}>
          {b.isSpire ? (
            <>
              {/* Spire shaft */}
              <mesh position={[0, 2, 0]}>
                <cylinderGeometry args={[0.08, 0.18, 4, 6]} />
                <meshBasicMaterial color={b.color} toneMapped={false} />
              </mesh>
              {/* Blinking tip */}
              <mesh
                ref={(el) => { spireBlinkRefs.current[i] = el; }}
                position={[0, 4.2, 0]}
              >
                <sphereGeometry args={[0.28, 8, 8]} />
                <meshBasicMaterial color={b.color} toneMapped={false} transparent opacity={1} />
              </mesh>
            </>
          ) : (
            /* Flat beacon box / sign */
            <mesh>
              <boxGeometry args={[1.4, 0.5, 0.2]} />
              <meshBasicMaterial color={b.color} toneMapped={false} />
            </mesh>
          )}
        </group>
      ))}

      {/* Floating drone lights */}
      {drones.map((d, i) => (
        <mesh
          key={d.id}
          ref={(el) => { droneRefs.current[i] = el; }}
          position={[d.baseX, d.baseY, d.baseZ]}
        >
          <sphereGeometry args={[0.18, 6, 6]} />
          <meshBasicMaterial
            color={d.color}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Flying-car traffic streams */}
      {traffic.map((c, i) => (
        <group
          key={`car${i}`}
          ref={(el) => { carRefs.current[i] = el; }}
          position={[c.lane, c.y, c.z]}
        >
          {/* Car body */}
          <mesh>
            <boxGeometry args={[0.5, 0.32, 1.7]} />
            <meshStandardMaterial color="#11111c" metalness={0.7} roughness={0.3} emissive={c.head} emissiveIntensity={0.15} />
          </mesh>
          {/* Headlight glow (facing travel direction) */}
          <mesh position={[0, 0, c.dir * 1.1]}>
            <sphereGeometry args={[0.34, 8, 8]} />
            <meshBasicMaterial color={c.head} toneMapped={false} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          {/* Taillight glow (trailing) */}
          <mesh position={[0, 0, -c.dir * 1.0]}>
            <sphereGeometry args={[0.26, 8, 8]} />
            <meshBasicMaterial color="#ff2b2b" toneMapped={false} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      ))}

      {/* Street lamps lining the corridor */}
      {lamps.map((l, i) => (
        <group key={`lamp${i}`} position={[l.x, -14, l.z]}>
          {/* Pole */}
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.1, 0.14, 6, 6]} />
            <meshStandardMaterial color="#15151f" metalness={0.6} roughness={0.5} />
          </mesh>
          {/* Glowing lamp head */}
          <mesh position={[0, 6.1, 0]}>
            <sphereGeometry args={[0.34, 8, 8]} />
            <meshBasicMaterial color="#ffdca0" toneMapped={false} />
          </mesh>
          {/* Additive halo around the lamp head */}
          <mesh position={[0, 6.1, 0]}>
            <sphereGeometry args={[0.7, 8, 8]} />
            <meshBasicMaterial color="#ffdca0" toneMapped={false} transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      ))}

      {/* Ambient neon fog halos (additive point-like planes for atmosphere) */}
      {[
        { pos: [-30, -6, 350], color: '#00ffe0' },
        { pos: [30, -6, 385], color: '#ff00cc' },
        { pos: [-25, -4, 420], color: '#a020f0' },
        { pos: [28, -3, 455], color: '#ffd700' },
      ].map((h, i) => (
        <mesh key={i} position={h.pos} rotation={[0, 0, 0]}>
          <planeGeometry args={[18, 18]} />
          <meshBasicMaterial
            color={h.color}
            toneMapped={false}
            transparent
            opacity={0.04}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export function SpaceWorld({ lowPowerMode = false, avatarRef }) {
  const lp = lowPowerMode;

  // ---- Canvas texture for soft round nebula glow particles ----
  const softTex = useMemo(() => {
    const s = 128;
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0,    'rgba(255,255,255,1)');
    g.addColorStop(0.28, 'rgba(255,255,255,0.72)');
    g.addColorStop(0.65, 'rgba(255,255,255,0.22)');
    g.addColorStop(1,    'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    return new THREE.CanvasTexture(c);
  }, []);

  // ---- Rich multi-colored nebula wisp clusters ----
  const nebula = useMemo(() => {
    const totalCount = lp ? 1400 : 3600;
    const positions = new Float32Array(totalCount * 3);
    const colors    = new Float32Array(totalCount * 3);

    const palette = [
      new THREE.Color('#c026d3'), // fuchsia
      new THREE.Color('#7c3aed'), // violet
      new THREE.Color('#2563eb'), // blue
      new THREE.Color('#06b6d4'), // teal
      new THREE.Color('#ec4899'), // pink
      new THREE.Color('#a78bfa'), // lavender
      new THREE.Color('#38bdf8'), // sky
    ];

    // 12 cluster centers scattered wide at the sides (keep centre corridor clear)
    const clusterCount = 12;
    const tmp = new THREE.Color();
    const clusters = Array.from({ length: clusterCount }, (_, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      return {
        x: side * (22 + Math.random() * 52),
        y: (Math.random() - 0.5) * 60 + 6,
        z: 500 + Math.random() * 140,
        col: palette[i % palette.length].clone().lerp(palette[(i + 2) % palette.length], Math.random() * 0.6),
        spread: 18 + Math.random() * 22,
      };
    });

    for (let i = 0; i < totalCount; i++) {
      const i3 = i * 3;
      const cl = clusters[i % clusterCount];
      const sp = cl.spread;
      positions[i3]     = cl.x + (Math.random() - 0.5) * sp;
      positions[i3 + 1] = cl.y + (Math.random() - 0.5) * sp * 0.55;
      positions[i3 + 2] = cl.z + (Math.random() - 0.5) * sp;
      tmp.copy(cl.col).lerp(palette[(i * 7 + 3) % palette.length], Math.random() * 0.35);
      colors[i3] = tmp.r; colors[i3 + 1] = tmp.g; colors[i3 + 2] = tmp.b;
    }
    return { positions, colors, count: totalCount };
  }, [lp]);

  // ---- Asteroid belt data ----
  const asteroidData = useMemo(() => {
    const count = lp ? 30 : 60;
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      return {
        pos: [
          side * (18 + Math.random() * 38),
          (Math.random() - 0.5) * 28 - 2,
          505 + Math.random() * 140,
        ],
        scale: 0.18 + Math.random() * 0.55,
        rotSpeed: (Math.random() - 0.5) * 0.018,
        rotAxis: new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize(),
        phase: Math.random() * Math.PI * 2,
        driftAmp: 0.04 + Math.random() * 0.06,
      };
    });
  }, [lp]);

  // ---- Refs for animated objects ----
  const planet1Ref  = useRef(); // warm gas giant
  const planet2Ref  = useRef(); // blue ice world
  const planet3Ref  = useRef(); // small rocky moon
  const planet4Ref  = useRef(); // deep red dwarf
  const ringedRef   = useRef(); // ringed saturn-like
  const asteroidRefs = useRef([]);
  // Ensure refs array length
  useMemo(() => {
    asteroidRefs.current = asteroidData.map((_, i) => asteroidRefs.current[i] || { current: null });
  }, [asteroidData]);

  // ---- useFrame: spin planets + drift asteroids ----
  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime;

    if (planet1Ref.current)  planet1Ref.current.rotation.y  += delta * 0.06;
    if (planet2Ref.current)  planet2Ref.current.rotation.y  += delta * 0.09;
    if (planet3Ref.current)  planet3Ref.current.rotation.y  += delta * 0.14;
    if (planet4Ref.current)  planet4Ref.current.rotation.y  += delta * 0.04;
    if (ringedRef.current)   ringedRef.current.rotation.y   += delta * 0.05;

    for (let i = 0; i < asteroidRefs.current.length; i++) {
      const r = asteroidRefs.current[i];
      if (!r || !r.current) continue;
      const d = asteroidData[i];
      r.current.rotation.x += d.rotSpeed;
      r.current.rotation.z += d.rotSpeed * 0.7;
      r.current.position.y = d.pos[1] + Math.sin(elapsed * 0.4 + d.phase) * d.driftAmp;
    }
  });

  return (
    <group>

      {/* =========================================================
          DISTANT SUN / STAR — far ahead at high Z
      ========================================================= */}
      <group position={[28, 22, 660]}>
        {/* Core: bright near-white/gold sphere */}
        <mesh>
          <sphereGeometry args={[4.2, 20, 20]} />
          <meshBasicMaterial color="#fff8e7" toneMapped={false} />
        </mesh>
        {/* Outer halo 1 — soft gold additive */}
        <mesh>
          <sphereGeometry args={[7.5, 16, 16]} />
          <meshBasicMaterial
            color="#ffe066"
            transparent
            opacity={0.18}
            toneMapped={false}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>
        {/* Outer halo 2 — wider diffuse glow */}
        <mesh>
          <sphereGeometry args={[14, 14, 14]} />
          <meshBasicMaterial
            color="#ffcc44"
            transparent
            opacity={0.07}
            toneMapped={false}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>
        <pointLight intensity={2.8} distance={320} color="#fff3c0" decay={2} />
      </group>

      {/* =========================================================
          PLANET 1 — Warm Gas Giant (Jupiter-like, orange/amber)
          Right side, mid-distance
      ========================================================= */}
      <group ref={planet1Ref} position={[46, 14, 545]}>
        <mesh>
          <sphereGeometry args={[11, lp ? 22 : 40, lp ? 14 : 28]} />
          <meshStandardMaterial
            color="#d9873a"
            emissive="#6b2a00"
            emissiveIntensity={0.28}
            roughness={0.75}
            metalness={0.0}
          />
        </mesh>
        {/* Subtle band overlay using a slightly lighter equatorial ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[11.05, 1.1, 6, lp ? 28 : 48]} />
          <meshBasicMaterial
            color="#f0a855"
            transparent
            opacity={0.22}
            toneMapped={false}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* =========================================================
          PLANET 2 — Blue Ice World (Neptune-like)
          Left side
      ========================================================= */}
      <group ref={planet2Ref} position={[-44, 8, 570]}>
        <mesh>
          <sphereGeometry args={[8.5, lp ? 20 : 38, lp ? 14 : 24]} />
          <meshStandardMaterial
            color="#2a6ec4"
            emissive="#071d4a"
            emissiveIntensity={0.35}
            roughness={0.55}
            metalness={0.1}
          />
        </mesh>
        {/* polar ice cap hint */}
        <mesh position={[0, 8.1, 0]}>
          <sphereGeometry args={[2.8, 12, 10]} />
          <meshBasicMaterial
            color="#cce8ff"
            transparent
            opacity={0.45}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* =========================================================
          PLANET 3 — Small Rocky Moon (grey/tan)
          Left side, closer
      ========================================================= */}
      <group ref={planet3Ref} position={[-30, -6, 525]}>
        <mesh>
          <sphereGeometry args={[3.8, lp ? 10 : 18, lp ? 8 : 14]} />
          <meshStandardMaterial
            color="#8a7f74"
            emissive="#2a1f18"
            emissiveIntensity={0.12}
            roughness={0.95}
            metalness={0.0}
            flatShading
          />
        </mesh>
      </group>

      {/* =========================================================
          PLANET 4 — Deep Red Dwarf (small, far background)
          Right side, far
      ========================================================= */}
      <group ref={planet4Ref} position={[56, -4, 625]}>
        <mesh>
          <sphereGeometry args={[6.2, lp ? 16 : 28, lp ? 10 : 18]} />
          <meshStandardMaterial
            color="#8b1a1a"
            emissive="#3d0808"
            emissiveIntensity={0.4}
            roughness={0.8}
            metalness={0.0}
          />
        </mesh>
      </group>

      {/* =========================================================
          RINGED PLANET — Saturn-like (teal/purple)
          Right side, ahead
      ========================================================= */}
      <group ref={ringedRef} position={[-54, 20, 600]} rotation={[0.18, 0, 0.08]}>
        {/* Planet body */}
        <mesh>
          <sphereGeometry args={[9, lp ? 22 : 38, lp ? 14 : 24]} />
          <meshStandardMaterial
            color="#7b5ea7"
            emissive="#2a1040"
            emissiveIntensity={0.3}
            roughness={0.65}
            metalness={0.05}
          />
        </mesh>
        {/* Ring — flat torus tilted on X, two layers for richness */}
        <mesh rotation={[Math.PI / 2.2, 0, 0.25]}>
          <torusGeometry args={[15, 1.8, 3, lp ? 48 : 80]} />
          <meshBasicMaterial
            color="#c9a4e8"
            transparent
            opacity={0.55}
            toneMapped={false}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2.2, 0, 0.25]}>
          <torusGeometry args={[17.5, 0.9, 3, lp ? 40 : 64]} />
          <meshBasicMaterial
            color="#9d6fc4"
            transparent
            opacity={0.3}
            toneMapped={false}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* thin innermost ring */}
        <mesh rotation={[Math.PI / 2.2, 0, 0.25]}>
          <torusGeometry args={[12.5, 0.5, 3, lp ? 36 : 56]} />
          <meshBasicMaterial
            color="#ead6ff"
            transparent
            opacity={0.22}
            toneMapped={false}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* =========================================================
          RICH NEBULA — soft round additive point wisps
      ========================================================= */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={nebula.positions}
            count={nebula.count}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={nebula.colors}
            count={nebula.count}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          map={softTex}
          alphaMap={softTex}
          size={lp ? 5 : 7}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.38}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          alphaTest={0.01}
        />
      </points>

      {/* =========================================================
          ASTEROID BELT — low-poly icosahedrons, grey, drifting
      ========================================================= */}
      {asteroidData.map((d, i) => (
        <mesh
          key={`sw-rock-${i}`}
          ref={(el) => {
            if (!asteroidRefs.current[i]) asteroidRefs.current[i] = { current: null };
            asteroidRefs.current[i].current = el;
          }}
          position={d.pos}
          scale={d.scale}
        >
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#6b6b7a"
            roughness={0.9}
            metalness={0.05}
            flatShading
          />
        </mesh>
      ))}

      {/* Faint ambient glow from the nebula region */}
      <pointLight position={[0, 8, 570]} intensity={0.55} color="#8b5cf6" distance={200} decay={2} />
      <pointLight position={[0, 4, 610]} intensity={0.4}  color="#3b82f6" distance={180} decay={2} />

    </group>
  );
}


export function WorldTransition({ lowPowerMode = false, avatarRef }) {
  const BOUNDARIES = useMemo(() => [
    { z: 110, color: new THREE.Color('#22d3ee') }, // dawn->ocean : cyan
    { z: 200, color: new THREE.Color('#fbbf24') }, // ocean->desert : gold
    { z: 330, color: new THREE.Color('#ec4899') }, // desert->city : magenta
    { z: 460, color: new THREE.Color('#a855f7') }, // city->space : violet
  ], []);
  const INFLUENCE = 26;
  const RING_COUNT = lowPowerMode ? 9 : 16;
  const SWIRL = lowPowerMode ? 110 : 240;

  const ringGeo = useMemo(() => new THREE.TorusGeometry(5, 0.14, 8, 44), []);

  const grpRefs = useMemo(() => BOUNDARIES.map(() => ({ current: null })), []);
  const ringRefs = useMemo(() => BOUNDARIES.map(() => Array.from({ length: RING_COUNT }, () => ({ current: null }))), [RING_COUNT]);
  const flashRefs = useMemo(() => BOUNDARIES.map(() => ({ current: null })), []);
  const swirlGeoRefs = useMemo(() => BOUNDARIES.map(() => ({ current: null })), []);
  const swirlMatRefs = useMemo(() => BOUNDARIES.map(() => ({ current: null })), []);

  const swirlPos = useMemo(() => BOUNDARIES.map(() => new Float32Array(SWIRL * 3)), [SWIRL]);
  const swirlData = useMemo(() => BOUNDARIES.map(() => Array.from({ length: SWIRL }, () => ({
    angle: Math.random() * Math.PI * 2, radius: 6 + Math.random() * 28, speed: 0.6 + Math.random() * 2.2, z: (Math.random() - 0.5) * 34,
  }))), [SWIRL]);

  const clock = useRef(0);
  const veilRef = useRef();
  const ss = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

  useFrame((_, delta) => {
    clock.current += delta; const t = clock.current;
    const pos = avatarRef?.current?.position;
    const z = pos?.z ?? 0;
    let maxI = 0;
    for (let b = 0; b < BOUNDARIES.length; b++) {
      const bd = BOUNDARIES[b];
      const dist = Math.abs(z - bd.z);
      const intensity = dist < INFLUENCE ? ss(INFLUENCE, 0, dist) : 0;
      if (intensity > maxI) maxI = intensity;
      const grp = grpRefs[b].current; if (!grp) continue;
      grp.visible = intensity > 0.002;
      if (!grp.visible) continue;

      const rings = ringRefs[b];
      for (let i = 0; i < RING_COUNT; i++) {
        const m = rings[i].current; if (!m) continue;
        const f = i / (RING_COUNT - 1);
        m.position.z = (f - 0.5) * 40;                 // tunnel stretched along flight axis
        const bulge = 1 + Math.sin(f * Math.PI) * 0.45; // gentle wormhole bulge
        const sc = bulge * (0.65 + intensity * 0.7) * (1 + Math.sin(t * 5 + i) * 0.05);
        m.scale.setScalar(sc);
        m.rotation.z = t * (0.5 + i * 0.04) * (i % 2 ? 1 : -1); // spin in-plane only -> stays a tunnel
        if (m.material) {
          m.material.opacity = intensity * (0.65 + 0.35 * Math.sin(t * 7 + i));
          m.material.emissiveIntensity = 3 + intensity * 8;
        }
      }

      const fl = flashRefs[b].current;
      if (fl && fl.material) {
        fl.material.opacity = Math.pow(intensity, 2) * 0.38;
        const s = 1 + intensity * 3.5;
        fl.scale.setScalar(s);
      }

      const sm = swirlMatRefs[b].current;
      if (sm) sm.opacity = intensity * 0.6;
      const sg = swirlGeoRefs[b].current;
      if (sg) {
        const arr = sg.attributes.position.array;
        const data = swirlData[b];
        for (let i = 0; i < SWIRL; i++) {
          const d = data[i];
          d.angle += delta * d.speed * (1 + intensity * 6);
          const r = d.radius * (1 - intensity * 0.82);
          arr[i * 3] = Math.cos(d.angle) * r;
          arr[i * 3 + 1] = Math.sin(d.angle) * r;
          arr[i * 3 + 2] = d.z * (1 - intensity * 0.6);
        }
        sg.attributes.position.needsUpdate = true;
      }
    }

    // Darkening veil — seals you inside the portal so neither the next world
    // nor any project balloon is visible mid-transition. Follows the plane;
    // ramps opaque at the boundary, clears as you emerge. Rings/particles draw over it.
    if (veilRef.current && pos) {
      veilRef.current.position.set(pos.x, pos.y, pos.z);
      veilRef.current.visible = maxI > 0.01;
      veilRef.current.material.opacity = Math.min(0.96, maxI * 1.15);
    }
  });

  return (
    <group>
      {/* darkening veil (renderOrder 40): covers worlds + balloons, sits under the rings (50) */}
      <mesh ref={veilRef} renderOrder={40} visible={false}>
        <sphereGeometry args={[55, 16, 12]} />
        <meshBasicMaterial color="#04050b" side={THREE.BackSide} transparent opacity={0} depthTest={false} depthWrite={false} toneMapped={false} />
      </mesh>
      {BOUNDARIES.map((bd, b) => (
        <group key={b} ref={grpRefs[b]} position={[0, 0, bd.z]} visible={false}>
          {Array.from({ length: RING_COUNT }, (_, i) => (
            <mesh key={i} ref={ringRefs[b][i]} geometry={ringGeo} renderOrder={50}>
              <meshStandardMaterial color={bd.color} emissive={bd.color} emissiveIntensity={3} transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          ))}
          <mesh ref={flashRefs[b]} renderOrder={50}>
            <circleGeometry args={[6, 44]} />
            <meshBasicMaterial color={bd.color} transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <points renderOrder={51}>
            <bufferGeometry ref={swirlGeoRefs[b]}>
              <bufferAttribute attach="attributes-position" args={[swirlPos[b], 3]} />
            </bufferGeometry>
            <pointsMaterial ref={swirlMatRefs[b]} color={bd.color} size={lowPowerMode ? 0.34 : 0.26} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} sizeAttenuation />
          </points>
        </group>
      ))}
    </group>
  );
}


export default function Projects({ openIframe, contactPage, avatarRef, scoreElement, scoreValueRef, fireRef, lowPowerMode = false }) {
  // Records when each project balloon was shot, so it can pop its banner open
  const hitRef = useRef({});
  // ... existing code ...




  // Generate random cloud positions
  const cloudPositions = useMemo(() => {
    const pos = [];
    const cloudCount = lowPowerMode ? 10 : 20;
    for (let i = 0; i < cloudCount; i++) {
      pos.push({
        x: (Math.random() - 0.5) * 150,
        y: (Math.random() - 0.5) * 60 + 10,
        z: i * 25, // Spread along Z
        seed: i,
        opacity: 0.5 + Math.random() * 0.5
      });
    }
    return pos;
  }, [lowPowerMode]);

  // ... (previous logic for coins)

  const asteroidData = [
    {
      z: 148,
      url: "https://medicinal-plant-82aa9.web.app/", //1
      repoUrl: "https://github.com/Itz-mehanth/MedPlant",
      title: "MedPlant",
      description: "CNN-based plant identifier with medicinal insights.",
      type: "live"
    },
    {
      z: 162,
      url: "https://vplants.vercel.app", //2
      repoUrl: "https://github.com/Itz-mehanth/VRoom",
      title: "VRoom",
      description: "Immersive 3D exploration and gardening.",
      type: "live"
    },
    {
      z: 240,
      url: "https://retempla.xyz/", //3
      repoUrl: "https://github.com/Itz-mehanth/Retempla",
      title: "ReTempla",
      description: "SaaS for smart document formatting and personalization.",
      type: "live"
    },
    {
      z: 256,
      url: "https://streamtick.vercel.app", //4
      repoUrl: "https://github.com/Itz-mehanth/LiveStock",
      title: "LiveStock",
      description: "Real-time data pipeline for processing and visualizing stock data.",
      type: "live"
    },
    {
      z: 273,
      url: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7261266876800868355?collapsed=1", //5
      repoUrl: "https://github.com/Itz-mehanth/GalaxyStrike",
      title: "Galaxy Strike",
      description: "A retro-style 2D Java game built from scratch using Swing.",
      type: "linkedin"
    },
    {
      z: 290,
      repoUrl: "https://github.com/Itz-mehanth/FSDC-project",  //6
      title: "C Food Delivery App",
      description: "Food Delivery App Simulation using C Language.",
      type: "github"
    },
    {
      z: 368,
      url: "https://xcng.vercel.app",
      repoUrl: "https://github.com/Itz-mehanth/XCNG", //7
      title: "XCNG",
      description: "Real-time marketplace and community platform for campuses.",
      type: "live"
    },
    {
      z: 385,
      url: "https://crownofsovereigns.netlify.app",
      repoUrl: "https://github.com/Itz-mehanth/CrownOfSovereigns", //8
      title: "Crown of Sovereigns",
      description: "Stunning 3D strategy board game inspired by Carcassonne.",
      type: "live"
    },
    {
      z: 402,
      repoUrl: "https://github.com/Itz-mehanth/VSCE", //9
      title: "VSCE Extension",
      description: "VS Code extension for interactive 360-degree HDR visualization.",
      type: "github"
    },
    {
      z: 419,
      repoUrl: "https://github.com/Itz-mehanth/NPM-Package---R3F-Nav-Controls", //10
      title: "R3F Nav Controls",
      description: "React component library for controls in 3D scenes.",
      type: "github"
    },
    {
      z: 500,
      repoUrl: "https://github.com/Itz-mehanth/DBMS_Hospital_Management", //11
      title: "Hospital Management",
      description: "Robust desktop application for efficient healthcare management.",
      type: "github"
    },
    {
      z: 528,
      repoUrl: "https://github.com/Itz-mehanth/Aura-AI-Agent", //12
      title: "Aura AI Agent",
      description: "Voice-activated AI personal assistant leveraging advanced ML models.",
      type: "github"
    },
    {
      z: 556,
      url: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7298710253531971584?collapsed=1",
      repoUrl: "https://github.com/Itz-mehanth/LudoGameAR", //13
      title: "AR Ludo Game",
      description: "Augmented reality version of Ludo built with Unity and Vuforia.",
      type: "linkedin"
    },
    {
      z: 584,
      url: "https://ssntour.vercel.app", //14
      repoUrl: "https://github.com/Itz-mehanth/SSN_Tour",
      title: "SSN Tour",
      description: "Immersive 3D virtual tour of SSN College of Engineering.",
      type: "live"
    },
    {
      z: 612,
      url: "https://ariseedu.vercel.app", //15
      repoUrl: "https://github.com/Itz-mehanth/Arise_SIH2025",
      title: "Arise",
      description: "Gamified Learning Platform for Rural Education.",
      type: "live"
    },
    {
      z: 640,
      url: "https://gh9b.games.mehanth.site", //16
      repoUrl: "https://github.com/Itz-mehanth/GH9B",
      title: "GH9-B",
      description: "Immersive 3D survival horror experience built for the web.",
      type: "live"
    },
    {
      z: 668,
      repoUrl: "https://github.com/Itz-mehanth/3DWallpaper", //17
      title: "3D Wallpaper",
      description: "Meta Quest 3-style 3D desktop environment with window capture.",
      type: "github"
    }
  ];



  return (
    <group>
      <ProjectEnvironment avatarRef={avatarRef} lowPowerMode={lowPowerMode} />

      {/* Worlds the plane flies through */}
      <OceanWorld lowPowerMode={lowPowerMode} avatarRef={avatarRef} />
      <DesertWorld lowPowerMode={lowPowerMode} avatarRef={avatarRef} />
      <CityWorld lowPowerMode={lowPowerMode} avatarRef={avatarRef} />
      <SpaceWorld lowPowerMode={lowPowerMode} avatarRef={avatarRef} />
      <WorldTransition lowPowerMode={lowPowerMode} avatarRef={avatarRef} />


      {/* Clouds */}
      {/* Distributed Clouds */}
      <Clouds limit={lowPowerMode ? 160 : 320} material={THREE.MeshStandardMaterial}>
        {cloudPositions.map((cloud, i) => (
          <Cloud key={i} seed={cloud.seed} position={[cloud.x, cloud.y, cloud.z]} segments={lowPowerMode ? 10 : 18} bounds={[20, 4, 20]} volume={lowPowerMode ? 6 : 10} color="white" opacity={cloud.opacity} speed={0.2} />
        ))}
      </Clouds>

      {/* Coins */}
      <CoinField
        avatarRef={avatarRef}
        scoreValueRef={scoreValueRef}
        scoreElement={scoreElement}
        lowPowerMode={lowPowerMode}
      />



      {/* Smart TV Display */}
      <group position={[0, 5, -20]}>
        {/* TV Body - thin panel */}
        <mesh position={[0, 0, -0.15]}>
          <boxGeometry args={[17, 10.5, 0.25]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Screen bezel frame */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[16.4, 9.8]} />
          <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.4} />
        </mesh>

        {/* Screen - dark with content */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[15.6, 9.2]} />
          <meshStandardMaterial color="#0f0f1a" emissive="#0f0f1a" emissiveIntensity={0.3} />
        </mesh>

        {/* Screen content */}
        <Text
          fontSize={2.2}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
          position={[0, 2, 0.05]}
          font={undefined}
        >
          PROJECTS
        </Text>
        <Text
          fontSize={0.55}
          color="#a1a1aa"
          anchorX="center"
          anchorY="middle"
          position={[0, -0.5, 0.05]}
          maxWidth={12}
          textAlign="center"
        >
          Fly through and click Live Site to preview in any device
        </Text>

        {/* Screen glow */}
        <pointLight position={[0, 0, 2]} intensity={0.4} color="#fbbf24" distance={8} />

        {/* TV Stand - center neck */}
        <mesh position={[0, -5.8, -0.1]}>
          <boxGeometry args={[0.8, 1.2, 0.3]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* TV Stand - base */}
        <mesh position={[0, -6.5, 0.3]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[5, 0.15, 1.8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Brand logo dot */}
        <mesh position={[0, -4.6, 0.01]}>
          <circleGeometry args={[0.12, 16]} />
          <meshStandardMaterial color="#333" emissive="#fbbf24" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Asteroids */}
      {asteroidData.map((asteroid, index) => {
        let theme = 'platinum';
        if (index < 6) theme = 'diamond';
        else if (index < 12) theme = 'gold';

        return (
          <Asteroid
            key={index}
            index={index}
            avatarRef={avatarRef}
            hitRef={hitRef}
            openIframe={openIframe}
            iframeUrl={asteroid.url}
            repoUrl={asteroid.repoUrl}
            type={asteroid.type}
            theme={theme}
            position={[index % 2 === 0 ? 7 : -7, 0, asteroid.z]}
            title={asteroid.title}
            description={asteroid.description}
          />
        );
      })}

      {/* Blaster — shoot with "F" (or the mobile fire button); hitting a balloon opens its project */}
      <Blaster
        avatarRef={avatarRef}
        fireRef={fireRef}
        targets={asteroidData.map((a, i) => ({ x: i % 2 === 0 ? 7 : -7, y: 0, z: a.z }))}
        onHit={(k) => { hitRef.current[k] = performance.now(); }}
      />
    </group>
  )
}
