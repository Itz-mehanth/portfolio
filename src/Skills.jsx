import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Text, PerspectiveCamera, OrbitControls, Billboard, Environment, useGLTF } from '@react-three/drei';
import Ground from './utils/models/Ground'; // Adjust the import path as necessary
import { Suspense } from 'react';
import House from './utils/models/House'; // Adjust the import path as necessary
import WaterTank from './utils/models/WaterTank'; // Adjust the import path as necessary
import Tank from './utils/models/Tank'; // Adjust the import path as necessary
import WindMills from './utils/models/WIndMill';
import Tree from './utils/models/Tree'; // Adjust the import path as necessary
import { EffectComposer, Outline } from '@react-three/postprocessing';
import Car from './utils/models/Car';
import { Vector3, CatmullRomCurve3, ACESFilmicToneMapping } from 'three';

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

const cityOrder = ['arvr', 'mobile', 'web', 'uiux'];

const cityPathPoints = {
  arvr: new Vector3(5.5, 1.6, 0.5),
  mobile: new Vector3(2, 1.6, 0.2),
  web: new Vector3(-1.5, 1.6, 0.5),
  uiux: new Vector3(-4, 1.6, 0.4),
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
  
  // Ordered city IDs representing the path
  
  const serialPath = new CatmullRomCurve3(cityOrder.map(cityId => cityPathPoints[cityId]), false, 'catmullrom', 0.5);
  
  const handleCityClick = (id) => {
    setSelectedCity(id);

    const pathToTarget = getCityToCityPath(currentCity, id);
    setPath(pathToTarget);
  };
  
  // useEffect(() => {
  //   setPath(serialPath);
  // }, [cityPathPoints]);

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
    web: [
      { name: 'React', description: 'A JavaScript library for building user interfaces' },
      { name: 'Next.js', description: 'A React framework with server-side rendering and static site generation' },
      { name: 'Firebase', description: 'A backend platform for building web and mobile applications' },
    ],
    mobile: [
      { name: 'Flutter', description: 'Google\'s UI toolkit for natively compiled mobile apps' },
      { name: 'Kotlin', description: 'A modern language for Android app development' },
      { name: 'Swift', description: 'Apple\'s language for building iOS applications' },
    ],
    arvr: [
      { name: 'Unity', description: 'A powerful game engine for creating 2D and 3D experiences' },
      { name: 'Blender', description: 'A free and open-source 3D modeling and animation tool' },
      { name: 'Three.js', description: 'A JavaScript library to create 3D graphics in the browser' },
    ],
    uiux: [
      { name: 'Figma', description: 'A collaborative design tool for interface design and prototyping' },
      { name: 'Adobe XD', description: 'A UI/UX design tool from Adobe for designing user experiences' },
      { name: 'Sketch', description: 'A vector graphics editor for macOS for UI design' },
    ],
  };

  return (
    <>
    <div style={{width: '90vw', height: '50vh', border: '15px ridge black', borderRadius: '10px'}}>
    <Canvas camera={{ position: [0, 6, 20], fov: 60 }} shadows gl={{ toneMapping: ACESFilmicToneMapping}}>
      {/* Basic scene setup - always available */}
      <ambientLight intensity={0.3} />
      <Environment preset='sunset' environmentIntensity={0.4} background={false} />
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
      <Billboard position={[0, 2.5, 1.5]}>
        <Text fontSize={0.4} position={[0, 1, 0]} color="#000000" anchorX="center" anchorY="middle">
          🚩click to visit house
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

    <div className='Skills'>
      {skillsByCity[selectedCity]?.map((skill, index) => (
        <div key={index} style={{ marginBottom: '1rem' }}>
          <strong>{skill.name}</strong>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
            {skill.description}
          </p>
        </div>
      ))}
    </div>
    </>
  );
}
