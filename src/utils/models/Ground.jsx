
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default function Ground(props) {
  const { nodes, materials } = useGLTF('models/ground.glb')
  return (
    <group {...props} dispose={null}>
      <group position={[5.278, 0.419, 0.25]} scale={[4.044, 1, 0.506]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Plane001.geometry}
          material={materials['Material.010']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Plane001_1.geometry}
          material={materials['Material.011']}
        />
      </group>
    </group>
  )
}

useGLTF.preload('models/ground.glb')