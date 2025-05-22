// src/App.jsx
import { Canvas } from '@react-three/fiber'
import {ScrollControls, Scroll, PerspectiveCamera, Sky, Environment, OrbitControls, Stars, Center } 
from '@react-three/drei'
import Avatar from './Avatar'
import { Suspense, useRef, useEffect, useState } from 'react'
import './App.css'
import AboutMe from './AboutMe'
import Projects from './Projects'
import VillainScene from './VillainScene'
import { SphereGeometry } from 'three'


export default function App() {
  const avatarRef = useRef()
  const [scrollEnabled, setScrollEnabled] = useState(false)
  const [waves, setWaves] = useState([])
  const [startShockwave, setStartShockwave] = useState(false)
  const [startSpiralPortal, setStartSpiralPortal] = useState(false)
  const [teleported, setTeleported] = useState(false)
  const [contactPage, setContactPage] = useState(false)

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
            
            <PerspectiveCamera makeDefault position={[0, 4, 20]} fov={50} />
            <ScrollControls pages={1} damping={0.5} enabled={scrollEnabled} >
              <Scroll>
                {!teleported && !contactPage && <AboutMe startSpiralPortal = {startSpiralPortal}  startShockwave = {startShockwave} waves = {waves} setWaves = {setWaves}/>}

                {<Avatar contactPage = {contactPage} setContactPage = {setContactPage} setTeleported = {setTeleported} setStartShockwave={setStartShockwave} scrollEnabled = {scrollEnabled} ref={avatarRef} scale={2} position={[0,0,0]} rotation={[-Math.PI/2,0,0]}/>}
                
                {teleported && !contactPage && <Projects/>}

                {contactPage &&
                  <>
                    {/* <Sky sunPosition={[100, 20, 100]} /> */}   
                    {/* <Center> */}
                      <VillainScene/>
                    {/* </Center>                  */}
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
