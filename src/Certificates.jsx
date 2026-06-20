import { ExternalLink, Trophy, Award, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Responsive camera — pulls back on narrow screens so the whole 3D model
// always fits horizontally regardless of device aspect ratio.
function FitCamera({ targetWidth, targetHeight, posY = 0, fov = 45, margin = 1.08 }) {
  const { size } = useThree();
  const z = useMemo(() => {
    const aspect = (size.width || 1) / (size.height || 1);
    const vFov = (fov * Math.PI) / 180;
    const distForHeight = (targetHeight / 2) / Math.tan(vFov / 2);
    const hHalf = Math.atan(Math.tan(vFov / 2) * aspect);
    const distForWidth = (targetWidth / 2) / Math.tan(hHalf);
    return Math.max(distForHeight, distForWidth) * margin;
  }, [size.width, size.height, targetWidth, targetHeight, fov, margin]);

  return <PerspectiveCamera makeDefault position={[0, posY, z]} fov={fov} />;
}

const hackathonPages = [
  { title: "Data Sprint 3.0", venue: "Sri Sairam Engineering College", date: "2026", badge: "1st Place", story: "Won the hackathon on my birthday. 40+ teams sang happy birthday at midnight." },
  { title: "TechathonX 2026", venue: "Prathyusha Engineering College", date: "2026", badge: "Best Performance", story: "Powered by pure sleep deprivation. Last-minute ideas actually work." },
  { title: "Impact Nexus", venue: "SSN College of Engineering", date: "2026", badge: "Winner", story: "Won at our own college with an Agentic Ads Platform." },
];

const certPages = [
  { title: "Top 1% NPTEL C++", issuer: "NPTEL", date: "2024", score: "92%", story: "Top 1 percentile nationally. Weeks of grind.", url: "https://drive.google.com/file/d/1Dc06pz6NxOhE7vkxdaQvb31Cw6UYX-sh/view?usp=sharing" },
  { title: "Top 5% Competitive Programming", issuer: "NPTEL", date: "2024", score: "85%", story: "Algorithms and data structures mastery.", url: "https://drive.google.com/file/d/1jfdlSOyMnJAaJryDomnqpMPpksZzx7QV/view?usp=sharing" },
  { title: "UI/UX Design Figma", issuer: "Cybernaut", date: "2024", score: "Certified", story: "Bridging developers and designers.", url: "https://drive.google.com/file/d/1lSmxFqJepnsuDZl7FMHyx74-gEsETpmw/view?usp=sharing" },
];

// Single animated page that lerps its rotation
function Page({ index, currentPage, onClick }) {
  const meshRef = useRef();
  const targetAngle = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const isFlipped = index < currentPage;
    targetAngle.current = isFlipped ? -Math.PI * 0.92 : 0;
    // Smooth slow flip
    meshRef.current.rotation.y += (targetAngle.current - meshRef.current.rotation.y) * delta * 2.5;
  });

  return (
    <group position={[-1.45, 0, 0.02 + index * 0.012]}>
      <mesh
        ref={meshRef}
        position={[1.45, 0, 0]}
        onClick={onClick}
        castShadow
      >
        <boxGeometry args={[2.8, 3.8, 0.008]} />
        <meshStandardMaterial
          color={index === currentPage ? '#fffdf5' : '#f8f4ec'}
          roughness={0.95}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// 3D Book with smooth page flips
function Book3D({ pages, color, spineColor, currentPage, onPageFlip }) {
  const bookRef = useRef();
  const coverRef = useRef();

  useFrame((_, delta) => {
    if (bookRef.current) {
      bookRef.current.position.y = Math.sin(Date.now() * 0.0008) * 0.03;
    }
    // Open cover smoothly
    if (coverRef.current) {
      const target = -Math.PI * 0.75;
      coverRef.current.rotation.y += (target - coverRef.current.rotation.y) * delta * 2;
    }
  });

  return (
    <group ref={bookRef} rotation={[0.1, 0, 0]}>
      {/* Back cover */}
      <mesh position={[0, 0, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[3, 4, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} />
      </mesh>

      {/* Spine */}
      <mesh position={[-1.53, 0, 0.1]} castShadow>
        <boxGeometry args={[0.1, 4, 0.4]} />
        <meshStandardMaterial color={spineColor} roughness={0.35} metalness={0.15} />
      </mesh>

      {/* Pages with smooth flip */}
      {pages.map((_, i) => (
        <Page key={i} index={i} currentPage={currentPage} onClick={() => onPageFlip(i)} />
      ))}

      {/* Front cover — opens smoothly */}
      <group position={[-1.48, 0, 0.02 + pages.length * 0.012 + 0.03]}>
        <mesh ref={coverRef} position={[1.48, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 4, 0.06]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} />
        </mesh>
      </group>
    </group>
  );
}

// ───────────────────────── Cozy library scene (drafted in parallel) ─────────────────────────

function LibraryRoom() {
  const rnd = (() => { let s = 9876.5; return () => { s = Math.sin(s * 12.9898) * 43758.5453; return s - Math.floor(s); }; })();
  const plankColors = ['#5a3820', '#6B4226', '#5e3a22', '#7a4d30', '#62391f', '#6d4528', '#574026', '#6B4226', '#5a3820', '#7a4d30'];
  const plankData = plankColors.map((color, i) => ({ x: -14 + i * 2.8 + 1.4, color, roughness: 0.55 + rnd() * 0.1 }));
  const windowPanes = [[-0.55, 0.55], [0.55, 0.55], [-0.55, -0.35], [0.55, -0.35]];

  return (
    <group>
      <color attach="background" args={['#33251a']} />

      {/* WOOD PLANK FLOOR */}
      <group>
        {plankData.map((plank, i) => (
          <mesh key={i} position={[plank.x, -3.95, 2.0]}>
            <boxGeometry args={[2.6, 0.12, 10.2]} />
            <meshStandardMaterial color={plank.color} roughness={plank.roughness} metalness={0.05} />
          </mesh>
        ))}
        {plankData.map((plank, i) => (
          <mesh key={'seam' + i} position={[plank.x - 1.3, -3.89, 2.0]}>
            <boxGeometry args={[0.03, 0.01, 10.2]} />
            <meshStandardMaterial color="#2a1a0e" roughness={1.0} />
          </mesh>
        ))}
      </group>

      {/* BACK WALL */}
      <mesh position={[0, 1.5, -1.76]}>
        <boxGeometry args={[28, 11, 0.08]} />
        <meshStandardMaterial color="#3a2a1e" roughness={0.85} />
      </mesh>
      {/* WAINSCOT BAND */}
      <mesh position={[0, -3.15, -1.70]}>
        <boxGeometry args={[28, 1.5, 0.10]} />
        <meshStandardMaterial color="#4a2c17" roughness={0.7} />
      </mesh>
      {[-11, -7, -3, 1, 5, 9].map((x, i) => (
        <mesh key={'wp' + i} position={[x, -3.15, -1.64]}>
          <boxGeometry args={[2.8, 1.1, 0.03]} />
          <meshStandardMaterial color="#3a2010" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, -2.41, -1.68]}>
        <boxGeometry args={[28, 0.06, 0.06]} />
        <meshStandardMaterial color="#c79a4b" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 4.1, -1.68]}>
        <boxGeometry args={[28, 0.18, 0.15]} />
        <meshStandardMaterial color="#4a2c17" roughness={0.65} />
      </mesh>
      <mesh position={[0, 4.22, -1.65]}>
        <boxGeometry args={[28, 0.06, 0.06]} />
        <meshStandardMaterial color="#c79a4b" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* WINDOW on far left */}
      <group position={[-9.5, 0.8, -1.67]}>
        <mesh position={[0, 0, -0.04]}>
          <planeGeometry args={[2.4, 3.8]} />
          <meshBasicMaterial color="#ffdca0" toneMapped={false} />
        </mesh>
        <mesh position={[-1.15, 0, 0.04]}><boxGeometry args={[0.18, 3.9, 0.14]} /><meshStandardMaterial color="#2a1a0a" roughness={0.7} /></mesh>
        <mesh position={[1.15, 0, 0.04]}><boxGeometry args={[0.18, 3.9, 0.14]} /><meshStandardMaterial color="#2a1a0a" roughness={0.7} /></mesh>
        <mesh position={[0, 1.92, 0.04]}><boxGeometry args={[2.5, 0.16, 0.14]} /><meshStandardMaterial color="#2a1a0a" roughness={0.7} /></mesh>
        <mesh position={[0, -1.92, 0.04]}><boxGeometry args={[2.5, 0.16, 0.14]} /><meshStandardMaterial color="#2a1a0a" roughness={0.7} /></mesh>
        <mesh position={[0, 0.08, 0.04]}><boxGeometry args={[2.5, 0.10, 0.10]} /><meshStandardMaterial color="#2a1a0a" roughness={0.7} /></mesh>
        <mesh position={[0, 0, 0.04]}><boxGeometry args={[0.10, 3.9, 0.10]} /><meshStandardMaterial color="#2a1a0a" roughness={0.7} /></mesh>
        {windowPanes.map(([px, py], i) => (
          <mesh key={'pane' + i} position={[px, py, 0.01]}>
            <planeGeometry args={[0.92, 0.88]} />
            <meshStandardMaterial color="#fce8c0" roughness={0.0} metalness={0.1} transparent opacity={0.25} />
          </mesh>
        ))}
        <mesh position={[0, 2.08, 0.03]}>
          <torusGeometry args={[1.05, 0.09, 8, 20, Math.PI]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.7} />
        </mesh>
        <mesh position={[1.2, -1.5, 1.8]} rotation={[0, 0.18, -0.22]}>
          <planeGeometry args={[2.2, 4.5]} />
          <meshBasicMaterial color="#fff8e0" transparent opacity={0.04} depthWrite={false} />
        </mesh>
        <mesh position={[1.4, -2.2, 3.0]} rotation={[0, 0.22, -0.25]}>
          <planeGeometry args={[3.0, 4.0]} />
          <meshBasicMaterial color="#fff0c0" transparent opacity={0.025} depthWrite={false} />
        </mesh>
      </group>

      {/* FLOOR RUG */}
      <group position={[0, -3.87, 1.8]}>
        <mesh><boxGeometry args={[7.0, 0.025, 4.5]} /><meshStandardMaterial color="#c79a4b" roughness={0.85} /></mesh>
        <mesh position={[0, 0.01, 0]}><boxGeometry args={[6.5, 0.028, 4.0]} /><meshStandardMaterial color="#8B1a1a" roughness={0.85} /></mesh>
        <mesh position={[0, 0.02, 0]}><boxGeometry args={[6.0, 0.03, 3.5]} /><meshStandardMaterial color="#7f1d1d" roughness={0.9} /></mesh>
        <mesh position={[0, 0.035, 0]}><cylinderGeometry args={[0.9, 0.9, 0.02, 20]} /><meshStandardMaterial color="#0f766e" roughness={0.9} /></mesh>
        <mesh position={[0, 0.045, 0]}><cylinderGeometry args={[0.55, 0.55, 0.02, 20]} /><meshStandardMaterial color="#c79a4b" roughness={0.85} /></mesh>
        <mesh position={[0, 0.055, 0]}><cylinderGeometry args={[0.28, 0.28, 0.02, 16]} /><meshStandardMaterial color="#7f1d1d" roughness={0.9} /></mesh>
      </group>
    </group>
  );
}

function BookWall() {
  const rnd = (() => { let s = 4321.5; return () => { s = Math.sin(s * 12.9898) * 43758.5453; return s - Math.floor(s); }; })();
  const bookColors = ['#7f1d1d','#b91c1c','#14532d','#15803d','#1e3a5f','#1d4ed8','#4c1d95','#6d28d9','#b45309','#0f766e','#e7dcc3','#1f2937'];
  const shelfYs = [-3.55, -2.15, -0.05, 1.95, 3.6];

  function generateBooks(xStart, xEnd) {
    const books = [];
    let x = xStart + 0.05;
    while (x < xEnd - 0.1) {
      const r = rnd(), r2 = rnd(), r3 = rnd(), r4 = rnd(), r5 = rnd(), r6 = rnd();
      if (r < 0.1 && x + 0.7 < xEnd - 0.1) {
        const stackCount = Math.floor(r2 * 3) + 2;
        const stackW = 0.35 + r3 * 0.25;
        const stackH = 0.12 + r4 * 0.08;
        const cx = x + stackW / 2;
        for (let s = 0; s < stackCount; s++) {
          books.push({ x: cx, y: shelfYsCurrent + 0.05 + s * stackH + stackH / 2, w: stackW, h: stackH, d: 0.88, color: bookColors[Math.floor(rnd() * bookColors.length)], rotZ: 0 });
        }
        x += stackW + 0.04; continue;
      }
      const bw = 0.34 + r2 * 0.30;
      const bh = 0.9 + r3 * 0.6;
      const color = bookColors[Math.floor(r4 * bookColors.length)];
      const tilt = r5 < 0.12 ? (r6 - 0.5) * 0.18 : 0;
      if (x + bw > xEnd - 0.05) break;
      books.push({ x: x + bw / 2, y: shelfYsCurrent + 0.05 + bh / 2, w: bw, h: bh, d: 0.85, color, rotZ: tilt });
      x += bw + 0.01;
    }
    return books;
  }

  let shelfYsCurrent = 0;
  const allBooks = [];
  shelfYs.forEach((sy, si) => {
    shelfYsCurrent = sy;
    const isCenterShelf = (si === 2 || si === 3);
    if (isCenterShelf) {
      allBooks.push(...generateBooks(-6.4, -2.5));
      allBooks.push(...generateBooks(2.5, 6.4));
    } else {
      allBooks.push(...generateBooks(-6.4, 6.4));
    }
  });
  const brassBooks = allBooks.filter(() => rnd() < 0.18);

  return (
    <group>
      {/* (back panel omitted — the room's back wall sits right behind) */}
      <mesh position={[-6.5, 0.25, -0.95]}><boxGeometry args={[0.22, 8.1, 1.0]} /><meshStandardMaterial color="#4a2c17" roughness={0.8} /></mesh>
      <mesh position={[6.5, 0.25, -0.95]}><boxGeometry args={[0.22, 8.1, 1.0]} /><meshStandardMaterial color="#4a2c17" roughness={0.8} /></mesh>
      <mesh position={[0, 4.35, -0.95]}><boxGeometry args={[13.3, 0.22, 1.05]} /><meshStandardMaterial color="#4a2c17" roughness={0.75} /></mesh>
      <mesh position={[0, -3.78, -0.95]}><boxGeometry args={[13.3, 0.22, 1.05]} /><meshStandardMaterial color="#4a2c17" roughness={0.75} /></mesh>
      {shelfYs.map((sy, i) => (
        <mesh key={`shelf-${i}`} position={[0, sy, -0.95]}><boxGeometry args={[12.8, 0.1, 0.95]} /><meshStandardMaterial color="#6B4226" roughness={0.7} /></mesh>
      ))}
      {[[-4.2, 0.75, 3.65], [4.2, 0.75, 3.65], [-4.2, -2.8, 1.35], [4.2, -2.8, 1.35], [0, -2.8, 1.35], [-2.2, 3.05, 1.6], [2.2, 3.05, 1.6]].map((d, i) => (
        <mesh key={`div-${i}`} position={[d[0], d[1], -0.95]}><boxGeometry args={[0.12, d[2], 0.9]} /><meshStandardMaterial color="#4a2c17" roughness={0.8} /></mesh>
      ))}
      {allBooks.map((b, i) => (
        <mesh key={`book-${i}`} position={[b.x, b.y, -0.95]} rotation={[0, 0, b.rotZ || 0]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color={b.color} roughness={0.65} />
        </mesh>
      ))}
      {brassBooks.slice(0, 18).map((b, i) => (
        <mesh key={`brass-${i}`} position={[b.x, b.y + b.h * 0.25, -0.95 + b.d / 2 + 0.003]} rotation={[0, 0, b.rotZ || 0]}>
          <boxGeometry args={[b.w + 0.002, 0.025, 0.004]} />
          <meshStandardMaterial color="#c79a4b" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
      {/* small globe + candle accents on shelves */}
      <mesh position={[5.5, 2.35, -0.75]}><sphereGeometry args={[0.18, 10, 10]} /><meshStandardMaterial color="#1e3a5f" roughness={0.5} /></mesh>
      <mesh position={[5.5, 2.15, -0.75]}><cylinderGeometry args={[0.06, 0.12, 0.1, 8]} /><meshStandardMaterial color="#c79a4b" roughness={0.4} metalness={0.6} /></mesh>
      <mesh position={[-5.1, 4.08, -0.78]}><cylinderGeometry args={[0.055, 0.06, 0.4, 8]} /><meshStandardMaterial color="#e7dcc3" roughness={0.8} /></mesh>
      <mesh position={[-5.1, 4.31, -0.78]}><coneGeometry args={[0.025, 0.1, 6]} /><meshStandardMaterial color="#f59e0b" roughness={0.4} emissive="#f59e0b" emissiveIntensity={0.6} /></mesh>
    </group>
  );
}

function LibraryProps() {
  const rnd = (() => { let s = 5555.5; return () => { s = Math.sin(s * 12.9898) * 43758.5453; return s - Math.floor(s); }; })();
  const stackColors = ['#7f1d1d', '#14532d', '#1e3a5f', '#4c1d95'];
  const landBlobs = [];
  for (let i = 0; i < 6; i++) {
    const theta = rnd() * Math.PI * 2, phi = rnd() * Math.PI * 0.7 + 0.15, r = 0.71;
    landBlobs.push({ x: r * Math.sin(phi) * Math.cos(theta), y: r * Math.cos(phi) - 0.05, z: r * Math.sin(phi) * Math.sin(theta) });
  }
  const mkLeaves = () => { const a = []; for (let i = 0; i < 7; i++) { const ang = (i / 7) * Math.PI * 2; const ri = 0.12 + rnd() * 0.18; a.push({ x: Math.cos(ang) * ri, y: rnd() * 0.35, z: Math.sin(ang) * ri, scale: 0.18 + rnd() * 0.18 }); } return a; };
  const leftLeaves = mkLeaves(), rightLeaves = mkLeaves();
  const rungs = []; for (let i = 0; i < 7; i++) rungs.push(-3.5 + i * 1.0);

  return (
    <group>
      {/* ROLLING LADDER (right) */}
      <group position={[5.2, 0, 0.1]} rotation={[0.17, 0, 0]}>
        <mesh position={[-0.22, -0.45, 0]}><boxGeometry args={[0.07, 6.9, 0.07]} /><meshStandardMaterial color="#6B4226" roughness={0.7} /></mesh>
        <mesh position={[0.22, -0.45, 0]}><boxGeometry args={[0.07, 6.9, 0.07]} /><meshStandardMaterial color="#6B4226" roughness={0.7} /></mesh>
        {rungs.map((ry, i) => (
          <mesh key={i} position={[0, ry, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.035, 0.035, 0.44, 8]} /><meshStandardMaterial color="#8B5E3C" roughness={0.6} /></mesh>
        ))}
        <mesh position={[-0.22, -3.87, 0.08]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.06, 14]} /><meshStandardMaterial color="#c79a4b" roughness={0.3} metalness={0.7} /></mesh>
        <mesh position={[0.22, -3.87, 0.08]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.06, 14]} /><meshStandardMaterial color="#c79a4b" roughness={0.3} metalness={0.7} /></mesh>
        <mesh position={[0, 3.1, -0.22]}><boxGeometry args={[0.5, 0.07, 0.18]} /><meshStandardMaterial color="#c79a4b" roughness={0.3} metalness={0.7} /></mesh>
      </group>

      {/* GLOBE ON STAND (left) */}
      <group position={[-5.0, -3.9, 1.2]}>
        <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.38, 0.44, 0.16, 16]} /><meshStandardMaterial color="#4a2c17" roughness={0.8} /></mesh>
        <mesh position={[0, 0.95, 0]}><cylinderGeometry args={[0.035, 0.035, 1.7, 8]} /><meshStandardMaterial color="#8B5E3C" roughness={0.6} /></mesh>
        <mesh position={[0, 2.1, 0]}><torusGeometry args={[0.76, 0.032, 8, 32]} /><meshStandardMaterial color="#c79a4b" roughness={0.3} metalness={0.8} /></mesh>
        <mesh position={[0, 2.1, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.76, 0.028, 8, 32]} /><meshStandardMaterial color="#c79a4b" roughness={0.3} metalness={0.8} /></mesh>
        <mesh position={[0, 2.1, 0]}><sphereGeometry args={[0.7, 24, 16]} /><meshStandardMaterial color="#1e3a5f" roughness={0.5} /></mesh>
        {landBlobs.map((lb, i) => (
          <mesh key={i} position={[lb.x, 2.1 + lb.y, lb.z]}><sphereGeometry args={[0.12, 8, 6]} /><meshStandardMaterial color="#15803d" roughness={0.7} /></mesh>
        ))}
      </group>

      {/* POTTED PLANTS */}
      {[{ x: -6.3, leaves: leftLeaves }, { x: 6.3, leaves: rightLeaves }].map((pot, pi) => (
        <group key={pi} position={[pot.x, -3.9, 1.0]}>
          <mesh position={[0, 0.28, 0]}><cylinderGeometry args={[0.26, 0.2, 0.56, 14]} /><meshStandardMaterial color="#b45309" roughness={0.85} /></mesh>
          <mesh position={[0, 0.57, 0]}><torusGeometry args={[0.27, 0.04, 6, 14]} /><meshStandardMaterial color="#92400e" roughness={0.8} /></mesh>
          <mesh position={[0, 0.54, 0]}><cylinderGeometry args={[0.23, 0.23, 0.04, 14]} /><meshStandardMaterial color="#3a2a1e" roughness={1} /></mesh>
          {pot.leaves.map((lf, i) => (
            <mesh key={i} position={[lf.x, 0.65 + lf.y, lf.z]}><coneGeometry args={[lf.scale * 0.8, lf.scale * 1.8, 6]} /><meshStandardMaterial color={i % 2 === 0 ? '#15803d' : '#14532d'} roughness={0.8} /></mesh>
          ))}
          <mesh position={[0, 1.18, 0]}><coneGeometry args={[0.14, 0.55, 6]} /><meshStandardMaterial color="#166534" roughness={0.7} /></mesh>
        </group>
      ))}

      {/* FLOOR BOOK STACK (left of center) */}
      <group position={[-2.82, -3.9, 2.0]}>
        {stackColors.map((col, i) => (
          <mesh key={i} position={[i * 0.015, 0.12 + i * 0.22, i * 0.02]} rotation={[0, rnd() * 0.12 - 0.06, 0]}><boxGeometry args={[0.55, 0.2, 0.38]} /><meshStandardMaterial color={col} roughness={0.75} /></mesh>
        ))}
      </group>

      {/* FRAMED DIPLOMAS (high on wall) */}
      {[{ x: -3.2, painting: false }, { x: 3.2, painting: true }].map((fr, fi) => (
        <group key={fi} position={[fr.x, 3.95, -1.55]}>
          <mesh><boxGeometry args={[1.3, 0.95, 0.06]} /><meshStandardMaterial color="#4a2c17" roughness={0.7} /></mesh>
          <mesh position={[0, 0, 0.032]}><boxGeometry args={[1.08, 0.75, 0.02]} /><meshStandardMaterial color="#e7dcc3" roughness={0.9} /></mesh>
          {!fr.painting ? (
            <>
              <mesh position={[0, 0.12, 0.044]}><boxGeometry args={[0.6, 0.04, 0.005]} /><meshStandardMaterial color="#8B5E3C" roughness={1} /></mesh>
              <mesh position={[0, 0.0, 0.044]}><boxGeometry args={[0.45, 0.03, 0.005]} /><meshStandardMaterial color="#8B5E3C" roughness={1} /></mesh>
              <mesh position={[0, -0.1, 0.044]}><boxGeometry args={[0.38, 0.03, 0.005]} /><meshStandardMaterial color="#8B5E3C" roughness={1} /></mesh>
            </>
          ) : (
            <>
              <mesh position={[0, 0.1, 0.044]}><boxGeometry args={[0.9, 0.22, 0.005]} /><meshStandardMaterial color="#1e3a5f" roughness={0.9} /></mesh>
              <mesh position={[0, -0.12, 0.044]}><boxGeometry args={[0.9, 0.18, 0.005]} /><meshStandardMaterial color="#14532d" roughness={0.9} /></mesh>
            </>
          )}
          <mesh position={[0, -0.28, 0.044]}><boxGeometry args={[0.3, 0.07, 0.006]} /><meshStandardMaterial color="#c79a4b" roughness={0.3} metalness={0.8} /></mesh>
        </group>
      ))}

      {/* WALL CLOCK (high center) */}
      <group position={[0, 4.05, -1.54]}>
        <mesh><torusGeometry args={[0.46, 0.055, 8, 32]} /><meshStandardMaterial color="#c79a4b" roughness={0.3} metalness={0.8} /></mesh>
        <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.44, 0.44, 0.04, 32]} /><meshStandardMaterial color="#e7dcc3" roughness={0.9} /></mesh>
        <mesh position={[0.0, 0.13, 0.048]} rotation={[0, 0, -0.4]}><boxGeometry args={[0.04, 0.28, 0.015]} /><meshStandardMaterial color="#1f2937" roughness={0.6} /></mesh>
        <mesh position={[0.1, 0.16, 0.052]} rotation={[0, 0, -1.1]}><boxGeometry args={[0.025, 0.36, 0.012]} /><meshStandardMaterial color="#1f2937" roughness={0.6} /></mesh>
        <mesh position={[0, 0, 0.055]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial color="#c79a4b" roughness={0.3} metalness={0.8} /></mesh>
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => { const a = (i / 12) * Math.PI * 2; return (
          <mesh key={i} position={[Math.sin(a) * 0.36, Math.cos(a) * 0.36, 0.038]}><boxGeometry args={[0.022, 0.07, 0.01]} /><meshStandardMaterial color="#4a2c17" roughness={0.7} /></mesh>
        ); })}
      </group>

      {/* HANGING PENDANT LAMP */}
      <group position={[0.5, 4.25, 0.3]}>
        <mesh position={[0, 0.35, 0]}><cylinderGeometry args={[0.012, 0.012, 0.7, 6]} /><meshStandardMaterial color="#1f2937" roughness={1} /></mesh>
        <mesh position={[0, -0.02, 0]} rotation={[Math.PI, 0, 0]}><sphereGeometry args={[0.38, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} /><meshStandardMaterial color="#c79a4b" roughness={0.25} metalness={0.85} side={2} /></mesh>
        <mesh position={[0, -0.19, 0]}><torusGeometry args={[0.375, 0.022, 6, 24]} /><meshStandardMaterial color="#c79a4b" roughness={0.25} metalness={0.85} /></mesh>
        <mesh position={[0, -0.06, 0]}><sphereGeometry args={[0.1, 12, 10]} /><meshBasicMaterial color="#ffd9a0" toneMapped={false} /></mesh>
      </group>

      {/* BANKER'S LAMP (right shelf) */}
      <group position={[4.6, 0.1, -0.2]}>
        <mesh position={[0, -0.18, 0]}><cylinderGeometry args={[0.18, 0.22, 0.07, 14]} /><meshStandardMaterial color="#c79a4b" roughness={0.35} metalness={0.75} /></mesh>
        <mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.022, 0.022, 0.78, 8]} /><meshStandardMaterial color="#c79a4b" roughness={0.35} metalness={0.75} /></mesh>
        <mesh position={[0.14, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.022, 0.022, 0.3, 8]} /><meshStandardMaterial color="#c79a4b" roughness={0.35} metalness={0.75} /></mesh>
        <mesh position={[0.28, 0.46, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.2, 0.28, 14, 1, true]} /><meshStandardMaterial color="#0f5132" roughness={0.6} side={2} /></mesh>
        <mesh position={[0.28, 0.5, 0]}><sphereGeometry args={[0.06, 8, 6]} /><meshBasicMaterial color="#ffd9a0" toneMapped={false} /></mesh>
      </group>
    </group>
  );
}

function LibraryLighting() {
  return (
    <group>
      <ambientLight intensity={0.9} color="#ffeacf" />
      <directionalLight position={[5, 7, 6]} intensity={1.9} color="#fff0d8" />
      <directionalLight position={[0, 2, 9]} intensity={0.95} color="#ffe8cc" />
      <pointLight position={[0, 3.2, 3]} intensity={0.7} color="#ffd9a0" distance={14} decay={2} />
      <pointLight position={[4.6, 0.6, 2.5]} intensity={0.45} color="#9ae6b4" distance={7} decay={2} />
    </group>
  );
}

// Bookshelf — front-facing books in a proper rack with sections
function BookShelf({ onSelectBook }) {
  const book1Ref = useRef();
  const book2Ref = useRef();
  const [hovered, setHovered] = useState(null);

  useFrame(() => {
    if (book1Ref.current) {
      const targetZ = hovered === 'hackathons' ? 0.4 : 0;
      book1Ref.current.position.z += (targetZ - book1Ref.current.position.z) * 0.08;
      const targetRot = hovered === 'hackathons' ? -0.08 : 0;
      book1Ref.current.rotation.y += (targetRot - book1Ref.current.rotation.y) * 0.08;
    }
    if (book2Ref.current) {
      const targetZ = hovered === 'certificates' ? 0.4 : 0;
      book2Ref.current.position.z += (targetZ - book2Ref.current.position.z) * 0.08;
      const targetRot = hovered === 'certificates' ? 0.08 : 0;
      book2Ref.current.rotation.y += (targetRot - book2Ref.current.rotation.y) * 0.08;
    }
  });

  const woodColor = '#6B4226';
  const darkWood = '#4a2c17';
  const lightWood = '#8B5E3C';

  return (
    <group>
      {/* === COZY LIBRARY (room + packed bookcase around the hero books) === */}
      <LibraryRoom />
      <BookWall />

      {/* === HERO BOOKS — front facing, in the cleared center compartment === */}
      {/* Book 1 - Hackathons (left section, top shelf) */}
      <group
        ref={book1Ref}
        position={[-1.3, 0.95, -0.2]}
        onPointerEnter={() => setHovered('hackathons')}
        onPointerLeave={() => setHovered(null)}
        onClick={() => onSelectBook('hackathons')}
      >
        {/* Book body — standing upright, front facing camera */}
        <mesh castShadow>
          <boxGeometry args={[1.4, 1.8, 0.35]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.45} metalness={0.05} />
        </mesh>
        {/* Gold band at top */}
        <mesh position={[0, 0.7, 0.01]}>
          <boxGeometry args={[1.42, 0.12, 0.36]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.3} />
        </mesh>
        {/* Gold band at bottom */}
        <mesh position={[0, -0.7, 0.01]}>
          <boxGeometry args={[1.42, 0.12, 0.36]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.3} />
        </mesh>
        {/* Title */}
        <Text position={[0, 0.2, 0.19]} fontSize={0.14} color="#fbbf24" anchorX="center" anchorY="middle" font={undefined}>
          HACKATHON
        </Text>
        <Text position={[0, -0.0, 0.19]} fontSize={0.14} color="#fbbf24" anchorX="center" anchorY="middle" font={undefined}>
          WINS
        </Text>
        <Text position={[0, -0.4, 0.19]} fontSize={0.08} color="rgba(255,255,255,0.4)" anchorX="center" anchorY="middle" font={undefined}>
          3 stories
        </Text>
      </group>

      {/* Book 2 - Certificates (right section, top shelf) */}
      <group
        ref={book2Ref}
        position={[1.3, 0.95, -0.2]}
        onPointerEnter={() => setHovered('certificates')}
        onPointerLeave={() => setHovered(null)}
        onClick={() => onSelectBook('certificates')}
      >
        <mesh castShadow>
          <boxGeometry args={[1.3, 1.7, 0.3]} />
          <meshStandardMaterial color="#1e3a2f" roughness={0.45} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.65, 0.01]}>
          <boxGeometry args={[1.32, 0.1, 0.32]} />
          <meshStandardMaterial color="#34d399" roughness={0.3} metalness={0.3} />
        </mesh>
        <mesh position={[0, -0.65, 0.01]}>
          <boxGeometry args={[1.32, 0.1, 0.32]} />
          <meshStandardMaterial color="#34d399" roughness={0.3} metalness={0.3} />
        </mesh>
        <Text position={[0, 0.15, 0.16]} fontSize={0.12} color="#34d399" anchorX="center" anchorY="middle" font={undefined}>
          CERTIFI-
        </Text>
        <Text position={[0, -0.05, 0.16]} fontSize={0.12} color="#34d399" anchorX="center" anchorY="middle" font={undefined}>
          CATIONS
        </Text>
        <Text position={[0, -0.4, 0.16]} fontSize={0.08} color="rgba(255,255,255,0.4)" anchorX="center" anchorY="middle" font={undefined}>
          3 entries
        </Text>
      </group>

      {/* Focused warm highlight so the two interactive hero books draw the eye */}
      <pointLight position={[0, 0.95, 2.2]} intensity={0.7} color="#fff2db" distance={5.5} decay={2} />

      {/* === LIBRARY PROPS + LIGHTING === */}
      <LibraryProps />
      <LibraryLighting />
    </group>
  );
}

export default function Certificates({ lowPowerMode = false }) {
  const [openBook, setOpenBook] = useState(null);
  const [page, setPage] = useState(0);

  // WebGL context-loss recovery: if the GPU drops this canvas during a heavy
  // screen transition, recreate it (remount via key) once memory frees, so the
  // library never stays blank. Listener persists (no { once }) to survive repeat losses.
  const [glKey, setGlKey] = useState(0);
  const handleGlCreated = ({ gl }) => {
    gl.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      setTimeout(() => setGlKey((k) => k + 1), 450);
    });
  };
  const certDpr = lowPowerMode ? [0.75, 1] : [1, 1.25];

  const pages = openBook === 'hackathons' ? hackathonPages : openBook === 'certificates' ? certPages : [];

  const flipNext = () => { if (page < pages.length - 1) setPage(page + 1); };
  const flipPrev = () => { if (page > 0) setPage(page - 1); };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {/* SHELF VIEW */}
        {!openBook && (
          <motion.div
            key="shelf"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Canvas key={glKey} onCreated={handleGlCreated} dpr={certDpr} gl={{ powerPreference: 'high-performance', antialias: !lowPowerMode }} style={{ width: '100%', height: '100%' }}>
              <FitCamera targetWidth={10.8} targetHeight={7.2} posY={0.15} fov={45} />
              <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2.1} minAzimuthAngle={-0.45} maxAzimuthAngle={0.45} />
              <BookShelf onSelectBook={(book) => setOpenBook(book)} />
            </Canvas>
            <div style={{ position: 'absolute', top: '18px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
                color: '#c79a4b', fontFamily: "'Poppins', sans-serif", marginBottom: '4px',
                textShadow: '0 1px 6px rgba(0,0,0,0.5)',
              }}>Achievements</div>
              <h2 style={{
                fontSize: '1.7rem', fontWeight: 800, margin: '0 0 3px', fontFamily: "'Poppins', sans-serif",
                background: 'linear-gradient(120deg, #f4cf8a, #e8a13c, #b45309)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.35)',
              }}>My Bookshelf</h2>
              <p style={{ color: '#e7dcc3', fontSize: '0.78rem', margin: 0, fontFamily: "'Quicksand', sans-serif", textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>Pick a book to read the story</p>
            </div>
          </motion.div>
        )}

        {/* OPEN BOOK VIEW */}
        {openBook && (
          <motion.div
            key="book-open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Canvas key={glKey} onCreated={handleGlCreated} dpr={certDpr} gl={{ powerPreference: 'high-performance', antialias: !lowPowerMode }} style={{ width: '100%', height: '100%' }}>
              <FitCamera targetWidth={4.4} targetHeight={5} posY={0} fov={40} />
              <ambientLight intensity={0.35} />
              <directionalLight position={[2, 4, 4]} intensity={1.8} castShadow color="#fff8f0" />
              <pointLight position={[-2, 1, 3]} intensity={0.4} color="#fbbf24" distance={6} />
              <Book3D
                pages={pages}
                color={openBook === 'hackathons' ? '#1a1a2e' : '#1e3a2f'}
                spineColor={openBook === 'hackathons' ? '#fbbf24' : '#34d399'}
                currentPage={page}
                onPageFlip={(i) => setPage(i >= page ? Math.min(i + 1, pages.length - 1) : i)}
              />
            </Canvas>

            {/* Page content overlay */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  style={{
                    width: 'min(360px, 82vw)', background: 'rgba(255,253,245,0.93)',
                    backdropFilter: 'blur(6px)', borderRadius: '12px',
                    padding: '24px 26px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.04)', pointerEvents: 'auto',
                  }}
                >
                  {openBook === 'hackathons' ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Trophy size={16} color="#d97706" />
                        <span style={{ color: '#d97706', fontSize: '10px', fontWeight: 800, letterSpacing: '1px', fontFamily: "'Poppins', sans-serif" }}>{pages[page].badge.toUpperCase()}</span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a1a1a', margin: '0 0 3px', fontFamily: "'Poppins', sans-serif" }}>{pages[page].title}</h3>
                      <p style={{ color: '#888', fontSize: '0.75rem', margin: '0 0 12px', fontFamily: "'Quicksand', sans-serif" }}>{pages[page].venue} &middot; {pages[page].date}</p>
                      <div style={{ width: '28px', height: '2px', background: '#fbbf24', marginBottom: '12px' }} />
                      <p style={{ color: '#444', fontSize: '0.85rem', lineHeight: 1.7, margin: 0, fontFamily: "'Quicksand', sans-serif", fontStyle: 'italic' }}>&ldquo;{pages[page].story}&rdquo;</p>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Award size={16} color="#059669" />
                        <span style={{ color: '#059669', fontSize: '10px', fontWeight: 800, letterSpacing: '1px', fontFamily: "'Poppins', sans-serif" }}>{pages[page].score}</span>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a1a', margin: '0 0 3px', fontFamily: "'Poppins', sans-serif" }}>{pages[page].title}</h3>
                      <p style={{ color: '#888', fontSize: '0.75rem', margin: '0 0 12px', fontFamily: "'Quicksand', sans-serif" }}>{pages[page].issuer} &middot; {pages[page].date}</p>
                      <div style={{ width: '28px', height: '2px', background: '#34d399', marginBottom: '12px' }} />
                      <p style={{ color: '#444', fontSize: '0.85rem', lineHeight: 1.7, margin: '0 0 10px', fontFamily: "'Quicksand', sans-serif", fontStyle: 'italic' }}>&ldquo;{pages[page].story}&rdquo;</p>
                      {pages[page].url && (
                        <a href={pages[page].url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#2563eb', fontSize: '11px', fontWeight: 600, textDecoration: 'none', fontFamily: "'Poppins', sans-serif" }}>
                          <ExternalLink size={12} /> View Certificate
                        </a>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', alignItems: 'center', pointerEvents: 'auto' }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setOpenBook(null); setPage(0); }}
                style={{ padding: '7px 14px', borderRadius: '8px', background: 'white', border: '1px solid #e0e0e0', cursor: 'pointer', fontSize: '11px', fontWeight: 600, fontFamily: "'Poppins', sans-serif", display: 'flex', alignItems: 'center', gap: '5px', color: '#333', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                <ArrowLeft size={12} /> Shelf
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={flipPrev} disabled={page === 0}
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'white', border: '1px solid #e0e0e0', cursor: page === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 0 ? 0.3 : 1, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                <ArrowLeft size={12} color="#333" />
              </motion.button>
              <span style={{ color: '#666', fontSize: '11px', fontFamily: "'Poppins', sans-serif", minWidth: '44px', textAlign: 'center' }}>{page + 1}/{pages.length}</span>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={flipNext} disabled={page === pages.length - 1}
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'white', border: '1px solid #e0e0e0', cursor: page === pages.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === pages.length - 1 ? 0.3 : 1, transform: 'rotate(180deg)', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                <ArrowLeft size={12} color="#333" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
