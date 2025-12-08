// src/App.jsx
import { Billboard, Clouds, Outlines } from '@react-three/drei'
import { Environment, Cloud, Stars } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { RGBELoader } from 'three-stdlib'
import * as THREE from 'three'
import './App.css'
import Asteroid from './Astroid'
import Effects from './Effects'
import { useState } from "react"
import { Text } from "@react-three/drei"


export default function Projects({ openIframe, contactPage }) {
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
      title: "C Food Delivery app",
      description: "An augmented reality version of the classic Ludo game built with Unity and Vuforia. Enables real-world surface tracking and interactive multiplayer gameplay using physical markers.",
      type: "linkedin"
    }
  ];

  const texture = useLoader(RGBELoader, '/hdr/anime_sky.hdr');
  texture.mapping = THREE.EquirectangularReflectionMapping;

  return (
    <group>
      <Environment
        files={'/hdr/anime_sky.hdr'}
        backgroundIntensity={0.5}
        environmentIntensity={0.1}
      />

      {/* Anime Sky Sphere with Reduced Radius for Parallax */}
      <mesh position={[0, 0, 100]} scale={[-1, 1, 1]}>
        <sphereGeometry args={[300, 60, 40]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>

      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />

      <Clouds position={[0, -20, -50]} >
        <Cloud segments={40} bounds={[50, 10, 50]} volume={10} color="white" opacity={1} speed={0.2} seed={1} />
        <Cloud segments={40} bounds={[50, 10, 50]} volume={10} color="white" opacity={0.8} speed={0.1} position={[40, 0, 0]} seed={2} />
        <Cloud segments={40} bounds={[50, 10, 50]} volume={10} color="white" opacity={1} speed={0.2} position={[-40, 10, 0]} seed={3} />
        <Cloud segments={40} bounds={[50, 10, 50]} volume={10} color="white" opacity={0.9} speed={0.2} position={[0, 20, -20]} seed={4} />
      </Clouds>

      <Billboard position={[0, 0, -5]}>
        <group position={[0, 5, -20]}>
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[16, 10]} />
            <meshToonMaterial color="#1f2937" />
            <Outlines thickness={0.05} color="black" />
          </mesh>
          <Text
            fontSize={2.5}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
            position={[0, 2.5, 0.1]}
          >
            PROJECTS
          </Text>
          <Text
            fontSize={0.6}
            color="#d1d5db"
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
          openIframe={openIframe}
          iframeUrl={asteroid.url}
          type={asteroid.type}
          position={[index % 2 === 0 ? 5 : -5, 0, asteroid.z]}
          title={asteroid.title}
          description={asteroid.description}
        />
      ))}
    </group>
  )
}