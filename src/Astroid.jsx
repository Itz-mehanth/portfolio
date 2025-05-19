import { useRef, useState } from 'react';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

export default function Asteroid({ position = [0, 0, 150], message = "Mysterious Rock" }) {
  const asteroidRef = useRef();
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <mesh
        ref={asteroidRef}
        geometry={new THREE.IcosahedronGeometry(1, 2)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color={hovered ? '#888888' : '#5a5a5a'} roughness={1} metalness={0.2} flatShading />
      </mesh>

      {hovered && (
        // <Billboard position={[position.x, position.y, position.z]}>
        <Billboard position={[position[0], position[1] - 50, position[2]]}>
          <Text
            fontSize={10}
            color="black"
            anchorX="center"
            anchorY="middle"
            backgroundColor="black"
          >
            {message}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
