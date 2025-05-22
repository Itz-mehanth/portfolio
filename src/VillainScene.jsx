import { useRef, useEffect } from 'react'
import { Environment, OrbitControls, Stars, PerspectiveCamera, Cloud, Clouds } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'



// Rock throne
function RockThrone() {
  return (
    <mesh position={[0, 0.3, 0]}>
      <boxGeometry args={[1.5, 0.6, 1.5]} />
      <meshStandardMaterial color="#333" />
    </mesh>
  )
}


function SteelRingsUpright({ count = 5 }) {
  const groupRef = useRef()
  const rings = useRef([])

  useEffect(() => {
    // same size but randomized vertical placement
    if (rings.current.length === 0) {
      rings.current = Array.from({ length: count }).map((_, i) => ({
        height: -3 + Math.random() * 15,
        speed: 0.1 + Math.random() * 0.5,
        shakeIntensity: 0.02 + Math.random() * 0.1,
        initialRotationX: Math.PI / 2,    
                // <-- upright
        initialRotationY: Math.PI,
        initialRotationZ: Math.PI,
      }))

    }

  }, [count, rings])

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()
    rings.current.forEach((ring, i) => {
      const mesh = groupRef.current.children[i]
      if (!mesh) return

      // Apply original upright orientation + wobble as *offset*
      mesh.rotation.x = ring.initialRotationX + Math.sin(time * 1.5 + i) * ring.shakeIntensity
      mesh.rotation.y = ring.initialRotationY + Math.sin(time * 1 + i) * ring.shakeIntensity / 2
      mesh.rotation.z = ring.initialRotationZ + Math.cos(time * 2 + i) * ring.shakeIntensity
    })    
  })

  return (
    <group ref={groupRef}>
      {rings.current.map((ring, i) => (
        <mesh key={i} position={[0, ring.height, 0]} rotation={[0, ring.initialRotation, 0]}>
          <torusGeometry args={[8, 0.05, 16, 500]} />
          <meshStandardMaterial color="#999" metalness={1} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function RandomOrbitingRocks({ count = 50, speedMultiplier = 3 }) {
  const groupRef = useRef()
  const rocks = useRef([])

  useEffect(() => {
    if (rocks.current.length === 0) {
      rocks.current = Array.from({ length: count }).map(() => {
        const angle = Math.random() * Math.PI * 2 // random initial angle
        const radius = 5 + Math.random() * 4
        const y = Math.random() * 15 - 6
        const size = 0.05 + Math.random() * 0.3


        // Random speed direction: clockwise (positive) or anticlockwise (negative)
        const direction = Math.random() < 0.5 ? 1 : -1
        const baseSpeed = 0.2 + Math.random() * 0.4
        const speed = baseSpeed * direction

        return { angle, radius, y, size, speed }
      })
    }
  }, [count])

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()
    groupRef.current.children.forEach((mesh, i) => {
      const rock = rocks.current[i]
      const angle = rock.angle + time * rock.speed * speedMultiplier
      const x = Math.cos(angle) * rock.radius
      const z = Math.sin(angle) * rock.radius
      mesh.position.set(x, rock.y, z)
    })
  })

  return (
    <group ref={groupRef}>
      {rocks.current.map((rock, i) => (
        <mesh key={i}>
          <sphereGeometry args={[rock.size, 8, 8]} />
          <meshStandardMaterial color="#000000" roughness={1} />
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
      <Environment preset="sunset" />
      {/* <Stars radius={100} depth={50} count={5000} factor={7} saturation={0} fade speed={1} /> */}

      <PerspectiveCamera makeDefault position={[0, 4, 20]} fov={50} />

      <OrbitControls
        enableZoom={false}
        autoRotate
        autoRotateSpeed={-10} // Adjust speed as needed
      />

      <spotLight
        position={[0, 6, 3]}
        angle={0.5}
        penumbra={0.2}
        intensity={12}
        castShadow
        color={'white'}
        target-position={[0, 0, 0]}
      />


      <Clouds>
        <Cloud opacity={0.2} scale={10} segments={1}/> 
        <Cloud opacity={0.2} scale={10} segments={1}/> 
        <Cloud opacity={0.2} scale={10} segments={1}/> 
      </Clouds>
      

      {/* Steel rings with various radius and speed */}
      {/* <SteelRing radius={4} speed={0.2} shakeIntensity={0.01} />
      <SteelRing radius={6} speed={-0.15} shakeIntensity={0.02} />
      <SteelRing radius={8} speed={0.1} shakeIntensity={0.03} /> */}

      {/* Orbiting rocks */}
      {/* <RandomSteelRings count={6} /> */}
      {/* <OrbitingRocks count={25} baseRadius={2.5} /> */}

      <SteelRingsUpright count={6} />
      <RandomOrbitingRocks count={155} />

      {/* Central rock throne */}
      <RockThrone />

      {/* Villain character */}
      <mesh position={[0, 1.2, -1]}>
        <boxGeometry args={[0.8, 1.5, 0.8]} />
        <meshStandardMaterial color={'black'} />
      </mesh>


      {/* Ground */}
      {/* <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#000000" />
      </mesh> */}

      {/* Effects */}
      <EffectComposer>
        {/* <Bloom intensity={0.4} luminanceThreshold={0.3} luminanceSmoothing={0.6} /> */}
        <DepthOfField focusDistance={0.001} focalLength={0.06} bokehScale={3} height={480} />
      </EffectComposer>
    </>
  )
}