// src/App.jsx
import { Billboard, Clouds, Sky } from '@react-three/drei'
import {  Environment, Cloud, Stars, Box } 
from '@react-three/drei'
import './App.css'
import Planet from './Planet'
import Asteroid from './Astroid'
import Effects from './Effects'
import  { useRef, useState } from "react"
import { Html } from "@react-three/drei"
import {Text} from "@react-three/drei"
import { BackSide, DoubleSide } from 'three'

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
        z: 60,
        url: "https://retempla.xyz/",
        title: "ReTempla",
        description: "SaaS for smart document formatting and personalization.",
        type: "live"
      },
      {
        z: 160,
        url: "https://sipandchat-91e6f.web.app/",
        title: "Sip & Chat",
        description: "Digital ordering platform built for SSN Mela.",
        type: "live"
      },
      {
        z: 100,
        url: "https://vrroom.netlify.app/",
        title: "Virtual Herbal Garden",
        description: "Immersive 3D exploration of medicinal plants.",
        type: "live"
      },
      {
        z: 140,
        url: "https://medbot-12052.web.app/",
        title: "MedBot",
        description: "AI health assistant offering medical insights.",
        type: "live"
      },
      {
        z: 120,
        url: "https://healthboosters-dff5b.web.app/",
        title: "Health Boosters",
        description: "Hospital management system for appointments and billing.",
        type: "live"
      },
      {
        z: 80,
        url: "https://medicinal-plant-82aa9.web.app/",
        title: "Medicinal Plants Info",
        description: "CNN-based plant identifier with medicinal insights.",
        type: "live"
      },
      {
        z: 180,
        url: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7261266876800868355?collapsed=1", // <-- Replace with your real URL
        title: "Galaxy Strike",
        description: "A retro-style 2D Java game built from scratch using Swing. Features real-time collisions, scoring, and keyboard controls.",
        type: "linkedin"
      },
      {
        z: 200,
        url: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7298710253531971584?collapsed=1", // Replace with your actual LinkedIn embed URL for the AR Ludo post
        title: "AR Ludo Game",
        description: "An augmented reality version of the classic Ludo game built with Unity and Vuforia. Enables real-world surface tracking and interactive multiplayer gameplay using physical markers.",
        type: "linkedin"
      },
      {
        z: 220,
        url: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7213766114437156864?collapsed=1", // Replace with your actual LinkedIn embed URL for the AR Ludo post
        title: "C Food Delivery app",
        description: "An augmented reality version of the classic Ludo game built with Unity and Vuforia. Enables real-world surface tracking and interactive multiplayer gameplay using physical markers.",
        type: "linkedin"
      }
    ];



    
    return (
    <>
        <Effects/>
        <Environment 
          background 
          backgroundIntensity={2}
          files="hdr/sky.hdr"
        />

        <Clouds position={[0, 0, 0]} >
          <Cloud segments={250} seed={8} scale={3} bounds={[100, -150, 300]} opacity={0.5} volume={250} color="white"  fade={100} />
          <Cloud segments={250} seed={7} scale={3} bounds={[100, -150, 300]} opacity={0.5} volume={250} color="white"  fade={100} />
          <Cloud segments={250} seed={6} scale={3} bounds={[100, -150, 300]} opacity={0.5} volume={250} color="white"  fade={100} />
          <Cloud segments={250} seed={5} scale={3} bounds={[100, -150, 500]} opacity={0.5} volume={250} color="white"  fade={100} />
        </Clouds>

        <Billboard position={[0, 0, -5]}>
          <group position={[0, 5, -20]}>
            {/* Notice Board Background */}
            <mesh position={[0, 0, -0.05]}>
              <planeGeometry args={[16, 10]} />
              <meshStandardMaterial color="#1f2937" /> {/* Tailwind's gray-800 */}
            </mesh>

            {/* Main Title */}
            <Text
              fontSize={2.5}
              color="#fbbf24" // Golden yellow
              anchorX="center"
              anchorY="middle"
              position={[0, 2.5, 0.1]}
            >
              PROJECTS
            </Text>

            {/* Description */}
            <Text
              fontSize={0.6}
              color="#d1d5db" // Tailwind's gray-300
              anchorX="center"
              anchorY="middle"
              position={[0, -1, 0.1]}
              maxWidth={12}
              textAlign="center"
            >
              Click on the Live Site button to explore more about my projects!
            </Text>
          </group>
        </Billboard>
     
        {asteroidData.map((asteroid, index) => (
          <Asteroid
            key={index}
            openIframe={props.openIframe}
            iframeUrl={asteroid.url}
            type={asteroid.type} // pass the type
            position={[index % 2 === 0 ? 5 : -5, 0, asteroid.z]}
            title={asteroid.title}
            description={asteroid.description}
          />
        ))}
    </>
    )
}