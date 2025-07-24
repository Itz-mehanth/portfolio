import { useProgress } from '@react-three/drei';
import { useEffect } from 'react';

export default function SplashLoader({ setLoading }) {
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => setLoading(false), 800); // Add a small delay
      return () => clearTimeout(timeout);
    }
  }, [progress]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Quicksand',
      fontSize: '2rem',
      zIndex: 9999,
    }}>
      Loading {Math.floor(progress)}%
    </div>
  );
}