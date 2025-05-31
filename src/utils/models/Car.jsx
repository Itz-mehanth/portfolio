import React, { useRef, useState, useEffect } from 'react'
import { useGLTF, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber';

export default function Car({ path, onReachEnd, ...props }) {
  const { nodes, materials } = useGLTF('models/car.glb')

  const characterRef = useRef();
    const [t, setT] = useState(0);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
    const speed = 0.01; // Adjust for faster/slower movement
  
    useFrame((state, delta) => {
      if (path && t < 1) {
        var nextT = t  + direction * speed;

        // Clamp t between 0 and 1 and flip direction if needed
        if (nextT >= 1) {
            nextT = 1;
            setDirection(-1); // reverse direction
            if (onReachEnd) {
                onReachEnd(); // Notify that the end of the path was reached
            }
        } else if (nextT <= 0) {
            nextT = 0;
            setDirection(1); // forward direction
        }
        
         // Get point on path
        const point = path.getPointAt(nextT);
        characterRef.current.position.copy(point);

        const tangent = path.getTangentAt(Math.min(nextT, 1)).normalize();
  
        // Optional: Ignore y-axis for rotation (keep car flat on ground)
        tangent.y = 0;
        tangent.normalize();

        if (characterRef.current) {
            characterRef.current.position.copy(point);
  
            // Calculate rotation so car faces tangent
            // Assume car's forward axis is Z+ (0, 0, 1)
            const forward = new THREE.Vector3(-1, 0, 0);
            const quaternion = new THREE.Quaternion().setFromUnitVectors(forward, tangent);

            // Apply the quaternion smoothly
            characterRef.current.quaternion.slerp(quaternion, 0.2);
        }
  
        setT(nextT);

      }
    });
  
    // Reset position when path changes
    useEffect(() => {
      if (path) {
        setT(0);
      }
    }, [path]);

  return (
    <group scale={0.3}  ref={characterRef} {...props} dispose={null}>
      <group rotateY={Math.PI/2} scale={[0.52, 0.288, 0.52]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001_1.geometry}
          material={materials['Material.003']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001_2.geometry}
          material={materials['Material.003']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001_3.geometry}
          material={materials['Material.001']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001_4.geometry}
          material={materials['Material.001']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001_5.geometry}
          material={materials['Material.001']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001_6.geometry}
          material={materials['Material.004']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001_7.geometry}
          material={materials['Material.001']}
        />
        <group position={[0, 0, 0.017]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube002_1.geometry}
            material={materials['Material.003']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube002_2.geometry}
            material={materials['Material.001']}
          />
        </group>
        <group position={[-0.006, 0, 0.402]} rotation={[Math.PI, 0, Math.PI]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube002_1.geometry}
            material={materials['Material.003']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube002_2.geometry}
            material={materials['Material.001']}
          />
        </group>
        <group position={[0, 0, 0.402]} rotation={[Math.PI, 0, Math.PI]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube003_1.geometry}
            material={materials['Material.003']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube003_2.geometry}
            material={materials['Material.001']}
          />
        </group>
        <group position={[-0.006, 0, 0.017]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube003_1.geometry}
            material={materials['Material.003']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube003_2.geometry}
            material={materials['Material.001']}
          />
        </group>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube005.geometry}
          material={materials['Material.001']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube006.geometry}
          material={materials['Material.001']}
          position={[0, -0.498, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube007.geometry}
          material={materials['Material.001']}
          position={[-0.943, -0.227, 0.397]}
          rotation={[Math.PI, 0, Math.PI]}
        />
        <group
          position={[1.292, -2.752, -0.873]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.434, 0.099, 0.785]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cylinder_1.geometry}
            material={materials['Material.001']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cylinder_2.geometry}
            material={materials['Material.002']}
          />
        </group>
        <group
          position={[1.292, -2.752, 1.276]}
          rotation={[Math.PI / 2, 0, Math.PI]}
          scale={[0.434, 0.099, 0.785]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cylinder_1.geometry}
            material={materials['Material.001']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cylinder_2.geometry}
            material={materials['Material.002']}
          />
        </group>
        <group
          position={[-2.132, -2.752, -0.873]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.434, 0.099, 0.785]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cylinder_1.geometry}
            material={materials['Material.001']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cylinder_2.geometry}
            material={materials['Material.002']}
          />
        </group>
        <group
          position={[-2.132, -2.752, 1.276]}
          rotation={[Math.PI / 2, 0, Math.PI]}
          scale={[0.434, 0.099, 0.785]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cylinder_1.geometry}
            material={materials['Material.001']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cylinder_2.geometry}
            material={materials['Material.002']}
          />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('models/car.glb')