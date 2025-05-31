import React, { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function House(props) {
  const { nodes, materials } = useGLTF('models/house.glb')

  return (
    <group {...props} dispose={null}>
      <group position={[0, 0, 2.412]} scale={[0.53, 0.284, 0.284]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube.geometry}
          material={materials.Material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_1.geometry}
          material={materials['Material.001']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_2.geometry}
          material={materials['Material.002']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_3.geometry}
          material={materials['Material.003']}
        />
      </group>
    </group>
  )
}

useGLTF.preload('models/house.glb')
