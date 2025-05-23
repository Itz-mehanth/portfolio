import { useRef, useEffect, useMemo, useState } from 'react'
import { Environment, OrbitControls, Stars, PerspectiveCamera, Cloud, Clouds, Icosahedron, CubicBezierLine, Sparkles} from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Effects from './Effects'


// Rock throne
function RockThrone() {
  const glassRef = useRef()

  // Lathe profile for throne back
  const lathePoints = []
  for (let i = 0; i < 10; i++) {
    lathePoints.push(new THREE.Vector2(Math.sin(i * 0.3) * 0.3 + 0.4, i * 0.1))
  }

  useFrame(() => {
    if (glassRef.current) {
      glassRef.current.rotation.y += 0.002
    }
  })

  return (
    <group ref={glassRef} position={[0, 0, 0]}>
      {/* Seat Base */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.5, 1, 1.6]} />
        <meshPhysicalMaterial
          color="#88ccff"
          transmission={1}
          roughness={0}
          metalness={0.1}
          thickness={0.5}
          clearcoat={1}
          ior={1.4}
        />
      </mesh>

      {/* Backrest */}
      {/* <mesh position={[0, 1.2, -0.7]}>
        <latheGeometry args={[lathePoints, 32]} />
        <meshPhysicalMaterial
          color="#88ccff"
          transmission={1}
          roughness={0}
          metalness={0}
          thickness={0.4}
          clearcoat={1}
          ior={1.45}
        />
      </mesh> */}

      {/* Armrests */}
      {/* <mesh position={[0.65, 0, -0.7]}>
        <cylinderGeometry args={[0.1, 0.1, 1.6, 32]} />
        <meshStandardMaterial color="#444" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0.65, 0, 0.7]}>
        <cylinderGeometry args={[0.1, 0.1, 1.6, 32]} />
        <meshStandardMaterial color="#444" metalness={0.3} roughness={0.7} />
      </mesh> */}

      {/* Emissive edge glow */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[1.6, 0.02, 1.7]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}


function SteelRingsUpright({ count = 5 }) {
  const groupRef = useRef()
  const rings = useRef([])
  const materialRef = useRef()
  const [isReady, setIsReady] = useState(false) // ✅

  useEffect(() => {
    if (rings.current.length === 0) {
      rings.current = Array.from({ length: count }).map((_, i) => ({
        height: -5 + Math.random() * 15,
        speed: 0.1 + Math.random() * 0.5,
        shakeIntensity: 0.02 + Math.random() * 0.1,
        initialRotationX: Math.PI / 2,
        initialRotationY: Math.PI,
        initialRotationZ: Math.PI,
      }))
      setIsReady(true) // ✅ force re-render
    }
  }, [count])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (materialRef.current) {
      materialRef.current.iridescenceThicknessRange = [
        100 + Math.sin(time) * 100,
        400 + Math.cos(time) * 100,
      ]
    }

    if (rings.current.length === 0) return

    rings.current.forEach((ring, i) => {
      if (!groupRef.current || !groupRef.current.children[i]) return;
      const mesh = groupRef.current.children[i]
      if (!mesh) return
      mesh.rotation.x = ring.initialRotationX + Math.sin(time * 1.5 + i) * ring.shakeIntensity
      mesh.rotation.y = ring.initialRotationY + Math.sin(time * 1 + i) * ring.shakeIntensity / 2
      mesh.rotation.z = ring.initialRotationZ + Math.cos(time * 2 + i) * ring.shakeIntensity
    })
  })

  if (!isReady) return null // ✅ prevent rendering prematurely

  return (
    <group ref={groupRef}>
      {rings.current.map((ring, i) => (
        <mesh key={i} position={[0, ring.height, 0]}>
          <torusGeometry args={[8, 0.05, 16, 500]} />
          <meshPhysicalMaterial
            ref={materialRef}
            transmission={1}
            thickness={1}
            emissive={new THREE.Color("00ffff")}
            roughness={0}
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={0}
            iridescence={1}
            iridescenceIOR={1.3}
            iridescenceThicknessRange={[100, 400]}
            reflectivity={0.8}
            color="00ffff"
          />
        </mesh>
      ))}
    </group>
  )
}


function RandomOrbitingRocks({ count = 50, speedMultiplier = 3 }) {
  const groupRef = useRef()
  const rocks = useRef([])
  const materialRef = useRef()
  const [isReady, setIsReady] = useState(false) // ✅
  
  useEffect(() => {
    console.log("RandomOrbitingRocks loaded")
    materialRef.current = new THREE.MeshPhysicalMaterial({
      transmission: 1,
      thickness: 1,
      roughness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      metalness: 0,
      iridescence: 1,
      emissive: new THREE.Color("00ffff"),
      iridescenceIOR: 1.3,
      reflectivity: 0.8,
      color: new THREE.Color("00ffff"),
    });
  }, []);

  useEffect(() => {
    if (rocks.current.length === 0) {
      rocks.current = Array.from({ length: count }).map(() => {
        const angle = Math.random() * Math.PI * 2
        const radius = 5 + Math.random() * 4
        const y = Math.random() * 15 - 6
        const size = 0.05 + Math.random() * 0.3
        const direction = Math.random() < 0.5 ? 1 : -1
        const baseSpeed = 0.2 + Math.random() * 0.4
        const speed = baseSpeed * direction
        return { angle, radius, y, size, speed }
      })
    }
    setIsReady(true)
  }, [count])


  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (materialRef.current) {
      materialRef.current.iridescenceThickness = 300 + Math.sin(time) * 100
    }

    if (!groupRef.current) return

    groupRef.current.children.forEach((mesh, i) => {
      const rock = rocks.current[i]
      const angle = rock.angle + time * rock.speed * speedMultiplier
      const x = Math.cos(angle) * rock.radius
      const z = Math.sin(angle) * rock.radius
      mesh.position.set(x, rock.y, z)
    })
  })

  if (!isReady) return null

  return (
    <group ref={groupRef}>
      {rocks.current.map((rock, i) => (
        <mesh material={materialRef.current} key={i}>
          <sphereGeometry args={[0.2, 2, 8]} />
        </mesh>
      ))}
    </group>
  )

}

// Main scene
export default function VillainScene() {
  const spotlightRef = useRef()

  useEffect(() => {
    console.log("VillainScene loaded")
  }, [])

  return (
    <>
      <Environment preset="sunset"/>
      <Stars radius={100} depth={500} count={100} factor={7} saturation={1} fade speed={5} />
      <Stars radius={100} depth={50} count={500} factor={7} saturation={1} fade speed={1} />

      <PerspectiveCamera makeDefault position={[0, 4, 20]} fov={50} />


      <OrbitControls
        enableZoom={false}
        autoRotate
        autoRotateSpeed={-10} // Adjust speed as needed
      />

      <spotLight
        position={[0, 6, 5]}
        angle={0.5}
        penumbra={0.2}
        intensity={12}
        castShadow
        color={'white'}
        target-position={[0, 0, 0]}
      />

    {/* <Effects/> */}
      
      <Clouds>
        <Cloud opacity={1} scale={10} segments={1} color={'white'}/> 
      </Clouds>
      

      {/* Steel rings with various radius and speed */}
      {/* <SteelRing radius={4} speed={0.2} shakeIntensity={0.01} />
      <SteelRing radius={6} speed={-0.15} shakeIntensity={0.02} />
      <SteelRing radius={8} speed={0.1} shakeIntensity={0.03} /> */}

      <SteelRingsUpright count={6} />
      <RandomOrbitingRocks count={100} />

        <Sparkles color={'aqua'} count={100} size={10} scale={50} noise={1} speed={1} blending={THREE.AdditiveBlending}/>
      {/* Central rock throne */}
      <RockThrone />

      {/* Ground */}
      {/* <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#000000" />
      </mesh> */}

      {/* Effects */}
      <EffectComposer>
        <Bloom intensity={0.4} luminanceThreshold={0.3} luminanceSmoothing={0.6} />
        <DepthOfField focusDistance={0.001} focalLength={0.06} bokehScale={3} height={480} />
      </EffectComposer>
    </>
  )
}