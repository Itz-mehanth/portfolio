// src/App.jsx
import { Canvas } from '@react-three/fiber'
import {
  ScrollControls,
  Scroll,
  Html,
  PerspectiveCamera,
  Hud,
  AdaptiveDpr,
  AdaptiveEvents,
  BakeShadows,
  Preload
} from '@react-three/drei'
import Airplane from './Airplane'
import { Suspense, useRef, useEffect, useState, memo } from 'react'
import './App.css'
import Projects from './Projects'
import Contact from './Contact'
import IntroSection from './IntroSection'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import './Navbar.css'
import { useAudio } from './context/AudioProvider'
// Razorpay script loader
function loadRazorpayScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
import SplashLoader from './SplashLoader'
import Skills from './Skills'
import { Mail, Linkedin, Github, Instagram } from 'lucide-react';
import Certificates from './Certificates'
import Cursor from "./Cursor";
import { Joystick } from 'react-joystick-component';


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
        <li><a href="#certificate" style={{ color: fontBlack ? 'black' : 'white' }}>Certificate</a></li>
        <li><a href="#contact" style={{ color: fontBlack ? 'black' : 'white' }}>Contact</a></li>
        <li><button onClick={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            }
          }
        }} style={{
          background: 'none',
          border: 'none',
          color: fontBlack ? 'black' : 'white',
          cursor: 'pointer',
          font: 'inherit',
          textDecoration: 'underline'
        }}>Fullscreen</button></li>
      </ul>

      {/* Hamburger icon */}
      <div className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div style={{ backgroundColor: fontBlack ? 'black' : 'white' }} />
        <div style={{ backgroundColor: fontBlack ? 'black' : 'white' }} />
        <div style={{ backgroundColor: fontBlack ? 'black' : 'white' }} />
      </div>

      {/* Mobile menu overlay */}
      <div style={{ backgroundColor: fontBlack ? 'black' : 'white' }} className={`mobile-menu ${menuOpen ? 'show' : ''}`}>
        <a style={{ color: fontBlack ? 'white' : 'black' }} href="#lander" onClick={toggleMenu}>Lander</a>
        <a style={{ color: fontBlack ? 'white' : 'black' }} href="#skills" onClick={toggleMenu}>Skills</a>
        <a style={{ color: fontBlack ? 'white' : 'black' }} href="#certificate" onClick={toggleMenu}>Certificate</a>
        <a style={{ color: fontBlack ? 'white' : 'black' }} href="#contact" onClick={toggleMenu}>Contact</a>
      </div>
    </nav>
  );
};


export default function App() {
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.8 })
  const [contactRef, contactinView] = useInView({ triggerOnce: false, threshold: 0.8 })
  const [certificateRef, certificateinView] = useInView({ triggerOnce: false, threshold: 0.8 })
  const [introRef, introinView] = useInView({ triggerOnce: false, threshold: 0.8 })

  // Performance optimization refs
  const [projectCanvasRef, projectCanvasInView] = useInView({ threshold: 0 })
  const [contactCanvasRef, contactCanvasInView] = useInView({ threshold: 0 })

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
  const [isCanvasScrollLocked, setIsCanvasScrollLocked] = useState(false);
  const joystickDataRef = useRef({ x: 0, y: 0 });
  const verticalControlRef = useRef(0); // Add this ref
  const [isMobile, setIsMobile] = useState(false);
  /* Game State */
  const scoreValueRef = useRef(0);
  const scoreElement = useRef(null);
  const [highScore, setHighScore] = useState({ score: 0, name: 'None' });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Fetch High Score
    fetch('/api/highscore')
      .then(res => res.json())
      .then(data => setHighScore(data))
      .catch(err => console.error("Failed to fetch high score:", err));
  }, []);

  const handleScoreSubmit = () => {
    const currentScore = scoreValueRef.current;
    // Safe access
    const safeHighScore = highScore && highScore.score !== undefined ? highScore.score : 0;
    const safeHighName = highScore && highScore.name ? highScore.name : 'None';

    if (currentScore > safeHighScore) {
      const name = prompt(`New High Score! (Current Best: ${safeHighScore} by ${safeHighName})\nEnter your name:`);
      if (name) {
        fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, score: currentScore })
        })
          .then(res => res.json())
          .then(data => {
            alert("Score Saved!");
            setHighScore({ name, score: currentScore });
          })
          .catch(err => console.error("Error saving score:", err));
      }
    } else {
      alert(`Good run! But the high score is ${safeHighScore} by ${safeHighName}. Keep trying!`);
    }
  };

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

  useEffect(() => {
    if (inView) {
      document.body.style.overflow = "hidden";   // stop page scrolling
    } else {
      document.body.style.overflow = "auto";     // restore normal page scroll
    }
  }, [inView]);


  // Razorpay fun payment before CV download
  const handleDownloadCV = async () => {
    // Load Razorpay script if not already loaded
    const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      alert('Razorpay SDK failed to load. Please check your connection.');
      return;
    }

    // Create Razorpay order options (for fun, not real)
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_1234567890abcdef', // Dummy key, not real
      amount: 20000000, // 2 million rupees in paise
      currency: 'INR',
      name: 'Mehanth Portfolio',
      description: 'Download CV',
      image: '/logo.jpg',
      handler: function (response) {
        // After payment, allow download
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = 'https://drive.google.com/file/d/1YDWTQODu8_bxtFBOBagk-zH6UWAE9Ds4/view?usp=sharing';
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 500);
      },
      prefill: {
        name: 'Mehanth',
        email: 'mehanth362@gmail.com',
      },
      theme: {
        color: '#FEC601',
      },
      modal: {
        ondismiss: function () {
          alert('Payment required to download CV!');
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return (
    <div
      style={{
        overflowY: 'scroll',
        height: '100vh',
        scrollBehavior: 'auto',
        position: 'relative',
        scrollSnapType: 'none',
        zIndex: 0
      }}
    >
      <Cursor />
      {loading && <SplashLoader setLoading={setLoading} />}
      {!loading && (
        <div
          style={{
            overflowX: 'hidden',
            scrollBehavior: 'smooth',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
            justifyContent: 'normal'
          }}>
          {/* <CustomCursor /> */}
          <Navbar fontBlack={fontBlack} />
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
              overflowX: 'hidden',
              scrollBehavior: 'smooth',
            }}
            ref={introRef}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '90%',
              margin: '0 auto',
            }}>
              <div style={{ width: '70%' }}>
                <p className='Quicksand' style={{ margin: '30px 0 0 0px', fontSize: '16px', textAlign: 'left', color: 'grey' }}>Hi, I'm</p>
                <p className='Silkscreen' style={{ margin: '5px 0px', fontSize: '50px', textAlign: 'left', color: 'black' }}>Mehanth</p>
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
                <p className='Quicksand' style={{ margin: '5px 0px', fontSize: '24px', textAlign: 'left' }}>a Computer Science Engineering student </p>
                <p className='Quicksand' style={{ margin: '5px 0px', fontSize: '16px', textAlign: 'left', color: 'grey' }}>with a passion for creating wonders through code, creativity, and innovation. From intelligent systems to immersive experiences, I love bringing bold ideas to life.</p>
              </div>

              {/* Right: Image */}
              <div style={{ flex: 1, textAlign: 'center' }}>
                <img
                  src='/logo.jpg' // Replace with actual image path
                  alt='Mehanth'
                  style={{
                    width: '100%',
                    maxWidth: '200px',
                    borderRadius: '15px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                  }}
                />
              </div>
            </div>
            <IntroSection />
          </section>

          <section id='skills'
            style={{
              height: '100vh',
              padding: '60px 0px 6px 0',
              width: '100vw',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              background: 'white',
              overflowX: 'hidden',
              zIndex: 1, // Changed from -1 to 1 to bring it forward
              position: 'relative', // Ensure proper stacking
            }}
          >
            <h1 style={{ fontSize: '80px', fontWeight: '500' }} className='Barrio'>Skill Town</h1>
            <Skills />
          </section>


          {/* 3D Section */}
          {/* 3D Section */}
          <section

            id="projects"
            className="canvas-text-section hide-scrollbar"
            style={{
              margin: "20px", // Added margin back for container
              borderRadius: "30px", // Added border radius back
              position: "relative",
              display: "flex",
              height: "100vh", // Back to original height
              flexDirection: "column-reverse",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px", // Added padding back for container
              gap: "30px", // Added gap back
              width: "calc(100vw - 40px)", // Full width minus margins
            }}
            ref={ref}
          >
            {/* TV Screen Container */}
            <div
              className="hide-scrollbar canvas-wrapper"
              style={{
                flex: 3, // Back to 3 for larger canvas proportion
                backgroundColor: "#1a1a1a", // Dark TV bezel color
                borderRadius: "15px", // TV-like rounded corners
                height: "calc(85vh - 40px)", // Back to original height
                width: "100%", // Full width of container
                maxWidth: "100%", // Ensure it fits container
                boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1)", // TV-like shadow with inner highlight
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden", // Prevent any overflow issues
                position: "relative",
                padding: "15px", // TV bezel padding
                border: "3px solid #333", // TV bezel border
              }}
            >
              {/* TV Screen */}
              <div
                ref={projectCanvasRef}
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#5cabff",
                  borderRadius: "8px", // Inner screen radius
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)", // Inner screen shadow
                }}
              >
                {/* TV Stand */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "-25px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "60%",
                    height: "25px",
                    backgroundColor: "#2a2a2a",
                    borderRadius: "0 0 10px 10px",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
                  }}
                />
                {/* TV Stand Base */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "-35px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "80%",
                    height: "10px",
                    backgroundColor: "#1a1a1a",
                    borderRadius: "5px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '25px',
                  zIndex: 10,
                  fontFamily: "'Share Tech Mono', monospace",
                  color: '#fbbf24', // Gold color
                  textShadow: '0 0 5px #fbbf24',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  padding: '5px 15px',
                  borderRadius: '20px',
                  border: '2px solid #fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '24px' }}>🪙</div>
                  <div ref={scoreElement} style={{ fontSize: '20px', fontWeight: 'bold' }}>0</div>
                  <button
                    onClick={handleScoreSubmit}
                    style={{
                      marginLeft: '10px',
                      background: 'transparent',
                      border: '1px solid #fbbf24',
                      color: '#fbbf24',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      padding: '2px 8px',
                      fontSize: '12px'
                    }}
                  >
                    SAVE
                  </button>
                  {/* High Score Display */}
                  <div style={{ marginLeft: '15px', borderLeft: '1px solid #fbbf24', paddingLeft: '15px', fontSize: '14px', color: '#fbbf24', whiteSpace: 'nowrap' }}>
                    Best: {highScore?.score || 0} ({highScore?.name || 'None'})
                  </div>
                </div>

                <Canvas
                  frameloop={projectCanvasInView ? 'always' : 'never'}
                  dpr={[1, 2]}
                  camera={{ position: [0, 4, 15], fov: 100 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    display: 'block' // Ensure proper display
                  }}
                  gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: "high-performance"
                  }}
                >
                  <AdaptiveDpr pixelated />
                  <AdaptiveEvents />
                  <ambientLight intensity={5} />
                  <Suspense fallback={null}>
                    <Hud>
                      <Html center>
                        <div
                          style={{
                            display: showIframe ? 'flex' : 'none',
                            width: '350px',
                            height: '650px',
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
                    <PerspectiveCamera makeDefault position={[0, 4, 15]} fov={100} />
                    <ScrollControls
                      maxSpeed={0.05}
                      distance={6}
                      pages={1} // Increase pages for more scroll distance
                      damping={0.8}
                      enabled={scrollEnabled}
                      infinite={true}
                      horizontal={false}
                    >
                      <Scroll>

                        <Airplane
                          contactPage={contactPage}
                          setContactPage={setContactPage}
                          setIsCanvasScrollLocked={setIsCanvasScrollLocked}
                          setTeleported={setTeleported}
                          setStartShockwave={setStartShockwave}
                          scrollEnabled={scrollEnabled}
                          ref={avatarRef}
                          scale={7.5}
                          position={[0, 0, 0]}
                          rotation={[0, Math.PI, 0]}
                          static={false}
                          isMobile={isMobile}
                          joystickDataRef={joystickDataRef}
                          verticalControlRef={verticalControlRef}
                        />

                        {!contactPage ? (
                          <Projects
                            openIframe={openIframe}
                            contactPage={contactPage}
                            avatarRef={avatarRef}
                            scoreElement={scoreElement}
                            scoreValueRef={scoreValueRef}
                          />
                        ) : null}


                      </Scroll>
                    </ScrollControls>
                    <Preload all />
                  </Suspense>
                </Canvas>
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  zIndex: 9999
                }}>
                  <Joystick
                    size={80}
                    sticky={false}
                    baseColor="rgba(255, 255, 255, 0.2)"
                    stickColor="rgba(255, 255, 255, 0.5)"
                    move={(e) => {
                      joystickDataRef.current = { x: e.x / 2, y: e.y / 2 }
                    }}
                    stop={() => {
                      joystickDataRef.current = { x: 0, y: 0 }
                    }}
                  />
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '40px',
                  right: '20px',
                  zIndex: 9999,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}>
                  <button
                    onPointerDown={() => { verticalControlRef.current = 1 }}
                    onPointerUp={() => { verticalControlRef.current = 0 }}
                    onPointerLeave={() => { verticalControlRef.current = 0 }}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                      color: 'white',
                      fontSize: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none'
                    }}
                  >
                    ↑
                  </button>
                  <button
                    onPointerDown={() => { verticalControlRef.current = -1 }}
                    onPointerUp={() => { verticalControlRef.current = 0 }}
                    onPointerLeave={() => { verticalControlRef.current = 0 }}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                      color: 'white',
                      fontSize: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none'
                    }}
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section
            ref={certificateRef}
            id='certificate'
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
              height: '100%',
              padding: '80px 40px',
              scrollBehavior: 'smooth',
            }}
          >
            <Certificates />
          </section>

          {/* Contact Section */}
          <section id='contact'
            ref={contactRef}
            style={{
              height: '100vh',
              width: '100vw', // Full viewport width
              overflowX: 'hidden',
              scrollBehavior: 'smooth',
              background: 'black',
              zIndex: 1000,
            }}
          >

            <div
              style={{
                height: '50%',
                width: '100%', // Full width
                backgroundColor: 'white',
              }}
            >
              <ContactSection />
            </div>
          </section>

        </div >
      )
      }

    </div >
  )
}

const MemoizedProjects = memo(Projects);
const MemoizedContact = memo(Contact);


function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('');

    // IMPORTANT: Replace this with your actual Google Apps Script deployment URL
    // It should look like: https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzdWxMgLRjgkewx0pxxqcwu0swJ4TxEE6htZdW-Yagjo5vDb_sKHNs7YmSLD-2gA39R/exec';

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          timestamp: new Date().toISOString(),
          source: 'Portfolio Website'
        })
      });

      // With no-cors, we can't read the response, so we assume success
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setErrors({});

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('');
      }, 5000);

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { href: "mailto:mehanth362@gmail.com", icon: Mail, label: "Email", color: "#EA4335" },
    { href: "https://linkedin.com/in/mehanth-776892279", icon: Linkedin, label: "LinkedIn", color: "#0077B5" },
    { href: "https://github.com/itz-mehanth", icon: Github, label: "GitHub", color: "#333" },
    { href: "https://instagram.com/itz_mehanth", icon: Instagram, label: "Instagram", color: "#E4405F" }
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <section className="contact-section">
        <div className="contact-container">

          {/* Main Content */}
          <div className="contact-content">
            {/* Contact Form */}
            <div className="contact-form-container">
              <form className="contact-form" onSubmit={handleSubmit}>
                {submitStatus === 'success' && (
                  <div style={{
                    background: '#d4edda',
                    border: '1px solid #c3e6cb',
                    color: '#155724',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    ✅ Message sent successfully! I'll get back to you soon.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div style={{
                    background: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    color: '#721c24',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    ❌ Error sending message. Please try again.
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    style={{
                      borderColor: errors.name ? '#dc3545' : undefined
                    }}
                  />
                  {errors.name && (
                    <span style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your.email@example.com"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    style={{
                      borderColor: errors.email ? '#dc3545' : undefined
                    }}
                  />
                  {errors.email && (
                    <span style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="message">Project Details</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tell me about your project, timeline, and any specific requirements..."
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    style={{
                      borderColor: errors.message ? '#dc3545' : undefined
                    }}
                  />
                  {errors.message && (
                    <span style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                  style={{
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  {!isSubmitting && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info & Social */}
            <div className="contact-info">
              <div className="contact-details">
                <h3>Get in Touch</h3>
                <div className="contact-item">
                  <Mail size={20} />
                  <span>mehanth362@gmail.com</span>
                </div>
                <div className="contact-item">
                  <Linkedin size={20} />
                  <span>LinkedIn Profile</span>
                </div>
              </div>

              <div className="social-section">
                <h4>Follow Me</h4>
                <div className="social-links">
                  {socialLinks.map(({ href, icon: IconComponent, label, color }, index) => (
                    <a
                      key={index}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      style={{ '--brand-color': color }}
                    >
                      <IconComponent size={20} />
                      <span>{label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx="true">{`
          .contact-section {
            padding: 4rem 2rem;
            background: #fafafa;
            min-height: 100vh;
            display: flex;
            align-items: center;
            position: relative;
          }

          .contact-container {
            max-width: 1200px;
            width: 100%;
            margin: 0 auto;
            position: relative;
            z-index: 1;
          }

          .contact-header {
            text-align: center;
            margin-bottom: 3rem;
            color: #1a1a1a;
          }

          .contact-header h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #1a1a1a;
          }

          .contact-header p {
            font-family: 'Inter', sans-serif;
            font-size: 1.2rem;
            color: #666;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
          }

          .contact-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 3rem;
            align-items: start;
          }

          .contact-form-container {
            background: white;
            border-radius: 20px;
            padding: 2.5rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
          }

          .contact-form {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-group label {
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            color: #374151;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .form-group input,
          .form-group textarea {
            padding: 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-family: 'Inter', sans-serif;
            font-size: 1rem;
            color: #374151;
            background: white;
            transition: all 0.3s ease;
            outline: none;
          }

          .form-group input:focus,
          .form-group textarea:focus {
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
            transform: translateY(-2px);
          }

          .form-group textarea {
            resize: vertical;
            min-height: 120px;
          }

          .submit-btn {
            background: #4f46e5;
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
            margin-top: 1rem;
          }

          .submit-btn:hover {
            background: #4338ca;
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
          }

          .contact-info {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .contact-details {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
          }

          .contact-details h3 {
            font-family: 'Poppins', sans-serif;
            font-size: 1.5rem;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 1.5rem;
          }

          .contact-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            color: #374151;
            margin-bottom: 1rem;
            font-family: 'Inter', sans-serif;
          }

          .social-section h4 {
            font-family: 'Poppins', sans-serif;
            font-size: 1.2rem;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 1rem;
          }

          .social-links {
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
          }

          .social-link {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.8rem 1rem;
            background: white;
            border-radius: 12px;
            color: #374151;
            text-decoration: none;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            transition: all 0.3s ease;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }

          .social-link:hover {
            background: var(--brand-color);
            color: white;
            transform: translateX(5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          }

          @media (max-width: 768px) {
            .contact-section {
              padding: 2rem 1rem;
            }

            .contact-header h2 {
              font-size: 2.2rem;
            }

            .contact-header p {
              font-size: 1rem;
            }

            .contact-content {
              grid-template-columns: 1fr;
              gap: 2rem;
            }

            .contact-form-container {
              padding: 1.5rem;
            }

            .contact-details,
            .social-section {
              padding: 1.5rem;
            }

            .social-links {
              flex-direction: row;
              flex-wrap: wrap;
            }

            .social-link {
              flex: 1;
              min-width: 120px;
              justify-content: center;
            }
          }

          @media (max-width: 480px) {
            .contact-header h2 {
              font-size: 1.8rem;
            }

            .contact-form-container {
              padding: 1rem;
            }

            .contact-details,
            .social-section {
              padding: 1rem;
            }

            .social-links {
              flex-direction: column;
            }

            .social-link {
              min-width: auto;
            }
          }
        `}</style>
      </section>
    </>
  );
}