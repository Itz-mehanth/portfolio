import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import SkillTownWorld, {
  DISTRICT_ROAD_POINTS, DRIVE_COLLIDERS, SPAWN_POINT, groundAt, pathBetween,
} from './skilltown';
import Car from './utils/models/Car';
import { useInView } from 'react-intersection-observer';
import { Joystick } from 'react-joystick-component';
import { SKILLS_BY_DISTRICT, DISTRICT_NAMES as CITY_LABELS } from './data/skills';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Keys set the booleans; the joystick sets analog throttle/steer (null when idle).
const IDLE_KEYS = { forward: false, backward: false, left: false, right: false, brake: false, reset: false, throttle: null, steer: null };

export default function SciFiSkillCities({ lowPowerMode = false, header = null, touch = false }) {
  const [reducedMotion] = useState(prefersReducedMotion);
  const [selectedCity, setSelectedCity] = useState('languages'); // starting city
  const [currentCity, setCurrentCity] = useState('languages');
  const [path, setPath] = useState(null);
  const [driveMode, setDriveMode] = useState(false);
  // WebGL context-loss recovery
  const [glKey, setGlKey] = useState(0);
  const handleGlCreated = ({ gl }) => {
    gl.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      setTimeout(() => setGlKey((k) => k + 1), 450);
    });
  };
  const driveKeysRef = useRef({ ...IDLE_KEYS });
  const [ref, inView] = useInView({ threshold: 0 }); // Visibility check for 3D canvas

  // Keyboard controls for drive mode
  useEffect(() => {
    if (!driveMode) return;

    const keyMap = {
      KeyW: 'forward', ArrowUp: 'forward',
      KeyS: 'backward', ArrowDown: 'backward',
      KeyA: 'left', ArrowLeft: 'left',
      KeyD: 'right', ArrowRight: 'right',
      Space: 'brake', KeyR: 'reset',
    };

    const handleKeyDown = (e) => {
      const action = keyMap[e.code];
      if (!action) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      driveKeysRef.current[action] = true;
    };
    const handleKeyUp = (e) => {
      const action = keyMap[e.code];
      if (action && action !== 'reset') driveKeysRef.current[action] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      driveKeysRef.current = { ...IDLE_KEYS };
    };
  }, [driveMode]);

  const handleCityClick = (id) => {
    setSelectedCity(id);

    const pathToTarget = pathBetween(currentCity, id);
    setPath(pathToTarget);
  };



  return (
    <>
      <div
        ref={ref}
        className={`skills-stage${driveMode ? ' is-driving' : ''}`}
        data-gesture-zone
        style={{
          overflow: 'hidden',
          zIndex: 10,
          pointerEvents: 'auto',
          cursor: 'default'
        }}
      >
        <Canvas
          key={glKey}
          onCreated={handleGlCreated}
          // Layout size, not the transformed box: the screen arrives tilted and scaled.
          resize={{ offsetSize: true, scroll: false }}
          frameloop={inView ? 'always' : 'never'}
          dpr={lowPowerMode ? [0.75, 1] : [1, 1.6]}
          shadows={lowPowerMode ? false : 'soft'}
          gl={{ toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            pointerEvents: 'auto'
          }}
        >
          <Suspense fallback={null}>


            {/* The world: terrain, ocean, sky, town, signs, designed camera and light */}
            <SkillTownWorld
              selected={selectedCity}
              onSelect={handleCityClick}
              driveMode={driveMode}
              lowPowerMode={lowPowerMode}
              reducedMotion={reducedMotion}
            />

            {/* Car with camera */}
            <Suspense fallback={null}>
              <Car
                position={DISTRICT_ROAD_POINTS[currentCity].toArray()}
                path={driveMode ? null : path}
                driveMode={driveMode}
                keysRef={driveKeysRef}
                colliders={DRIVE_COLLIDERS}
                groundAt={groundAt}
                spawn={SPAWN_POINT}
                onReachEnd={() => setCurrentCity(selectedCity)}
              />
            </Suspense>

          </Suspense>
        </Canvas>

        {/* Drive Mode Toggle */}
        <button
          className="drive-toggle"
          onClick={() => setDriveMode(!driveMode)}
          style={{
            position: 'absolute',
            bottom: '110px',
            right: '56px',
            padding: '9px 16px',
            background: driveMode ? 'var(--paper)' : 'var(--ink)',
            color: driveMode ? 'var(--ink)' : 'var(--paper)',
            border: 'none',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            zIndex: 20,
            boxShadow: '0 6px 20px -6px rgba(18,17,23,0.35)',
            transition: 'background 0.2s ease',
          }}
        >
          {driveMode ? 'Exit drive mode' : 'Drive the car'}
        </button>

        {/* Drive controls: a key guide on desktop, an analog stick and brake on touch */}
        {driveMode && !touch && (
          <div className="drive-hint" aria-live="polite">
            <span><kbd>W</kbd><kbd>↑</kbd> drive</span>
            <span><kbd>S</kbd><kbd>↓</kbd> brake / reverse</span>
            <span><kbd>A</kbd><kbd>D</kbd> steer</span>
            <span><kbd>Space</kbd> handbrake</span>
            <span><kbd>R</kbd> reset</span>
          </div>
        )}
        {driveMode && touch && (
          <div className="drive-pad">
            <Joystick
              size={120}
              stickSize={56}
              baseColor="rgba(18,17,23,0.32)"
              stickColor="rgba(255,181,27,0.95)"
              throttle={16}
              move={(e) => {
                if (!e) return;
                driveKeysRef.current.throttle = e.y ?? 0;
                driveKeysRef.current.steer = -(e.x ?? 0);
              }}
              stop={() => {
                driveKeysRef.current.throttle = null;
                driveKeysRef.current.steer = null;
              }}
            />
            <button
              type="button"
              className="drive-brake"
              onPointerDown={() => { driveKeysRef.current.brake = true; }}
              onPointerUp={() => { driveKeysRef.current.brake = false; }}
              onPointerLeave={() => { driveKeysRef.current.brake = false; }}
            >
              Brake
            </button>
            <button type="button" className="drive-brake" onClick={() => { driveKeysRef.current.reset = true; }}>
              Reset
            </button>
          </div>
        )}

        {/* Paper fade + editorial column: header, then the selected district's skills */}
        <div className="skills-fade" aria-hidden="true" />
        <div className="skills-overlay">
          {header}
          {!driveMode && <SkillsGrid skillsByCity={SKILLS_BY_DISTRICT} selectedCity={selectedCity} />}
        </div>
      </div>
    </>
  );
}


const SkillsGrid = ({ skillsByCity, selectedCity }) => {
  const skills = skillsByCity[selectedCity] || [];

  return (
    <div className="skills-panel layer" style={{ '--d': 3 }}>
      <div className="skills-district">
        <span className="skills-district-pill" aria-live="polite">
          <i aria-hidden="true" />{CITY_LABELS[selectedCity] || 'Tech stack'}
        </span>
        <span className="skills-district-hint">Selected district</span>
      </div>
      <ul key={selectedCity} style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {skills.map((skill, i) => (
          <motion.li
            key={skill.name}
            title={skill.description}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.25 }}
            className="skill-chip"
          >
            {skill.name}
          </motion.li>
        ))}
      </ul>
    </div>
  );
};
