// Asteroid.jsx
import { useRef, useState, useMemo } from 'react';
import { Billboard, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Balloon } from './utils/models/Balloon';

export default function Asteroid({ position = [0, 0, 150], openIframe, iframeUrl, title, description, type='live' }) {
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

  return (
    <group position={position}>
      {/* Balloon with random rotation and color */}
      <Balloon 
        rotation={balloonProps.rotation}
        balloonColor={balloonProps.balloonColor}
      />

      {/* Sky-themed Billboard UI */}
      <Billboard position={[position[0] < 0 ? 2 : -2, 0, -5]}>
        <group>
          {/* Cloud-like background with soft rounded edges */}
          <RoundedBox args={[7, 6, 0.1]} radius={0.3} smoothness={4}>
            <meshStandardMaterial 
              color="#f0f8ff" 
              transparent 
              opacity={0.95}
              side={THREE.DoubleSide}
            />
          </RoundedBox>

          {/* Decorative cloud border */}
          <RoundedBox args={[6.5, 5.7, 0.05]} radius={0.4} smoothness={4}>
            <meshStandardMaterial 
              color="#87ceeb" 
              transparent 
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </RoundedBox>

          {/* Sky gradient background (optional decorative element) */}
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[5.3, 3.3]} />
            <meshStandardMaterial 
              color="#e6f3ff"
              transparent 
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Title with sky theme */}
          <Text
            position={[-3, 2, 0.1]}
            fontSize={0.5}
            color="#2c5aa0"
            anchorX="left"
            anchorY="top"
            fontWeight={600}
          >
            ☁️{title || 'Sky Project'}
          </Text>

          {/* Description */}
          <Text
            position={[-2.5, 1.4, 0.1]}
            fontSize={0.3}
            color="#1e3a8a"
            maxWidth={4.8}
            lineHeight={1.4}
            anchorX="left"
            anchorY="top"
          >
            {description || 'Floating high above the clouds, this project soars with innovative ideas. Click to explore the sky!'}
          </Text>

          {/* Action button with balloon theme */}
          <group position={[0, -2, 0.1]}>
            {/* Button background */}
            <RoundedBox args={[2.2, 0.8, 0.05]} radius={0.15} smoothness={4}>
              <meshStandardMaterial 
                color={
                  type === 'github' ? '#24292e' : 
                  type === 'linkedin' ? '#ffd000ff' : 
                  '#0099ff'
                }
                emissive={
                  type === 'github' ? '#24292e' : 
                  type === 'linkedin' ? '#ffee00ff' : 
                  '#0099ff'
                }
                emissiveIntensity={1}
              />
            </RoundedBox>
            
            {/* Button text */}
            <Text
              position={[0, 0, 0.05]}
              fontSize={0.25}
              fontWeight={700}
              color="#000000ff"
              anchorX="center"
              anchorY="middle"
              onClick={() => {
                if (type === 'live') openIframe(iframeUrl)
                else window.open(iframeUrl, '_blank')
              }}
              onPointerOver={() => (document.body.style.cursor = 'pointer')}
              onPointerOut={() => (document.body.style.cursor = 'default')}
            >
              {type === 'github' && 'View GitHub'}
              {type === 'linkedin' && 'View Post'}
              {type === 'live' && 'Live Site'}
            </Text>
          </group>

          {/* Decorative elements - floating clouds */}
          <Text
            position={[2.2, 1.5, 0.05]}
            fontSize={0.3}
            color="#b8e6ff"
            anchorX="center"
            anchorY="middle"
          >
            ☁️
          </Text>
          
          <Text
            position={[-2.8, -0.5, 0.05]}
            fontSize={0.25}
            color="#d1f2ff"
            anchorX="center"
            anchorY="middle"
          >
            ☁️
          </Text>

          <Text
            position={[2.5, -0.8, 0.05]}
            fontSize={0.2}
            color="#e8f4fd"
            anchorX="center"
            anchorY="middle"
          >
            ☁️
          </Text>
        </group>
      </Billboard>
    </group>
  );
}