import { useRef, useState } from 'react';
import { Billboard, Text} from '@react-three/drei';
import * as THREE from 'three';

export default function Asteroid({ position = [0, 0, 150], openIframe, iframeUrl, title , description }) {
  const asteroidRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [hudVisible, setHudVisible] = useState(false);

  return (
    <group position={position}>
      {/* Asteroid mesh */}
      <mesh
        ref={asteroidRef}
        geometry={new THREE.IcosahedronGeometry(1, 2)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={hovered ? '#888888' : '#5a5a5a'}
          roughness={1}
          metalness={0.2}
          flatShading
        />
      </mesh>

      {/* Billboard UI above asteroid */}
      <Billboard position={[0, 4, 0]}>
        <group>
          {/* Background */}
          <mesh>
            <planeGeometry args={[5, 5]} />
            <meshStandardMaterial color="#000" side={THREE.DoubleSide} />
          </mesh>

          {/* Title */}
          <Text
            position={[-2.2, 2, 0]}
            fontSize={0.5}
            color="#00ffd5"
            anchorX="left"
            anchorY="top"
          >
            {title || 'Project Name'}
          </Text>

          {/* Description */}
          <Text
            position={[-2.3, 1, 0]}
            fontSize={0.2}
            color="#ffffff"
            maxWidth={4.5}
            lineHeight={1.5}
            anchorX="left"
            anchorY="top"
          >
            {description || 'This is a brief description of the project. Click to learn more.'}
          </Text>

          {/* Click Me */}
          <Text
            position={[-0.8, -1.2, 0]}
            fontSize={0.4}
            fontWeight={700}
            color="#00ffd5"
            anchorX="left"
            anchorY="top"
            onClick={() => openIframe(iframeUrl)}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = 'default')}
          >
            Click Me
          </Text>
        </group>
      </Billboard>
    </group>
  );
}
