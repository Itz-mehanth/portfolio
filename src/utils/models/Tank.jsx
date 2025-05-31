
import React, { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
export default function Tank(props) {
  const { nodes, materials } = useGLTF('models/tank.glb')

  return (
    <group {...props} dispose={null}>
      <group position={[1.425, 0.613, 3.639]} scale={[0.221, 0.479, 0.221]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cylinder001.geometry}
          material={materials['Material.007']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cylinder001_1.geometry}
          material={materials['Material.008']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cylinder001_2.geometry}
          material={materials['Material.009']}
        />
      </group>
    </group>
  )
}

useGLTF.preload('models/tank.glb')
