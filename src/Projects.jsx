// src/App.jsx
import { Billboard, Clouds, Outlines } from '@react-three/drei'
import { Environment, Cloud, Stars } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { RGBELoader } from 'three-stdlib'
import * as THREE from 'three'
import './App.css'
import Asteroid from './Astroid'
import Effects from './Effects'
import { useState, useMemo } from "react"
import { Text } from "@react-three/drei"
import { Balloon } from './utils/models/Balloon' // Import Balloon

import Coin from './Coin';
import { useFrame } from '@react-three/fiber';

// Isolated Environment Component to prevent Suspense-based re-renders
function ProjectEnvironment() {
  const texture = useLoader(RGBELoader, '/hdr/anime_sky.hdr');
  texture.mapping = THREE.EquirectangularReflectionMapping;

  return (
    <group>
      <Environment files={'/hdr/anime_sky.hdr'} backgroundIntensity={0.5} environmentIntensity={0.1} />
      <mesh position={[0, 0, 100]} scale={[-1, 1, 1]}>
        <sphereGeometry args={[700, 60, 40]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <ambientLight intensity={1.2} />
    </group>
  );
}

export default function Projects({ openIframe, contactPage, avatarRef, scoreElement, scoreValueRef }) {
  // ... existing code ...

  // Generate coins along the path
  const coins = useMemo(() => {
    const _coins = [];
    for (let z = 20; z < 500; z += 15) {
      // Random X and Y within flight bounds
      // X: -30 to 30, Y: -10 to 30
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 30 + 10;
      _coins.push({ position: [x, y, z], id: z });
    }
    return _coins;
  }, []);

  const [collectedCoins, setCollectedCoins] = useState({});

  useFrame(() => {
    if (avatarRef && avatarRef.current && avatarRef.current.position) {
      const planePos = avatarRef.current.position;

      coins.forEach(coin => {
        if (!collectedCoins[coin.id]) {
          const dx = planePos.x - coin.position[0];
          const dy = planePos.y - coin.position[1];
          const dz = planePos.z - coin.position[2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 5) { // Collision radius
            setCollectedCoins(prev => ({ ...prev, [coin.id]: true }));

            // Play Coin Sound
            const audio = new Audio('/audio/coin.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.error("Audio play failed", e));

            // Direct update without re-rendering App
            if (scoreValueRef) scoreValueRef.current += 10;
            if (scoreElement && scoreElement.current) {
              scoreElement.current.innerText = scoreValueRef.current;
            }
          }
        }
      });
    }
  });


  // Generate random cloud positions
  const cloudPositions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < 20; i++) {
      pos.push({
        x: (Math.random() - 0.5) * 150,
        y: (Math.random() - 0.5) * 60 + 10,
        z: i * 25, // Spread along Z
        seed: i,
        opacity: 0.5 + Math.random() * 0.5
      });
    }
    return pos;
  }, []);

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
      <Clouds limit={400} material={THREE.MeshStandardMaterial}>
        {cloudPositions.map((cloud, i) => (
          <Cloud key={i} seed={cloud.seed} position={[cloud.x, cloud.y, cloud.z]} segments={20} bounds={[20, 4, 20]} volume={10} color="white" opacity={cloud.opacity} speed={0.2} />
        ))}
      </Clouds>

      {/* Coins */}
      {coins.map(coin => (
        !collectedCoins[coin.id] && (
          <Coin key={coin.id} position={coin.position} onCollect={() => { }} />
        )
      ))}



      {/* Billboard */}
      <Billboard position={[0, 0, -5]}>
        {/* ... billboard content ... */}
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