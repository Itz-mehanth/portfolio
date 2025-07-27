// Balloon.jsx
import React, { useRef, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

export function Balloon({ balloonColor, ...props }) {
  const { nodes, materials } = useGLTF('models/balloon.glb')
  const groupRef = useRef()
  
  // Create custom materials with the passed color
  const customMaterials = useMemo(() => {
    if (!balloonColor) return materials;
    
    return {
      // Clone existing materials and modify the balloon material
      'Material.003': materials['Material.003'], // Keep basket material as is
      'Material.001': new THREE.MeshStandardMaterial({
        ...materials['Material.001'],
        color: balloonColor,
        // Enhance the balloon material
        metalness: 0.1,
        roughness: 0.3,
        emissive: balloonColor.clone().multiplyScalar(0.1),
      }),
      'Material.002': materials['Material.002'], // Keep rope/string material as is
    };
  }, [balloonColor, materials]);

  // Add wiggle animation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime

      // Create a gentle swaying motion
      groupRef.current.rotation.z = Math.sin(time * 0.8) * 0.1
      groupRef.current.rotation.x = Math.cos(time * 0.6) * 0.05

      // Add some vertical bobbing
      groupRef.current.position.y = Math.sin(time * 1.2) * 0.1
      
      // Add subtle horizontal drift
      groupRef.current.position.x = Math.cos(time * 0.4) * 0.05
    }
  })

  return (
    <group ref={groupRef} scale={0.3} {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube_1.geometry}
        material={customMaterials['Material.002']} // Main balloon
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube_2.geometry}
        material={customMaterials['Material.001']} // Basket
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube_3.geometry}
        material={customMaterials['Material.003']} // Ropes
      />
    </group>
  )
}

useGLTF.preload('models/balloon.glb')