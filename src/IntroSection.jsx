import { useBox, useSphere, Physics, usePlane } from '@react-three/cannon'
import { OrbitControls, Center, Text3D, Box, Sparkles } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Suspense, useRef} from 'react'
import * as THREE from 'three'

function ClickableBox({ position, color }) {
  const [ref, api] = useBox(() => ({ mass: 1, position }))

  return (
    <mesh
      ref={ref}
      onPointerDown={(e) => {
        e.stopPropagation()
        api.applyImpulse([5, 5, 0], [10, 2, 10]) // small jump
      }}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial
        transmission={1}
        thickness={1}
        emissive={new THREE.Color("orange")}
        emissiveIntensity={2}
        roughness={0}
        clearcoat={1}
        clearcoatRoughness={0.1}
        metalness={1}
        iridescence={1}
        iridescenceIOR={1.3}
        iridescenceThicknessRange={[100, 400]}
        reflectivity={2}
        color="orange"
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
        api.applyImpulse([5, 10, 0], [10, 10, 10]) // bounce right
      }}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[0.75, 80, 80]} />
      <meshPhysicalMaterial
        transmission={1}
        thickness={1}
        emissive={new THREE.Color("aqua")}
        emissiveIntensity={1}
        roughness={0}
        clearcoat={1}
        clearcoatRoughness={0.1}
        metalness={0}
        iridescence={1}
        iridescenceIOR={1.3}
        iridescenceThicknessRange={[100, 400]}
        reflectivity={0.8}
        color="aqua"
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
      <meshBasicMaterial color={'black'}/>
    </mesh>
  )
}

export function DraggableMeshes() {
  const NUM_OBJECTS = 20
  const randomPosition = () => [
    (Math.random() - 0.5) * 20, // X between -10 and 10
    Math.random() * 20 + 10,   // Y between 10 and 30 (height)
    (Math.random() - 0.5) * 20 // Z between -10 and 10
  ]
  
  return (
    <>
      <Physics gravity={[0, -9.81, 0]}>
        
        {/* Generate many spheres and boxes at random positions */}
        {Array.from({ length: NUM_OBJECTS }).map((_, i) =>
          Math.random() > 0.5 ? (
            <ClickableSphere key={`s-${i}`} position={randomPosition()} color="skyblue" />
          ) : (
            <ClickableBox key={`b-${i}`} position={randomPosition()} color="orange" />
          )
        )}

        {/* Ground plane */}
        <Ground/>
      </Physics>
    </>
  )
}

export default function IntroSection() {
  return (
    <div
    style={{
        backgroundColor: 'black',
        position: 'relative',
        zIndex: 10,
        width: '90%',
        height: '60%',
        borderRadius: '20px',
        overflow: 'hidden',
        margin: '10px auto',
      }}
      >
      <Canvas shadows camera={{ position: [0, 0, 25], fov: 60 }}>
        <ambientLight intensity={50} />
        <OrbitControls enableZoom={false}/>
        <EffectComposer>
          <Bloom></Bloom>
        </EffectComposer>
        <Suspense fallback={null}>
          <Center>
            <Sparkles count={100}/>
            <Text3D
              font={'/fonts/Calligraphy_Regular.typeface.json'}
              emissive={'white'}
              color={'white'}
              castShadow
              receiveShadow
              emissiveIntensity = {2}
              size={4}
              height={2}
              curveSegments={32}
              bevelEnabled
              bevelSegments={5}
              letterSpacing={0.1}
              position={[0, 0, 0]}
            >
              Mehanth
              <meshPhysicalMaterial color={'white'} ior={1.44} transmission={0.9} roughness={0.1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.5} iridescence={1} iridescenceIOR={1.3} iridescenceThicknessRange={[100, 400]} reflectivity={0.8}
              />
            </Text3D>
          </Center>
          <Sparkles count={200} size={10} scale={50} noise={1} speed={1} blending={THREE.AdditiveBlending} color={'orange'}/>

          {/* Draggable Meshes */}
          <DraggableMeshes />
        </Suspense>
      </Canvas>
    </div>
  )
}