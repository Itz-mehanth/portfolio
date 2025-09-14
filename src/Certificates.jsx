import { Award, ExternalLink } from 'lucide-react';

import { useState } from 'react';
import ARCertificates from './ARCertificates';
import { ARButton, createXRStore } from '@react-three/xr';

// Create a single XR store instance for the whole app
const xrStore = createXRStore();

const Certificates = () => {
  const [arActive, setARActive] = useState(false);

  
  const certificates = [
    {
      title: "Top 1% NPTEL C++",
      issuer: "NPTEL",
      score: "92%",
      date: "2024",
      category: "Programming",
      color: "linear-gradient(135deg, #60a5fa, #2563eb)",
      certificateUrl: "https://drive.google.com/file/d/1Dc06pz6NxOhE7vkxdaQvb31Cw6UYX-sh/view?usp=sharing"
    },
    {
      title: "Top 5% NPTEL Competitive Programming",
      issuer: "NPTEL",
      score: "85%",
      date: "2024",
      category: "Programming",
      color: "linear-gradient(135deg, #4ade80, #16a34a)",
      certificateUrl: "https://drive.google.com/file/d/1jfdlSOyMnJAaJryDomnqpMPpksZzx7QV/view?usp=sharing"
    },
    {
      title: "UI/UX Design Figma Certification",
      issuer: "Cybernaut",
      score: "Certified",
      date: "2024",
      category: "Design",
      color: "linear-gradient(135deg, #a78bfa, #7c3aed)",
      certificateUrl: "https://drive.google.com/file/d/1lSmxFqJepnsuDZl7FMHyx74-gEsETpmw/view?usp=sharing"
    }
  ];

  const handleCertificateClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };


  const handleARClick = async () => {
      setARActive(!arActive);
      try {
        // Check if WebXR is supported
        if (!navigator.xr) {
          alert('WebXR not supported in this browser. Try Chrome on Android or Safari on iOS.');
          return;
        }
        
        // Check if AR is supported
        const isARSupported = await navigator.xr.isSessionSupported('immersive-ar');
        if (!isARSupported) {
          alert('AR not supported on this device. Please use a device with AR capabilities.');
          return;
        }
        
        console.log('AR is supported, attempting to start session...');
      } catch (error) {
        console.error('Error checking AR support:', error);
        alert('Error starting AR session. Please check console for details.');
      }
    };

  return (
    <>
        {/* <ARButton 
          store={xrStore} 
          sessionInit={{ 
            requiredFeatures: ['hit-test'],
            optionalFeatures: ['dom-overlay'],
            domOverlay: { root: document.body }
          }}
          onClick={handleARClick}
          style={{ 
            zIndex: 1000,
            padding: '12px 24px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Start AR Session
        </ARButton> */}
      {!arActive && (
        <>
          <div>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
              <Award style={{ fontSize: '1.5rem', color: '#d97706' }} />
              <h2 style={{ 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                color: '#1f2937',
                margin: 0
              }}>
                Certifications
              </h2>
            </div>
            {/* Certificates List */}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              alignItems: 'flex-start',
              width: '100%',
              height: '100%',
              maxWidth: '500px'
            }}>
              {certificates.map((cert, index) => (
                <div 
                  key={index} 
                  style={{ 
                    position: 'relative',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    const hoverBg = e.currentTarget.querySelector('.hover-bg');
                    if (hoverBg) {
                      hoverBg.style.opacity = '1';
                    }
                    const card = e.currentTarget.querySelector('.card');
                    if (card) {
                      card.style.transform = 'translateY(-4px)';
                      card.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const hoverBg = e.currentTarget.querySelector('.hover-bg');
                    if (hoverBg) {
                      hoverBg.style.opacity = '0';
                    }
                    const card = e.currentTarget.querySelector('.card');
                    if (card) {
                      card.style.transform = 'translateY(0)';
                      card.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                    }
                  }}
                >
                  <div 
                    className="hover-bg"
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      right: '0',
                      bottom: '0',
                      background: cert.color,
                      opacity: '0',
                      transition: 'opacity 300ms ease-in-out',
                      borderRadius: '1rem',
                      filter: 'blur(8px)',
                      zIndex: '-1'
                    }}
                  />
                  <div 
                    className="card"
                    style={{
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(16px)',
                      borderRadius: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      padding: '1rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      transition: 'all 300ms ease-in-out',
                      width: '100%'
                    }}
                  >
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      color: 'white',
                      background: cert.color,
                      marginBottom: '1rem'
                    }}>
                      {cert.category}
                    </div>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginBottom: '0.5rem',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {cert.title}
                    </h3>
                    <p style={{
                      color: '#4b5563',
                      marginBottom: '0.75rem',
                      margin: '0 0 0.75rem 0'
                    }}>
                      by {cert.issuer}
                    </p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <span style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#16a34a'
                      }}>
                        {cert.score}
                      </span>
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#6b7280'
                      }}>
                        {cert.date}
                      </span>
                    </div>
                    <div 
                      style={{
                        marginTop: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.875rem',
                        color: cert.certificateUrl ? '#2563eb' : '#9ca3af',
                        cursor: cert.certificateUrl ? 'pointer' : 'not-allowed',
                        transition: 'color 200ms ease-in-out',
                        opacity: cert.certificateUrl ? 1 : 0.6
                      }}
                      onClick={() => handleCertificateClick(cert.certificateUrl)}
                      onMouseEnter={(e) => {
                        if (cert.certificateUrl) {
                          e.currentTarget.style.color = '#1d4ed8';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (cert.certificateUrl) {
                          e.currentTarget.style.color = '#2563eb';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }
                      }}
                    >
                      <ExternalLink style={{ 
                        width: '1rem', 
                        height: '1rem', 
                        marginRight: '0.25rem' 
                      }} />
                      {cert.certificateUrl ? 'View Certificate' : 'Certificate Pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {/* <div
        
      > 
        <ARCertificates arActive ={arActive} xrStore={xrStore}/>      
      </div> */}
    </>
  );
};

export default Certificates;