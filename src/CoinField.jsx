import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import Coin from './Coin';

export default function CoinField({ avatarRef, scoreValueRef, scoreElement }) {
    const [collectedCoins, setCollectedCoins] = useState({});

    // Generate coins along the path
    const coins = useMemo(() => {
        const _coins = [];
        for (let z = 20; z < 500; z += 15) {
            // Random X and Y within flight bounds
            // X: -30 to 30, Y: -10 to 30
            const x = (Math.random() - 0.5) * 50;
            const y = (Math.random() - 0.5) * 30 + 10;
            _coins.push({ position: [x, y, z], id: z });
        }
        return _coins;
    }, []);

    useFrame(() => {
        if (avatarRef && avatarRef.current && avatarRef.current.position) {
            const planePos = avatarRef.current.position;

            coins.forEach(coin => {
                if (!collectedCoins[coin.id]) {
                    const dx = planePos.x - coin.position[0];
                    const dy = planePos.y - coin.position[1];
                    const dz = planePos.z - coin.position[2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < 5) { // Collision radius
                        setCollectedCoins(prev => ({ ...prev, [coin.id]: true }));

                        // Play Coin Sound
                        const audio = new Audio('/audio/coin.mp3');
                        audio.volume = 0.5;
                        audio.play().catch(e => console.error("Audio play failed", e));

                        // Direct update without re-rendering App
                        if (scoreValueRef) scoreValueRef.current += 10;
                        if (scoreElement && scoreElement.current) {
                            scoreElement.current.innerText = scoreValueRef.current;
                        }
                    }
                }
            });
        }
    });

    return (
        <>
            {coins.map(coin => (
                !collectedCoins[coin.id] && (
                    <Coin key={coin.id} position={coin.position} onCollect={() => { }} />
                )
            ))}
        </>
    );
}
