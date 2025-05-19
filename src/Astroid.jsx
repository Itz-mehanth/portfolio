// Asteroid.js
import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useScroll } from '@react-three/drei';

export default function Asteroid() {
  const scroll = useScroll();
  var progress = scroll.offset;
  const asteroidRef = useRef();
  const { camera } = useThree();

  // Generate a bumpy geometry once
  const geometry = new THREE.IcosahedronGeometry(5, 2);
  const positionAttribute = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  for (let i = 0; i < positionAttribute.count; i++) {
    vertex.fromBufferAttribute(positionAttribute, i);
    vertex.addScaledVector(vertex.clone().normalize(), (Math.random() - 0.5) * 1);
    positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  useFrame(() => {
    if (!asteroidRef.current) return;

    // Animate only during a specific progress range
    if (progress > 1.4 && progress < 2) {
      const localProgress = (progress - 1.4) / (2 - 1.4); // 0 to 1

      // Z comes toward camera, with slight offset
      const z = THREE.MathUtils.lerp(-1000, camera.position.z + 5, localProgress);

      // Wobble movement on X/Y
      const x = Math.sin(localProgress * Math.PI * 4) * 10;
      const y = Math.cos(localProgress * Math.PI * 2) * 5;

      asteroidRef.current.position.set(x, y, z);

      // Rotation for realism
      asteroidRef.current.rotation.x += 0.01;
      asteroidRef.current.rotation.y += 0.015;
    }
  });

  return (
    <mesh ref={asteroidRef} geometry={geometry}>
      <meshStandardMaterial color="#5a5a5a" roughness={1} metalness={0.2} flatShading />
    </mesh>
  );
}
