// Balloon.jsx
import React, { useRef, useMemo, useState } from 'react'
import { useGLTF, Outlines } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

export function Balloon({ balloonColor, ...props }) {
  const { nodes, materials } = useGLTF('/models/balloon.glb')
  const groupRef = useRef()
  const [clicked, setClicked] = useState(false)
  const bounceRef = useRef(0)
  const squashRef = useRef({ x: 1, y: 1, z: 1 })

  // Create custom materials with the passed color
  const customMaterials = useMemo(() => {
    if (!balloonColor) return materials;

    return {
      'Material.003': materials['Material.003'],
      'Material.001': new THREE.MeshStandardMaterial({
        ...materials['Material.001'],
        color: balloonColor,
        metalness: 0.1,
        roughness: 0.3,
        emissive: balloonColor.clone().multiplyScalar(0.1),
      }),
      'Material.002': materials['Material.002'],
    };
  }, [balloonColor, materials]);

  const handleClick = (e) => {
    e.stopPropagation();
    setClicked(true);
    bounceRef.current = 1; // trigger bounce
    setTimeout(() => setClicked(false), 800);
  };

  // Add wiggle animation + bounce reaction
  useFrame((state, delta) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime

      // Gentle swaying
      groupRef.current.rotation.z = Math.sin(time * 0.8) * 0.1
      groupRef.current.rotation.x = Math.cos(time * 0.6) * 0.05
      groupRef.current.position.y = Math.sin(time * 1.2) * 0.1
      groupRef.current.position.x = Math.cos(time * 0.4) * 0.05

      // Bounce + squash/stretch on click
      if (bounceRef.current > 0) {
        bounceRef.current -= delta * 2.5;
        const t = bounceRef.current;
        const bounce = Math.sin(t * Math.PI * 3) * t * 0.8;

        // Squash and stretch
        const squashY = 1 + bounce * 0.3;
        const squashXZ = 1 - bounce * 0.15;
        squashRef.current = { x: squashXZ, y: squashY, z: squashXZ };

        groupRef.current.position.y += bounce * 2;
        groupRef.current.rotation.z += Math.sin(t * 20) * t * 0.3;
      } else {
        // Lerp back to normal
        squashRef.current.x += (1 - squashRef.current.x) * 0.1;
        squashRef.current.y += (1 - squashRef.current.y) * 0.1;
        squashRef.current.z += (1 - squashRef.current.z) * 0.1;
      }

      groupRef.current.scale.set(
        0.3 * squashRef.current.x,
        0.3 * squashRef.current.y,
        0.3 * squashRef.current.z
      );
    }
  })

  return (
    <group ref={groupRef} scale={0.3} {...props} dispose={null} onClick={handleClick} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = ''}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube_1.geometry}
      >
        <meshToonMaterial color={customMaterials['Material.002'].color} gradientMap={null} />
        <Outlines thickness={1} color="black" />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube_2.geometry}
      >
        <meshToonMaterial color={balloonColor || "hotpink"} gradientMap={null} />
        <Outlines thickness={1} color="black" />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube_3.geometry}
      >
        <meshToonMaterial color={customMaterials['Material.003'].color} gradientMap={null} />
        <Outlines thickness={1} color="black" />
      </mesh>
    </group>
  )
}

useGLTF.preload('/models/balloon.glb')