import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

const MODEL_ASSETS = [
  '/models/paper_airplane.glb',
  '/models/balloon.glb',
  '/models/car.glb',
  '/models/ground.glb',
  '/models/house.glb',
  '/models/tank.glb',
  '/models/tree.glb',
  '/models/water tank.glb',
  '/models/wind mill.glb',
];

const HDR_ASSETS = [];
const FONT_ASSETS = ['/fonts/Calligraphy_Regular.typeface.json'];
const AUDIO_ASSETS = ['/audio/coin.mp3'];
const IMAGE_ASSETS = ['/mehanth-developer.jpg'];

const CRITICAL_ASSET_URLS = [...FONT_ASSETS, ...IMAGE_ASSETS];
const NON_CRITICAL_ASSET_URLS = [...MODEL_ASSETS, ...HDR_ASSETS, ...AUDIO_ASSETS];
const ALL_ASSET_URLS = [...CRITICAL_ASSET_URLS, ...NON_CRITICAL_ASSET_URLS];
const ROUTE_ASSET_URLS = {
  lander: [...FONT_ASSETS, '/mehanth-developer.jpg'],
  skills: [
    '/models/car.glb',
    '/models/ground.glb',
    '/models/house.glb',
    '/models/tank.glb',
    '/models/tree.glb',
    '/models/water tank.glb',
    '/models/wind mill.glb',
  ],
  projects: [
    '/models/paper_airplane.glb',
    '/models/balloon.glb',
    '/audio/coin.mp3',
  ],
  certificate: [],
  contact: [],
};

let preloadPromise = null;
let preloadStarted = false;
let backgroundWarmupStarted = false;
let currentProgress = 0;
const listeners = new Set();
const routePreloadCache = new Map();
const loadedRoutes = new Set();

function emitProgress(value) {
  currentProgress = value;
  listeners.forEach((listener) => listener(currentProgress));
}

function warmAsset(url) {
  return fetch(url, { cache: 'force-cache' }).catch(() => {
    console.warn(`Failed to preload: ${url}`);
  });
}

function scheduleIdleTask(task) {
  if (typeof window === 'undefined') {
    setTimeout(task, 0);
    return;
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(task, { timeout: 2000 });
    return;
  }

  setTimeout(task, 800);
}

export function warmRemainingAssets() {
  // Route assets are now loaded on demand during page transitions so the
  // bottom loader reflects real progress instead of instantly jumping to 100%.
  backgroundWarmupStarted = true;
}

export function preloadRouteAssets(routeId, onProgress) {
  const routeAssets = ROUTE_ASSET_URLS[routeId] ?? [];

  if (routeAssets.length === 0) {
    if (typeof onProgress === 'function') {
      onProgress(100);
    }
    return Promise.resolve();
  }

  if (routePreloadCache.has(routeId)) {
    const cachedPromise = routePreloadCache.get(routeId);
    if (typeof onProgress === 'function') {
      cachedPromise.then(() => onProgress(100));
    }
    return cachedPromise;
  }

  const preloadPromise = new Promise((resolve) => {
    let loaded = 0;
    const total = routeAssets.length;
    const emit = () => {
      if (typeof onProgress === 'function') {
        onProgress(Math.min(100, Math.round((loaded / total) * 100)));
      }
    };

    emit();

    const tasks = routeAssets.map((url) => {
      if (url.endsWith('.glb')) {
        useGLTF.preload(url);
      }

      return warmAsset(url).finally(() => {
        loaded += 1;
        emit();
      });
    });

    Promise.allSettled(tasks).then(() => {
      loadedRoutes.add(routeId);
      if (typeof onProgress === 'function') {
        onProgress(100);
      }
      resolve();
    });
  });

  routePreloadCache.set(routeId, preloadPromise);
  return preloadPromise;
}

export function preloadAssets(onProgress) {
  if (typeof onProgress === 'function') {
    listeners.add(onProgress);
    onProgress(currentProgress);
  }

  if (preloadStarted && preloadPromise) {
    return preloadPromise;
  }

  preloadStarted = true;
  preloadPromise = new Promise((resolve) => {
    const total = CRITICAL_ASSET_URLS.length || 1;
    let loaded = 0;
    const update = () => {
      emitProgress(Math.min(100, Math.round((loaded / total) * 100)));
    };

    emitProgress(0);

    const warmupRequests = CRITICAL_ASSET_URLS.map((url) =>
      warmAsset(url)
        .finally(() => {
          loaded += 1;
          update();
        })
    );

    Promise.allSettled(warmupRequests).then(() => {
      emitProgress(100);
      warmRemainingAssets();
      resolve();
    });
  });

  return preloadPromise;
}

export function unsubscribePreloadProgress(onProgress) {
  if (typeof onProgress === 'function') {
    listeners.delete(onProgress);
  }
}

export function isRoutePreloaded(routeId) {
  return loadedRoutes.has(routeId);
}

export function getPreloadedAssetCount() {
  return ALL_ASSET_URLS.length;
}
