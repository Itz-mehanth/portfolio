import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'

export default function Terrain() {
  const [heightMap, colorMap, roughnessMap, normalMap] = useLoader(THREE.TextureLoader, 
   [ 'images/terrain/terrain.jpg',
    'images/terrain/col.jpg',
    'images/terrain/rough.jpg',
    'images/terrain/nor.png']
)

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1000, 1000, 1256, 1256]} />
      <meshStandardMaterial
        displacementMap={heightMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        color={"#111111"}
        displacementScale={-5}
      />
    </mesh>
  )
}
