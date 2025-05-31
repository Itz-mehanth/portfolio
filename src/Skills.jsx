import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Text, Sky, PerspectiveCamera, OrbitControls, QuadraticBezierLine, Billboard, Environment } from '@react-three/drei';
import * as THREE from 'three';
import Ground from './utils/models/Ground'; // Adjust the import path as necessary
import { Suspense } from 'react';
import House from './utils/models/House'; // Adjust the import path as necessary
import WaterTank from './utils/models/WaterTank'; // Adjust the import path as necessary
import Tank from './utils/models/Tank'; // Adjust the import path as necessary
import WindMills from './utils/models/WIndMill';
import Tree from './utils/models/Tree'; // Adjust the import path as necessary
import { useLoader } from '@react-three/fiber';

const cityColors = {
  web: '#00ffff',
  mobile: '#ff00ff',
  arvr: '#00ff00',
  uiux: '#ffff00',
};


function City({ id, name, position, onClick, isSelected }) {
//   const color = cityColors[id] || '#ffffff';
  const color =  '#FF002C';
 
  return (
    <group position={position} onClick={() => onClick(id)}>
      <House scale={1}/>
      <WaterTank position={[1,-0.5,-1]}/>

        <Billboard position={[0, 1.1, 2.5]}>
          <Text fontSize={0.4} position={[0, 0, 0]} color="#000000" anchorX="center" anchorY="middle">
            {name}
          </Text>
        </Billboard>
      {isSelected && (
        <Billboard position={[0, 1.1, 2.5]}>
          <mesh>
            <planeGeometry args={[2, 1]} />
            <meshStandardMaterial color={'green'} />
          </mesh>
          <Text fontSize={0.4} position={[0, 0, 0]} color="#ffffff" anchorX="center" anchorY="middle">
            {name}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

function Scroll({ open, skills }) {
  const texture = useLoader(THREE.TextureLoader, '/images/wood.png');
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

export default function SciFiSkillCities() {
  const [selectedCity, setSelectedCity] = React.useState('web');

  const handleCityClick = (id) => {
    setSelectedCity(id);
  };

  const cityPositions = {
    web: [-1.5, 1.55, -0.5],
    mobile: [2, 1.55, -3],
    arvr: [6, 1.55, -0.6],
    uiux: [-4, 1.55, -3],
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
    web: ['React', 'Next.js', 'Firebase'],
    mobile: ['Flutter', 'Kotlin', 'Swift'],
    arvr: ['Unity', 'Blender', 'Three.js'],
    uiux: ['Figma', 'Adobe XD', 'Sketch'],
  };

  const roads = [
    // [cityPositions.web, cityPositions.mobile],
    // [cityPositions.web, cityPositions.arvr],
    // [cityPositions.arvr, cityPositions.uiux],
    // [cityPositions.mobile, cityPositions.uiux],
  ];

  const getPlaneMidPoint = (start, end) => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const direction = new THREE.Vector3().subVectors(endVec, startVec);
    const midpoint = new THREE.Vector3().addVectors(startVec, direction.clone().multiplyScalar(0.5));
    const offset = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(3);
    return midpoint.add(offset).toArray();
  };

  return (
    <Canvas camera={{ position: [0, 6, 20], fov: 60 }} shadows gl={{ toneMapping: THREE.ACESFilmicToneMapping, outputEncoding: THREE.sRGBEncoding }}>
      <Suspense fallback={null}>
      <PerspectiveCamera makeDefault position={[0, 6, 20]} />
      <ambientLight intensity={0.3} />
      <Environment preset='sunset' environmentIntensity={0.2} background={false} />
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
      <OrbitControls enableZoom={false} enablePan={true} maxPolarAngle={Math.PI / 2.3} />

      {/* Ground Plane */}
      <Ground scale = {3}/>

      {/* Windmills */}
      {Object.entries(windmillPositions).map(([id, pos]) => (
        <WindMills key={id} position={pos} />
      ))}

      {/* Trees */}
      {Object.entries(treePositions).map(([id, pos]) => (
        <Tree key={id} position={pos} scale={1} />
      ))}

      {/* Tanks */}
      {Object.entries(tankPositions).map(([id, pos]) => (
        <Tank key={id} position={pos} />
      ))}

      {/* Sci-fi Cities */}
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

      {/* Roads with Plane-like Arcs */}
      {roads.map(([start, end], i) => (
        <QuadraticBezierLine
          key={i}
          start={start}
          end={end}
          mid={getPlaneMidPoint(start, end)}
          color="#000"
          lineWidth={20.5}
        />
      ))}

      {/* Floating Holographic Scroll */}
      <Billboard>
        <Scroll open={!!selectedCity} skills={skillsByCity[selectedCity] || []} />
      </Billboard>
      </Suspense>
    </Canvas>
  );
}
