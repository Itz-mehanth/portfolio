// Ultron (Marvel Rivals style): dark segmented armor + sharp steel trim, a crown
// of blades, intense glowing red eyes, and fiery red/orange glow pulsing in the
// chest, shoulders and mouth. Watches your cursor; poke it and it lunges, drops
// its jaw and SHOUTS with synthesized robotic + laser SFX.
import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { playUltronShout } from './utils/sfx';

const lerp = (a, b, t) => a + (b - a) * t;

// ---- materials: dark armor, steel trim, fiery glow ----
const armor = { color: '#1b1f27', metalness: 0.92, roughness: 0.46 };
const armorLite = { color: '#2b313d', metalness: 0.9, roughness: 0.42 };
const trim = { color: '#8d94a1', metalness: 0.95, roughness: 0.3 };
const trimBright = { color: '#c2c8d2', metalness: 0.96, roughness: 0.22 };
const darkMetal = { color: '#0b0d12', metalness: 0.7, roughness: 0.7 };
const RED = '#ff2016';
const FIRE = '#ff5a12';
const redMat = (i = 2.4) => ({ color: '#360505', emissive: RED, emissiveIntensity: i, toneMapped: false });
const fireMat = (i = 1.6) => ({ color: '#3a1402', emissive: FIRE, emissiveIntensity: i, toneMapped: false });

function Ultron({ mouse, annoyedRef }) {
  const root = useRef();
  const head = useRef();
  const jaw = useRef();
  const eyeL = useRef();
  const eyeR = useRef();
  const pupilL = useRef();
  const pupilR = useRef();
  const cavity = useRef();
  const redLight = useRef();
  const chestCore = useRef();
  const shoulderGlow = useRef([]);
  const crownGlow = useRef();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const mx = mouse.current.x;
    const my = mouse.current.y;

    let a = 0;
    if (annoyedRef.current) {
      a = Math.max(0, 1 - (performance.now() - annoyedRef.current) / 1400);
      a = a * a;
    }

    if (head.current) {
      const yaw = mx * 0.6 + (a > 0 ? Math.sin(t * 46) * 0.17 * a : 0);
      const pitch = -my * 0.38 + (a > 0 ? Math.sin(t * 39) * 0.11 * a : 0);
      const k = a > 0 ? 20 : 6.5;
      head.current.rotation.y = lerp(head.current.rotation.y, yaw, Math.min(1, dt * k));
      head.current.rotation.x = lerp(head.current.rotation.x, pitch, Math.min(1, dt * k));
      head.current.rotation.z = lerp(head.current.rotation.z, a > 0 ? Math.sin(t * 53) * 0.09 * a : 0, 0.5);
    }
    if (jaw.current) {
      const open = a * 0.62 + (a > 0 ? Math.abs(Math.sin(t * 24)) * 0.12 * a : 0);
      jaw.current.rotation.x = lerp(jaw.current.rotation.x, open, Math.min(1, dt * 18));
    }
    if (root.current) {
      root.current.rotation.y = lerp(root.current.rotation.y, mx * 0.14, Math.min(1, dt * 4));
      root.current.position.z = lerp(root.current.position.z, a * 0.5, Math.min(1, dt * 14));
      root.current.scale.setScalar((1 + a * 0.1) * (1 + Math.sin(t * 1.4) * 0.006));
      root.current.position.y = -0.5 + Math.sin(t * 1.4) * 0.035;
    }

    const eyeI = 2.6 + a * 12 + Math.sin(t * 2) * 0.3;
    if (eyeL.current) eyeL.current.material.emissiveIntensity = eyeI;
    if (eyeR.current) eyeR.current.material.emissiveIntensity = eyeI;
    const px = mx * 0.03, py = my * 0.025;
    if (pupilL.current) { pupilL.current.position.x = -0.185 + px; pupilL.current.position.y = 0.12 + py; }
    if (pupilR.current) { pupilR.current.position.x = 0.185 + px; pupilR.current.position.y = 0.12 + py; }

    // fiery, breathing glow in chest/shoulders/crown; flares when enraged
    const fire = 1.3 + Math.sin(t * 2.4) * 0.4 + a * 4;
    if (chestCore.current) chestCore.current.material.emissiveIntensity = fire;
    shoulderGlow.current.forEach((m, i) => { if (m && m.material) m.material.emissiveIntensity = 1.1 + Math.sin(t * 2.4 + i * 1.7) * 0.5 + a * 3; });
    if (crownGlow.current) crownGlow.current.material.emissiveIntensity = 0.9 + Math.sin(t * 2) * 0.3 + a * 3;
    if (cavity.current) cavity.current.material.emissiveIntensity = 0.5 + a * 6 + Math.sin(t * 28) * a * 1.5;
    if (redLight.current) redLight.current.intensity = 0.35 + a * 3.4;
  });

  const upperTeeth = [-0.21, -0.14, -0.07, 0, 0.07, 0.14, 0.21];
  const rivets = [[-0.34, 0.46, 0.34], [0.34, 0.46, 0.34], [-0.43, 0.1, 0.16], [0.43, 0.1, 0.16], [-0.3, -0.18, 0.32], [0.3, -0.18, 0.32]];
  // crown blade fan (behind/above head)
  const crown = [-3, -2, -1, 0, 1, 2, 3];

  return (
    <group ref={root} position={[0, -0.5, 0]}>
      <mesh position={[0, -1.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.3, 40]} />
        <meshBasicMaterial color={RED} transparent opacity={0.13} toneMapped={false} />
      </mesh>
      <pointLight ref={redLight} position={[0, 0.7, 1.3]} color={FIRE} intensity={0.35} distance={9} decay={2} />

      {/* ── Torso (hunched, dark armor) ── */}
      <group position={[0, -0.62, 0]} rotation={[0.13, 0, 0]}>
        <RoundedBox args={[1.22, 1.2, 0.76]} radius={0.14} smoothness={4}>
          <meshStandardMaterial {...armor} />
        </RoundedBox>
        {/* layered chest plates */}
        <mesh position={[0, 0.24, 0.4]} rotation={[0.1, 0, 0]}><boxGeometry args={[0.94, 0.46, 0.12]} /><meshStandardMaterial {...armorLite} /></mesh>
        <mesh position={[0, 0.24, 0.47]} rotation={[0.1, 0, 0]}><boxGeometry args={[0.5, 0.3, 0.06]} /><meshStandardMaterial {...trim} /></mesh>
        {/* fiery chest core */}
        <mesh ref={chestCore} position={[0, -0.02, 0.46]}><cylinderGeometry args={[0.15, 0.15, 0.12, 6]} /><meshStandardMaterial {...fireMat()} /></mesh>
        <mesh position={[0, -0.02, 0.44]}><torusGeometry args={[0.21, 0.045, 6, 18]} /><meshStandardMaterial {...trim} /></mesh>
        {/* glowing rib vents */}
        {[-1, 1].map((s) => [0, 1, 2].map((i) => (
          <mesh key={`${s}-${i}`} position={[s * (0.18 + i * 0.0), -0.18 - i * 0.12, 0.42]} rotation={[0, 0, s * 0.2]}>
            <boxGeometry args={[0.34, 0.03, 0.05]} /><meshStandardMaterial {...fireMat(1.0)} />
          </mesh>
        )))}
        {/* shoulder pauldrons with fiery glow seam */}
        {[-1, 1].map((s, si) => (
          <group key={s} position={[s * 0.78, 0.52, 0]} rotation={[0, 0, s * -0.34]}>
            <mesh><coneGeometry args={[0.36, 0.54, 4]} /><meshStandardMaterial {...armorLite} flatShading /></mesh>
            <mesh position={[0, 0, 0.18]}><coneGeometry args={[0.2, 0.3, 4]} /><meshStandardMaterial {...trim} flatShading /></mesh>
            <mesh ref={(el) => { shoulderGlow.current[si] = el; }} position={[0, -0.04, 0.22]}><boxGeometry args={[0.1, 0.2, 0.05]} /><meshStandardMaterial {...fireMat(1.1)} /></mesh>
            <mesh position={[s * 0.1, -0.46, 0]} rotation={[0, 0, s * 0.2]}><capsuleGeometry args={[0.15, 0.5, 4, 8]} /><meshStandardMaterial {...armor} /></mesh>
            <mesh position={[s * 0.24, -0.84, 0.05]}><boxGeometry args={[0.22, 0.26, 0.26]} /><meshStandardMaterial {...armorLite} flatShading /></mesh>
          </group>
        ))}
        <mesh position={[0, -0.55, 0.28]}><boxGeometry args={[0.68, 0.3, 0.4]} /><meshStandardMaterial {...darkMetal} /></mesh>
      </group>

      {/* ── Neck ── */}
      <mesh position={[0, 0.14, -0.02]}><cylinderGeometry args={[0.16, 0.21, 0.32, 12]} /><meshStandardMaterial {...darkMetal} /></mesh>
      <mesh position={[0, 0.04, -0.02]}><torusGeometry args={[0.19, 0.045, 6, 16]} /><meshStandardMaterial {...trim} /></mesh>
      <mesh position={[0, 0.22, -0.02]}><torusGeometry args={[0.16, 0.035, 6, 16]} /><meshStandardMaterial {...armorLite} /></mesh>

      {/* ════════ HEAD — sculpted from smooth curved volumes ════════ */}
      <group ref={head} position={[0, 0.62, 0]}>

        {/* ── crown of blades (behind/above) ── */}
        <group position={[0, 0.52, -0.22]}>
          <mesh ref={crownGlow} position={[0, 0.02, 0.08]}><boxGeometry args={[0.62, 0.05, 0.04]} /><meshStandardMaterial {...fireMat(0.9)} /></mesh>
          {crown.map((i) => {
            const h = 0.46 - Math.abs(i) * 0.06;
            return (
              <mesh key={i} position={[i * 0.11, h / 2, -Math.abs(i) * 0.03]} rotation={[-0.55, 0, i * 0.15]}>
                <coneGeometry args={[0.045, h, 4]} />
                <meshStandardMaterial {...(Math.abs(i) % 2 === 0 ? trim : armorLite)} flatShading />
              </mesh>
            );
          })}
        </group>

        {/* ── smooth ovoid skull (the head volume) ── */}
        <mesh position={[0, 0.2, -0.08]} scale={[0.86, 1.02, 0.96]}>
          <sphereGeometry args={[0.6, 48, 40]} />
          <meshStandardMaterial {...armorLite} />
        </mesh>
        {/* darker rear skull for depth */}
        <mesh position={[0, 0.26, -0.34]} scale={[0.82, 0.92, 0.72]}>
          <sphereGeometry args={[0.56, 36, 28]} />
          <meshStandardMaterial {...armor} />
        </mesh>
        {/* smooth forehead crest plate following the curve */}
        <mesh position={[0, 0.5, 0.18]} scale={[0.5, 0.7, 0.6]} rotation={[0.3, 0, 0]}>
          <sphereGeometry args={[0.4, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial {...armor} />
        </mesh>
        {/* central forehead seam */}
        <mesh position={[0, 0.46, 0.45]} rotation={[0.42, 0, 0]}><capsuleGeometry args={[0.02, 0.3, 4, 8]} /><meshStandardMaterial {...trim} /></mesh>

        {/* ── brow ridges (smooth ellipsoids, angled angry) ── */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.18, 0.26, 0.44]} rotation={[0.1, 0, s * 0.34]} scale={[1.25, 0.4, 0.5]}>
            <sphereGeometry args={[0.18, 20, 14]} />
            <meshStandardMaterial {...armorLite} />
          </mesh>
        ))}
        {/* furrow between brows */}
        <mesh position={[0, 0.3, 0.5]} scale={[0.5, 1, 0.6]}><sphereGeometry args={[0.05, 12, 10]} /><meshStandardMaterial {...darkMetal} /></mesh>

        {/* ── EYES — recessed smooth sockets, red lenses ── */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.185, 0.11, 0.42]} rotation={[0, 0, s * 0.28]}>
            {/* smooth recessed socket */}
            <mesh position={[0, 0, -0.04]} scale={[1.4, 1, 0.7]}><sphereGeometry args={[0.13, 24, 18]} /><meshStandardMaterial {...darkMetal} /></mesh>
            {/* lens ring */}
            <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]} scale={[1.25, 1, 1]}><torusGeometry args={[0.095, 0.022, 10, 24]} /><meshStandardMaterial {...trim} /></mesh>
            {/* glowing red lens */}
            <mesh ref={s === -1 ? eyeL : eyeR} position={[0, 0, 0.05]} scale={[1.3, 1, 0.7]}><sphereGeometry args={[0.08, 22, 18]} /><meshStandardMaterial {...redMat()} /></mesh>
          </group>
        ))}
        <mesh ref={pupilL} position={[-0.185, 0.11, 0.49]}><sphereGeometry args={[0.028, 12, 10]} /><meshStandardMaterial color="#fff3f0" emissive="#ff8a80" emissiveIntensity={4} toneMapped={false} /></mesh>
        <mesh ref={pupilR} position={[0.185, 0.11, 0.49]}><sphereGeometry args={[0.028, 12, 10]} /><meshStandardMaterial color="#fff3f0" emissive="#ff8a80" emissiveIntensity={4} toneMapped={false} /></mesh>

        {/* ── smooth nose ridge + nostril vents ── */}
        <mesh position={[0, 0.0, 0.5]} rotation={[-0.18, 0, 0]} scale={[0.7, 1, 0.9]}>
          <capsuleGeometry args={[0.055, 0.22, 8, 14]} />
          <meshStandardMaterial {...armorLite} />
        </mesh>
        <mesh position={[0, 0.13, 0.52]} scale={[0.8, 0.7, 0.7]}><sphereGeometry args={[0.07, 16, 12]} /><meshStandardMaterial {...armorLite} /></mesh>
        {[-0.045, 0.045].map((x, i) => (
          <mesh key={i} position={[x, -0.13, 0.54]} scale={[0.7, 1.2, 0.6]}><sphereGeometry args={[0.022, 10, 8]} /><meshStandardMaterial {...darkMetal} /></mesh>
        ))}

        {/* ── smooth cheekbones ── */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.31, -0.07, 0.34]} rotation={[0, s * 0.3, 0]} scale={[1, 1.15, 0.85]}>
            <sphereGeometry args={[0.19, 24, 18]} />
            <meshStandardMaterial {...armorLite} />
          </mesh>
        ))}
        {/* subtle cheek vents */}
        {[-1, 1].map((s) => [-0.05, 0.04].map((yy, i) => (
          <mesh key={`${s}-${i}`} position={[s * 0.34, -0.1 + yy, 0.46]} rotation={[0, s * 0.3, 0]}><boxGeometry args={[0.12, 0.018, 0.02]} /><meshStandardMaterial {...darkMetal} /></mesh>
        )))}

        {/* battle damage scar */}
        <mesh position={[0.34, 0.04, 0.46]} rotation={[0, 0.3, 0.6]}><capsuleGeometry args={[0.012, 0.2, 4, 8]} /><meshStandardMaterial {...darkMetal} /></mesh>

        {/* ── upper mouth: glowing cavity + smooth lip + teeth ── */}
        <mesh ref={cavity} position={[0, -0.32, 0.36]} scale={[1, 1, 0.8]}><sphereGeometry args={[0.24, 24, 18]} /><meshStandardMaterial {...fireMat(0.5)} /></mesh>
        {/* upper lip (smooth curved band) */}
        <mesh position={[0, -0.19, 0.46]} rotation={[0.2, 0, 0]} scale={[1.5, 0.45, 0.8]}><sphereGeometry args={[0.2, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} /><meshStandardMaterial {...armorLite} /></mesh>
        {upperTeeth.map((x, i) => {
          const h = 0.11 - Math.abs(i - 3) * 0.01;
          return <mesh key={i} position={[x, -0.25, 0.47]} rotation={[0, 0, x * 0.4]}><boxGeometry args={[0.04, h, 0.05]} /><meshStandardMaterial {...trimBright} /></mesh>;
        })}

        {/* ── smooth hinged jaw / chin ── */}
        <group ref={jaw} position={[0, -0.22, 0.04]}>
          {/* rounded jaw volume */}
          <mesh position={[0, -0.16, 0.18]} rotation={[0.15, 0, 0]} scale={[0.92, 0.78, 0.95]}>
            <sphereGeometry args={[0.34, 32, 24, 0, Math.PI * 2, Math.PI * 0.32, Math.PI * 0.68]} />
            <meshStandardMaterial {...armorLite} />
          </mesh>
          {/* chin pad */}
          <mesh position={[0, -0.34, 0.26]} scale={[0.8, 0.8, 0.9]}><sphereGeometry args={[0.16, 24, 18]} /><meshStandardMaterial {...armor} /></mesh>
          {/* lower lip */}
          <mesh position={[0, -0.12, 0.34]} rotation={[-0.2, 0, 0]} scale={[1.4, 0.4, 0.7]}><sphereGeometry args={[0.18, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} /><meshStandardMaterial {...armorLite} /></mesh>
          {/* lower teeth */}
          {upperTeeth.map((x, i) => {
            const h = 0.1 - Math.abs(i - 3) * 0.01;
            return <mesh key={i} position={[x, -0.07, 0.32]} rotation={[0, 0, x * 0.4]}><boxGeometry args={[0.04, h, 0.05]} /><meshStandardMaterial {...trimBright} /></mesh>;
          })}
        </group>

        {/* ── smooth ear housings with red sensor ── */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.48, 0.08, -0.04]} rotation={[0, s * Math.PI / 2, 0]}>
            <mesh scale={[1, 1.2, 1]}><sphereGeometry args={[0.15, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} /><meshStandardMaterial {...armor} /></mesh>
            <mesh position={[0, 0, 0.04]}><cylinderGeometry args={[0.1, 0.1, 0.05, 18]} /><meshStandardMaterial {...trim} /></mesh>
            <mesh position={[0, 0, 0.08]}><sphereGeometry args={[0.04, 12, 10]} /><meshStandardMaterial {...redMat(1.4)} /></mesh>
          </group>
        ))}

        {/* neck cables */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.3, -0.46, 0.0]} rotation={[0.3, 0, s * 0.15]}><capsuleGeometry args={[0.035, 0.36, 6, 10]} /><meshStandardMaterial {...darkMetal} /></mesh>
        ))}
      </group>
    </group>
  );
}

export default function ContactCharacter({ onEnrage, lowPowerMode = false }) {
  const mouse = useRef({ x: 0, y: 0 });
  const annoyed = useRef(0);
  const [glKey, setGlKey] = useState(0);
  const handleGlCreated = ({ gl }) => {
    gl.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      setTimeout(() => setGlKey((k) => k + 1), 450);
    });
  };

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const enrage = () => {
    annoyed.current = performance.now();
    playUltronShout();
    if (onEnrage) onEnrage();
  };

  return (
    <div onPointerDown={enrage} style={{ width: '100%', height: '100%', cursor: 'pointer' }} title="Poke him… if you dare">
      <Canvas
        key={glKey}
        onCreated={handleGlCreated}
        dpr={lowPowerMode ? [0.75, 1] : [1, 1.5]}
        camera={{ position: [0, 0.08, 4.2], fov: 40 }}
        gl={{ alpha: true, antialias: !lowPowerMode, powerPreference: lowPowerMode ? 'default' : 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.45} color="#cdd6e6" />
        {/* key */}
        <directionalLight position={[3, 5, 4]} intensity={1.3} color="#ffffff" />
        {/* cool rim from upper-back to edge-light the dark armor */}
        <directionalLight position={[-2, 4, -4]} intensity={1.1} color="#9db8e6" />
        <directionalLight position={[4, 1, -3]} intensity={0.8} color="#cbd5e1" />
        {/* warm fiery underglow */}
        <pointLight position={[0, -0.5, 2.5]} intensity={0.6} color={FIRE} distance={9} />
        <Ultron mouse={mouse} annoyedRef={annoyed} />
      </Canvas>
    </div>
  );
}
