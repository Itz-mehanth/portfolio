import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, ChevronRight, ChevronLeft, MousePointer2, Send } from 'lucide-react';

const TOUR_STEPS = [
  {
    section: 0,
    title: "Welcome!",
    message: "Hey! I'm your portfolio assistant. Let me show you around Mehanth's world. Ready to explore?",
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    pointer: null,
  },
  {
    section: 0,
    title: "The Hero",
    message: "This is the landing page. Mehanth is a CS student at SSN who builds 3D web experiences. Check out the interactive physics scene below!",
    position: { top: '20%', left: '10%' },
    pointer: { top: '60%', left: '50%' },
    pointerLabel: "Interactive 3D below",
  },
  {
    section: 0,
    title: "Download CV",
    message: "Want the resume? Hit the Download CV button right here.",
    position: { top: '35%', left: '10%' },
    pointer: { top: '42%', left: '15%' },
    pointerLabel: "Click here",
  },
  {
    section: 1,
    title: "Skill Town",
    message: "This is a miniature 3D city! Each building cluster represents a tech domain. Click any house to see skills in that area.",
    position: { bottom: '20%', left: '10%' },
    pointer: { top: '40%', left: '50%' },
    pointerLabel: "Click a building",
  },
  {
    section: 1,
    title: "Drive Mode",
    message: "See that Drive Mode button? You can actually drive the car around the town using keyboard (WASD) or joystick on mobile!",
    position: { top: '20%', left: '10%' },
    pointer: { top: '8%', right: '5%' },
    pointerLabel: "Try it!",
  },
  {
    section: 2,
    title: "Project Orbit",
    message: "Welcome to the flight zone! You're piloting a paper airplane through a sky of projects. Use WASD to fly around.",
    position: { top: '20%', left: '10%' },
    pointer: { top: '50%', left: '50%' },
    pointerLabel: "Fly with WASD",
  },
  {
    section: 2,
    title: "Live Preview",
    message: "See the project cards floating around? Click 'Visit Live Site' on any of them to preview the site in a realistic device mockup!",
    position: { bottom: '30%', left: '5%' },
    pointer: { top: '45%', left: '60%' },
    pointerLabel: "Click Live Site",
  },
  {
    section: 3,
    title: "Achievements",
    message: "Hackathon wins and certifications live here. Click any hackathon card to expand the story behind it!",
    position: { top: '15%', left: '10%' },
    pointer: { top: '45%', left: '30%' },
    pointerLabel: "Click to expand",
  },
  {
    section: 4,
    title: "Let's Connect",
    message: "Reach out! Fill the contact form or hit up the social links. Thanks for the tour!",
    position: { top: '20%', left: '10%' },
    pointer: { top: '50%', left: '40%' },
    pointerLabel: "Say hello",
  },
];

export default function TourGuide({ activeScreenIndex, onNavigate }) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  const currentStep = TOUR_STEPS[step];

  useEffect(() => {
    if (active && currentStep && currentStep.section !== activeScreenIndex) {
      const sectionIds = ['lander', 'skills', 'projects', 'certificate', 'contact'];
      onNavigate(sectionIds[currentStep.section]);
    }
  }, [step, active]);

  const next = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) setStep(step + 1);
    else { setActive(false); setStep(0); }
  }, [step]);

  const prev = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  const stop = useCallback(() => {
    setActive(false);
    setStep(0);
  }, []);

  return (
    <>
      {/* ChatGPT-style help button */}
      {!active && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setActive(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 9999,
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#10a37f',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(16,163,127,0.4)',
          }}
        >
          <MessageCircle size={20} color="white" />
        </motion.button>
      )}

      <AnimatePresence>
        {active && currentStep && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, zIndex: 9990,
                background: 'rgba(0,0,0,0.25)',
                pointerEvents: 'none',
              }}
            />

            {/* Pointer */}
            {currentStep.pointer && (
              <motion.div
                key={`pointer-${step}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                style={{
                  position: 'fixed',
                  ...currentStep.pointer,
                  zIndex: 9993,
                  pointerEvents: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <MousePointer2 size={24} color="#10a37f" fill="#10a37f" style={{ filter: 'drop-shadow(0 2px 8px rgba(16,163,127,0.5))' }} />
                </motion.div>
                {currentStep.pointerLabel && (
                  <span style={{
                    background: '#10a37f',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 600,
                    fontFamily: "'Poppins', sans-serif",
                    whiteSpace: 'nowrap',
                  }}>
                    {currentStep.pointerLabel}
                  </span>
                )}
              </motion.div>
            )}

            {/* ChatGPT-style card */}
            <motion.div
              key={`tooltip-${step}`}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: 'spring', damping: 22, stiffness: 200 }}
              style={{
                position: 'fixed',
                ...currentStep.position,
                zIndex: 9995,
                maxWidth: '360px',
                width: '90vw',
                background: '#ffffff',
                borderRadius: '16px',
                padding: '0',
                border: '1px solid #e5e5e5',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                pointerEvents: 'auto',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderBottom: '1px solid #f0f0f0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: '#10a37f',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <MessageCircle size={14} color="white" />
                  </div>
                  <div>
                    <span style={{
                      color: '#1a1a1a', fontSize: '13px', fontWeight: 700,
                      fontFamily: "'Poppins', sans-serif", display: 'block',
                    }}>
                      {currentStep.title}
                    </span>
                    <span style={{
                      color: '#10a37f', fontSize: '9px', fontWeight: 600,
                      fontFamily: "'Poppins', sans-serif", letterSpacing: '0.3px',
                    }}>
                      Portfolio Guide
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ background: '#f5f5f5' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={stop}
                  style={{
                    background: 'transparent', border: 'none', borderRadius: '8px',
                    padding: '6px', cursor: 'pointer', display: 'flex',
                  }}
                >
                  <X size={16} color="#999" />
                </motion.button>
              </div>

              {/* Message body */}
              <div style={{ padding: '16px' }}>
                <p style={{
                  color: '#374151', fontSize: '13px', lineHeight: 1.7,
                  margin: 0, fontFamily: "'Quicksand', sans-serif",
                }}>
                  {currentStep.message}
                </p>
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', background: '#fafafa', borderTop: '1px solid #f0f0f0',
              }}>
                {/* Step dots */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {TOUR_STEPS.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: i === step ? '14px' : '5px',
                        height: '5px',
                        borderRadius: '3px',
                        background: i === step ? '#10a37f' : i < step ? '#10a37f50' : '#e0e0e0',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {step > 0 && (
                    <motion.button
                      whileHover={{ background: '#ebebeb' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={prev}
                      style={{
                        padding: '7px 12px', borderRadius: '8px',
                        background: '#f0f0f0', border: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px',
                        color: '#555', fontSize: '11px', fontWeight: 600,
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      <ChevronLeft size={12} /> Back
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ background: '#0d8c6d' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={next}
                    style={{
                      padding: '7px 14px', borderRadius: '8px',
                      background: '#10a37f', border: 'none',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      color: 'white', fontSize: '11px', fontWeight: 600,
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {step < TOUR_STEPS.length - 1 ? (
                      <>Next <ChevronRight size={12} /></>
                    ) : (
                      <>Done <Send size={11} /></>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
