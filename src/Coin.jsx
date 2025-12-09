import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export default function Coin({ position, onCollect }) {
    const ref = useRef();
    const [active, setActive] = useState(true);

    useFrame((state, delta) => {
        if (active && ref.current) {
            ref.current.rotation.y += delta * 3;
        }
    });

    const handleCollect = () => {
        if (active) {
            setActive(false);
            onCollect();
        }
    };

    if (!active) return null;

    return (
        <group position={position} ref={ref}>
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <mesh
                    rotation={[Math.PI / 2, 0, 0]}
                    onClick={handleCollect} // Fallback click interaction
                // We will handle collision from parent, but this mesh needs to be raycastable if we used raycaster
                >
                    <cylinderGeometry args={[1, 1, 0.2, 32]} />
                    <meshStandardMaterial
                        color="#fbbf24"
                        metalness={0.8}
                        roughness={0.2}
                        emissive="#d97706"
                        emissiveIntensity={0.5}
                    />
                </mesh>

                {/* Inner detail */}
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.8, 0.8, 0.22, 32]} />
                    <meshStandardMaterial color="#f59e0b" />
                </mesh>
            </Float>
        </group>
    );
}
