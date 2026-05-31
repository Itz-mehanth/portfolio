import { ExternalLink, Trophy, Award, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

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
      {/* === BOOKSHELF RACK === */}
      {/* Back panel */}
      <mesh position={[0, 0, -1.1]} receiveShadow>
        <boxGeometry args={[5.5, 4, 0.12]} />
        <meshStandardMaterial color={darkWood} roughness={0.8} />
      </mesh>

      {/* Top shelf */}
      <mesh position={[0, 1.9, -0.4]} receiveShadow castShadow>
        <boxGeometry args={[5.5, 0.12, 1.4]} />
        <meshStandardMaterial color={woodColor} roughness={0.7} />
      </mesh>

      {/* Bottom shelf */}
      <mesh position={[0, -1.9, -0.4]} receiveShadow castShadow>
        <boxGeometry args={[5.5, 0.12, 1.4]} />
        <meshStandardMaterial color={woodColor} roughness={0.7} />
      </mesh>

      {/* Middle shelf */}
      <mesh position={[0, 0, -0.4]} receiveShadow castShadow>
        <boxGeometry args={[5.5, 0.1, 1.4]} />
        <meshStandardMaterial color={lightWood} roughness={0.7} />
      </mesh>

      {/* Left side panel */}
      <mesh position={[-2.7, 0, -0.4]} castShadow>
        <boxGeometry args={[0.12, 4, 1.4]} />
        <meshStandardMaterial color={woodColor} roughness={0.7} />
      </mesh>

      {/* Right side panel */}
      <mesh position={[2.7, 0, -0.4]} castShadow>
        <boxGeometry args={[0.12, 4, 1.4]} />
        <meshStandardMaterial color={woodColor} roughness={0.7} />
      </mesh>

      {/* Center divider */}
      <mesh position={[0, 0.95, -0.4]} castShadow>
        <boxGeometry args={[0.08, 1.8, 1.3]} />
        <meshStandardMaterial color={lightWood} roughness={0.7} />
      </mesh>

      {/* === BOOKS — front facing === */}
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

      {/* Decorative books on bottom shelf (filler) */}
      <mesh position={[-1.8, -1, -0.4]} castShadow>
        <boxGeometry args={[0.3, 1.5, 0.9]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.5} />
      </mesh>
      <mesh position={[-1.3, -1.1, -0.4]} castShadow>
        <boxGeometry args={[0.25, 1.3, 0.85]} />
        <meshStandardMaterial color="#dc2626" roughness={0.5} />
      </mesh>
      <mesh position={[-0.8, -1, -0.4]} castShadow>
        <boxGeometry args={[0.35, 1.5, 0.9]} />
        <meshStandardMaterial color="#0284c7" roughness={0.5} />
      </mesh>
      <mesh position={[0.5, -1.05, -0.4]} castShadow>
        <boxGeometry args={[0.28, 1.4, 0.85]} />
        <meshStandardMaterial color="#ea580c" roughness={0.5} />
      </mesh>
      <mesh position={[1, -1.1, -0.4]} castShadow>
        <boxGeometry args={[0.3, 1.3, 0.9]} />
        <meshStandardMaterial color="#4f46e5" roughness={0.5} />
      </mesh>
      <mesh position={[1.6, -1, -0.4]} castShadow>
        <boxGeometry args={[0.25, 1.5, 0.85]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.5} />
      </mesh>

      {/* Small plant on bottom shelf */}
      <group position={[2.2, -0.8, -0.2]}>
        <mesh>
          <cylinderGeometry args={[0.15, 0.18, 0.3, 8]} />
          <meshStandardMaterial color="#8B5E3C" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.22, 8, 6]} />
          <meshStandardMaterial color="#22c55e" roughness={0.7} />
        </mesh>
      </group>

      {/* === LIGHTING === */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} color="#fff5e0" />
      <pointLight position={[-3, 2, 3]} intensity={0.6} color="#fbbf24" distance={8} />
      <pointLight position={[3, 2, 3]} intensity={0.4} color="#ffffff" distance={6} />
      {/* Soft fill from below */}
      <pointLight position={[0, -2, 2]} intensity={0.2} color="#ffe4c4" distance={5} />
    </group>
  );
}

export default function Certificates() {
  const [openBook, setOpenBook] = useState(null);
  const [page, setPage] = useState(0);

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
            <Canvas shadows dpr={[1, 1.5]} style={{ width: '100%', height: '100%' }}>
              <PerspectiveCamera makeDefault position={[0, 0.5, 5]} fov={45} />
              <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2.1} minAzimuthAngle={-0.4} maxAzimuthAngle={0.4} />
              <BookShelf onSelectBook={(book) => setOpenBook(book)} />
            </Canvas>
            <div style={{ position: 'absolute', top: '14px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a1a1a', margin: '0 0 2px', fontFamily: "'Poppins', sans-serif" }}>My Bookshelf</h2>
              <p style={{ color: '#888', fontSize: '0.75rem', margin: 0, fontFamily: "'Quicksand', sans-serif" }}>Click a book to open</p>
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
            <Canvas shadows dpr={[1, 1.5]} style={{ width: '100%', height: '100%' }}>
              <PerspectiveCamera makeDefault position={[0, 1.5, 4.5]} fov={40} />
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
