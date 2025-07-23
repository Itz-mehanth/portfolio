import { useLoader } from '@react-three/fiber'
import { Suspense, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Text, Billboard } from '@react-three/drei'

function LoadingFallback() {
  return (
    <Billboard>
      <Text fontSize={0.2} color="#000000">
        Loading terrain...
      </Text>
    </Billboard>
  );
}

function TerrainMesh() {
  const [heightMap, colorMap, roughnessMap, normalMap] = useLoader(THREE.TextureLoader, 
    [
      'images/terrain/terrain.jpg',
     'images/terrain/col.jpg',
     'images/terrain/rough.jpg',
     'images/terrain/nor.png'
    ]
  )

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[500, 500, 10, 10]} />
      <meshStandardMaterial
        displacementMap={heightMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        color={"#111111"}
        // displacementScale={-0.1}
      />
    </mesh>
  )
}

export default function Terrain() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TerrainMesh />
    </Suspense>
  )
}
