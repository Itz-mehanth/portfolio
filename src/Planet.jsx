import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { TextureLoader } from 'three'

export default function Planet({
  position = [0, -0, -0], // push it far and below
  radius = 20,
  textureUrl = '/Planets/mars.jpg', // your planet texture
}) {
  const planetRef = useRef()

  // Optional: slow rotation
  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.001
    }
  })

  return (
    <mesh ref={planetRef} position={position}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial color={'white'} map={new TextureLoader().load(textureUrl)} />
    </mesh>
  )
}
