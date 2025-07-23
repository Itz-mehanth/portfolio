// src/App.jsx
import { Billboard, Clouds } from '@react-three/drei'
import {  Environment, Cloud, Stars, Box } 
from '@react-three/drei'
import './App.css'
import Planet from './Planet'
import Asteroid from './Astroid'
import Effects from './Effects'
import  { useRef } from "react"
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


export default function Projects(props) {
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
        <Stars radius={100} depth={10} count={100} factor={10} saturation={1} fade speed={1} />
        {/* <Stars radius={20} depth={1} count={1000} factor={10} saturation={1} fade speed={1} /> */}

        <Clouds position={[0, 0, 0]} >
          <Cloud segments={250} seed={5} scale={3} bounds={[100, -150, 500]} opacity={0.01} volume={150} color="white"  fade={100} />
        </Clouds>

        <Planet textureUrl='Planets/mars.jpg' radius={10} position={[0,-50,100]}/>
        <Planet textureUrl='Planets/earth.jpg' radius={10} position={[50,-50,200]}/>

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

        {/* <Content /> */}

        {/* <GroundPlane /> */}
        {/* <OrbitControls/> */}
    </>
    )
}