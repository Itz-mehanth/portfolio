// Blaster.jsx — lets the plane shoot glowing energy bolts (key "F" or the mobile
// fire button). Bolts streak forward; hitting a project balloon spawns a burst
// and a hit blip. Pure pooled meshes (no per-shot allocation, no extra lights).
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playLaser, playHit } from './utils/sfx';

const MAX_BOLTS = 30;
const MAX_BURSTS = 14;
const BOLT_SPEED = 150;   // units/sec forward (+Z)
const BOLT_LIFE = 2.4;    // seconds
const COOLDOWN = 0.15;    // seconds between shots

export default function Blaster({ avatarRef, fireRef, targets = [], onHit }) {
  const boltMeshes = useRef([]);
  const burstMeshes = useRef([]);

  const bolts = useMemo(
    () => Array.from({ length: MAX_BOLTS }, () => ({ active: false, life: 0 })),
    []
  );
  const bursts = useMemo(
    () => Array.from({ length: MAX_BURSTS }, () => ({ active: false, life: 0 })),
    []
  );

  const nextBolt = useRef(0);
  const nextBurst = useRef(0);
  const cooldown = useRef(0);
  const firingKey = useRef(false);

  // Desktop: hold "F" to fire
  useEffect(() => {
    const down = (e) => { if (e.code === 'KeyF') firingKey.current = true; };
    const up = (e) => { if (e.code === 'KeyF') firingKey.current = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const spawnBurst = (x, y, z, scale = 1) => {
    const i = nextBurst.current % MAX_BURSTS;
    nextBurst.current++;
    const b = bursts[i];
    b.active = true;
    b.life = 0.28;
    b.maxScale = 3.2 * scale;
    const m = burstMeshes.current[i];
    if (m) {
      m.position.set(x, y, z);
      m.scale.setScalar(0.4 * scale);
      m.visible = true;
      if (m.material) m.material.opacity = 0.9;
    }
  };

  const spawnBolt = (px, py, pz, dx) => {
    const i = nextBolt.current % MAX_BOLTS;
    nextBolt.current++;
    const b = bolts[i];
    b.active = true;
    b.life = BOLT_LIFE;
    const m = boltMeshes.current[i];
    if (m) {
      m.position.set(px + dx, py - 0.3, pz + 3);
      m.visible = true;
    }
  };

  const fire = () => {
    const p = avatarRef?.current?.position;
    if (!p) return;
    playLaser();
    spawnBolt(p.x, p.y, p.z, -1.5);
    spawnBolt(p.x, p.y, p.z, 1.5);
    // muzzle flash at the nose
    spawnBurst(p.x, p.y - 0.2, p.z + 4, 0.5);
  };

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    cooldown.current -= dt;

    const wantFire = firingKey.current || (fireRef && fireRef.current);
    if (wantFire && cooldown.current <= 0) {
      fire();
      cooldown.current = COOLDOWN;
    }

    // Advance bolts
    for (let i = 0; i < MAX_BOLTS; i++) {
      const b = bolts[i];
      const m = boltMeshes.current[i];
      if (!m) continue;
      if (!b.active) { if (m.visible) m.visible = false; continue; }
      b.life -= dt;
      m.position.z += BOLT_SPEED * dt;
      if (b.life <= 0) { b.active = false; m.visible = false; continue; }
      // Hit test against project balloons
      for (let k = 0; k < targets.length; k++) {
        const tg = targets[k];
        if (
          Math.abs(m.position.z - tg.z) < 3.2 &&
          Math.abs(m.position.x - tg.x) < 3.2 &&
          Math.abs(m.position.y - tg.y) < 3.5
        ) {
          b.active = false;
          m.visible = false;
          spawnBurst(m.position.x, m.position.y, m.position.z, 1);
          playHit();
          if (onHit) onHit(k);
          break;
        }
      }
    }

    // Animate bursts (expand + fade)
    for (let i = 0; i < MAX_BURSTS; i++) {
      const bu = bursts[i];
      const m = burstMeshes.current[i];
      if (!m) continue;
      if (!bu.active) { if (m.visible) m.visible = false; continue; }
      bu.life -= dt;
      const k = Math.max(0, bu.life / 0.28); // 1 -> 0
      m.scale.setScalar(0.4 + (1 - k) * (bu.maxScale || 3.2));
      if (m.material) m.material.opacity = k * 0.9;
      if (bu.life <= 0) { bu.active = false; m.visible = false; }
    }
  });

  return (
    <group>
      {/* Bolt pool — elongated glowing cyan capsules along +Z */}
      {Array.from({ length: MAX_BOLTS }, (_, i) => (
        <group
          key={`bolt${i}`}
          ref={(el) => { boltMeshes.current[i] = el; }}
          visible={false}
        >
          {/* bright core */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.12, 2.2, 4, 8]} />
            <meshBasicMaterial color="#eaffff" toneMapped={false} />
          </mesh>
          {/* outer glow */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.32, 2.6, 4, 8]} />
            <meshBasicMaterial color="#27e0ff" toneMapped={false} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      ))}

      {/* Burst pool — additive flash spheres */}
      {Array.from({ length: MAX_BURSTS }, (_, i) => (
        <mesh
          key={`burst${i}`}
          ref={(el) => { burstMeshes.current[i] = el; }}
          visible={false}
        >
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color="#9af6ff" toneMapped={false} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
