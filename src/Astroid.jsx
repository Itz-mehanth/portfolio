// Asteroid.jsx
import { useRef, useState, useMemo } from 'react';
import { Billboard, Text, RoundedBox, Image, Outlines } from '@react-three/drei';
import * as THREE from 'three';
import { Balloon } from './utils/models/Balloon';

export default function Asteroid({ position = [0, 0, 150], openIframe, iframeUrl, repoUrl, title, description, type = 'live', theme = 'platinum' }) {
  // Generate random rotation and color for balloon
  const balloonProps = useMemo(() => {
    // Thick, vibrant colors array
    const thickColors = [
      '#FFD700', // Yellow
      '#FF4444', // Red
      '#FF8C00', // Orange
      '#32CD32', // Green
      '#FF69B4', // Pink
      '#4169E1'  // Blue
    ];

    const randomColor = thickColors[Math.floor(Math.random() * thickColors.length)];

    return {
      rotation: [
        (Math.random() - 0.5) * 0.5, // Random X rotation
        Math.random() * Math.PI * 2,  // Random Y rotation (full 360°)
        (Math.random() - 0.5) * 0.3   // Random Z rotation
      ],
      balloonColor: new THREE.Color(randomColor)
    };
  }, []);

  const [hovered, setHovered] = useState({ live: false, repo: false });

  // Theme colors
  const themeColors = {
    diamond: '#67e8f9', // Cyan 300
    gold: '#fcd34d',    // Amber 300
    platinum: '#94a3b8' // Slate 400
  };

  const billboardColor = themeColors[theme] || themeColors.platinum;

  return (
    <group position={position}>
      {/* Balloon with random rotation and color */}
      <Balloon
        rotation={balloonProps.rotation}
        balloonColor={balloonProps.balloonColor}
        scale={0.7}
      />


      {/* Modern Glassmorphic Billboard UI */}
      <Billboard position={[position[0] < 0 ? -4 : 4, -3, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
        <group>
          {/* Main Card (Toon Style) */}
          <RoundedBox args={[6, 4, 0.1]} radius={0.2} smoothness={4}>
            <meshToonMaterial
              color={billboardColor}
              emissive={billboardColor}
              emissiveIntensity={theme === 'platinum' ? 0.2 : 12.5}
              toneMapped={theme === 'platinum'}
              transparent
              opacity={0.95}
              side={THREE.DoubleSide}
            />
            <Outlines thickness={0.05} color="black" />
          </RoundedBox>

          {/* Inner Content Container */}
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[5.8, 3.8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Border Outline Style */}
          <RoundedBox args={[6.05, 4.05, 0.08]} radius={0.2} smoothness={4}>
            <meshBasicMaterial color="black" wireframe={true} />
          </RoundedBox>

          {/* Title */}
          <Text
            position={[-2.6, 1.4, 0.1]}
            fontSize={0.5}
            color="#1a1a1a"
            anchorX="left"
            anchorY="top"
            fontWeight={800}
          >
            {title || 'Project Title'}
          </Text>

          {/* Divider Line */}
          <mesh position={[-0.05, 0.9, 0.1]}>
            <planeGeometry args={[5.2, 0.02]} />
            <meshBasicMaterial color="#333" transparent opacity={0.2} />
          </mesh>

          {/* Content Text */}
          <Text
            position={[-2.6, 0.6, 0.1]}
            fontSize={0.25}
            color="#333333"
            maxWidth={5.2}
            lineHeight={1.5}
            anchorX="left"
            anchorY="top"
            fontWeight={400}
          >
            {description || 'Project description goes here.'}
          </Text>

          {/* Action Buttons */}
          {(() => {
            const hasLive = !!iframeUrl;
            const hasRepo = !!repoUrl;

            // Helper to render a button
            const Button = ({ label, onClick, xPos, isRepo }) => {
              const isHovered = isRepo ? hovered.repo : hovered.live;
              return (
                <group
                  position={[xPos, -1.2, 0.15]}
                  onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(prev => ({ ...prev, [isRepo ? 'repo' : 'live']: true })); }}
                  onPointerOut={() => { document.body.style.cursor = 'default'; setHovered(prev => ({ ...prev, [isRepo ? 'repo' : 'live']: false })); }}
                  onClick={onClick}
                >
                  {/* Shadow/Outline Layer (Black) */}
                  <RoundedBox args={[2.55, 0.75, 0.01]} radius={0.35} position={[0.05, -0.05, -0.01]}>
                    <meshBasicMaterial color="black" />
                  </RoundedBox>

                  {/* Main Button Layer (Flat Color) */}
                  <RoundedBox args={[2.5, 0.7, 0.02]} radius={0.35} smoothness={4}>
                    <meshBasicMaterial
                      color={isHovered
                        ? (isRepo ? "#4b5563" : "#2563eb") // Darker on hover
                        : (isRepo ? "#374151" : "#3b82f6") // Repo: Gray, Live: Blue
                      }
                    />
                  </RoundedBox>
                  <Text
                    position={[0, 0, 0.06]}
                    fontSize={0.25}
                    fontWeight={700}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {label}
                  </Text>
                </group>
              );
            };

            if (hasLive && hasRepo) {
              return (
                <>
                  <Button
                    label="View Code"
                    onClick={() => window.open(repoUrl, '_blank')}
                    xPos={-1.4}
                    isRepo={true}
                  />
                  <Button
                    label={type === 'linkedin' ? 'View Post' : 'Visit Live Site'}
                    onClick={() => {
                      if (type === 'live') openIframe(iframeUrl);
                      else window.open(iframeUrl, '_blank');
                    }}
                    xPos={1.4}
                    isRepo={false}
                  />
                </>
              );
            } else if (hasLive) {
              return (
                <Button
                  label={type === 'github' ? 'View Code' : type === 'linkedin' ? 'View Post' : 'Visit Live Site'}
                  onClick={() => {
                    if (type === 'live') openIframe(iframeUrl);
                    else window.open(iframeUrl, '_blank');
                  }}
                  xPos={0}
                  isRepo={false}
                />
              );
            } else if (hasRepo) {
              return (
                <Button
                  label="View Code"
                  onClick={() => window.open(repoUrl, '_blank')}
                  xPos={0}
                  isRepo={true}
                />
              );
            }
            return null;
          })()}
        </group>
      </Billboard>

    </group>
  );
}