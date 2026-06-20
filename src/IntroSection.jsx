import { OrbitControls, Sparkles, DeviceOrientationControls, PerspectiveCamera, Billboard, Text, Float } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, ChromaticAberration, Vignette } from '@react-three/postprocessing'
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

// ---- GLSL 3D simplex noise (Ashima / Stefan Gustavson) ----
const GLSL_SNOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

// Morphing energy orb — the living showpiece
function MorphingOrb({ lowPowerMode }) {
  const matRef = useRef();
  const meshRef = useRef();
  const pulseRef = useRef(0);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAmp: { value: 0.55 },
    uPulse: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColorA: { value: new THREE.Color('#6d28d9') }, // twilight violet (shadow)
    uColorB: { value: new THREE.Color('#fb7185') }, // warm rose (body)
    uColorC: { value: new THREE.Color('#fcd34d') }, // gold rim glow
  }), []);

  useFrame((state, delta) => {
    if (matRef.current) {
      const u = matRef.current.uniforms;
      u.uTime.value += delta;
      const mx = state.pointer.x, my = state.pointer.y;
      u.uMouse.value.x += (mx - u.uMouse.value.x) * 0.06;
      u.uMouse.value.y += (my - u.uMouse.value.y) * 0.06;
      // decay click pulse
      pulseRef.current *= Math.pow(0.12, delta);
      if (pulseRef.current < 0.001) pulseRef.current = 0;
      u.uPulse.value = pulseRef.current;
      // gentle breathing amplitude + pulse spike
      u.uAmp.value = 0.5 + Math.sin(state.clock.elapsedTime * 0.8) * 0.12 + pulseRef.current * 0.9;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.12;
      meshRef.current.rotation.x = state.pointer.y * 0.25;
      meshRef.current.rotation.z = state.pointer.x * 0.1;
    }
  });

  const handlePulse = (e) => { e.stopPropagation(); pulseRef.current = 1; };

  const vertex = `
    ${GLSL_SNOISE}
    uniform float uTime; uniform float uAmp; uniform vec2 uMouse;
    varying vec3 vNormal; varying vec3 vView; varying float vN;
    void main(){
      float n = snoise(normalize(position)*1.3 + uTime*0.28);
      float n2 = snoise(normalize(position)*2.7 - uTime*0.18)*0.5;
      float mouseBoost = 1.0 + length(uMouse)*0.6;
      float disp = (n + n2) * uAmp * mouseBoost;
      vec3 pos = position + normal * disp;
      vN = n;
      vNormal = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(pos,1.0);
      vView = -mv.xyz;
      gl_Position = projectionMatrix * mv;
    }`;

  const fragment = `
    uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uColorC; uniform float uTime; uniform float uPulse;
    varying vec3 vNormal; varying vec3 vView; varying float vN;
    vec3 hueShift(vec3 c, float a){
      const vec3 k = vec3(0.57735);
      float cosA = cos(a);
      return c*cosA + cross(k,c)*sin(a) + k*dot(k,c)*(1.0-cosA);
    }
    void main(){
      vec3 V = normalize(vView);
      float fres = pow(1.0 - max(dot(V, vNormal), 0.0), 2.0);
      float t = vN*0.5 + 0.5;
      vec3 base = mix(uColorA, uColorB, t);
      vec3 color = base * (0.45 + 0.55 * t);
      color += uColorC * fres * 1.7;
      color += base * fres * 0.6;
      float spark = smoothstep(0.75, 1.0, t) * 0.6;
      color += base * spark;
      // subtle living shimmer — stays within the warm sunset range
      color = hueShift(color, sin(uTime * 0.15) * 0.18);
      // click pulse: flash brighter + whiten rim
      color += (fres + 0.3) * uPulse * 1.5;
      gl_FragColor = vec4(color, 1.0);
    }`;

  return (
    <mesh
      ref={meshRef}
      position={[0, 1, -17]}
      scale={lowPowerMode ? 2.4 : 2.9}
      onClick={handlePulse}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <icosahedronGeometry args={[1, lowPowerMode ? 4 : 6]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// Living accretion vortex — particles spiral inward into the core, then respawn
function ParticleSwarm({ lowPowerMode }) {
  const ref = useRef();
  const count = lowPowerMode ? 500 : 1500;
  const INNER = 3.6, OUTER = 9.5;

  const { positions, colors, parts } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const parts = [];
    const cA = new THREE.Color('#fcd34d'); // gold embers
    const cB = new THREE.Color('#fb7185'); // rose
    const cC = new THREE.Color('#c084fc'); // soft violet
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = INNER + Math.pow(Math.random(), 0.7) * (OUTER - INNER);
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * (0.5 + radius * 0.1);
      const angSpeed = (0.5 + Math.random() * 0.7) * (1 + (OUTER - radius) * 0.06);
      const inSpeed = 0.5 + Math.random() * 1.1;
      parts.push({ radius, angle, y, angSpeed, inSpeed, baseR: radius });
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = y;
      positions[i3 + 2] = Math.sin(angle) * radius;
      const m = (Math.random() < 0.5 ? cA.clone().lerp(cB, Math.random()) : cB.clone().lerp(cC, Math.random()));
      colors[i3] = m.r; colors[i3 + 1] = m.g; colors[i3 + 2] = m.b;
    }
    return { positions, colors, parts };
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array;
    const dt = Math.min(delta, 0.05);
    for (let i = 0; i < count; i++) {
      const p = parts[i];
      p.angle += p.angSpeed * dt;
      p.radius -= p.inSpeed * dt;
      if (p.radius <= INNER) { p.radius = OUTER; p.angle = Math.random() * Math.PI * 2; }
      const i3 = i * 3;
      arr[i3] = Math.cos(p.angle) * p.radius;
      arr[i3 + 1] = p.y * (p.radius / p.baseR);
      arr[i3 + 2] = Math.sin(p.angle) * p.radius;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    // tilt disc toward cursor for a living, 3D feel
    ref.current.rotation.x += ((0.45 + state.pointer.y * 0.35) - ref.current.rotation.x) * 0.05;
    ref.current.rotation.z += (state.pointer.x * 0.12 - ref.current.rotation.z) * 0.05;
  });

  return (
    <points ref={ref} position={[0, 1, -17]} rotation={[0.45, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.13} sizeAttenuation vertexColors transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// Spiral galaxy particle system — the showpiece backdrop
function Galaxy({ lowPowerMode }) {
  const ref = useRef()
  const count = lowPowerMode ? 2600 : 8000

  const { positions, colors } = useMemo(() => {
    const radius = 14
    const branches = 5
    const spin = 1.1
    const randomnessPower = 2.4
    const inside = new THREE.Color('#ffcf6b')   // warm gold core
    const outside = new THREE.Color('#9b5cff')  // purple rim
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      // deterministic-ish pseudo random (no Math.random ban here, this is fine in component)
      const r = Math.pow(Math.random(), 1.6) * radius
      const branchAngle = ((i % branches) / branches) * Math.PI * 2
      const spinAngle = r * spin
      const rand = () => Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
      const rx = rand() * (0.3 + r * 0.06)
      const ry = rand() * (0.18 + r * 0.02)
      const rz = rand() * (0.3 + r * 0.06)

      positions[i3]     = Math.cos(branchAngle + spinAngle) * r + rx
      positions[i3 + 1] = ry
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + rz

      const mixed = inside.clone().lerp(outside, Math.min(r / radius, 1))
      colors[i3] = mixed.r; colors[i3 + 1] = mixed.g; colors[i3 + 2] = mixed.b
    }
    return { positions, colors }
  }, [count])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.06
  })

  return (
    <group ref={ref} position={[0, -2, -42]} rotation={[-Math.PI / 3.2, 0, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
          <bufferAttribute attach="attributes-color" array={colors} count={count} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          sizeAttenuation
          depthWrite={false}
          vertexColors
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

// Drifting glass orbs — translucent spheres that refract the light behind them
function FloatingCrystals({ lowPowerMode }) {
  const orbs = useMemo(() => {
    const list = [
      { pos: [-11, 4, -19], scale: 1.2, tint: '#fcd34d' }, // soft gold
      { pos: [12, -2, -22], scale: 1.5, tint: '#fda4af' }, // soft rose
      { pos: [7, 6.5, -26], scale: 0.9, tint: '#c4b5fd' }, // soft violet
    ]
    return lowPowerMode ? list.slice(0, 2) : list
  }, [lowPowerMode])

  return (
    <>
      {orbs.map((o, i) => (
        <Float key={i} speed={1.1} rotationIntensity={0.2} floatIntensity={1.4} floatingRange={[-0.6, 0.6]}>
          <mesh position={o.pos} scale={o.scale}>
            <sphereGeometry args={[1, 48, 48]} />
            <meshPhysicalMaterial
              color={o.tint}
              transmission={1}
              thickness={0.8}
              ior={1.35}
              roughness={0.18}
              metalness={0}
              clearcoat={1}
              clearcoatRoughness={0.25}
              emissive={o.tint}
              emissiveIntensity={0.12}
              attenuationColor={o.tint}
              attenuationDistance={4}
              transparent
              opacity={0.7}
            />
          </mesh>
        </Float>
      ))}
    </>
  )
}

import { useInView } from 'react-intersection-observer'

export default function IntroSection({ lowPowerMode = false }) {
  const [ref, inView] = useInView({ threshold: 0 })
  const [cursorColor, setCursorColor] = useState(null)

  // WebGL context-loss recovery — entering the lander from a heavy scene can drop
  // this canvas (it would clear to white). Recreate it once the GPU frees up.
  const [glKey, setGlKey] = useState(0)
  const handleGlCreated = ({ gl }) => {
    gl.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault()
      setTimeout(() => setGlKey((k) => k + 1), 450)
    })
  }

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
      className="intro-stage"
      style={{
        background: 'radial-gradient(circle at 50% 38%, #3b2a7a 0%, #1b1140 42%, #0a0618 75%, #030109 100%)',
        position: 'relative',
        zIndex: 10,
        width: '90%',
        height: '60%',
        borderRadius: '20px',
        overflow: 'hidden',
        margin: '10px auto',
        boxShadow: '0 24px 60px -20px rgba(80, 50, 200, 0.45), inset 0 0 80px rgba(120, 80, 255, 0.08)',
        border: '1px solid rgba(150, 120, 255, 0.15)',
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

      <Canvas key={glKey} onCreated={handleGlCreated} frameloop={inView ? 'always' : 'never'} dpr={lowPowerMode ? [0.75, 1] : [1, 1.5]}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 1]} fov={40} />
          <ambientLight intensity={5} />
          <Controls />
          {!lowPowerMode && (
            <EffectComposer>
              <Bloom luminanceThreshold={0.25} luminanceSmoothing={0.9} intensity={1.1} mipmapBlur />
              <ChromaticAberration offset={[0.0009, 0.0012]} />
              <Vignette offset={0.3} darkness={0.55} />
            </EffectComposer>
          )}
          {/* Hint */}
          <Billboard follow position={[0, -8, -10]}>
            <Text fontSize={1.1} color={'white'} fillOpacity={0.55} anchorX="center">
              Drag to orbit  •  Dip your cursor in the paint
            </Text>
          </Billboard>

          <Sparkles count={lowPowerMode ? 18 : 40} size={4} scale={14} noise={1} speed={0.8} blending={THREE.AdditiveBlending} color={'#fff7d6'} />

          {/* Living energy orb — hero centerpiece + orbiting swarm */}
          <MorphingOrb lowPowerMode={lowPowerMode} />
          <ParticleSwarm lowPowerMode={lowPowerMode} />

          {/* Galaxy backdrop + floating crystals */}
          <Galaxy lowPowerMode={lowPowerMode} />
          <FloatingCrystals lowPowerMode={lowPowerMode} />

          {/* Paint Buckets */}
          <PaintBuckets onColorChange={handleColorChange} />
        </Suspense>
      </Canvas>
    </div>
  )
}
