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
import { AmbientLight, Color, PointLight } from 'three';
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Shockwave from './Shockwave'
import Enemy from './Enemy'
import Terrain from './Terrain'
import SpiralPortal from './SpiralPortal'
import SplashParticles from './SplashParticles'
import Planet from './Planet'
import Asteroid from './Astroid'

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
      avatarRef.current?.playSequence(['Landing', 'StandUp', 'Stretch', 'Idle'])
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

          {/* <Hud>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} />
            <mesh>
              <ringGeometry />
            </mesh>
          </Hud>
          <Hud>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} />
            <mesh>
              <ringGeometry />
            </mesh>
          </Hud> */}
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 4, 20]} fov={50} />
            <ScrollControls pages={1} damping={2} enabled={scrollEnabled} >

              {/* <Scroll  html>
                <Html>
                  {showName && (
                    <div className={`name-banner ${showName ? 'animate-name' : ''}`}>Mehanth</div>
                  )}
                </Html>
              </Scroll> */}

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
                  <Sparkles  color='white' count={80} size={180} scale={50}/>

                  <Portal count={5000}/>
                  {/* <Planet textureUrl='Planets/mars.jpg' radius={20} position={[100,100,1000]}/> */}
                  <Planet textureUrl='Planets/moon.jpg' radius={40} position={[-50,100,500]}/>
                  <pointLight color="yellow" intensity={2000} position={[200, 100, 1100]} />


                  { startSpiralPortal &&
                    <Mask>
                      <SpiralPortal position={[0, 4.5, 35]} scale={2} />
                      <SpiralPortal position={[0, 4.5, 35]} scale={1.5} />
                      <SpiralPortal position={[0, 4.5, 35]} scale={1} />
                      <SplashParticles radius={1} count={1000} position={[0,-35, 4.5]}/>
                      <SplashParticles radius={1} count={1000} position={[0,-40, 4.5]}/>
                    </Mask>
                  }

                  {/* Scene Elements */}
                  {/* <GroundPlane /> */}
                  <Terrain />

                  <Float
                    speed={10}
                    rotationIntensity={1}
                    floatIntensity={1}
                    floatingRange={[10, 10]} 
                  >
                    <Sphere args={[0.5, 32, 32]} scale={1} position={[0, 1, 0]}></Sphere>
                  </Float>

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
                  <Environment preset="night" intensity={1}>
                  <pointLight intensity={100} position={[10,5,5]}/>
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
                    <Environment preset="sunset" intensity={1} background></Environment>
                    <ambientLight intensity={1} />

                    <Clouds position={[0, 0, 0]} >
                      <Cloud segments={250} seed={8} scale={2} bounds={[100, -150, 300]} volume={250} color="white"  fade={1} />
                      <Cloud segments={250} seed={7} scale={3} bounds={[100, -150, 300]} volume={250} color="white"  fade={1} />
                      <Cloud segments={250} seed={6} scale={2} bounds={[100, -150, 300]} volume={250} color="white"  fade={1} />
                      <Cloud segments={250} seed={5} scale={3} bounds={[100, -150, 300]} volume={250} color="white"  fade={1} />
                    </Clouds>

                    <Asteroid/>

                    {/* <GroundPlane /> */}
                    {/* <OrbitControls/> */}
                    <Sky 
                      distance={450} // Camera distance (default=4500)
                      sunPosition={[100, 20, 10]} // Sun position (default=[100, 20, 10])
                      inclination={0} // [0..1] inclination (default=0)
                      azimuth={0.25} // [0..1] azimuth (default=0.25)
                      turbidity={10} // [0..20] turbidity (default=10)
                      rayleigh={2} // [0..4] rayleigh (default=1)
                      mieCoefficient={0.005} // [0..0.1] mieCoefficient (default=0.005)
                      mieDirectionalG={0.8} // [0..1] mieDirectionalG (default=0.8)
                      exposure={1} // Camera exposure control (default=1)
                    />
                  </>
                }

              </Scroll>
            </ScrollControls>
          </Suspense>

          {/* HUD renders on top and stays fixed on screen */}
          {/* <Hud>
            <OrbitControls/>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} />
            <mesh>
              <ringGeometry />
            </mesh>
          </Hud> */}
        </Canvas>
      </div>
    </>
  )
}
