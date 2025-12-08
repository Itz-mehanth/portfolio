import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Text, Sky, PerspectiveCamera, OrbitControls, QuadraticBezierLine, Billboard, useGLTF, Merged, AdaptiveDpr, AdaptiveEvents, BakeShadows } from '@react-three/drei';
import * as THREE from 'three';
import Ground from './utils/models/Ground';
import { Suspense } from 'react';
import House from './utils/models/House';
import WaterTank from './utils/models/WaterTank';
import Tank from './utils/models/Tank';
import WindMills from './utils/models/WIndMill';
import Tree from './utils/models/Tree';
import { RGBELoader } from 'three-stdlib';
import { useLoader } from '@react-three/fiber';

import { EffectComposer, Outline } from '@react-three/postprocessing';
import Car from './utils/models/Car';
import { useInView } from 'react-intersection-observer';
import { Environment } from '@react-three/drei';

// Preload all models at the start
useGLTF.preload('models/house.glb');
useGLTF.preload('models/water tank.glb');
useGLTF.preload('models/tank.glb');
useGLTF.preload('models/wind mill.glb');
useGLTF.preload('models/tree.glb');
useGLTF.preload('models/ground.glb');
useGLTF.preload('models/car.glb');

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
  const { nodes: houseNodes, materials: houseMaterials } = useGLTF('models/house.glb');
  const { nodes: tankNodes, materials: tankMaterials } = useGLTF('models/water tank.glb');

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

      {!isSelected && (
        <Billboard position={[0, 1.1, 2.5]}>
          <Text fontSize={0.4} position={[0, 0, 0]} color="#000000" anchorX="center" anchorY="middle">
            {name}
          </Text>
        </Billboard>
      )}

      {isSelected && (
        <Billboard position={[0, 1.1, 2.6]}>
          <mesh>
            <planeGeometry args={[2.5, 1]} />
            <meshStandardMaterial emissive={color} emissiveIntensity={20} color={color} />
          </mesh>
          <Text fontSize={0.35} fontWeight={1000} position={[0, 0, 0]} color="black" anchorX="center" anchorY="middle">
            {name}
          </Text>
        </Billboard>
      )}
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

// Updated city order with new categories
const cityOrder = ['languages', 'web', 'mobile', 'backend', 'database', 'arvr', 'uiux', 'tools', 'aiml'];

const cityPathPoints = {
  languages: new THREE.Vector3(8, 1.6, -0.5),
  web: new THREE.Vector3(5, 1.6, 0.2),
  mobile: new THREE.Vector3(2, 1.6, 0.5),
  backend: new THREE.Vector3(-1, 1.6, 0.4),
  database: new THREE.Vector3(-4, 1.6, 0.3),
  arvr: new THREE.Vector3(-7, 1.6, 0.5),
  uiux: new THREE.Vector3(-10, 1.6, 0.4),
  tools: new THREE.Vector3(-13, 1.6, 0.3),
  aiml: new THREE.Vector3(-16, 1.6, 0.4),
};

const getCityToCityPath = (fromId, toId) => {
  const fromIndex = cityOrder.indexOf(fromId);
  const toIndex = cityOrder.indexOf(toId);
  if (fromIndex === -1 || toIndex === -1 || fromId == toId) return null;

  const pathSlice = cityOrder.slice(
    Math.min(fromIndex, toIndex),
    Math.max(fromIndex, toIndex) + 1
  );

  const orderedPoints = (fromIndex <= toIndex ? pathSlice : pathSlice.reverse()).map(
    (id) => cityPathPoints[id]
  );

  return new THREE.CatmullRomCurve3(orderedPoints, false, 'catmullrom', 0.5);
};

export default function SciFiSkillCities() {
  const [selectedCity, setSelectedCity] = useState('languages'); // starting city
  const [currentCity, setCurrentCity] = useState('languages');
  const [path, setPath] = useState(null);
  const [ref, inView] = useInView({ threshold: 0 }); // Visibility check for 3D canvas

  const texture = useLoader(RGBELoader, '/hdr/anime_sky.hdr');
  texture.mapping = THREE.EquirectangularReflectionMapping;

  const handleCityClick = (id) => {
    setSelectedCity(id);

    const pathToTarget = getCityToCityPath(currentCity, id);
    setPath(pathToTarget);
  };

  // Updated city positions for better layout
  const cityPositions = {
    languages: [8, 1.55, -1.5],
    web: [5, 1.55, -3],
    mobile: [2, 1.55, -0],
    backend: [-1, 1.55, -3.2],
    database: [-4, 1.55, -0.6],
    arvr: [-7, 1.55, -2.8],
    uiux: [-10, 1.55, -0.9],
    tools: [-13, 1.55, -3.4],
    aiml: [-17, 1.55, -0.1],
  };

  // Updated decorative element positions
  const windmillPositions = {
    pos1: [-5, 1, -4],
    pos2: [-8, 1, -4.5],
    pos3: [-11, 1, -4.2],
    pos4: [-14, 1, -4.8],
    pos5: [3, 1, -4.3],
    pos6: [6, 1, -4.1],
  };

  const treePositions = {
    tree1: [-18, 1.3, 0],
    tree2: [-15, 1.3, 1],
    tree3: [-12, 1.3, 1.5],
    tree4: [-9, 1.3, 1.2],
    tree5: [-6, 1.3, 1.8],
    tree6: [-3, 1.3, 1.3],
    tree7: [0, 1.3, 1.6],
    tree8: [3, 1.3, 1.4],
    tree9: [6, 1.3, 1.7],
    tree10: [9, 1.3, 1.1],
    tree11: [10, 1.3, -0.8],
    tree12: [7, 1.3, 0.9],
    tree13: [4, 1.3, 0.7],
  };

  const tankPositions = {
    tank1: [-17, 1.1, -2],
    tank2: [-14, 1.1, -1.5],
    tank3: [-11, 1.1, -1.8],
    tank4: [-8, 1.1, -1.3],
    tank5: [-5, 1.1, -1.9],
    tank6: [-2, 1.1, -1.4],
    tank7: [1, 1.1, -1.7],
    tank8: [4, 1.1, -1.2],
    tank9: [9, 1.1, -3.5],
  };

  // Updated skills by city based on the new skill list
  const skillsByCity = {
    languages: [
      { name: 'Python', description: 'Versatile programming language for backend, AI/ML, and scripting' },
      { name: 'JavaScript', description: 'Essential language for web development and frontend interactions' },
      { name: 'TypeScript', description: 'Typed superset of JavaScript for large-scale applications' },
      { name: 'Dart', description: 'Programming language optimized for Flutter mobile app development' },
      { name: 'C', description: 'Low-level programming language for system programming and embedded systems' },
      { name: 'C++', description: 'Object-oriented extension of C for game development and performance-critical apps' },
      { name: 'Java', description: 'Platform-independent language for enterprise and Android development' },
      { name: 'SQL', description: 'Standard language for database queries and data manipulation' },
    ],
    web: [
      { name: 'HTML', description: 'Markup language for structuring web content and pages' },
      { name: 'CSS', description: 'Styling language for designing web page layouts and appearances' },
      { name: 'Tailwind CSS', description: 'Utility-first CSS framework for rapid UI development' },
      { name: 'React.js', description: 'JavaScript library for building interactive user interfaces' },
      { name: 'Next.js', description: 'React framework with SSR, routing, and performance optimization' },
      { name: 'React Three Fiber', description: 'React renderer for Three.js 3D graphics in web browsers' },
      { name: 'Three.js', description: 'JavaScript library for creating 3D graphics and animations in browsers' },
      { name: 'WebSockets', description: 'Protocol for real-time bidirectional communication between client and server' },
      { name: 'WebRTC', description: 'Technology for peer-to-peer real-time communication in web applications' },
    ],
    mobile: [
      { name: 'Flutter', description: 'Google\'s cross-platform framework for iOS and Android app development' },
      { name: 'Dart', description: 'Programming language specifically designed for Flutter development' },
    ],
    backend: [
      { name: 'Node.js', description: 'JavaScript runtime for building scalable server-side applications' },
      { name: 'Express.js', description: 'Minimalist web framework for Node.js backend development' },
      { name: 'Flask', description: 'Lightweight Python web framework for APIs and microservices' },
      { name: 'REST API', description: 'Architectural style for designing networked applications and web services' },
    ],
    database: [
      { name: 'MySQL', description: 'Popular relational database management system for structured data' },
      { name: 'MongoDB', description: 'NoSQL document database for flexible, scalable data storage' },
    ],
    arvr: [
      { name: 'Three.js', description: 'JavaScript library for 3D graphics, VR, and AR web experiences' },
      { name: 'React Three Fiber', description: 'React integration for Three.js enabling declarative 3D scenes' },
      { name: 'Unity', description: 'Game engine for creating immersive VR, AR, and 3D applications' },
      { name: 'Blender', description: '3D modeling, animation, and rendering software for asset creation' },
    ],
    uiux: [
      { name: 'Figma', description: 'Collaborative design tool for UI/UX prototyping and design systems' },
    ],
    tools: [
      { name: 'Git', description: 'Version control system for tracking code changes and collaboration' },
      { name: 'Firebase', description: 'Google platform providing backend services, hosting, and real-time database' },
      { name: 'Raspberry Pi', description: 'Single-board computer for IoT projects and embedded systems' },
    ],
    aiml: [
      { name: 'TensorFlow', description: 'Open-source machine learning framework for neural networks and AI' },
      { name: 'OpenCV', description: 'Computer vision library for image processing and analysis' },
      { name: 'CNNs', description: 'Convolutional Neural Networks for image recognition and classification' },
    ],
  };

  return (
    <>
      <div
        ref={ref}
        style={{
          width: '90vw',
          height: '60vh',
          border: '15px ridge black',
          borderRadius: '10px',
          position: 'relative',
          zIndex: 10,
          pointerEvents: 'auto',
          cursor: 'grab'
        }}
        onClick={() => console.log('Canvas container clicked!')}
      >
        <Canvas
          frameloop={inView ? 'always' : 'never'}
          camera={{ position: [0, 6, 20], fov: 60 }}
          shadows
          gl={{ toneMapping: THREE.ACESFilmicToneMapping, outputEncoding: THREE.sRGBEncoding }}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            pointerEvents: 'auto'
          }}
        >
          <Suspense fallback={null}>

            <AdaptiveDpr pixelated />
            <AdaptiveEvents />
            <BakeShadows />

            {/* Anime Sky Environment */}
            <Environment map={texture} />

            {/* Anime Sky Sphere with Parallax */}
            <mesh position={[0, 0, -50]} scale={[-1, 1, 1]}>
              <sphereGeometry args={[200, 60, 40]} />
              <meshBasicMaterial map={texture} side={THREE.BackSide} />
            </mesh>

            {/* Basic scene setup */}
            <ambientLight intensity={1.2} />
            <directionalLight
              castShadow
              position={[10, 10, 10]}
              intensity={1.4}
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-20}
              shadow-camera-right={20}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            <OrbitControls
              enableZoom={true}
              enablePan={true}
              enableRotate={true}
              maxPolarAngle={Math.PI / 2.3}
              minDistance={5}
              maxDistance={60}
              enableDamping={true}
              dampingFactor={0.05}
            />

            {/* Ground */}
            <Suspense fallback={null}>
              <Ground scale={4} />
            </Suspense>

            {/* Car with camera */}
            <Suspense fallback={null}>
              <PerspectiveCamera makeDefault position={[0, 6, 10]} />
              <Car
                position={cityPathPoints[currentCity].toArray()}
                path={path}
                onReachEnd={() => {
                  console.log('Reached:', selectedCity);
                  setCurrentCity(selectedCity);
                }}
              />
            </Suspense>

            {/* UI Elements */}
            <Billboard position={[0, -2, 1.5]}>
              <Text fontSize={1} position={[0, 1, 0]} color="#000000" anchorX="center" anchorY="middle">
                🚩 Click any house to explore skills
              </Text>
            </Billboard>

            {/* Decorative elements */}
            <group>
              {/* Windmills */}
              {Object.entries(windmillPositions).map(([id, pos]) => (
                <Suspense key={id} fallback={<LoadingFallback />}>
                  <WindMills position={pos} />
                </Suspense>
              ))}

              {/* Trees */}
              {Object.entries(treePositions).map(([id, pos]) => (
                <Suspense key={id} fallback={<LoadingFallback />}>
                  <Tree position={pos} scale={1} />
                </Suspense>
              ))}

              {/* Tanks */}
              {Object.entries(tankPositions).map(([id, pos]) => (
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
      </div>

      <PhysicsSkillsContainer skillsByCity={skillsByCity} selectedCity={selectedCity} />
    </>
  );
}

const PhysicsSkillsContainer = ({ skillsByCity, selectedCity }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const skillsRef = useRef([]);
  const ballRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, isPressed: false });
  const [ref, inView] = useInView({ threshold: 0 }); // Visibility check for 2D keys

  // Physics properties
  const friction = 0.99;
  const bounce = 0.7;
  const gravity = 0.15;
  const repelForce = 60;
  const ballSpeed = 3;

  // Ball physics object
  class Ball {
    constructor(x, y, radius) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.vx = ballSpeed;
      this.vy = ballSpeed;
    }

    update(canvas, skills) {
      // Move ball
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off walls
      if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
        this.vx = -this.vx;
        this.x = this.x - this.radius <= 0 ? this.radius : canvas.width - this.radius;
      }
      if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
        this.vy = -this.vy;
        this.y = this.y - this.radius <= 0 ? this.radius : canvas.height - this.radius;
      }

      // Check collision with skills
      for (let skill of skills) {
        if (this.isCollidingWithRect(skill)) {
          this.resolveRectCollision(skill);
        }
      }

      // Maintain constant speed
      const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      this.vx = (this.vx / currentSpeed) * ballSpeed;
      this.vy = (this.vy / currentSpeed) * ballSpeed;
    }

    isCollidingWithRect(rect) {
      const closestX = Math.max(rect.x, Math.min(this.x, rect.x + rect.width));
      const closestY = Math.max(rect.y, Math.min(this.y, rect.y + rect.height));
      const distanceX = this.x - closestX;
      const distanceY = this.y - closestY;
      return (distanceX * distanceX + distanceY * distanceY) < (this.radius * this.radius);
    }

    resolveRectCollision(rect) {
      const rectCenterX = rect.x + rect.width / 2;
      const rectCenterY = rect.y + rect.height / 2;

      const dx = this.x - rectCenterX;
      const dy = this.y - rectCenterY;

      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // Determine which side of the rectangle we hit
      if (absX / rect.width > absY / rect.height) {
        // Hit left or right side
        this.vx = -this.vx;
        this.x = dx > 0 ? rect.x + rect.width + this.radius : rect.x - this.radius;
      } else {
        // Hit top or bottom side
        this.vy = -this.vy;
        this.y = dy > 0 ? rect.y + rect.height + this.radius : rect.y - this.radius;
      }

      // Give the skill a little push
      const pushForce = 2;
      rect.vx += (dx / Math.sqrt(dx * dx + dy * dy)) * pushForce;
      rect.vy += (dy / Math.sqrt(dx * dx + dy * dy)) * pushForce;
    }

    draw(ctx) {
      ctx.fillStyle = '#FF4444';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Black border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Simplified skill physics object
  class SkillBox {
    constructor(skill, x, y, width, height) {
      this.skill = skill;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      // Set initial velocity
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2;
      this.radius = 8;
      this.isDragging = false;
    }

    update(canvas) {
      if (!this.isDragging) {
        this.vy += gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= friction;
        this.vy *= friction;

        // Boundary collisions
        if (this.x <= 0) {
          this.x = 0;
          this.vx *= -bounce;
        }
        if (this.x + this.width >= canvas.width) {
          this.x = canvas.width - this.width;
          this.vx *= -bounce;
        }
        if (this.y <= 0) {
          this.y = 0;
          this.vy *= -bounce;
        }
        if (this.y + this.height >= canvas.height) {
          this.y = canvas.height - this.height;
          this.vy *= -bounce;
        }
      }
    }

    draw(ctx) {
      // Simple white rounded rectangle
      ctx.fillStyle = '#FFFFFF';
      this.drawRoundedRect(ctx, this.x, this.y, this.width, this.height, this.radius);
      ctx.fill();

      // Black border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      this.drawRoundedRect(ctx, this.x, this.y, this.width, this.height, this.radius);
      ctx.stroke();

      // Text
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.skill.name, this.x + this.width / 2, this.y + this.height / 2 - 8);

      // Description
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const maxChars = Math.floor(this.width / 7);
      const truncatedDesc = this.skill.description.length > maxChars
        ? this.skill.description.substring(0, maxChars - 3) + '...'
        : this.skill.description;
      ctx.fillText(truncatedDesc, this.x + this.width / 2, this.y + this.height / 2 + 12);
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.closePath();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize skills with random velocity
    const skills = skillsByCity[selectedCity] || [];
    skillsRef.current = skills.map((skill, index) => {
      const width = Math.max(200, skill.name.length * 10 + 60);
      const height = 60;
      const x = Math.random() * (canvas.width - width);
      const y = Math.random() * (canvas.height - height);
      return new SkillBox(skill, x, y, width, height);
    });

    // Initialize ball
    ballRef.current = new Ball(50, 50, 10);

    const animate = () => {
      // Light gray background
      ctx.fillStyle = '#F5F5F5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw ball
      ballRef.current.update(canvas, skillsRef.current);
      ballRef.current.draw(ctx);

      // Update and draw skills
      for (let skill of skillsRef.current) {
        skill.update(canvas);
        skill.draw(ctx);
      }

      // Simple collision detection between skills
      for (let i = 0; i < skillsRef.current.length; i++) {
        for (let j = i + 1; j < skillsRef.current.length; j++) {
          const skillA = skillsRef.current[i];
          const skillB = skillsRef.current[j];

          if (!skillA.isDragging && !skillB.isDragging) {
            const dx = (skillA.x + skillA.width / 2) - (skillB.x + skillB.width / 2);
            const dy = (skillA.y + skillA.height / 2) - (skillB.y + skillB.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = (skillA.width + skillB.width) / 2 + 5;

            if (distance < minDistance) {
              const overlap = minDistance - distance;
              const separationX = (dx / distance) * overlap * 0.5;
              const separationY = (dy / distance) * overlap * 0.5;

              skillA.x += separationX;
              skillA.y += separationY;
              skillB.x -= separationX;
              skillB.y -= separationY;

              skillA.vx += separationX * 0.1;
              skillA.vy += separationY * 0.1;
              skillB.vx -= separationX * 0.1;
              skillB.vy -= separationY * 0.1;
            }
          }
        }
      }

      if (inView) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (inView) {
      animate();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedCity, inView]);

  return (
    <div
      ref={ref}
      style={{
        height: '40vh',
        width: '90vw',
        position: 'relative',
        overflow: 'hidden',
        margin: '10px 0px 70px 0',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        backgroundColor: '#F5F5F5',
        border: '2px solid #000000'
      }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          display: 'block'
        }}
      />
    </div>
  );
};