// src/App.jsx
import { Billboard, Clouds } from '@react-three/drei'
import {  Environment, Cloud, Stars, Box } 
from '@react-three/drei'
import './App.css'
import Planet from './Planet'
import Asteroid from './Astroid'
import Effects from './Effects'
import  { useRef, useState } from "react"
import { Html } from "@react-three/drei"
import {Text} from "@react-three/drei"

function Dodecahedron({ time, ...props }) {
  return (
    <mesh {...props}>
      <dodecahedronGeometry />
      <meshStandardMaterial roughness={0.75} emissive="#404057" />

      <Billboard>
        <group>
          <Html position={[0, 0, 0]}>
            <div
              style={{
                width: "200px",
                height: "100px",
                backgroundColor: "white",
                padding: "10px",
                borderRadius: "5px",
                color: "black",
                fontFamily: "Arial",
                boxShadow: "0 0 10px rgba(0,0,0,0.5)",
              }}
            >
              <p style={{ fontSize: "18px" }}>This is a HTML</p>
            </div>
          </Html>
        </group>
      </Billboard>
    </mesh>
  )
}

function Content() {
  const ref = useRef()
  // useFrame(() => (ref.current.rotation.x = ref.current.rotation.y = ref.current.rotation.z += 0.01))
  return (
    <group ref={ref}>
      <Dodecahedron position={[5, 0, 170]}/>
      <Dodecahedron position={[-5, 0, 150]} />
      <Dodecahedron position={[5, 0, 120]}/>
    </group>
  )
}

export default function Projects(props) {
    const [showBillboard, setShowBillboard] = useState(true);

    const asteroidData = [
      {
        z: 170,
        url: "https://sipandchat-91e6f.web.app/",
        title: "Sip & Chat",
        description: "A social chat app designed for seamless conversations over coffee."
      },
      {
        z: 150,
        url: "https://virtual-herbal-garden-7a5e6.web.app/",
        title: "Virtual Herbal Garden",
        description: "Explore medicinal plants in an immersive 3D environment."
      },
      {
        z: 120,
        url: "https://medbot-12052.web.app/",
        title: "MedBot",
        description: "An AI-powered health assistant for quick and reliable medical advice."
      },
      {
        z: 100,
        url: "https://healthboosters-dff5b.web.app/",
        title: "Health Boosters",
        description: "Track your fitness, get tips, and boost your health every day."
      },
      {
        z: 80,
        url: "https://medicinal-plant-82aa9.web.app/",
        title: "Medicinal Plants Info",
        description: "Discover uses and benefits of medicinal plants with images and data."
      }
    ];
    
    return (
    <>
        <Environment preset="night" intensity={0.1}></Environment>
        <ambientLight intensity={0.1} />
        <Effects/>
        <pointLight position={[0, 0, 500]} intensity={100} distance={100} decay={2} color="white" />

        <Stars radius={200} depth={1} count={1000} factor={10} saturation={1} fade speed={1} />
        <Stars radius={50} depth={10} count={1000} factor={10} saturation={1} fade speed={1} />
        <Stars radius={100} depth={10} count={100} factor={10} saturation={1} fade speed={1} />
        {/* <Stars radius={20} depth={1} count={1000} factor={10} saturation={1} fade speed={1} /> */}

        <Clouds position={[0, 0, 0]} >
          <Cloud segments={250} seed={8} scale={3} bounds={[100, -150, 300]} opacity={0.1} volume={250} color="white"  fade={100} />
          <Cloud segments={250} seed={7} scale={3} bounds={[100, -150, 300]} opacity={0.1} volume={250} color="white"  fade={100} />
          <Cloud segments={250} seed={6} scale={3} bounds={[100, -150, 300]} opacity={0.1} volume={250} color="white"  fade={100} />
          <Cloud segments={250} seed={5} scale={3} bounds={[100, -150, 500]} opacity={0.1} volume={250} color="white"  fade={100} />
        </Clouds>

        <Planet textureUrl='Planets/mars.jpg' radius={150} position={[0,-250,100]}/>

        {asteroidData.map((asteroid, index) => (
          <Asteroid
            key={index}
            openIframe={props.openIframe}
            iframeUrl={asteroid.url}
            position={[index % 2 === 0 ? 5 : -5, 0, asteroid.z]}
            title={asteroid.title}
            description={asteroid.description}
          />
        ))}

        {showBillboard && (
          <Billboard position={[0, 3, 120]} follow>
              <planeGeometry args={[3.2, 1.5]} />
              <meshStandardMaterial color="#fff" transparent opacity={0.97} />
          </Billboard>
        )}

        {/* <Content /> */}

        {/* <GroundPlane /> */}
        {/* <OrbitControls/> */}
    </>
    )
}