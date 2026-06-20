// Asteroid.jsx — a project "checkpoint": a balloon marker that opens a styled
// description card when the plane flies near it, and shows a pulsing ring +
// floating title when far so it's easy to spot among the busy worlds.
import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Balloon } from './utils/models/Balloon';

export default function Asteroid({
  position = [0, 0, 150],
  index = 0,
  avatarRef,
  hitRef,
  openIframe,
  iframeUrl,
  repoUrl,
  title,
  description,
  type = 'live',
  theme = 'platinum',
}) {
  // Random balloon look (stable per-mount)
  const balloonProps = useMemo(() => {
    const thickColors = ['#FFD700', '#FF4444', '#FF8C00', '#32CD32', '#FF69B4', '#4169E1'];
    const randomColor = thickColors[Math.floor(Math.random() * thickColors.length)];
    return {
      rotation: [
        (Math.random() - 0.5) * 0.5,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.3,
      ],
      balloonColor: new THREE.Color(randomColor),
    };
  }, []);

  const [hovered, setHovered] = useState({ live: false, repo: false });

  // Neon accent per theme
  const themeColors = {
    diamond: '#22d3ee', // cyan
    gold: '#fbbf24',    // amber
    platinum: '#a78bfa', // violet
  };
  const accent = themeColors[theme] || themeColors.platinum;

  const side = position[0] < 0 ? -1 : 1;

  // Animation refs
  const rootRef = useRef();
  const cardRef = useRef();
  const ringRef = useRef();
  const ring2Ref = useRef();
  const markerRef = useRef();
  const beaconRef = useRef();
  const haloRef = useRef();
  const open = useRef(0); // 0 = closed (far), 1 = open (near)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    // Proximity to the plane (mostly along the flight axis Z)
    let target = 0;
    const p = avatarRef?.current?.position;
    if (p) {
      const dz = Math.abs(p.z - position[2]);
      // fully open within ~8 units, closed beyond ~34
      target = 1 - Math.min(1, Math.max(0, (dz - 8) / 26));
    }
    // Shooting the balloon pops its banner open for a few seconds
    const hitT = hitRef?.current?.[index];
    if (hitT && performance.now() - hitT < 4000) target = 1;
    open.current += (target - open.current) * Math.min(1, dt * 6);
    const o = open.current;
    const closed = 1 - o;

    // Card grows open
    if (cardRef.current) {
      const s = 0.0001 + o;
      cardRef.current.scale.setScalar(s);
      cardRef.current.visible = o > 0.02;
    }
    // Pulsing checkpoint rings (visible when far)
    if (ringRef.current) {
      ringRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.12);
      ringRef.current.material.opacity = closed * 0.9;
      ringRef.current.visible = closed > 0.03;
    }
    if (ring2Ref.current) {
      ring2Ref.current.scale.setScalar(1.35 + Math.sin(t * 3 + 1.2) * 0.18);
      ring2Ref.current.material.opacity = closed * 0.45;
      ring2Ref.current.visible = closed > 0.03;
    }
    // Floating title marker (visible when far)
    if (markerRef.current) {
      markerRef.current.visible = closed > 0.08;
      markerRef.current.position.y = 3.0 + Math.sin(t * 1.6 + index) * 0.18;
    }
    // Beacon pillar — always pulsing so the project is unmistakable
    if (beaconRef.current) {
      beaconRef.current.material.opacity = 0.18 + 0.12 * (0.5 + 0.5 * Math.sin(t * 2.2 + index));
    }
    if (haloRef.current) {
      const hp = 1 + 0.08 * Math.sin(t * 2.6 + index);
      haloRef.current.scale.setScalar(hp);
    }
  });

  // ── Reusable action button ──
  const Button = ({ label, onClick, xPos, isRepo }) => {
    const isHovered = isRepo ? hovered.repo : hovered.live;
    return (
      <group
        position={[xPos, -1.25, 0.2]}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered((p) => ({ ...p, [isRepo ? 'repo' : 'live']: true })); }}
        onPointerOut={() => { document.body.style.cursor = 'default'; setHovered((p) => ({ ...p, [isRepo ? 'repo' : 'live']: false })); }}
        onClick={onClick}
      >
        <RoundedBox args={[2.5, 0.72, 0.06]} radius={0.36} smoothness={4} renderOrder={15}>
          <meshBasicMaterial
            color={isRepo
              ? (isHovered ? '#475569' : '#334155')
              : (isHovered ? '#3b82f6' : '#2563eb')}
            toneMapped={false}
           
          />
        </RoundedBox>
        {!isRepo && (
          <RoundedBox args={[2.62, 0.84, 0.04]} radius={0.4} position={[0, 0, -0.03]} renderOrder={14}>
            <meshBasicMaterial color={accent} transparent opacity={isHovered ? 0.9 : 0.55} toneMapped={false} />
          </RoundedBox>
        )}
        <Text position={[0, 0, 0.09]} fontSize={0.26} fontWeight={700} color="white" anchorX="center" anchorY="middle" renderOrder={16}>
          {label}
        </Text>
      </group>
    );
  };

  const hasLive = !!iframeUrl;
  const hasRepo = !!repoUrl;
  const typeLabel = type === 'github' ? 'OPEN SOURCE' : type === 'linkedin' ? 'SHOWCASE' : 'LIVE PROJECT';

  return (
    <group ref={rootRef} position={position}>
      {/* Balloon */}
      <Balloon rotation={balloonProps.rotation} balloonColor={balloonProps.balloonColor} scale={0.95} />

      {/* Beacon pillar — a vertical column of light so the project reads as a
          point of interest from across any world. renderOrder high so it cuts
          through wormhole particles instead of being washed out by them. */}
      <mesh ref={beaconRef} position={[0, -2, 0]} renderOrder={8}>
        <cylinderGeometry args={[0.55, 0.9, 34, 12, 1, true]} />
        <meshBasicMaterial color={accent} transparent opacity={0.22} toneMapped={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Soft halo glow behind the balloon */}
      <Billboard position={[0, 0.4, 0]} follow>
        <mesh ref={haloRef} renderOrder={8}>
          <circleGeometry args={[2.6, 32]} />
          <meshBasicMaterial color={accent} transparent opacity={0.18} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </Billboard>

      {/* ── Checkpoint marker (shown when far) ── */}
      <Billboard position={[0, 0, 0]} follow lockX={false} lockY={false} lockZ={false}>
        {/* Glowing locator rings around the balloon */}
        <mesh ref={ringRef} renderOrder={9}>
          <ringGeometry args={[2.3, 2.6, 48]} />
          <meshBasicMaterial color={accent} transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh ref={ring2Ref} renderOrder={9}>
          <ringGeometry args={[2.75, 2.9, 48]} />
          <meshBasicMaterial color={accent} transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {/* Floating name plate with a clear "PROJECT" eyebrow.
            High renderOrder → drawn after the wormhole particles so it stays readable mid-portal. */}
        <group ref={markerRef} position={[0, 3.0, 0]}>
          {(() => {
            const w = Math.max(3.0, (title?.length || 8) * 0.3 + 1.2);
            return (
              <>
                {/* accent glow backing */}
                <RoundedBox args={[w + 0.18, 1.5, 0.04]} radius={0.26} position={[0, 0, -0.05]} renderOrder={18}>
                  <meshBasicMaterial color={accent} transparent opacity={0.7} toneMapped={false} />
                </RoundedBox>
                {/* dark plate */}
                <RoundedBox args={[w, 1.32, 0.08]} radius={0.22} smoothness={4} renderOrder={19}>
                  <meshBasicMaterial color="#0b1220" transparent opacity={0.96} toneMapped={false} />
                </RoundedBox>
                {/* eyebrow */}
                <Text position={[0, 0.36, 0.08]} fontSize={0.22} fontWeight={800} color={accent} anchorX="center" anchorY="middle" letterSpacing={0.18} renderOrder={20} material-toneMapped={false}>
                  ◆ PROJECT
                </Text>
                {/* title */}
                <Text position={[0, -0.18, 0.08]} fontSize={0.4} fontWeight={700} color="#ffffff" anchorX="center" anchorY="middle" maxWidth={w - 0.4} renderOrder={20} material-toneMapped={false}>
                  {title || 'Project'}
                </Text>
                {/* downward pointer toward the balloon */}
                <mesh position={[0, -1.05, 0]} rotation={[0, 0, Math.PI]} renderOrder={19}>
                  <coneGeometry args={[0.22, 0.5, 4]} />
                  <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.9} />
                </mesh>
              </>
            );
          })()}
        </group>
      </Billboard>

      {/* ── Expanded description card (opens when near) ── */}
      <Billboard position={[side * 4.6, -2.4, 0]} follow lockX={false} lockY={false} lockZ={false}>
        <group ref={cardRef} scale={0.0001}>
          {/* Outer neon glow plate */}
          <RoundedBox args={[6.5, 4.5, 0.04]} radius={0.3} smoothness={4} position={[0, 0, -0.06]} renderOrder={12}>
            <meshBasicMaterial color={accent} transparent opacity={0.55} toneMapped={false} />
          </RoundedBox>
          {/* Dark glass body (high contrast) */}
          <RoundedBox args={[6.2, 4.2, 0.14]} radius={0.26} smoothness={4} renderOrder={13}>
            <meshStandardMaterial color="#0b1220" metalness={0.35} roughness={0.45} transparent opacity={0.98} />
          </RoundedBox>

          {/* Accent header bar */}
          <mesh position={[0, 1.55, 0.1]} renderOrder={14}>
            <planeGeometry args={[6.2, 0.12]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>
          {/* Type badge */}
          <group position={[-2.0, 1.92, 0.12]}>
            <RoundedBox args={[2.0, 0.46, 0.04]} radius={0.18} smoothness={3} renderOrder={14}>
              <meshBasicMaterial color={accent} toneMapped={false} />
            </RoundedBox>
            <Text position={[0, 0, 0.05]} fontSize={0.2} fontWeight={800} color="#0b1220" anchorX="center" anchorY="middle" letterSpacing={0.05} renderOrder={16}>
              {typeLabel}
            </Text>
          </group>

          {/* Title */}
          <Text position={[-2.85, 1.15, 0.12]} fontSize={0.46} color="#ffffff" anchorX="left" anchorY="top" fontWeight={800} maxWidth={5.6} lineHeight={1.05} renderOrder={16}>
            {title || 'Project Title'}
          </Text>

          {/* Description */}
          <Text position={[-2.85, 0.2, 0.12]} fontSize={0.26} color="#cbd5e1" maxWidth={5.6} lineHeight={1.45} anchorX="left" anchorY="top" fontWeight={400} renderOrder={16}>
            {description || 'Project description goes here.'}
          </Text>

          {/* Buttons */}
          {hasLive && hasRepo ? (
            <>
              <Button label="View Code" onClick={() => window.open(repoUrl, '_blank')} xPos={-1.45} isRepo />
              <Button
                label={type === 'linkedin' ? 'View Post' : 'Visit Live'}
                onClick={() => { type === 'live' ? openIframe(iframeUrl) : window.open(iframeUrl, '_blank'); }}
                xPos={1.45}
                isRepo={false}
              />
            </>
          ) : hasLive ? (
            <Button
              label={type === 'github' ? 'View Code' : type === 'linkedin' ? 'View Post' : 'Visit Live'}
              onClick={() => { type === 'live' ? openIframe(iframeUrl) : window.open(iframeUrl, '_blank'); }}
              xPos={0}
              isRepo={false}
            />
          ) : hasRepo ? (
            <Button label="View Code" onClick={() => window.open(repoUrl, '_blank')} xPos={0} isRepo />
          ) : null}
        </group>
      </Billboard>
    </group>
  );
}
