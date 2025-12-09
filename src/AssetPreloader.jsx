import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

// --- Define all assets to be preloaded globally ---

const models = [
  '/models/character.glb',
  '/models/house.glb',
  '/models/water tank.glb',
  '/models/tank.glb',
  '/models/wind mill.glb',
  '/models/tree.glb',
  '/models/ground.glb',
  '/models/car.glb'
];

const audioFiles = [
  '/audio/coin.mp3'
];

const fontFiles = [
  '/fonts/Calligraphy_Regular.typeface.json'
];

// This component is invisible. Its only job is to trigger the preloading.
export function AssetPreloader({ onProgress, onComplete }) {
  useEffect(() => {
    const manager = THREE.DefaultLoadingManager;

    // Set up listeners on the default loading manager
    manager.onStart = (url, itemsLoaded, itemsTotal) => {
      // Initial progress
      onProgress((itemsLoaded / itemsTotal) * 100);
    };

    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      onProgress((itemsLoaded / itemsTotal) * 100);
    };

    manager.onLoad = () => {
      onComplete();
    };

    manager.onError = (url) => {
      console.error(`Error loading ${url}`);
    };

    // --- Instantiate all loaders with the manager ---
    const fontLoader = new FontLoader(manager);
    
    // --- Trigger all preloads here ---
    // GLTF models (useGLTF.preload automatically uses the default manager)
    models.forEach(url => useGLTF.preload(url));
    
    // Fonts
    fontFiles.forEach(url => fontLoader.load(url, () => {}));

  }, [onProgress, onComplete]);

  return null; // This component does not render anything
}
