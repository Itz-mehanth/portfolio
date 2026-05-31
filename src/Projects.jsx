import { Billboard, Clouds, Sparkles } from '@react-three/drei'
import { Cloud, Stars } from '@react-three/drei'
import * as THREE from 'three'
import './App.css'
import Asteroid from './Astroid'
import Effects from './Effects'
import { useState, useMemo, memo, useRef } from "react"
import { Text } from "@react-three/drei"
import { Balloon } from './utils/models/Balloon'

import CoinField from './CoinField';
import { useFrame } from '@react-three/fiber';

const ProjectEnvironment = memo(function ProjectEnvironment() {
  return (
    <group>
      {/* Clean bright sky */}
      <color attach="background" args={['#1a1a2e']} />
      <fog attach="fog" args={['#1a1a2e', 80, 400]} />

      {/* Stars */}
      <Stars
        radius={200}
        depth={80}
        count={4000}
        factor={5}
        saturation={0}
        fade
        speed={0.8}
      />

      {/* Golden dust particles along the flight corridor */}
      <Sparkles
        count={150}
        scale={[40, 20, 500]}
        size={2.5}
        speed={0.4}
        opacity={0.7}
        color="#fbbf24"
      />

      {/* Lighting — cinematic */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, -10]} intensity={2} color="#ffffff" />
      <hemisphereLight skyColor="#4338ca" groundColor="#1e1b4b" intensity={0.4} />
    </group>
  );
});

export default function Projects({ openIframe, contactPage, avatarRef, scoreElement, scoreValueRef, lowPowerMode = false }) {
  // ... existing code ...




  // Generate random cloud positions
  const cloudPositions = useMemo(() => {
    const pos = [];
    const cloudCount = lowPowerMode ? 10 : 20;
    for (let i = 0; i < cloudCount; i++) {
      pos.push({
        x: (Math.random() - 0.5) * 150,
        y: (Math.random() - 0.5) * 60 + 10,
        z: i * 25, // Spread along Z
        seed: i,
        opacity: 0.5 + Math.random() * 0.5
      });
    }
    return pos;
  }, [lowPowerMode]);

  // ... (previous logic for coins)

  const asteroidData = [
    {
      z: 60,
      url: "https://medicinal-plant-82aa9.web.app/", //1
      repoUrl: "https://github.com/Itz-mehanth/MedPlant",
      title: "MedPlant",
      description: "CNN-based plant identifier with medicinal insights.",
      type: "live"
    },
    {
      z: 80,
      url: "https://vplants.vercel.app", //2
      repoUrl: "https://github.com/Itz-mehanth/VRoom",
      title: "VRoom",
      description: "Immersive 3D exploration and gardening.",
      type: "live"
    },
    {
      z: 100,
      url: "https://retempla.xyz/", //3
      repoUrl: "https://github.com/Itz-mehanth/Retempla",
      title: "ReTempla",
      description: "SaaS for smart document formatting and personalization.",
      type: "live"
    },
    {
      z: 120,
      url: "https://streamtick.vercel.app", //4
      repoUrl: "https://github.com/Itz-mehanth/LiveStock",
      title: "LiveStock",
      description: "Real-time data pipeline for processing and visualizing stock data.",
      type: "live"
    },
    {
      z: 140,
      url: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7261266876800868355?collapsed=1", //5
      repoUrl: "https://github.com/Itz-mehanth/GalaxyStrike",
      title: "Galaxy Strike",
      description: "A retro-style 2D Java game built from scratch using Swing.",
      type: "linkedin"
    },
    {
      z: 160,
      repoUrl: "https://github.com/Itz-mehanth/FSDC-project",  //6
      title: "C Food Delivery App",
      description: "Food Delivery App Simulation using C Language.",
      type: "github"
    },
    {
      z: 180,
      url: "https://xcng.vercel.app",
      repoUrl: "https://github.com/Itz-mehanth/XCNG", //7
      title: "XCNG",
      description: "Real-time marketplace and community platform for campuses.",
      type: "live"
    },
    {
      z: 200,
      url: "https://crownofsovereigns.netlify.app",
      repoUrl: "https://github.com/Itz-mehanth/CrownOfSovereigns", //8
      title: "Crown of Sovereigns",
      description: "Stunning 3D strategy board game inspired by Carcassonne.",
      type: "live"
    },
    {
      z: 220,
      repoUrl: "https://github.com/Itz-mehanth/VSCE", //9
      title: "VSCE Extension",
      description: "VS Code extension for interactive 360-degree HDR visualization.",
      type: "github"
    },
    {
      z: 240,
      repoUrl: "https://github.com/Itz-mehanth/NPM-Package---R3F-Nav-Controls", //10
      title: "R3F Nav Controls",
      description: "React component library for controls in 3D scenes.",
      type: "github"
    },
    {
      z: 260,
      repoUrl: "https://github.com/Itz-mehanth/DBMS_Hospital_Management", //11
      title: "Hospital Management",
      description: "Robust desktop application for efficient healthcare management.",
      type: "github"
    },
    {
      z: 280,
      repoUrl: "https://github.com/Itz-mehanth/Aura-AI-Agent", //12
      title: "Aura AI Agent",
      description: "Voice-activated AI personal assistant leveraging advanced ML models.",
      type: "github"
    },
    {
      z: 300,
      url: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7298710253531971584?collapsed=1",
      repoUrl: "https://github.com/Itz-mehanth/LudoGameAR", //13
      title: "AR Ludo Game",
      description: "Augmented reality version of Ludo built with Unity and Vuforia.",
      type: "linkedin"
    },
    {
      z: 320,
      url: "https://ssntour.vercel.app", //14
      repoUrl: "https://github.com/Itz-mehanth/SSN_Tour",
      title: "SSN Tour",
      description: "Immersive 3D virtual tour of SSN College of Engineering.",
      type: "live"
    },
    {
      z: 340,
      url: "https://ariseedu.vercel.app", //15
      repoUrl: "https://github.com/Itz-mehanth/Arise_SIH2025",
      title: "Arise",
      description: "Gamified Learning Platform for Rural Education.",
      type: "live"
    },
    {
      z: 360,
      url: "https://gh9b.games.mehanth.site", //16
      repoUrl: "https://github.com/Itz-mehanth/GH9B",
      title: "GH9-B",
      description: "Immersive 3D survival horror experience built for the web.",
      type: "live"
    },
    {
      z: 380,
      repoUrl: "https://github.com/Itz-mehanth/3DWallpaper", //17
      title: "3D Wallpaper",
      description: "Meta Quest 3-style 3D desktop environment with window capture.",
      type: "github"
    }
  ];



  return (
    <group>
      <ProjectEnvironment />

      {/* Clouds */}
      {/* Distributed Clouds */}
      <Clouds limit={lowPowerMode ? 160 : 320} material={THREE.MeshStandardMaterial}>
        {cloudPositions.map((cloud, i) => (
          <Cloud key={i} seed={cloud.seed} position={[cloud.x, cloud.y, cloud.z]} segments={lowPowerMode ? 10 : 18} bounds={[20, 4, 20]} volume={lowPowerMode ? 6 : 10} color="white" opacity={cloud.opacity} speed={0.2} />
        ))}
      </Clouds>

      {/* Coins */}
      <CoinField
        avatarRef={avatarRef}
        scoreValueRef={scoreValueRef}
        scoreElement={scoreElement}
        lowPowerMode={lowPowerMode}
      />



      {/* Smart TV Display */}
      <group position={[0, 5, -20]}>
        {/* TV Body - thin panel */}
        <mesh position={[0, 0, -0.15]}>
          <boxGeometry args={[17, 10.5, 0.25]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Screen bezel frame */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[16.4, 9.8]} />
          <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.4} />
        </mesh>

        {/* Screen - dark with content */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[15.6, 9.2]} />
          <meshStandardMaterial color="#0f0f1a" emissive="#0f0f1a" emissiveIntensity={0.3} />
        </mesh>

        {/* Screen content */}
        <Text
          fontSize={2.2}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
          position={[0, 2, 0.05]}
          font={undefined}
        >
          PROJECTS
        </Text>
        <Text
          fontSize={0.55}
          color="#a1a1aa"
          anchorX="center"
          anchorY="middle"
          position={[0, -0.5, 0.05]}
          maxWidth={12}
          textAlign="center"
        >
          Fly through and click Live Site to preview in any device
        </Text>

        {/* Screen glow */}
        <pointLight position={[0, 0, 2]} intensity={0.4} color="#fbbf24" distance={8} />

        {/* TV Stand - center neck */}
        <mesh position={[0, -5.8, -0.1]}>
          <boxGeometry args={[0.8, 1.2, 0.3]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* TV Stand - base */}
        <mesh position={[0, -6.5, 0.3]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[5, 0.15, 1.8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Brand logo dot */}
        <mesh position={[0, -4.6, 0.01]}>
          <circleGeometry args={[0.12, 16]} />
          <meshStandardMaterial color="#333" emissive="#fbbf24" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Asteroids */}
      {asteroidData.map((asteroid, index) => {
        let theme = 'platinum';
        if (index < 6) theme = 'diamond';
        else if (index < 12) theme = 'gold';

        return (
          <Asteroid
            key={index}
            openIframe={openIframe}
            iframeUrl={asteroid.url}
            repoUrl={asteroid.repoUrl}
            type={asteroid.type}
            theme={theme}
            position={[index % 2 === 0 ? 7 : -7, 0, asteroid.z]}
            title={asteroid.title}
            description={asteroid.description}
          />
        );
      })}
    </group>
  )
}
