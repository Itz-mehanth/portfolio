import React, { useRef } from 'react'
import { useGLTF, Outlines } from '@react-three/drei'

export default function House(props) {
  const { nodes, materials } = useGLTF('/models/house.glb')
  return (
    <group {...props} dispose={null}>
      <group position={[0, 0, 2.412]} scale={[0.53, 0.284, 0.284]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube.geometry}
        >
          <meshToonMaterial color={materials.Material.color} />
          <Outlines thickness={0.9} color="black" />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_1.geometry}
        >
          <meshToonMaterial color={materials['Material.001'].color} />
          <Outlines thickness={0.9} color="black" />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_2.geometry}
        >
          <meshToonMaterial color={materials['Material.002'].color} />
          <Outlines thickness={0.9} color="black" />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_3.geometry}
        >
          <meshToonMaterial color={materials['Material.003'].color} />
          <Outlines thickness={0.9} color="black" />
        </mesh>
      </group>
    </group>
  )
}

useGLTF.preload('/models/house.glb')
