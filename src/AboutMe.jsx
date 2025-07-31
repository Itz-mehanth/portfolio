// src/App.jsx
import { Clouds } from '@react-three/drei'
import { Environment, Mask, Stars, Html} 
from '@react-three/drei'
import Portal from './Portal'
import './App.css'
import Shockwave from './Shockwave'
import Terrain from './Terrain'
import SplashParticles from './SplashParticles'
import Planet from './Planet'
import Effects from './Effects'
import './AboutMe.css'
import { useState, useEffect } from 'react'

function TextOverlay() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const triggerPoint = window.innerHeight * 0.5
      setVisible(window.scrollY > triggerPoint)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Html position={[0, 2, 0]} center>
      <div className={`text-container ${visible ? 'visible' : ''}`}>
        <span className="left">Curiosity...</span>
        <span className="right">Drive...</span>
        <span className="center">A leap into the unknown...</span>
      </div>
    </Html>
  )
}

export default function AboutMe(props) {
    const startSpiralPortal = props.startSpiralPortal
    const startShockwave = props.startShockwave
    const waves = props.waves
    const setWaves = props.setWaves
    const [visible, setVisible] = useState(false)

    useEffect(() => {
      const handleScroll = () => {
        const triggerPoint = window.innerHeight * 0.5
        setVisible(window.scrollY > triggerPoint)
      }

      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }, [])


    return (
    <>
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* <Sparkles  color='white' count={80} size={180} scale={50} noise={1} speed={1} blending={AdditiveBlending}/> */}

        <Portal count={10000}/>
        {/* <Planet textureUrl='Planets/mars.jpg' radius={20} position={[100,100,1000]}/> */}

        <Planet textureUrl='Planets/earth.jpg' radius={80} position={[-50,100,500]}/>

        { startSpiralPortal &&
          <Mask>
            {/* <SpiralPortal position={[0, 4.5, 35]} scale={2} />
            <SpiralPortal position={[0, 4.5, 35]} scale={1.5} />
            <SpiralPortal position={[0, 4.5, 35]} scale={1} /> */}
            <SplashParticles radius={1} count={1000} position={[0,-35, 4.5]}/>
            <SplashParticles radius={1} count={1000} position={[0,-36, 4.5]}/>
            <SplashParticles radius={1} count={1000} position={[0,-37, 4.5]}/>
            <SplashParticles radius={1} count={1000} position={[0,-38, 4.5]}/>
            <SplashParticles radius={1} count={1000} position={[0,-39, 4.5]}/>
          </Mask>
        }

        {/* Scene Elements */}
        {/* <GroundPlane /> */}
        <Terrain />

        <Effects/>
        
        {waves.map((wave) => (
          <Shockwave
            key={wave.id}
            position={wave.position}
            onComplete={() => {
              setWaves((prev) => prev.filter((w) => w.id !== wave.id))
            }}
          />
        ))}


        {/* Controls */}
        {/* <OrbitControls enableZoom={false} /> */}
  
        <Stars radius={200} depth={10} count={1000} factor={10} saturation={4} fade speed={1} />
        <Stars radius={100} depth={10} count={1000} factor={10} saturation={7} fade speed={1} />
    </>
    )
}