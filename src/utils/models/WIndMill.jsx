
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default  function WindMills(props) {
  const { nodes, materials } = useGLTF('models/wind mill.glb')
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder002.geometry}
        material={nodes.Cylinder002.material}
        position={[0.204, 0.82, 5.148]}
        scale={[0.054, 0.677, 0.054]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sphere.geometry}
        material={nodes.Sphere.material}
        position={[0.246, 1.343, 5.15]}
        scale={[0.083, 0.031, 0.031]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sphere001.geometry}
        material={materials['Material.009']}
        position={[0.303, 1.343, 5.15]}
        scale={0.029}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane.geometry}
        material={nodes.Plane.material}
        position={[0.331, 1.345, 5.149]}
        rotation={[0, 0, -Math.PI / 2]}
        scale={[0.282, 0.029, 0.038]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane001.geometry}
        material={nodes.Plane001.material}
        position={[0.331, 1.345, 5.149]}
        rotation={[-2.351, 0, -Math.PI / 2]}
        scale={[0.282, 0.029, 0.038]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane002.geometry}
        material={nodes.Plane002.material}
        position={[0.331, 1.345, 5.149]}
        rotation={[2.157, 0, -Math.PI / 2]}
        scale={[0.282, 0.029, 0.038]}
      />
    </group>
  )
}

useGLTF.preload('models/wind mill.glb')