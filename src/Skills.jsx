import React, { useState, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Text, PerspectiveCamera, OrbitControls, QuadraticBezierLine, Billboard, useGLTF, Merged, AdaptiveEvents, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import SkillIsland, {
  DISTRICT_CENTERS, DISTRICT_POSITIONS, DISTRICT_ROAD_POINTS, PARK_TANKS, PARK_TREES, PARK_WINDMILLS,
  SPAWN_POINT, SelectionRing, isOnIsland, pathBetween,
} from './SkillIsland';
import { Suspense } from 'react';
import House from './utils/models/House';
import WaterTank from './utils/models/WaterTank';
import Tank from './utils/models/Tank';
import WindMills from './utils/models/WIndMill';
import Tree from './utils/models/Tree';

import { EffectComposer, Outline } from '@react-three/postprocessing';
import Car from './utils/models/Car';
import { useInView } from 'react-intersection-observer';
import { Joystick } from 'react-joystick-component';
import useResponsiveFov from './utils/useResponsiveFov';
import CameraEntrance from './utils/CameraEntrance';

// City colors for different tech domains
const cityColors = {
  languages: '#ff6b35',
  web: '#00ffff',
  mobile: '#ff00ff',
  arvr: '#00ff00',
  uiux: '#ffff00',
  backend: '#ff4444',
  database: '#8a2be2',
  tools: '#ffa500',
  aiml: '#00bfff',
};

// Wrap individual models in Suspense
function ModelWithSuspense({ component: Component, ...props }) {
  return (
    <Suspense fallback={null}>
      <Component {...props} />
    </Suspense>
  );
}

// Add a loading fallback component for individual models
function LoadingFallback() {
  return (
    <Billboard>
      <Text fontSize={0.2} color="#000000">
        Loading...
      </Text>
    </Billboard>
  );
}

const InstancedContext = React.createContext(null);

function Instances({ children }) {
  const { nodes: houseNodes, materials: houseMaterials } = useGLTF('/models/house.glb');
  const { nodes: tankNodes, materials: tankMaterials } = useGLTF('/models/water tank.glb');

  // Apply Toon Material to loaded nodes
  React.useMemo(() => {
    [houseNodes, tankNodes].forEach(nodes => {
      Object.values(nodes).forEach(node => {
        if (node.isMesh) {
          node.material = new THREE.MeshToonMaterial({
            color: node.material.color,
            map: node.material.map,
            gradientMap: null
          });
        }
      });
    });
  }, [houseNodes, tankNodes]);

  const instances = React.useMemo(() => ({
    HouseCube: houseNodes.Cube,
    HouseCube1: houseNodes.Cube_1,
    HouseCube2: houseNodes.Cube_2,
    HouseCube3: houseNodes.Cube_3,
    TankCyl1: tankNodes.Cylinder_1,
    TankCyl2: tankNodes.Cylinder_2,
    TankCyl3: tankNodes.Cylinder_3,
    TankPath1: tankNodes.NurbsPath,
    TankPath2: tankNodes.NurbsPath001,
  }), [houseNodes, tankNodes]);

  return (
    <Merged meshes={instances}>
      {(models) => <InstancedContext.Provider value={models}>{children}</InstancedContext.Provider>}
    </Merged>
  );
}

function City({ id, name, position, onClick, isSelected, color }) {
  const instances = React.useContext(InstancedContext);
  return (
    <group position={position} onClick={() => onClick(id)}>
      <Suspense fallback={<LoadingFallback />}>
        {instances ? (
          <group position={[0, 0, 0]}>
            <group position={[0, 0, 2.412]} scale={[0.53, 0.284, 0.284]}>
              <instances.HouseCube />
              <instances.HouseCube1 />
              <instances.HouseCube2 />
              <instances.HouseCube3 />
            </group>
          </group>
        ) : <House scale={1} />}
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        {instances ? (
          <group position={[1, -0.5, -1]}>
            {/* Instanced WaterTank partial implementation */}
            <group position={[-0.001, 0.904, 3.351]} scale={[0.165, 0.712, 0.165]}>
              <instances.TankCyl1 />
              <instances.TankCyl2 />
              <instances.TankCyl3 />
            </group>
            {/* Simplified WaterTank extra pipes to save calls if needed, or implement all paths */}
          </group>
        ) : <WaterTank position={[1, -0.5, -1]} />}
      </Suspense>

      {/* City label billboard */}
      <Billboard position={[0, 1.4, 2.5]}>
        {/* Sign post */}
        <mesh position={[0, -0.5, -0.02]}>
          <boxGeometry args={[0.06, 0.8, 0.04]} />
          <meshToonMaterial color="#5a3e1a" />
        </mesh>

        {/* Sign board background */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[isSelected ? 2.2 : 1.8, isSelected ? 0.7 : 0.55]} />
          <meshToonMaterial color={isSelected ? color : '#1a1a1a'} />
        </mesh>

        {/* Inner panel */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[isSelected ? 2.0 : 1.6, isSelected ? 0.55 : 0.4]} />
          <meshToonMaterial color={isSelected ? '#1a1a1a' : '#2a2a2a'} />
        </mesh>

        {/* Text */}
        <Text
          fontSize={isSelected ? 0.3 : 0.22}
          position={[0, 0, 0.01]}
          color={isSelected ? color : '#ffffff'}
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {name}
        </Text>

        {/* Glow indicator for selected */}
        {isSelected && (
          <pointLight position={[0, 0, 0.5]} intensity={0.8} color={color} distance={3} />
        )}
      </Billboard>
    </group>
  );
}

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
    if (width > 900) cam.setViewOffset(width, height, -width * 0.13, 0, width, height);
    else cam.clearViewOffset();
    cam.updateProjectionMatrix();
    return () => cam.clearViewOffset();
  }, [width, height, fov]);
  return <PerspectiveCamera ref={ref} makeDefault position={[0, 15, 22.5]} fov={fov} />;
}

export default function SciFiSkillCities({ lowPowerMode = false, header = null }) {
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

  const cityPositions = DISTRICT_POSITIONS;

  // Island props. The windmill and tank models sit offset from their own origins
  // (about (0.2, 5.15) and (1.43, 3.64)), so those offsets are subtracted here.
  const WINDMILL_SCALE = 1.8;   // the origin offset scales with the model
  const windmillPositions = Object.fromEntries(PARK_WINDMILLS.map(([x, z], i) => [`w${i}`, [x - 0.2 * WINDMILL_SCALE, 1.55 - 0.14 * WINDMILL_SCALE, z - 5.15 * WINDMILL_SCALE]]));
  const treePositions = Object.fromEntries(PARK_TREES.map(([x, z], i) => [`t${i}`, [x, 1.3, z]]));
  const tankPositions = Object.fromEntries(PARK_TANKS.map(([x, z], i) => [`k${i}`, [x - 1.43, 1.1, z - 3.64]]));

  const visibleWindmills = Object.entries(windmillPositions).slice(0, lowPowerMode ? 2 : undefined);
  const visibleTrees = Object.entries(treePositions).slice(0, lowPowerMode ? 12 : undefined);
  const visibleTanks = Object.entries(tankPositions);

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
          cursor: 'grab'
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
            {!driveMode && (
              <OrbitControls
                enableZoom={true}
                enablePan={true}
                enableRotate={true}
                maxPolarAngle={Math.PI / 2.3}
                minDistance={8}
                maxDistance={34}
                enableDamping={true}
                dampingFactor={0.05}
              />
            )}

            {/* The island: terraces, ring road, sea, waterfall, dock, boat, rocks, clouds */}
            <SkillIsland lowPowerMode={lowPowerMode} />
            <SelectionRing districtId={selectedCity} />

            {/* Car with camera */}
            <Suspense fallback={null}>
              {!driveMode && <TownCamera />}
              <Car
                position={DISTRICT_ROAD_POINTS[currentCity].toArray()}
                path={driveMode ? null : path}
                driveMode={driveMode}
                keysRef={driveKeysRef}
                cityPositions={DISTRICT_CENTERS}
                isOverGround={isOnIsland}
                spawn={SPAWN_POINT}
                onReachEnd={() => setCurrentCity(selectedCity)}
              />
            </Suspense>

            {/* Decorative elements */}
            <group>
              {/* Windmills */}
              {visibleWindmills.map(([id, pos]) => (
                <Suspense key={id} fallback={<LoadingFallback />}>
                  <WindMills position={pos} scale={WINDMILL_SCALE} />
                </Suspense>
              ))}

              {/* Trees */}
              {visibleTrees.map(([id, pos]) => (
                <Suspense key={id} fallback={<LoadingFallback />}>
                  <Tree position={pos} scale={1.35} />
                </Suspense>
              ))}

              {/* Tanks */}
              {visibleTanks.map(([id, pos]) => (
                <Suspense key={id} fallback={<LoadingFallback />}>
                  <Tank position={pos} />
                </Suspense>
              ))}

              {/* Cities */}
              {Object.entries(cityPositions).map(([id, pos]) => (
                <City
                  key={id}
                  id={id}
                  name={id.toUpperCase()}
                  position={pos}
                  onClick={handleCityClick}
                  isSelected={selectedCity === id}
                  color={cityColors[id]}
                />
              ))}
            </group>


          </Suspense>
        </Canvas>

        {/* Drive Mode Toggle */}
        <button
          className="drive-toggle"
          onClick={() => setDriveMode(!driveMode)}
          style={{
            position: 'absolute',
            top: '96px',
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
