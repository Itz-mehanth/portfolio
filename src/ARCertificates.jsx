import { Canvas, useFrame } from '@react-three/fiber';
import { XR, ARButton } from '@react-three/xr';
import { useRef } from 'react';
import * as THREE from 'three';

// Certificate data
const certificates = [
  {
    title: "Web Development",
    issuer: "Tech Academy",
    date: "2024",
    color: "#4f46e5"
  },
  {
    title: "React Specialist",
    issuer: "Code Institute",
    date: "2024",
    color: "#059669"
  },
  {
    title: "UI/UX Design",
    issuer: "Design School",
    date: "2024",
    color: "#dc2626"
  }
];

// Helper to create a canvas texture for a certificate
function createCertificateTexture(cert) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 358;
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 512, 358);
  gradient.addColorStop(0, cert.color);
  gradient.addColorStop(1, cert.color + '80');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 358);
  
  // Border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, 492, 338);
  
  // Text
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 42px Arial';
  ctx.fillText('CERTIFICATE', 256, 80);
  ctx.font = 'bold 36px Arial';
  ctx.fillText(cert.title, 256, 140);
  ctx.font = '24px Arial';
  ctx.fillText(`Issued by ${cert.issuer}`, 256, 200);
  ctx.font = '20px Arial';
  ctx.fillText(cert.date, 256, 280);
  
  return new THREE.CanvasTexture(canvas);
}

function FloatingCertificate({ cert, index, total }) {
  const meshRef = useRef();
  
  // Position in a straight row, 0.3x of previous spacing
  // Previous spacing was radius = 3, so spacing = 3 * 2 = 6 between farthest
  // New spacing: 0.3 * 6 = 1.8 between farthest, so step = 1.8 / (total - 1)
  const rowWidth = 1.8;
  const step = total > 1 ? rowWidth / (total - 1) : 0;
  const x = -rowWidth / 2 + index * step;
  const position = [x, 1, -2];

  // No rotation (face forward)
  const rotation = [0, 0, 0];

  // Create texture
  const texture = createCertificateTexture(cert);

  // Animate floating
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = 1 + Math.sin(time * 0.5 + index) * 0.3;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      rotation={rotation} 
      castShadow 
      receiveShadow
    >
      <planeGeometry args={[2, 1.4]} />
      <meshLambertMaterial map={texture} transparent />
    </mesh>
  );
}

export default function ARCertificates({xrStore, arActive}) { 
  return (
    <>
      <Canvas 
        style={{ 
          height: '100vh', 
          width: '100vw', 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          zIndex: 999 
        }} 
        shadows
      >
        <XR 
            style={{ display: arActive ? 'block' : 'none' }}
            store={xrStore}>
            <ambientLight intensity={0.6} />
            <directionalLight 
                position={[5, 5, 5]} 
                intensity={0.8} 
        />
          
          {arActive && certificates.map((cert, i) => (
            <FloatingCertificate 
                key={i} 
                cert={cert} 
                index={i} 
                total={certificates.length} 
            />
            ))}
        </XR>
      </Canvas>                         
    </>
  );
}