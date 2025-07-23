import { useEffect } from 'react';
import * as THREE from 'three';
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

const textures = [
  '/images/terrain/terrain.jpg',
  '/images/terrain/col.jpg',
  '/images/terrain/rough.jpg',
  '/images/terrain/nor.png',
  '/Planets/earth.jpg',
  '/Planets/mars.jpg'
];

const audioFiles = [
  '/audio/whoosh.mp3',
  '/audio/space.mp3',
  '/audio/alienClick.mp3',
  '/audio/happy.mp3',
  '/audio/background.mp3'
];

const fontFiles = [
  '/fonts/Calligraphy_Regular.typeface.json'
];

const animationFiles = [
  '/animations/Crouch To Stand.fbx',
  '/animations/Start Walking.fbx',
  '/animations/Fast Run.fbx',
  '/animations/Breathing Idle.fbx',
  '/animations/Closing.fbx',
  '/animations/Arm Stretching.fbx',
  '/animations/jump high.fbx',
  '/animations/Landing.fbx',
  '/animations/Run To Dive.fbx',
  '/animations/Flying.fbx',
  '/animations/Male Sitting Pose.fbx'
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
    const textureLoader = new THREE.TextureLoader(manager);
    const fontLoader = new FontLoader(manager);
    const fbxLoader = new FBXLoader(manager);
    
    // --- Trigger all preloads here ---
    // GLTF models (useGLTF.preload automatically uses the default manager)
    models.forEach(url => useGLTF.preload(url));
    
    // Textures
    textures.forEach(url => textureLoader.load(url, () => {}));

    // Fonts
    fontFiles.forEach(url => fontLoader.load(url, () => {}));

    // FBX Animations
    animationFiles.forEach(url => fbxLoader.load(url, () => {}));

  }, [onProgress, onComplete]);

  return null; // This component does not render anything
}
