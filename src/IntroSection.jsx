import { useBox, useSphere, Physics, usePlane } from '@react-three/cannon'
import { OrbitControls, Center, Text3D, Sparkles, DeviceOrientationControls, PerspectiveCamera, Billboard, Text } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Suspense, useState, useEffect, useMemo, useRef, useCallback } from 'react'
import * as THREE from 'three'

function Controls() {
  const [mobile, setMobile] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)

  function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  useEffect(() => {
    setMobile(isMobileDevice())
  }, [])

  useEffect(() => {
    const requestPermission = async () => {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        try {
          const response = await DeviceOrientationEvent.requestPermission()
          if (response === 'granted') {
            setPermissionGranted(true)
          }
        } catch (error) {
          console.error('Permission request denied or failed:', error)
        }
      } else {
        setPermissionGranted(true)
      }
    }

    if (mobile) {
      requestPermission()
    }
  }, [mobile])

  if (mobile) {
    return permissionGranted ? <DeviceOrientationControls makeDefault /> : null
  }

  return <OrbitControls enableZoom={false} />
}

function ClickableBox({ position, color }) {
  const [ref, api] = useBox(() => ({ mass: 1, position }))

  return (
    <mesh
      ref={ref}
      onPointerDown={(e) => {
        e.stopPropagation()
        api.applyImpulse([15, 15, 15], [0, 0, 0])
      }}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[4, 4, 4]} />
      <meshPhysicalMaterial
        transmission={1}
        thickness={1}
        emissive={new THREE.Color(color)}
        emissiveIntensity={2}
        roughness={0}
        clearcoat={1}
        clearcoatRoughness={0.1}
        metalness={1}
        iridescence={1}
        iridescenceIOR={1.3}
        iridescenceThicknessRange={[100, 400]}
        reflectivity={2}
        color={color}
      />
    </mesh>
  )
}

function ClickableSphere({ position, color }) {
  const [ref, api] = useSphere(() => ({ mass: 1, position }))

  return (
    <mesh
      ref={ref}
      onPointerDown={(e) => {
        e.stopPropagation()
        api.applyImpulse([15, 15, 15], [0, 0, 0])
      }}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[2, 24, 24]} />
      <meshPhysicalMaterial
        transmission={1}
        thickness={1}
        emissive={new THREE.Color(color)}
        emissiveIntensity={0.7}
        roughness={0}
        clearcoat={1}
        clearcoatRoughness={0.1}
        metalness={0}
        iridescence={1}
        iridescenceIOR={1.3}
        iridescenceThicknessRange={[100, 400]}
        reflectivity={0.8}
        color={color}
      />
    </mesh>
  )
}

function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -7, 0],
  }))

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshBasicMaterial transparent opacity={0} color={'black'} />
    </mesh>
  )
}

export function DraggableMeshes({ lowPowerMode = false }) {
  const NUM_OBJECTS = lowPowerMode ? 6 : 10

  const objectConfigs = useMemo(() =>
    Array.from({ length: NUM_OBJECTS }).map((_, i) => ({
      type: Math.random() > 0.5 ? 'sphere' : 'box',
      position: [
        (Math.random() - 0.5) * 50,
        Math.random() * 50 + 10,
        (Math.random() - 0.5) * 50
      ]
    }))
  , [NUM_OBJECTS])

  return (
    <>
      <Physics gravity={[0, -9.81, 0]}>
        {objectConfigs.map((config, i) =>
          config.type === 'sphere' ? (
            <ClickableSphere key={`s-${i}`} position={config.position} color="white" />
          ) : (
            <ClickableBox key={`b-${i}`} position={config.position} color="orange" />
          )
        )}
        <Ground />
      </Physics>
    </>
  )
}

// Paint splash particles
function PaintSplash({ position, color, active }) {
  const ref = useRef();
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map(() => ({
      dir: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 2 + 1,
        (Math.random() - 0.5) * 2
      ),
      speed: 0.5 + Math.random() * 1.5,
    }));
  }, []);

  const elapsed = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current || !active) {
      elapsed.current = 0;
      if (ref.current) ref.current.visible = false;
      return;
    }
    ref.current.visible = true;
    elapsed.current += delta;
    const t = elapsed.current;

    const positions = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      positions[i * 3] = position[0] + p.dir.x * p.speed * t;
      positions[i * 3 + 1] = position[1] + p.dir.y * p.speed * t - 4.9 * t * t;
      positions[i * 3 + 2] = position[2] + p.dir.z * p.speed * t;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;

    // Fade after 0.6s
    ref.current.material.opacity = Math.max(0, 1 - t / 0.6);
  });

  const posArr = useMemo(() => new Float32Array(particles.length * 3), []);

  return (
    <points ref={ref} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={posArr} count={particles.length} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.4} color={color} transparent opacity={1} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// Paint bucket with dip interaction
function PaintBucket({ position, color, onDip }) {
  const [dipping, setDipping] = useState(false);
  const [splashActive, setSplashActive] = useState(false);
  const bucketRef = useRef();
  const paintRef = useRef();

  const handleClick = (e) => {
    e.stopPropagation();
    setDipping(true);
    setSplashActive(true);
    onDip(color);

    // Animate paint surface wobble
    setTimeout(() => setDipping(false), 400);
    setTimeout(() => setSplashActive(false), 700);
  };

  useFrame((_, delta) => {
    if (paintRef.current && dipping) {
      paintRef.current.scale.y = 0.7 + Math.sin(Date.now() * 0.02) * 0.15;
    } else if (paintRef.current) {
      paintRef.current.scale.y += (1 - paintRef.current.scale.y) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Bucket body — colored to match paint */}
      <mesh ref={bucketRef} onClick={handleClick} castShadow>
        <cylinderGeometry args={[0.6, 0.5, 1.2, 16]} />
        <meshBasicMaterial color={color} opacity={0.85} transparent />
      </mesh>

      {/* Bucket rim */}
      <mesh position={[0, 0.6, 0]}>
        <torusGeometry args={[0.6, 0.06, 8, 16]} />
        <meshBasicMaterial color="white" opacity={0.6} transparent />
      </mesh>

      {/* Paint surface inside */}
      <mesh ref={paintRef} position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.2, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Drips on outside */}
      <mesh position={[0.45, 0.2, 0]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[-0.35, 0.3, 0.3]}>
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0.1, 0.15, -0.45]}>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Splash particles */}
      <PaintSplash position={[0, 0.5, 0]} color={color} active={splashActive} />
    </group>
  );
}

// Paint buckets row — positioned close to the 3D name
function PaintBuckets({ onColorChange }) {
  const colors = ['#ff3b30', '#fbbf24', '#34d399', '#3b82f6'];
  const spacing = 1.4;
  const startX = -((colors.length - 1) * spacing) / 2;

  return (
    <group position={[0, -3, -4]}>
      {/* Extra lighting for the paint to look vibrant */}
      <pointLight position={[0, 2, 2]} intensity={3} color="#ffffff" distance={8} />
      <pointLight position={[-3, 1, 1]} intensity={1.5} color="#ffffff" distance={6} />
      <pointLight position={[3, 1, 1]} intensity={1.5} color="#ffffff" distance={6} />
      {colors.map((color, i) => (
        <PaintBucket
          key={color}
          position={[startX + i * spacing, 0, 0]}
          color={color}
          onDip={onColorChange}
        />
      ))}
    </group>
  );
}

import { useInView } from 'react-intersection-observer'

export default function IntroSection({ lowPowerMode = false }) {
  const [ref, inView] = useInView({ threshold: 0 })
  const [cursorColor, setCursorColor] = useState(null)

  const handleColorChange = useCallback((color) => {
    setCursorColor(color);
    // Override the global cursor by injecting a style
    const existingStyle = document.getElementById('paint-cursor-style');
    if (existingStyle) existingStyle.remove();
    const style = document.createElement('style');
    style.id = 'paint-cursor-style';
    const cursorSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><defs><filter id='glow'><feGaussianBlur stdDeviation='2' result='blur'/><feMerge><feMergeNode in='blur'/><feMergeNode in='SourceGraphic'/></feMerge></filter></defs><path d='M3 3L21 12L12 15L9 21L3 3Z' fill='${color}' stroke='rgba(0,0,0,0.4)' stroke-width='1.5' filter='url(%23glow)'/></svg>`;
    const encoded = encodeURIComponent(cursorSvg);
    style.textContent = `*, *::before, *::after, body, a, button { cursor: url("data:image/svg+xml,${encoded}") 5 5, auto !important; }`;
    document.head.appendChild(style);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: 'blue',
        position: 'relative',
        zIndex: 10,
        width: '90%',
        height: '60%',
        borderRadius: '20px',
        overflow: 'hidden',
        margin: '10px auto',
        cursor: cursorColor ? `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='8' fill='${cursorColor}' opacity='0.9'/><circle cx='12' cy='12' r='10' fill='none' stroke='${cursorColor}' stroke-width='2' opacity='0.5'/></svg>`)}") 12 12, auto` : undefined,
      }}
    >
      {/* Dip indicator */}
      {cursorColor && (
        <div style={{
          position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
          padding: '4px 12px', borderRadius: '12px', zIndex: 20,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cursorColor, boxShadow: `0 0 6px ${cursorColor}` }} />
          <span style={{ color: 'white', fontSize: '10px', fontFamily: "'Quicksand', sans-serif" }}>Cursor painted!</span>
        </div>
      )}

      <Canvas frameloop={inView ? 'always' : 'never'} dpr={lowPowerMode ? [0.75, 1] : [1, 1.5]}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 1]} fov={40} />
          <ambientLight intensity={5} />
          <Controls />
          {!lowPowerMode && (
            <EffectComposer>
              <Bloom luminanceThreshold={0.35} intensity={0.8} />
            </EffectComposer>
          )}
          <Center>
            <Billboard follow position={[0, 0, 0]}>
              <Text
                position={[0, 10, -30]}
                fontSize={3}
                color={'white'}
              >
                Look around and interact with the objects!
              </Text>
            </Billboard>
            <Text3D
              font={'/fonts/Calligraphy_Regular.typeface.json'}
              emissive={'white'}
              color={'white'}
              emissiveIntensity={5}
              castShadow={false}
              receiveShadow={false}
              size={10}
              height={2}
              letterSpacing={0.1}
              position={[-10, 0, -150]}
              rotation={[0, 0, 0]}
            >
              Mehanth
              <meshPhysicalMaterial
                emissive={'white'}
                emissiveIntensity={0.25}
                color={'white'}
                ior={1.44}
                transmission={0.9}
                reflectivity={0.8}
              />
            </Text3D>
          </Center>
          <Sparkles count={lowPowerMode ? 18 : 40} size={4} scale={10} noise={1} speed={0.8} blending={THREE.AdditiveBlending} color={'yellow'} />

          {/* Paint Buckets */}
          <PaintBuckets onColorChange={handleColorChange} />

          {/* Draggable Meshes */}
          <DraggableMeshes lowPowerMode={lowPowerMode} />
        </Suspense>
      </Canvas>
    </div>
  )
}
