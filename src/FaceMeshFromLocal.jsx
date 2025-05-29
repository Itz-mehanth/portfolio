// src/FaceMeshFromLocal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { Facemesh, OrbitControls } from '@react-three/drei';
import { detectFaceFromImage } from './utils/detectFaceFromImage';
import { TextureLoader } from 'three';

export default function FaceMeshFromLocal() {
  const [faceData, setFaceData] = useState(null);
  const apiRef = useRef();
  const imageTexture = useLoader(TextureLoader, 'images/face.jpg'); // Public folder path

  useEffect(() => {
    const img = new Image();
    img.src = 'images/face.jpg'; // Reference from /public/images/
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const result = await detectFaceFromImage(img);
      if (result.faceLandmarks.length > 0) {
        setFaceData({
          points: result.faceLandmarks[0],
          matrix: result.facialTransformationMatrixes?.[0],
          blendshapes: result.faceBlendshapes?.[0],
        });
      }
    };
  }, []);

  useEffect(() => {
    if (faceData && apiRef.current?.meshRef?.current) {
      const mesh = apiRef.current.meshRef.current;
      mesh.material.map = imageTexture;
      mesh.material.needsUpdate = true;
    }
  }, [imageTexture, faceData]);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[0, 2, 2]} intensity={1} />
        <OrbitControls enableZoom />
        {faceData && (
          <Facemesh
            ref={apiRef}
            rotateZ={-Math.PI / 2}
            points={faceData.points}
            facialTransformationMatrix={faceData.matrix}
            faceBlendshapes={faceData.blendshapes}
            eyes
            eyesAsOrigin
          />
        )}
      </Canvas>
    </div>
  );
}
