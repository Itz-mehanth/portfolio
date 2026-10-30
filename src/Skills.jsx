import React, { useState, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Text, PerspectiveCamera, OrbitControls, QuadraticBezierLine, Billboard, useGLTF, Merged, AdaptiveEvents, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import SkillIsland, {
  DISTRICT_ROAD_POINTS, DRIVE_OBSTACLES, GROUND_Y, SPAWN_POINT, SelectionRing, isOnIsland, pathBetween,
} from './SkillIsland';
import { Suspense } from 'react';

import { EffectComposer, Outline } from '@react-three/postprocessing';
import Car from './utils/models/Car';
import { useInView } from 'react-intersection-observer';
import { Joystick } from 'react-joystick-component';
import useResponsiveFov from './utils/useResponsiveFov';
import CameraEntrance from './utils/CameraEntrance';

function Scroll({ open, skills }) {
  return (
    <group position={[0, 4.5, 5]} visible={open}>
      <mesh rotation={[0, 0, 0]}>
        <planeGeometry args={[5, 2.5]} />
        <meshStandardMaterial color={'black'} />
      </mesh>
      {skills.map((skill, index) => (
        <Text
          key={index}
          fontSize={0.3}
          position={[-1.5 + (index % 3) * 1.5, 0.1 - Math.floor(index / 3) * 0.4, 0.01]}
          color="#ffffff"
        >
          {skill}
        </Text>
      ))}
    </group>
  );
}

function ToonSky({ lowPowerMode = false }) {
  return (
    <>
      <color attach="background" args={['#9fd8f2']} />
      <fog attach="fog" args={['#c8e9f7', 48, 125]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[14, 16, -8]} intensity={1.9} color="#fff3d6" />
      <hemisphereLight skyColor="#9bd4f0" groundColor="#5a8c4a" intensity={0.5} />

      {/* Ground-level pollen / dust motes drifting over the town (stays in frame) */}
      <Sparkles count={lowPowerMode ? 16 : 40} size={2.5} scale={[24, 4, 16]} position={[0, 3.2, 0]} speed={0.2} opacity={0.45} color="#fff7d6" />
    </>
  );
}

// Overview camera; widens on portrait screens so the whole town stays in frame.
// On wide screens the view is shifted so the town sits on the right, clear of the
// editorial column on the left.
function TownCamera() {
  const fov = useResponsiveFov(52, 1.5, 85);
  const ref = useRef();
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  useEffect(() => {
    const cam = ref.current;
    if (!cam) return undefined;
    if (width > 900) cam.setViewOffset(width, height, -width * 0.12, 0, width, height);
    else cam.clearViewOffset();
    cam.updateProjectionMatrix();
    return () => cam.clearViewOffset();
  }, [width, height, fov]);
  return <PerspectiveCamera ref={ref} makeDefault position={[1.2, 14, 20.5]} fov={fov} />;
}

export default function SciFiSkillCities({ lowPowerMode = false, header = null, touch = false }) {
  const [selectedCity, setSelectedCity] = useState('languages'); // starting city
  const [currentCity, setCurrentCity] = useState('languages');
  const [path, setPath] = useState(null);
  const [driveMode, setDriveMode] = useState(false);
  // WebGL context-loss recovery
  const [glKey, setGlKey] = useState(0);
  const handleGlCreated = ({ gl }) => {
    gl.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      setTimeout(() => setGlKey((k) => k + 1), 450);
    });
  };
  const driveKeysRef = useRef({ forward: false, backward: false, left: false, right: false });
  const [ref, inView] = useInView({ threshold: 0 }); // Visibility check for 3D canvas

  // Keyboard controls for drive mode
  useEffect(() => {
    if (!driveMode) return;

    const keyMap = {
      KeyW: 'forward', ArrowUp: 'forward',
      KeyS: 'backward', ArrowDown: 'backward',
      KeyA: 'left', ArrowLeft: 'left',
      KeyD: 'right', ArrowRight: 'right',
    };

    const handleKeyDown = (e) => {
      const action = keyMap[e.code];
      if (action) {
        e.preventDefault();
        driveKeysRef.current[action] = true;
      }
    };
    const handleKeyUp = (e) => {
      const action = keyMap[e.code];
      if (action) driveKeysRef.current[action] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      driveKeysRef.current = { forward: false, backward: false, left: false, right: false };
    };
  }, [driveMode]);

  const handleCityClick = (id) => {
    setSelectedCity(id);

    const pathToTarget = pathBetween(currentCity, id);
    setPath(pathToTarget);
  };


  // Updated skills by city based on the new skill list
  const skillsByCity = {
    languages: [
      { name: 'Python', description: 'Versatile programming language for backend, AI/ML, and scripting' },
      { name: 'JavaScript', description: 'Essential language for web development and frontend interactions' },
      { name: 'TypeScript', description: 'Typed superset of JavaScript for large-scale applications' },
      { name: 'Dart', description: 'Programming language optimized for Flutter mobile app development' },
      { name: 'C', description: 'Low-level programming language for system programming' },
      { name: 'C++', description: 'Object-oriented extension of C for game development' },
      { name: 'Java', description: 'Platform-independent language for enterprise and Android development' },
      { name: 'SQL', description: 'Standard language for database queries' },
    ],
    web: [
      { name: 'HTML', description: 'Standard markup language for documents designed to be displayed in a web browser' },
      { name: 'CSS', description: 'Style sheet language used for describing the presentation of a document' },
      { name: 'Tailwind CSS', description: 'Utility-first CSS framework for rapid UI development' },
      { name: 'React.js', description: 'JavaScript library for building interactive user interfaces' },
      { name: 'Next.js', description: 'React framework enabling server-side rendering and static site generation' },
      { name: 'Vue.js', description: 'Progressive JavaScript framework for building user interfaces' },
      { name: 'Angular', description: 'Platform and framework for building single-page client applications' },
      { name: 'Chart.js', description: 'Simple yet flexible JavaScript charting for designers & developers' },
    ],
    mobile: [
      { name: 'Flutter', description: 'Google\'s UI toolkit for building natively compiled applications' },
    ],
    backend: [
      { name: 'Node.js', description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine' },
      { name: 'Express.js', description: 'Minimal and flexible Node.js web application framework' },
      { name: 'Flask', description: 'Micro web framework written in Python' },
      { name: 'Spring Boot', description: 'Java-based framework used to create microservices' },
      { name: 'REST API', description: 'Architectural style for designing networked applications' },
      { name: 'WebSockets', description: 'Communication protocol providing full-duplex communication channels' },
      { name: 'WebRTC', description: 'Real-Time Communications for the web' },
      { name: 'Apache Kafka', description: 'Distributed event streaming platform' },
      { name: 'Apache Spark', description: 'Unified analytics engine for large-scale data processing' },
    ],
    database: [
      { name: 'PostgreSQL', description: 'Powerful, open source object-relational database system' },
      { name: 'MySQL', description: 'Open-source relational database management system' },
      { name: 'MongoDB', description: 'Source-available cross-platform document-oriented database program' },
      { name: 'Redis', description: 'In-memory data structure store, used as a database, cache, and message broker' },
    ],
    arvr: [
      { name: 'React Three Fiber', description: 'React renderer for Three.js' },
      { name: 'Three.js', description: 'Cross-browser JavaScript library and application programming interface used to create and display animated 3D computer graphics' },
      { name: 'Unity', description: 'Cross-platform game engine used to create three-dimensional and two-dimensional games' },
      { name: 'Godot', description: 'Cross-platform, free and open-source game engine' },
      { name: 'Blender', description: 'Free and open-source 3D computer graphics software toolset' },
    ],
    uiux: [
      { name: 'Figma', description: 'Vector graphics editor and prototyping tool' },
    ],
    tools: [
      { name: 'Docker', description: 'Set of platform as a service products that use OS-level virtualization' },
      { name: 'Git', description: 'Distributed version control system' },
      { name: 'Firebase', description: 'Platform developed by Google for creating mobile and web applications' },
      { name: 'Raspberry Pi', description: 'Series of small single-board computers' },
      { name: 'PySpark', description: 'Python API for Apache Spark' },
      { name: 'Spark Streaming', description: 'Extension of the core Spark API that enables scalable, high-throughput, fault-tolerant stream processing' },
      { name: 'Spark MLlib', description: 'Apache Spark\'s scalable machine learning library' },
    ],
    aiml: [
      { name: 'TensorFlow', description: 'Free and open-source software library for machine learning and artificial intelligence' },
      { name: 'OpenCV', description: 'Library of programming functions mainly aimed at real-time computer vision' },
      { name: 'CNNs', description: 'Class of artificial neural network most commonly applied to analyzing visual imagery' },
    ],
  };

  return (
    <>
      <div
        ref={ref}
        className="skills-stage"
        data-gesture-zone
        style={{
          overflow: 'hidden',
          zIndex: 10,
          pointerEvents: 'auto',
          cursor: touch ? 'default' : 'grab'
        }}
      >
        <Canvas
          key={glKey}
          onCreated={handleGlCreated}
          // Layout size, not the transformed box: the screen arrives tilted and scaled.
          resize={{ offsetSize: true, scroll: false }}
          frameloop={inView ? 'always' : 'never'}
          camera={{ position: [0, 6, 20], fov: 60 }}
          dpr={lowPowerMode ? [0.75, 1] : [1, 1.5]}
          shadows={!lowPowerMode}
          gl={{ toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            pointerEvents: 'auto'
          }}
        >
          <Suspense fallback={null}>

            <AdaptiveEvents />

            {/* Anime Sky Environment & Sphere */}
            <ToonSky lowPowerMode={lowPowerMode} />

            {/* Basic scene setup */}
            <ambientLight intensity={1.2} />
            <directionalLight
              castShadow
              position={[10, 10, 10]}
              intensity={1.4}
              shadow-mapSize-width={lowPowerMode ? 512 : 1024}
              shadow-mapSize-height={lowPowerMode ? 512 : 1024}
              shadow-camera-far={60}
              shadow-camera-left={-16}
              shadow-camera-right={16}
              shadow-camera-top={14}
              shadow-camera-bottom={-14}
              shadow-bias={-0.0001}
            />
            {!driveMode && <CameraEntrance distanceFactor={2.6} lift={6} duration={1.8} />}
            {/* In the scrolling page the wheel scrolls (no zoom), and touch screens get no
                orbit drag, so a swipe over the island scrolls the page; taps still pick houses. */}
            {!driveMode && !touch && (
              <OrbitControls
                enableZoom={false}
                enablePan={true}
                enableRotate={true}
                maxPolarAngle={Math.PI / 2.3}
                minDistance={8}
                maxDistance={34}
                enableDamping={true}
                dampingFactor={0.05}
              />
            )}

            {/* Two islands, bridge, winding road, districts, props, sea, waterfalls */}
            <SkillIsland lowPowerMode={lowPowerMode} selected={selectedCity} onSelect={handleCityClick} />
            <SelectionRing districtId={selectedCity} />

            {/* Car with camera */}
            <Suspense fallback={null}>
              {!driveMode && <TownCamera />}
              <Car
                position={DISTRICT_ROAD_POINTS[currentCity].toArray()}
                path={driveMode ? null : path}
                driveMode={driveMode}
                keysRef={driveKeysRef}
                cityPositions={DRIVE_OBSTACLES}
                isOverGround={isOnIsland}
                spawn={SPAWN_POINT}
                groundY={GROUND_Y}
                onReachEnd={() => setCurrentCity(selectedCity)}
              />
            </Suspense>

          </Suspense>
        </Canvas>

        {/* Drive Mode Toggle */}
        <button
          className="drive-toggle"
          onClick={() => setDriveMode(!driveMode)}
          style={{
            position: 'absolute',
            bottom: '110px',
            right: '56px',
            padding: '9px 16px',
            background: driveMode ? 'var(--paper)' : 'var(--ink)',
            color: driveMode ? 'var(--ink)' : 'var(--paper)',
            border: 'none',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            zIndex: 20,
            boxShadow: '0 6px 20px -6px rgba(18,17,23,0.35)',
            transition: 'background 0.2s ease',
          }}
        >
          {driveMode ? 'Exit drive mode' : 'Drive the car'}
        </button>

        {/* Drive mode controls hint (desktop) */}
        {driveMode && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 14px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            fontSize: '11px',
            fontFamily: "var(--font-body)",
            zIndex: 20,
            backdropFilter: 'blur(4px)',
            whiteSpace: 'nowrap',
          }}>
            W↑ S↓ A← D→
          </div>
        )}

        {/* Joystick for mobile drive mode */}
        {driveMode && (
          <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '30px',
            zIndex: 25,
          }}>
            <Joystick
              size={80}
              baseColor="rgba(0,0,0,0.3)"
              stickColor="rgba(255,215,0,0.9)"
              throttle={50}
              move={(e) => {
                if (!e) return;
                const threshold = 0.3;
                driveKeysRef.current.forward = e.y > threshold;
                driveKeysRef.current.backward = e.y < -threshold;
                driveKeysRef.current.left = e.x < -threshold;
                driveKeysRef.current.right = e.x > threshold;
              }}
              stop={() => {
                driveKeysRef.current = { forward: false, backward: false, left: false, right: false };
              }}
            />
          </div>
        )}

        {/* Paper fade + editorial column: header, then the selected district's skills */}
        <div className="skills-fade" aria-hidden="true" />
        <div className="skills-overlay">
          {header}
          {!driveMode && <SkillsGrid skillsByCity={skillsByCity} selectedCity={selectedCity} />}
        </div>
      </div>
    </>
  );
}

const CITY_LABELS = {
  languages: 'Languages',
  web: 'Web',
  mobile: 'Mobile',
  backend: 'Backend',
  database: 'Databases',
  arvr: 'AR / VR & 3D',
  uiux: 'UI / UX',
  tools: 'Tools',
  aiml: 'AI / ML',
};

const SkillsGrid = ({ skillsByCity, selectedCity }) => {
  const skills = skillsByCity[selectedCity] || [];

  return (
    <div className="skills-panel layer" style={{ '--d': 3 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <span className="section-eyebrow">{CITY_LABELS[selectedCity] || 'Tech stack'}</span>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Click a district in the town to switch</span>
      </div>
      <ul key={selectedCity} style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {skills.map((skill, i) => (
          <motion.li
            key={skill.name}
            title={skill.description}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.25 }}
            style={{
              padding: '5px 11px', borderRadius: '999px',
              border: '1px solid var(--line)', background: '#fff',
              fontSize: '12.5px', fontWeight: 500, color: 'var(--ink)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {skill.name}
          </motion.li>
        ))}
      </ul>
    </div>
  );
};
