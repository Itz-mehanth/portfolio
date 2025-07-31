import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Text, Sky, PerspectiveCamera, OrbitControls, QuadraticBezierLine, Billboard, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import Ground from './utils/models/Ground'; // Adjust the import path as necessary
import { Suspense } from 'react';
import House from './utils/models/House'; // Adjust the import path as necessary
import WaterTank from './utils/models/WaterTank'; // Adjust the import path as necessary
import Tank from './utils/models/Tank'; // Adjust the import path as necessary
import WindMills from './utils/models/WIndMill';
import Tree from './utils/models/Tree'; // Adjust the import path as necessary
import { useLoader } from '@react-three/fiber';
import { EffectComposer, Outline } from '@react-three/postprocessing';
import Car from './utils/models/Car';
import { useThree } from '@react-three/fiber';

// Preload all models at the start
useGLTF.preload('models/house.glb');
useGLTF.preload('models/water tank.glb');
useGLTF.preload('models/tank.glb');
useGLTF.preload('models/wind mill.glb');
useGLTF.preload('models/tree.glb');
useGLTF.preload('models/ground.glb');
useGLTF.preload('models/car.glb');

const cityColors = {
  web: '#00ffff',
  mobile: '#ff00ff',
  arvr: '#00ff00',
  uiux: '#ffff00',
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

function City({ id, name, position, onClick, isSelected }) {
  const color =  '#FF002C';
 
  return (
    <group position={position} onClick={() => onClick(id)}>
      <Suspense fallback={<LoadingFallback />}>
        <House scale={1}/>
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <WaterTank position={[1,-0.5,-1]}/>
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
            <planeGeometry args={[2, 1]} />
            <meshStandardMaterial emissive={'yellow'} emissiveIntensity={50} color={'yellow'} />
          </mesh>
          <Text fontSize={0.4} fontWeight={1000} position={[0, 0, 0]} color="black" anchorX="center" anchorY="middle">
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
        <meshStandardMaterial color={'black'}  />
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

const cityOrder = ['arvr', 'mobile', 'web', 'uiux', 'ai_iot'];

const cityPathPoints = {
  arvr: new THREE.Vector3(5.5, 1.6, 0.5),
  mobile: new THREE.Vector3(2, 1.6, 0.2),
  web: new THREE.Vector3(-1.5, 1.6, 0.5),
  uiux: new THREE.Vector3(-4, 1.6, 0.4),
  ai_iot: new THREE.Vector3(-7, 1.6, 0.4),
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
  const [selectedCity, setSelectedCity] = useState('arvr'); // starting city
  const [currentCity, setCurrentCity] = useState('arvr');
  const [path, setPath] = useState(null);
    
  const handleCityClick = (id) => {
    setSelectedCity(id);

    const pathToTarget = getCityToCityPath(currentCity, id);
    setPath(pathToTarget);
  };


  const cityPositions = {
    web: [-1.5, 1.55, -0.5],
    mobile: [2, 1.55, -3],
    arvr: [6, 1.55, -0.6],
    uiux: [-4, 1.55, -3],
    ai_iot: [-7, 1.55, -1.2],
  };

  const windmillPositions = {
    web: [-5, 1, -4],
    mobile: [-8, 1, -4],
    arvr: [-6, 1, -6],
    uiux: [-8, 1, -6],
  };

  const treePositions = {
    web: [-6, 1.3, 0],
    mobile: [-4, 1.3, 1],
    arvr: [-6, 1.3, -1.5],
    uiux: [-8, 1.3, 1.2],
    uiux1: [8, 1.3, -0.8],
    uiux2: [7, 1.3, 1],
    uiux3: [1, 1.3, 0.9],
    uiux4: [2, 1.3, -1],
    uiux5: [0, 1.3, -0.8],
    uiux6: [-1, 1.3, 1.2],
  }

  const tankPositions = {
    web: [-5, 1.1, -2],
    mobile: [-8, 1.1, -4.5],
    arvr: [-10, 1.1, -2],
    uiux: [-12, 1.1, -4],
  };

  const skillsByCity = {
    web: [
      { name: 'React.js', description: 'A JavaScript library for building user interfaces' },
      { name: 'Next.js', description: 'A React framework with SSR and static site generation' },
      { name: 'Node.js', description: 'A JavaScript runtime for server-side development' },
      { name: 'Flask', description: 'A lightweight Python web framework for APIs and backends' },
      { name: 'MongoDB', description: 'A NoSQL database used for scalable web apps' },
      { name: 'MySQL', description: 'A relational database for structured data' },
      { name: 'REST API', description: 'API architecture style used to interact with web services' },
      { name: 'Firebase', description: 'A platform for real-time databases, hosting, and auth' },
    ],
    mobile: [
      { name: 'Flutter', description: 'Google’s UI toolkit for building native apps in Dart' },
      { name: 'Dart', description: 'The programming language used with Flutter' },
      { name: 'Android (Java)', description: 'Languages and platform for Android app development' },
    ],
    arvr: [
      { name: 'Three.js', description: 'A JavaScript library for 3D rendering in the browser' },
      { name: 'React Three Fiber', description: 'A React renderer for Three.js for easier 3D dev' },
      { name: 'Unity', description: 'Game engine for 3D, AR, and VR experiences' },
      { name: 'Blender', description: '3D modeling and animation tool used in asset creation' },
      { name: 'WebXR', description: 'API to enable immersive VR/AR experiences on the web' },
      { name: 'WebRTC', description: 'Real-time communication for collaborative VR environments' },
      { name: 'WebSockets', description: 'Enables two-way interactive communication in AR/VR apps' },
    ],
    uiux: [
      { name: 'Figma', description: 'Collaborative design tool for UI/UX prototyping and handoff' },
      { name: 'Adobe Illustrator', description: 'Industry-standard tool for creating vector graphics, illustrations, and UI assets' },
    ],
    ai_iot: [
      { name: 'TensorFlow', description: 'ML framework used for CNNs and plant classification' },
      { name: 'OpenCV', description: 'Computer vision library for image processing' },
      { name: 'Hugging Face Transformers', description: 'State-of-the-art NLP models and libraries' },
      { name: 'Raspberry Pi', description: 'Embedded computing platform for IoT and AI deployment' },
      { name: 'CNNs', description: 'Used for image classification in offline plant identifier' },
    ],
  };

  return (
    <>
    <div style={{width: '90vw', height: '60vh', border: '15px ridge black', borderRadius: '10px'}}>
    <Canvas camera={{ position: [0, 6, 20], fov: 60 }} shadows gl={{ toneMapping: THREE.ACESFilmicToneMapping, outputEncoding: THREE.sRGBEncoding }}>
      {/* Basic scene setup - always available */}
      <ambientLight intensity={0.3} />
      {/* <Environment preset='sunset' environmentIntensity={0.4} background={false} /> */}
      <directionalLight
        castShadow
        position={[10, 10, 10]}
        intensity={1.4}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <OrbitControls enableZoom={true} enablePan={true} maxPolarAngle={Math.PI / 2.3} />

      {/* Post-processing effects */}
      <Suspense fallback={null}>
        <EffectComposer>
          <Outline edgeStrength={5} visibleEdgeColor="black" hiddenEdgeColor="gray" blur />
        </EffectComposer>
      </Suspense>

      {/* Ground - fundamental element */}
      <Suspense fallback={null}>
        <Ground scale={3} />
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
          🚩click any house
        </Text>
      </Billboard>

      {/* Decorative elements - can load progressively */}
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
          />
        ))}
      </group>

    </Canvas>
    </div>

      <PhysicsSkillsContainer skillsByCity={skillsByCity} selectedCity={selectedCity}/>
    </>
  );
}

const PhysicsSkillsContainer = ({skillsByCity, selectedCity}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const skillsRef = useRef([]);
  const ballRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, isPressed: false });

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
      this.vx = 0;
      this.vy = 0;
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

    isPointInside(x, y) {
      return x >= this.x && x <= this.x + this.width && 
             y >= this.y && y <= this.y + this.height;
    }

    applyRepelForce(mouseX, mouseY) {
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      const dx = centerX - mouseX;
      const dy = centerY - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100 && distance > 0) {
        const force = repelForce / distance;
        this.vx += (dx / distance) * force;
        this.vy += (dy / distance) * force;
      }
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

    // Initialize skills
    const skills = skillsByCity[selectedCity] || [];
    skillsRef.current = skills.map((skill, index) => {
      const width = Math.max(70, skill.name.length * 8 + 40);
      const height = 50;
      const x = Math.random() * (canvas.width - width);
      const y = Math.random() * (canvas.height - height);
      return new SkillBox(skill, x, y, width, height);
    });

    // Initialize ball
    ballRef.current = new Ball(50, 50, 10);

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      mouseRef.current = { x: mouseX, y: mouseY, isPressed: true };
      
      for (let skill of skillsRef.current) {
        if (skill.isPointInside(mouseX, mouseY)) {
          skill.isDragging = true;
          skill.vx = 0;
          skill.vy = 0;
          break;
        }
      }
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      mouseRef.current.x = mouseX;
      mouseRef.current.y = mouseY;
      
      for (let skill of skillsRef.current) {
        if (skill.isDragging) {
          skill.x = mouseX - skill.width / 2;
          skill.y = mouseY - skill.height / 2;
        }
      }
    };

    const handleMouseUp = () => {
      mouseRef.current.isPressed = false;
      
      for (let skill of skillsRef.current) {
        if (skill.isDragging) {
          skill.isDragging = false;
          skill.vx = (Math.random() - 0.5) * 4;
          skill.vy = (Math.random() - 0.5) * 4;
        }
      }
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      handleMouseUp();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

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
        
        if (mouseRef.current.isPressed && !skill.isDragging) {
          skill.applyRepelForce(mouseRef.current.x, mouseRef.current.y);
        }
        
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
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedCity]);

  return (
    <div style={{
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
