import { useBox, useSphere, Physics, usePlane } from '@react-three/cannon'
import { OrbitControls, Center, Text3D, Box, Sparkles, CameraControls, Fisheye, DeviceOrientationControls, PerspectiveCamera, Billboard, Text } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Suspense, useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Perf } from 'r3f-perf'

// Preload font
const fontUrl = '/fonts/Calligraphy_Regular.typeface.json';

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

  return <OrbitControls 
    enableZoom={false} 
    // minPolarAngle={Math.PI / 2} 
    // maxPolarAngle={Math.PI / 2}
    enablePan={false}
    // target={[0, 0, 0]}
  />
}

function ClickableBox({ position, color }) {
  // const [ref, api] = useBox(() => ({ mass: 1, position }))
  
  return (
    <mesh
      // ref={ref}
      onPointerDown={(e) => {
        e.stopPropagation()
        // api.applyImpulse([15, 15, 15], [0, 0, 0])
      }}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[4, 4, 4]} />
      <meshPhysicalMaterial
        emissive={new THREE.Color(color)}
        emissiveIntensity={2}
        metalness={1}
        reflectivity={2}
        color={color}
      />
    </mesh>
  )
}

function ClickableSphere({ position, color }) {
  // const [ref, api] = useSphere(() => ({ mass: 1, position }))

  return (
    <mesh
      // ref={ref}
      onPointerDown={(e) => {
        e.stopPropagation()
        // api.applyImpulse([15, 15, 15], [0, 0, 0])
      }}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[2, 50, 50]} />
      <meshPhysicalMaterial
        emissive={new THREE.Color(color)}
        emissiveIntensity={0.7}
        color={color}
      />
    </mesh>
  )
}

function Ground() {
  // const [ref] = usePlane(() => ({
  //   rotation: [-Math.PI / 2, 0, 0],
  //   position: [0, -7, 0],
  // }))

  return (
    <mesh 
    // ref={ref} 
    receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshBasicMaterial transparent opacity={0} color={'black'}/>
    </mesh>
  )
}

function DraggableMeshes() {
  const NUM_OBJECTS = 30
  const randomPosition = () => [
    (Math.random() - 0.5) * 50,
    Math.random() * 50 + 10,
    (Math.random() - 0.5) * 50
  ]
  
  return (
    // <Physics gravity={[0, -9.81, 0]}>
    <>
      {Array.from({ length: NUM_OBJECTS }).map((_, i) =>
        Math.random() > 0.5 ? (
          <ClickableSphere key={`s-${i}`} position={randomPosition()} color="white" />
        ) : (
          <ClickableBox key={`b-${i}`} position={randomPosition()} color="orange" />
        )
      )}
      <Ground/>
    </>
    /* </Physics> */
  )
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[-1, 0, 0]} fov={50} />
      <ambientLight intensity={50} />
      <Controls />
      <EffectComposer>
        <Bloom />
      </EffectComposer>
      <Center>
        {/* North Text */}
        <Billboard position={[0, 5, 15]}>
          {/* <Text>
            Look around and interact with the objects!
          </Text> */}
        </Billboard>
        <Text3D
          font={fontUrl}
          emissive={'white'}
          color={'white'}
          castShadow
          receiveShadow
          emissiveIntensity={2}
          size={4}
          height={2}
          curveSegments={32}
          bevelEnabled
          bevelSegments={5}
          letterSpacing={0.1}
          position={[5, 0, 25]}
          rotation={[0, Math.PI, 0]}
        >
          Mehanth
          <meshPhysicalMaterial
            color={'white'}
            ior={1.44}
            transmission={0.9}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={0.5}
            iridescence={1}
            iridescenceIOR={1.3}
            iridescenceThicknessRange={[100, 400]}
            reflectivity={0.8}
          />
        </Text3D>

        {/* East Text */}
        <Billboard position={[25, 5, 0]}>
          {/* <Text>
            Look around and interact with the objects!
          </Text> */}
        </Billboard>
        <Text3D
          font={fontUrl}
          emissive={'white'}
          color={'white'}
          castShadow
          receiveShadow
          emissiveIntensity={2}
          size={4}
          height={2}
          curveSegments={32}
          bevelEnabled
          bevelSegments={5}
          letterSpacing={0.1}
          position={[25, 0, -5]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          Mehanth
          <meshPhysicalMaterial
            color={'white'}
            ior={1.44}
            transmission={0.9}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={0.5}
            iridescence={1}
            iridescenceIOR={1.3}
            iridescenceThicknessRange={[100, 400]}
            reflectivity={0.8}
          />
        </Text3D>

        {/* West Text */}
        <Billboard position={[-25, 5, 0]}>
          {/* <Text>
            Look around and interact with the objects!
          </Text> */}
        </Billboard>
        <Text3D
          font={fontUrl}
          emissive={'white'}
          color={'white'}
          castShadow
          receiveShadow
          emissiveIntensity={2}
          size={4}
          height={2}
          curveSegments={32}
          bevelEnabled
          bevelSegments={5}
          letterSpacing={0.1}
          position={[-25, 0, 5]}
          rotation={[0, Math.PI / 2, 0]}
        >
          Mehanth
          <meshPhysicalMaterial
            color={'white'}
            ior={1.44}
            transmission={0.9}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={0.5}
            iridescence={1}
            iridescenceIOR={1.3}
            iridescenceThicknessRange={[100, 400]}
            reflectivity={0.8}
          />
        </Text3D>

        {/* Center Text */}
        <Billboard position={[0, 5, -25]}>
          {/* <Text>
            Look around and interact with the objects!
          </Text> */}
        </Billboard>
        <Text3D
          font={fontUrl}
          emissive={'white'}
          color={'white'}
          castShadow
          receiveShadow
          emissiveIntensity={2}
          size={4}
          height={2}
          curveSegments={32}
          bevelEnabled
          bevelSegments={5}
          letterSpacing={0.1}
          position={[-5, 0, -25]}
        >
          Mehanth
          <meshPhysicalMaterial
            color={'white'}
            ior={1.44}
            transmission={0.9}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={0.5}
            iridescence={1}
            iridescenceIOR={1.3}
            iridescenceThicknessRange={[100, 400]}
            reflectivity={0.8}
          />
        </Text3D>

        <Sparkles
          position={[0,0,0]}
          count={100}
          size={30}
          scale={20}
          noise={1}
          speed={1}
          blending={THREE.AdditiveBlending}
          color={'yellow'}
        />

        <DraggableMeshes />
      </Center>
    </>
  );
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
      <Canvas shadows>
        <Suspense fallback={null}>
          <Perf position="top-left" />
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}