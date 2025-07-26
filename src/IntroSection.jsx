import { useBox, useSphere, Physics, usePlane } from '@react-three/cannon'
import { OrbitControls, Center, Text3D, Box, Sparkles, DeviceOrientationControls, PerspectiveCamera, Billboard, Text } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Suspense, useState, useEffect} from 'react'
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
        // On Android and non-iOS devices, permission is typically granted by default
        setPermissionGranted(true)
      }
    }

    if (mobile) {
      requestPermission()
    }
  }, [mobile])

  // Render the appropriate control based on device and permission
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
        api.applyImpulse([15, 15, 15], [0, 0, 0]) // small jump
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
        api.applyImpulse([15, 15, 15], [0, 0, 0]) // bounce right
      }}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[2, 50, 50]} />
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
      <meshBasicMaterial transparent opacity={0} color={'black'}/>
    </mesh>
  )
}

export function DraggableMeshes() {
  const NUM_OBJECTS = 10
  const randomPosition = () => [
    (Math.random() - 0.5) * 50, // X between -10 and 10
    Math.random() * 50 + 10,   // Y between 10 and 30 (height)
    (Math.random() - 0.5) * 50 // Z between -10 and 10
  ]
  
  return (
    <>
      <Physics gravity={[0, -9.81, 0]}>
        
        {/* Generate many spheres and boxes at random positions */}
        {Array.from({ length: NUM_OBJECTS }).map((_, i) =>
          Math.random() > 0.5 ? (
            <ClickableSphere key={`s-${i}`} position={randomPosition()} color="white" />
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
        backgroundColor: 'blue',
        position: 'relative',
        zIndex: 10,
        width: '90%',
        height: '60%',
        borderRadius: '20px',
        overflow: 'hidden',
        margin: '10px auto',
      }}
      >
      <Canvas shadows >
        <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
        <ambientLight intensity={50} />
        {/* <OrbitControls enableZoom={false}/> */}
        {/* <DeviceOrientationControls/> */}
        <Controls />
        <EffectComposer>
          <Bloom></Bloom>
        </EffectComposer>
          <Center>
                <Billboard position={[-10, 5, 25]}>
                  <Text>
                    Look around and interact with the objects!
                  </Text>
                </Billboard>
                <Text3D
                  // font={'/fonts/Calligraphy_Regular.typeface.json'}
                  emissive={'white'}
                  color={'white'}
                  castShadow
                  receiveShadow
                  emissiveIntensity = {2}
                  size={4}
                  height={2}
                  curveSegments={10}
                  bevelEnabled
                  bevelSegments={5}
                  letterSpacing={0.1}
                  position={[-10, 0, 30]}
                  rotation={[0, Math.PI / 2, 0]}
                  >
                  Mehanth
                  <meshPhysicalMaterial color={'white'} ior={1.44} transmission={0.9} roughness={0.1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.5} iridescence={1} iridescenceIOR={1.3} iridescenceThicknessRange={[100, 400]} reflectivity={0.8}
                  />
                </Text3D>

                <Billboard position={[40, 5, 25]}>
                  <Text>
                    Look around and interact with the objects!
                  </Text>
                </Billboard>

                <Text3D
                  // font={'/fonts/Calligraphy_Regular.typeface.json'}
                  emissive={'white'}
                  color={'white'}
                  castShadow
                  receiveShadow
                  emissiveIntensity = {2}
                  size={4}
                  height={2}
                  curveSegments={10}
                  bevelEnabled
                  bevelSegments={5}
                  letterSpacing={0.1}
                  position={[40, 0, 20]}
                  rotation={[0, -Math.PI / 2, 0]}
                  >
                  Mehanth
                  <meshPhysicalMaterial color={'white'} ior={1.44} transmission={0.9} roughness={0.1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.5} iridescence={1} iridescenceIOR={1.3} iridescenceThicknessRange={[100, 400]} reflectivity={0.8}
                  />
                </Text3D>

                <Billboard position={[15, 5, 0]}>
                  <Text>
                    Look around and interact with the objects!
                  </Text>
                </Billboard>

                <Text3D
                  // font={'/fonts/Calligraphy_Regular.typeface.json'}
                  emissive={'white'}
                  color={'white'}
                  castShadow
                  receiveShadow
                  emissiveIntensity = {2}
                  size={4}
                  height={2}
                  curveSegments={10}
                  bevelEnabled
                  bevelSegments={5}
                  letterSpacing={0.1}
                  position={[10, 0, 0]}
                  >
                  Mehanth
                  <meshPhysicalMaterial color={'white'} ior={1.44} transmission={0.9} roughness={0.1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.5} iridescence={1} iridescenceIOR={1.3} iridescenceThicknessRange={[100, 400]} reflectivity={0.8}
                  />
                </Text3D>

                <Billboard position={[15, 5, 50]}>
                  <Text>
                    Look around and interact with the objects!
                  </Text>
                </Billboard>

                <Text3D
                  // font={'/fonts/Calligraphy_Regular.typeface.json'}
                  emissive={'white'}
                  color={'white'}
                  castShadow
                  receiveShadow
                  emissiveIntensity = {2}
                  size={4}
                  height={2}
                  curveSegments={10}
                  bevelEnabled
                  bevelSegments={5}
                  letterSpacing={0.1}
                  position={[20, 0, 50]}
                  rotation={[0, Math.PI, 0]}
                  >
                  Mehanth
                  <meshPhysicalMaterial color={'white'} ior={1.44} transmission={0.9} roughness={0.1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.5} iridescence={1} iridescenceIOR={1.3} iridescenceThicknessRange={[100, 400]} reflectivity={0.8}
                  />
                </Text3D>
          </Center>
          <Sparkles count={50} size={10} scale={30} noise={1} speed={1} blending={THREE.AdditiveBlending} color={'yellow'}/>

          {/* Draggable Meshes */}
          <DraggableMeshes />
        </Suspense>
      </Canvas>
    </div>
  )
}