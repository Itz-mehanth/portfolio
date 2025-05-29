// src/App.jsx
import { Canvas } from '@react-three/fiber'
import {
  ScrollControls,
  Scroll,
  PerspectiveCamera,
} from '@react-three/drei'
import Avatar from './Avatar'
import { Suspense, useRef, useEffect, useState } from 'react'
import './App.css'
import AboutMe from './AboutMe'
import Projects from './Projects'
import Contact from './Contact'
import IntroSection from './IntroSection'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import './Navbar.css'
import FaceMeshFromLocal from './FaceMeshFromLocal'


const Navbar = ({ fontBlack }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    <nav className="navbar">
      <div className="navbar-left" style={{ color: fontBlack ? 'black' : 'white' }}>
        Mehanth
      </div>

      {/* Desktop menu */}
      <ul className="navbar-right desktop-menu">
        <li><a href="#lander" style={{ color: fontBlack ? 'black' : 'white' }}>Lander</a></li>
        <li><a href="#about" style={{ color: fontBlack ? 'black' : 'white' }}>About</a></li>
        <li><a href="#contact" style={{ color: fontBlack ? 'black' : 'white' }}>Contact</a></li>
      </ul>

      {/* Hamburger icon */}
      <div className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div />
        <div />
        <div />
      </div>

      {/* Mobile menu overlay */}
      <div className={`mobile-menu ${menuOpen ? 'show' : ''}`}>
        <a href="#lander" onClick={toggleMenu}>Lander</a>
        <a href="#about" onClick={toggleMenu}>About</a>
        <a href="#contact" onClick={toggleMenu}>Contact</a>
      </div>
    </nav>
  );
};


export default function App() {
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.9 })
  const avatarRef = useRef()
  const [scrollEnabled, setScrollEnabled] = useState(false)
  const [waves, setWaves] = useState([])
  const [startShockwave, setStartShockwave] = useState(false)
  const [startSpiralPortal, setStartSpiralPortal] = useState(false)
  const [teleported, setTeleported] = useState(false)
  const [contactPage, setContactPage] = useState(false)
  const [fontBlack, setFontBlack] = useState(true)

  const triggerShockwave = (pos) => {
    setWaves((prev) => [...prev, { id: Date.now() + Math.random(), position: pos }])
  }

  useEffect(() => {
    if (inView) {
      setFontBlack(false)
    } else {
      setFontBlack(true)
    }
  }, [inView])

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
    <div style={{ scrollSnapType: 'y mandatory',  height: '100vh', overflowX: 'hidden' }}>

      
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
        >
        {/* <FaceMeshFromLocal/> */}

        <div style={{width: '90%'}}>
          <p className='Quicksand' style={{margin: '5px 0px', fontSize: '16px', textAlign: 'left', color: 'grey'}}>Hi, I'm</p>
          <p className='Quicksand' style={{margin: '5px 0px', fontSize: '24px', textAlign: 'left'}}>Mehanth — a Computer Science Engineering student </p>
          <p className='Quicksand' style={{margin: '5px 0px', fontSize: '16px', textAlign: 'left', color: 'grey'}}>with a passion for creating wonders through code, creativity, and innovation. From intelligent systems to immersive experiences, I love bringing bold ideas to life.</p>
        </div>
        <IntroSection />
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
              <PerspectiveCamera makeDefault position={[0, 4, 15]} fov={70} />
              <ScrollControls distance={5} pages={1} damping={0.5} enabled={scrollEnabled}>
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

                  {teleported && !contactPage && <Projects />}
                </Scroll>
              </ScrollControls>
            </Suspense>
          </Canvas>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section id='contact'
        style={{
          height: '100vh',
          scrollSnapAlign: 'start',
          background: 'black',
        }}
      >
        <Canvas>
          <Contact />
        </Canvas>
      </section>
    </div>
  )
}
