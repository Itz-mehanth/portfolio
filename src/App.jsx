// src/App.jsx
import { Canvas } from '@react-three/fiber'
import {
  ScrollControls,
  Scroll,
  Html,
  PerspectiveCamera,
  Billboard,
  Text,
  OrbitControls,
  Splat,
  AsciiRenderer,
  Hud,
  Box,
} from '@react-three/drei'
import Avatar from './Avatar'
import { Suspense, useRef, useEffect, useState } from 'react'
import './App.css'
import AboutMe from './AboutMe'
import Projects from './Projects'
import Contact from './Contact'
import IntroSection from './IntroSection'
import { motion, transform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import './Navbar.css'
import FaceMeshFromLocal from './FaceMeshFromLocal'
import { useAudio } from './context/AudioProvider'
import { AmbientLight } from 'three'
import SplashLoader from './SplashLoader'
import Skills from './Skills'

const Navbar = ({ fontBlack }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAudioEnabled, toggleAudio } = useAudio()

  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    <nav className="navbar">
      <div className="navbar-left" style={{ color: fontBlack ? 'black' : 'white' }}>
        Mehanth
      </div>

      <button onClick={toggleAudio}>
        {isAudioEnabled ? '🔊 Music On' : '🔇 Music Off'}
      </button>

      {/* Desktop menu */}
      <ul className="navbar-right desktop-menu">
        <li><a href="#lander" style={{ color: fontBlack ? 'black' : 'white' }}>Lander</a></li>
        <li><a href="#skills" style={{ color: fontBlack ? 'black' : 'white' }}>Skills</a></li>
        <li><a href="#about" style={{ color: fontBlack ? 'black' : 'white' }}>About</a></li>
        <li><a href="#contact" style={{ color: fontBlack ? 'black' : 'white' }}>Contact</a></li>
      </ul>

      {/* Hamburger icon */}
      <div className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div style={{backgroundColor: fontBlack ? 'black' : 'white'}}/>
        <div style={{backgroundColor: fontBlack ? 'black' : 'white'}}/>
        <div style={{backgroundColor: fontBlack ? 'black' : 'white'}}/>
      </div>

      {/* Mobile menu overlay */}
      <div  style={{backgroundColor: fontBlack ? 'black' : 'white'}} className={`mobile-menu ${menuOpen ? 'show' : ''}`}>
        <a style={{ color: fontBlack ? 'white' : 'black' }} href="#lander" onClick={toggleMenu}>Lander</a>
        <a style={{ color: fontBlack ? 'white' : 'black' }} href="#skills" onClick={toggleMenu}>Skills</a>
        <a style={{ color: fontBlack ? 'white' : 'black' }} href="#about" onClick={toggleMenu}>About</a>
        <a style={{ color: fontBlack ? 'white' : 'black' }} href="#contact" onClick={toggleMenu}>Contact</a>
      </div>
    </nav>
  );
};


export default function App() {
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.8 })
  const [contactRef, contactinView] = useInView({ triggerOnce: false, threshold: 0.8 })
  const [introRef, introinView] = useInView({ triggerOnce: false, threshold: 0.8 })
  const avatarRef = useRef()
  const [scrollEnabled, setScrollEnabled] = useState(false)
  const [waves, setWaves] = useState([])
  const [startShockwave, setStartShockwave] = useState(false)
  const [startSpiralPortal, setStartSpiralPortal] = useState(false)
  const [teleported, setTeleported] = useState(false)
  const [contactPage, setContactPage] = useState(false)
  const [fontBlack, setFontBlack] = useState(true)
  const { playTrack } = useAudio()
  const [iframeUrl, setIframeUrl] = useState(null); // or '' initially
  const [showIframe, setShowIframe] = useState(false);
  const [loading, setLoading] = useState(true);

  const openIframe = (url) => {
    setIframeUrl(url);
    setShowIframe(true);
  };

  const closeIframe = () => {
    setShowIframe(false);
    setIframeUrl(null);
  };

  const triggerShockwave = (pos) => {
    setWaves((prev) => [...prev, { id: Date.now() + Math.random(), position: pos }])
  }

  useEffect(() => {
    if (inView || contactinView) {
      setFontBlack(false)
    } else {
      setFontBlack(true)
    }
  }, [inView, contactinView])
  
  useEffect(() => {
    if (introinView) {
      console.log('intro in view')
      playTrack('happy')
    }
  }, [introinView])

  useEffect(() => {
    if (startShockwave) {
      console.log('triggered shockwave')
      triggerShockwave([0, 0, 25])
      setStartShockwave(false)
      setTimeout(() => {
        setStartSpiralPortal(true)
      }, 1000)
    } else {
      setStartSpiralPortal(false)
    }
  }, [startShockwave])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const timeout = setTimeout(() => {
      avatarRef.current?.playSequence(['Landing', 'StandUp', 'Idle'])
      avatarRef.current?.playSequence(['Idle', 'Stretch'])
      setTimeout(() => {
        document.body.style.overflow = 'auto'
        setScrollEnabled(true)
      }, 5000)
    }, 2000)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <>
     {loading && <SplashLoader setLoading={setLoading} />}
    {!loading && (
    <div style={{ scrollSnapType: 'y mandatory',  height: '100vh', overflowX: 'hidden' }}>
      {/* <CustomCursor /> */}
      <Navbar fontBlack = {fontBlack}/>
      {/* Intro Section */}
      <section id='lander'
        style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          background: 'white',
          scrollSnapAlign: 'start',
        }}
        ref = {introRef}
        >
        {/* <FaceMeshFromLocal/> */}

        <div style={{width: '90%'}}>
          <p className='Quicksand' style={{margin: '5px 0px', fontSize: '16px', textAlign: 'left', color: 'grey'}}>Hi, I'm</p>
          <p className='Silkscreen' style={{margin: '5px 0px', fontSize: '50px', textAlign: 'left'}}>Mehanth</p>
          <p className='Quicksand' style={{margin: '5px 0px', fontSize: '24px', textAlign: 'left'}}>a Computer Science Engineering student </p>
          <p className='Quicksand' style={{margin: '5px 0px', fontSize: '16px', textAlign: 'left', color: 'grey'}}>with a passion for creating wonders through code, creativity, and innovation. From intelligent systems to immersive experiences, I love bringing bold ideas to life.</p>
        </div>
        <IntroSection />
      </section>

        <section id='lander'
        style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          background: 'white',
          scrollSnapAlign: 'start',
        }}
        >
          <Skills/>
        </section>

      {/* 3D Section */}
      <section id='about'
        className="canvas-text-section hide-scrollbar"
        style={{
          height: '100vh',
          width: '100vw',
          position: 'relative', // Important to contain absolute children
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          background: 'white',
          scrollSnapAlign: 'start',
        }}
        ref={ref}
      >
          {/* Canvas Wrapper */}
        <motion.div className='hide-scrollbar'
          initial={{
            width: '40%',
            height: '40%',
            borderRadius: '20px',
            boxShadow: '0 0 30px rgba(0, 0, 0, 0.3)',
            overflow: 'scroll',
            scrollbarWidth: 'none',       // Firefox
            msOverflowStyle: 'none', // Internet Explorer and Edge
          }}
          animate={{
            width: inView ? '100%' : '40%',
            height: inView ? '100%' : '40%',
            borderRadius: inView ? '0px' : '30px',
            boxShadow: inView ? 'none' : '0 0 30px rgba(0, 0, 0, 0.3)',
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          style={{
            backgroundColor: 'black',
            position: 'relative',
            zIndex: 10,
            width: '80%',
            height: '80%',
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
        {/* <div style={{width: '90%'}}>
            <p className='Righteous' style={{margin: '5px 0px', fontSize: '16px', textAlign: 'left', color: 'grey'}}>Explore my Portfolio</p>
        </div> */}
          <Canvas shadows>
         
            <Suspense fallback={null}>
                <Hud>
                  <ambientLight intensity={5} />
                  <Html center>                    
                    <div
                      style={{
                        display: showIframe ? 'flex' : 'none',
                        width: '350px',
                        height: '750px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        boxShadow: '0 0 15px rgba(0,0,0,0.3)',
                        position: 'relative',
                      }}
                    >
                      {/* Close Button */}
                      <button
                        onClick={closeIframe}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          zIndex: 10,
                        }}
                      >
                        ✖
                      </button>

                      {/* Iframe */}
                      <iframe
                        height={'100%'}
                        width={'100%'}
                        src={iframeUrl}
                        title="Dynamic Iframe"
                      />
                    </div>
                  </Html>
                </Hud>
              <PerspectiveCamera makeDefault position={[0, 4, 15]} fov={70} />
              <ScrollControls distance={5} pages={1} damping={1} enabled={scrollEnabled}>
                <Scroll>
                  {!teleported && !contactPage && (
                    <AboutMe
                      startSpiralPortal={startSpiralPortal}
                      startShockwave={startShockwave}
                      waves={waves}
                      setWaves={setWaves}
                    />
                  )}

                  <Avatar
                    contactPage={contactPage}
                    setContactPage={setContactPage}
                    setTeleported={setTeleported}
                    setStartShockwave={setStartShockwave}
                    scrollEnabled={scrollEnabled}
                    ref={avatarRef}
                    scale={2}
                    position={[0, 0, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    static={false}
                  />

                  {teleported && !contactPage && 
                  <Projects
                    openIframe={openIframe}
                  />}

                </Scroll>
              </ScrollControls>
            </Suspense>
          </Canvas>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section id='contact'
        ref={contactRef}
        style={{
          height: '100vh',
          scrollSnapAlign: 'start',
          background: 'black',
        }}
      >
        <Canvas>
          <Suspense fallback={null}>
          <Contact />
          </Suspense>
        </Canvas>

         {/* <Canvas camera={{ position: [0, 8, 5] }}>
          <ScrollControls pages={2} damping={0.5} enabled={scrollEnabled}>
            <Scroll>
              <ambientLight intensity={1} />
                  <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="orange" />
                  </mesh>
              <Billboard lockX={true} lockY={true} lockZ={true}>
                <group>
                  <sphereGeometry position={[-2,2,0]} args={[1, 32, 32]} />
                  <Html style={{position: 'relative', top: '0px', left: '0px', background: 'white'}} position={[0, -105, 0]}>
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        backgroundColor: "white",
                        padding: "10px",
                        borderRadius: "5px",
                        color: "black",
                        fontFamily: "Arial",
                        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                      }}
                    >
                      <iframe
                        src="https://mehanth-a1964.web.app"
                        title="Mobile Preview"
                        style={{ width: "100%", height: "100%", border: "none" }}
                      ></iframe>
                    </div>
                  </Html>
                </group>
              </Billboard>
            </Scroll>
          </ScrollControls>
        </Canvas> */}
        
      </section>
    </div>
     )}
    </>
  )
}
