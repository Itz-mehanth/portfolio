import React, { useState, useEffect } from 'react';
import './GlobalLoader.css'; // We'll create this new CSS file for the animations

export function GlobalLoader({ progress, isFadingOut, loadingTexts = [] }) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    if (loadingTexts.length > 0) {
      const interval = setInterval(() => {
        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % loadingTexts.length);
      }, 2000); // Change text every 3 seconds

      return () => clearInterval(interval);
    }
  }, [loadingTexts]);

  return (
    <div
      className="global-loader-container"
      style={{
        opacity: isFadingOut ? 0 : 1,
        pointerEvents: isFadingOut ? 'none' : 'all',
      }}
    >
      <div className="loader-content">
        <div className="welcome-text">
          <span>W</span><span>E</span><span>L</span><span>C</span><span>O</span><span>M</span><span>E</span>
        </div>
        <div className="subtitle-text">
          Initializing Portfolio Experience
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          >
            <div className="progress-bar-glow"></div>
            <div className="progress-bar-sparkle"></div>
          </div>
        </div>
        {/* New Rotating Text Section */}
        <div className="loading-fact-container">
          {loadingTexts.length > 0 && (
            <p className="loading-fact-text" key={currentTextIndex}>
              {loadingTexts[currentTextIndex]}
            </p>
          )}
        </div>
      </div>
      <div className="loader-bg-grid"></div>
    </div>
  );
}
