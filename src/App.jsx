// src/App.jsx
import { Billboard, Clouds, Sparkles, useScroll } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, MarchingCubes, MarchingCube, MarchingPlane, Mask,
Sky, Html, ScrollControls, Scroll, GizmoHelper, GizmoViewport, GizmoViewcube, 
PerspectiveCamera, Cloud, Stars, Float, Sphere, Grid, Text, Trail, Center,
AccumulativeShadows,  RandomizedLight, Lightformer, Hud, Ring, TransformControls } 
from '@react-three/drei'
import { Avatar } from './Avatar'
import { Suspense, useRef, useEffect, useState } from 'react'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import Portal from './Portal'
import './App.css'
import { AdditiveBlending, AmbientLight, Color, PointLight } from 'three';
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Shockwave from './Shockwave'
import Enemy from './Enemy'
import Terrain from './Terrain'
import SpiralPortal from './SpiralPortal'
import SplashParticles from './SplashParticles'
import Planet from './Planet'
import Asteroid from './Astroid'
import Effects from './Effects'

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[500, 500]} /> 
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  )
}

export default function App() {
  const avatarRef = useRef()
  const [showName, setShowName] = useState(false)
  const [scrollEnabled, setScrollEnabled] = useState(false)
  const [waves, setWaves] = useState([])
  const [startShockwave, setStartShockwave] = useState(false)
  const [startSpiralPortal, setStartSpiralPortal] = useState(false)
  const [teleported, setTeleported] = useState(false)

  const triggerShockwave = (pos) => {
    setWaves((prev) => [...prev, { id: Date.now()+ Math.random(), position: pos }])
  }

  useEffect(() => {
    if(startShockwave) {
      console.log('triggered shockwave')
      triggerShockwave([0, 0, 25])
      setStartShockwave(false)
      setTimeout(() => {
        setStartSpiralPortal(true)
      }, 1000) // wait x seconds after shockwave
    }else{
      setStartSpiralPortal(false)
    }
  }, [startShockwave])


  useEffect(() => {
    // 🔒 Disable scroll
    document.body.style.overflow = 'hidden'

    const timeout = setTimeout(() => {
      avatarRef.current?.playSequence(['Landing', 'StandUp', 'Idle'])
      avatarRef.current?.playSequence(['Idle', 'Stretch'])
      setTimeout(() => {
        document.body.style.overflow = 'auto'
        setScrollEnabled(true)
      }, 5000) // wait x seconds after load
    }, 2000) // wait x seconds after load
    return () => clearTimeout(timeout)
  }, [])


  return (
    <>
      <div className="canvas-container" style={{ width: '100vw', height: '100%', background: 'black', overflow: 'hidden', position: 'relative'  }}>
        <Canvas shadows>
          <Suspense fallback={null}>
            <Effects/>
            <PerspectiveCamera makeDefault position={[0, 4, 20]} fov={50} />
            <ScrollControls pages={1} damping={2} enabled={scrollEnabled} >
              <Scroll>
                {!teleported &&
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

                  <Portal count={5000}/>
                  {/* <Planet textureUrl='Planets/mars.jpg' radius={20} position={[100,100,1000]}/> */}
                  
                  <Planet textureUrl='Planets/moon.jpg' radius={40} position={[-50,100,500]}/>


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

                  {Array.from({ length: 5 }, (_, i) => (
                    <Enemy
                      key={i}
                      index={i}
                      total={5}
                      shockwave={startShockwave}
                    />
                  ))}
                  
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
                  <Environment preset="night" intensity={0}>
                  </Environment>
                  <Stars radius={200} depth={10} count={1000} factor={10} saturation={0} fade speed={1} />
                  <Stars radius={100} depth={10} count={1000} factor={10} saturation={0} fade speed={1} />
                  <Stars radius={10} depth={10} count={100} factor={10} saturation={0} fade speed={1} />
                  <Clouds>
                   
                  </Clouds>
                </>}


                  {<Avatar setTeleported = {setTeleported} setStartShockwave={setStartShockwave} scrollEnabled = {scrollEnabled} ref={avatarRef} scale={2} position={[0,0,0]} rotation={[-Math.PI/2,0,0]}/>}
                
                {teleported &&
                  <>
                    <Environment preset="night" intensity={0.1}></Environment>
                    <ambientLight intensity={0.1} />

                    <pointLight position={[0, 0, 500]} intensity={100} distance={100} decay={2} color="white" />

                    <Stars radius={200} depth={1} count={1000} factor={10} saturation={1} fade speed={1} />
                    <Stars radius={50} depth={10} count={1000} factor={10} saturation={1} fade speed={1} />
                    <Stars radius={100} depth={10} count={100} factor={10} saturation={1} fade speed={1} />
                    <Stars radius={20} depth={1} count={1000} factor={10} saturation={1} fade speed={1} />

                    <Clouds position={[0, 0, 0]} >
                      <Cloud segments={250} seed={8} scale={3} bounds={[100, -150, 300]} opacity={0.1} volume={250} color="white"  fade={100} />
                      <Cloud segments={250} seed={7} scale={3} bounds={[100, -150, 300]} opacity={0.1} volume={250} color="white"  fade={100} />
                      <Cloud segments={250} seed={6} scale={3} bounds={[100, -150, 300]} opacity={0.1} volume={250} color="white"  fade={100} />
                      <Cloud segments={250} seed={5} scale={3} bounds={[100, -150, 500]} opacity={0.1} volume={250} color="white"  fade={100} />
                    </Clouds>

                    <Planet textureUrl='Planets/mars.jpg' radius={150} position={[0,-250,100]}/>

                    <Asteroid position={[5, 0, 170]}/>
                    <Asteroid position={[-5, 0, 150]}/>
                    <Asteroid position={[5, 0, 120]}/>
                    <Asteroid position={[-5, 0, 100]}/>
                    <Asteroid position={[5, 0, 80]}/>
                    <Asteroid position={[-5, 0, 60]}/>
                    <Asteroid position={[5, 0, 40]}/>

                    {/* <GroundPlane /> */}
                    {/* <OrbitControls/> */}
                  </>
                }

              </Scroll>
            </ScrollControls>
          </Suspense>
        </Canvas>
      </div>
    </>
  )
}
