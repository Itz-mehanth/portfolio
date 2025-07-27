// src/App.jsx
import { Canvas } from '@react-three/fiber'
import {
  ScrollControls,
  Scroll,
  Html,
  PerspectiveCamera,
  Hud
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
import { useAudio } from './context/AudioProvider'
import SplashLoader from './SplashLoader'
import Skills from './Skills'
import { Mail, Linkedin, Github, Instagram } from 'lucide-react';


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
  }, [inView, contactinView, teleported])
  
  useEffect(() => {
    if (introinView) {
      console.log('intro in view')
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

  const handleDownloadCV = () => {
    // Create a link element and trigger download
    const link = document.createElement('a')
    link.href = 'https://drive.google.com/file/d/1jkPCERyK7Z8Vz_afloqAapmaYtPMBHFP/view?usp=sharing' // Update this path to your CV file
    link.download = 'Mehanth_CV.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
          padding: '40px 0',
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
        <div style={{width: '90%'}}>
          <p className='Quicksand' style={{margin: '5px 0px', fontSize: '16px', textAlign: 'left', color: 'grey'}}>Hi, I'm</p>
          <p className='Silkscreen' style={{margin: '5px 0px', fontSize: '50px', textAlign: 'left', color: 'black'}}>Mehanth</p>
        <button
                onClick={handleDownloadCV}
                style={{
                  width: '170px',
                  padding: '5px 10px',
                  backgroundColor: 'rgba(255, 215, 0, 0.9)', // Yellow with transparency
                  color: 'black',
                  border: '2px solid rgba(0, 0, 0, 0.3)',
                  borderRadius: '25px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Poppins',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 215, 0, 1)'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 215, 0, 0.9)'
                  e.target.style.transform = 'translateY(0px)'
                  e.target.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.3)'
                }}
              >
                Download CV
              </button>
          <p className='Quicksand' style={{margin: '5px 0px', fontSize: '24px', textAlign: 'left'}}>a Computer Science Engineering student </p>
          <p className='Quicksand' style={{margin: '5px 0px', fontSize: '16px', textAlign: 'left', color: 'grey'}}>with a passion for creating wonders through code, creativity, and innovation. From intelligent systems to immersive experiences, I love bringing bold ideas to life.</p>
        </div>
        <IntroSection />
      </section>

        <section id='skills'
        style={{
          height: '100vh',
          padding: '60px 0px 60px 0',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          background: 'white',
          scrollSnapAlign: 'start',
          zIndex: -1
        }}
        >
          <h1 style={{fontSize: '80px', fontWeight: '500'}} className='Barrio'>Skill Town</h1>
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
        <div className='hide-scrollbar'
          style={{
            backgroundColor: '#000',
            position: 'relative',
            zIndex: 10,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            zIndex: 5
          }}
        >
          <Canvas 
            shadows
            camera={{ position: [0, 4, 15], fov: 70 }}
            style={{ width: '100%', height: '100%' }}
          >
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
        </div>
      </section>

      {/* Contact Section */}
      <section id='contact'
        ref={contactRef}
        style={{
          height: '100vh',
          scrollSnapAlign: 'start',
          background: 'black',
          zIndex: 1000
        }}
      >
        <div
          style={{
            height: '50vh',
          }}
        >
        <Canvas>
          <Suspense fallback={null}>
          <Contact />
          </Suspense>
        </Canvas>
        </div>
        <div
          style={{
            height: '50vh',
          }}
        >
          <ContactSection/>
        </div>
      </section>

    </div>
     )}
    </>
  )
}


function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    const form = document.createElement('form');
    form.action = 'https://formspree.io/f/xayrjzqg';
    form.method = 'POST';
    
    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit();
  };

  const socialLinks = [
    { href: "mailto:itzmehanth@gmail.com", icon: Mail, label: "Email" },
    { href: "https://linkedin.com/in/mehanth-776892279", icon: Linkedin, label: "LinkedIn" },
    { href: "https://github.com/itz-mehanth", icon: Github, label: "GitHub" },
    { href: "https://instagram.com/itz_mehanth", icon: Instagram, label: "Instagram" }
  ];

  return (
    <>
      {/* Premium Typography */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;600;700&display=swap" 
        rel="stylesheet" 
      />
      
      <section style={{
        padding: '3rem 2rem',
        backgroundColor: '#fafafa',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div className="contact-container">
          
          {/* Left Column */}
          <div className="contact-left">
            <h2>Get in touch</h2>
            <p>Let's discuss your next project</p>

            <div className="social-links">
              {socialLinks.map(({ href, icon: IconComponent, label }, index) => (
                <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="social-icon">
                  <IconComponent size={20} color="#fff" />
                </a>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="contact-right">
            <form onSubmit={handleSubmit}>
              <input type="text" name="name" placeholder="Full name" required onChange={handleInputChange} />
              <input type="email" name="email" placeholder="Email address" required onChange={handleInputChange} />
              <textarea name="message" placeholder="Your message" rows={3} required onChange={handleInputChange}></textarea>
              <button type="submit">Send Message</button>
            </form>
          </div>
        </div>

        {/* ✅ Responsive styles */}
        <style>{`
          .contact-container {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 3rem;
            max-width: 900px;
            width: 100%;
          }

          .contact-left,
          .contact-right {
            flex: 1 1 400px;
          }

          h2 {
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            font-weight: 400;
            margin-bottom: 1rem;
            color: #1a1a1a;
          }

          p {
            font-family: 'Inter', sans-serif;
            font-size: 16px;
            color: #666;
            margin-bottom: 2rem;
          }

          .social-links {
            display: flex;
            gap: 1rem;
          }

          .social-icon {
            width: 44px;
            height: 44px;
            background-color: #1a1a1a;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }

          .social-icon:hover {
            background-color: #333;
            transform: translateY(-2px);
          }

          form {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          input, textarea {
            padding: 1rem 0;
            border: none;
            border-bottom: 1px solid #e0e0e0;
            background: transparent;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
            color: #1a1a1a;
            outline: none;
          }

          button {
            padding: 1rem;
            background-color: #1a1a1a;
            color: #fff;
            border: none;
            cursor: pointer;
            font-size: 14px;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            transition: all 0.3s ease;
          }

          @media (max-width: 768px) {
            .contact-container {
              flex-direction: column;
              align-items: center;
            }

            .contact-left,
            .contact-right {
              flex: 1 1 100%;
              width: 100%;
              text-align: center;
            }

            .social-links {
              justify-content: center;
            }

            form {
              align-items: center;
            }

            input, textarea, button {
              width: 100%;
            }
          }
        `}</style>
      </section>
    </>
  );
}