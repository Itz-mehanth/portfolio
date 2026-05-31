export default function SectionTransitionLoader({ screen, progress = 0 }) {
  if (!screen || progress <= 0) return null;

  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const stars = [
    { top: '12px', left: '8%', duration: '2.2s' },
    { top: '18px', left: '16%', duration: '3.4s' },
    { top: '8px', left: '30%', duration: '2.6s' },
    { top: '14px', left: '46%', duration: '3.1s' },
    { top: '10px', left: '58%', duration: '2.4s' },
    { top: '20px', left: '72%', duration: '3.5s' },
    { top: '12px', left: '86%', duration: '2.7s' },
    { top: '7px', left: '93%', duration: '3s' },
  ];
  const trees = Array.from({ length: 14 }, (_, index) => ({
    left: `${index * 8 + (index % 2 ? 2 : -1)}%`,
    height: `${14 + (index % 4) * 5}px`,
    width: `${9 + (index % 3) * 2}px`,
    delay: `${index * 0.18}s`,
  }));
  const windLines = [
    { top: '22px', right: '18%', width: '36px', delay: '0s', duration: '2.8s' },
    { top: '34px', right: '34%', width: '48px', delay: '0.7s', duration: '3.6s' },
    { top: '18px', right: '58%', width: '30px', delay: '1.1s', duration: '3.2s' },
  ];
  const butterflies = [
    { left: '18%', top: '26px', delay: '0.2s', duration: '2.8s', hue: '#ffb3c1' },
    { left: '64%', top: '22px', delay: '1.1s', duration: '3.4s', hue: '#ffe08a' },
  ];
  const particles = [
    { left: '12%', bottom: '18px', delay: '0.2s', duration: '4.2s' },
    { left: '26%', bottom: '24px', delay: '1.5s', duration: '5.1s' },
    { left: '51%', bottom: '18px', delay: '0.7s', duration: '4.8s' },
    { left: '79%', bottom: '26px', delay: '2.2s', duration: '5.6s' },
  ];

  return (
    <div
      className="section-transition-dock"
      style={{
        '--transition-accent': screen.accent || '#38bdf8',
        '--transition-progress-ratio': clampedProgress,
      }}
      aria-hidden="true"
    >
      <div className="anime-loader">
        <div className="anime-loader__sky" />
        <div className="anime-loader__sun-rays" />
        <div className="anime-loader__sun" />

        <div className="anime-loader__stars">
          {stars.map((star, index) => (
            <span
              key={`star-${index}`}
              style={{
                top: star.top,
                left: star.left,
                '--twinkle-duration': star.duration,
              }}
            />
          ))}
        </div>

        <div className="anime-loader__cloud anime-loader__cloud--1" />
        <div className="anime-loader__cloud anime-loader__cloud--2" />
        <div className="anime-loader__cloud anime-loader__cloud--3" />

        <div className="anime-loader__mountains anime-loader__mountains--far">
          <svg viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="animeLoaderFar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4a6fa5" />
                <stop offset="100%" stopColor="#2d4870" />
              </linearGradient>
            </defs>
            <path d="M0,200 L0,120 L60,80 L130,110 L200,50 L290,90 L380,30 L460,70 L550,20 L640,60 L720,10 L810,55 L900,25 L980,65 L1070,15 L1160,55 L1250,35 L1340,70 L1440,30 L1440,200 Z" fill="url(#animeLoaderFar)" opacity="0.74" />
            <path d="M195,50 L200,50 L210,65 L190,65 Z" fill="rgba(255,255,255,0.45)" />
            <path d="M375,30 L380,30 L390,45 L370,45 Z" fill="rgba(255,255,255,0.45)" />
            <path d="M545,20 L552,20 L562,38 L538,38 Z" fill="rgba(255,255,255,0.45)" />
            <path d="M715,10 L722,10 L734,30 L708,30 Z" fill="rgba(255,255,255,0.45)" />
            <path d="M895,25 L902,25 L912,42 L888,42 Z" fill="rgba(255,255,255,0.45)" />
          </svg>
        </div>

        <div className="anime-loader__mountains anime-loader__mountains--near">
          <svg viewBox="0 0 1440 180" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="animeLoaderNear" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2d5a3d" />
                <stop offset="100%" stopColor="#1a3d2b" />
              </linearGradient>
            </defs>
            <path d="M0,180 L0,130 L80,90 L170,120 L260,75 L360,105 L440,60 L540,95 L620,50 L710,85 L790,40 L880,78 L960,45 L1050,80 L1130,55 L1220,88 L1310,62 L1440,100 L1440,180 Z" fill="url(#animeLoaderNear)" />
          </svg>
        </div>

        <div className="anime-loader__horizon" />
        <div className="anime-loader__trees">
          {trees.map((tree, index) => (
            <span
              key={`tree-${index}`}
              className="anime-loader__tree"
              style={{
                left: tree.left,
                width: tree.width,
                height: tree.height,
                animationDelay: tree.delay,
              }}
            />
          ))}
        </div>
        <div className="anime-loader__ground" />
        <div className="anime-loader__path" />
        <div className="anime-loader__grass-scroll" />
        <div className="anime-loader__grass-top" />
        <div className="anime-loader__flowers" />
        <div className="anime-loader__wind">
          {windLines.map((line, index) => (
            <span
              key={`wind-${index}`}
              style={{
                top: line.top,
                right: line.right,
                width: line.width,
                animationDelay: line.delay,
                '--wind-duration': line.duration,
              }}
            />
          ))}
        </div>
        <div className="anime-loader__butterflies">
          {butterflies.map((butterfly, index) => (
            <span
              key={`butterfly-${index}`}
              className="anime-loader__butterfly"
              style={{
                left: butterfly.left,
                top: butterfly.top,
                animationDelay: butterfly.delay,
                '--butterfly-duration': butterfly.duration,
                '--butterfly-color': butterfly.hue,
              }}
            />
          ))}
        </div>
        <div className="anime-loader__particles">
          {particles.map((particle, index) => (
            <span
              key={`particle-${index}`}
              style={{
                left: particle.left,
                bottom: particle.bottom,
                animationDelay: particle.delay,
                '--particle-duration': particle.duration,
              }}
            />
          ))}
        </div>
        <div className="anime-loader__grain" />
        <div className="anime-loader__vignette" />

        <div className="anime-loader__walker-track">
          <div className="anime-loader__boy-container">
            <div className="anime-loader__boy-shadow" />
            <svg
              className="anime-loader__boy"
              viewBox="0 0 80 140"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g className="boy-scarf-back">
                <path d="M30,48 Q20,60 15,78 Q13,85 16,88" stroke="#e63946" strokeWidth="4" fill="none" strokeLinecap="round" />
              </g>

              <g className="boy-leg boy-leg-left">
                <rect x="27" y="100" width="11" height="28" rx="4" fill="#1d3557" />
                <rect x="24" y="124" width="14" height="8" rx="3" fill="#2b2d42" />
                <rect x="24" y="130" width="14" height="2" rx="1" fill="#8d99ae" />
              </g>

              <g className="boy-leg boy-leg-right">
                <rect x="42" y="100" width="11" height="28" rx="4" fill="#1d3557" />
                <rect x="42" y="124" width="14" height="8" rx="3" fill="#2b2d42" />
                <rect x="42" y="130" width="14" height="2" rx="1" fill="#8d99ae" />
              </g>

              <rect x="22" y="52" width="36" height="50" rx="6" fill="#457b9d" />
              <rect x="26" y="78" width="10" height="8" rx="2" fill="#1d6c8a" opacity="0.7" />
              <line x1="40" y1="54" x2="40" y2="100" stroke="#1d6c8a" strokeWidth="1.5" opacity="0.5" />
              <path d="M30,52 L40,62 L50,52" fill="#f1faee" stroke="#dde8e0" strokeWidth="0.5" />
              <rect x="34" y="49" width="12" height="8" rx="2" fill="#f1faee" />

              <g className="boy-arm boy-arm-left">
                <rect x="13" y="54" width="11" height="22" rx="5" fill="#457b9d" />
                <ellipse cx="18" cy="80" rx="5" ry="5" fill="#ffd6a5" />
                <line x1="18" y1="78" x2="18" y2="70" stroke="#8b5e3c" strokeWidth="2" />
              </g>

              <g className="boy-arm boy-arm-right">
                <rect x="56" y="54" width="11" height="20" rx="5" fill="#457b9d" />
                <ellipse cx="62" cy="78" rx="5" ry="5" fill="#ffd6a5" />
              </g>

              <rect x="13" y="55" width="15" height="30" rx="5" fill="#8b5e3c" />
              <rect x="15" y="58" width="11" height="8" rx="2" fill="#a0714a" />
              <path d="M22,54 Q24,52 28,54" stroke="#6b4226" strokeWidth="2" fill="none" />
              <line x1="13" y1="65" x2="13" y2="82" stroke="#6b4226" strokeWidth="2" />

              <rect x="35" y="41" width="10" height="12" rx="4" fill="#ffd6a5" />
              <ellipse cx="40" cy="32" rx="18" ry="20" fill="#ffd6a5" />
              <ellipse cx="22" cy="34" rx="4" ry="5" fill="#ffd6a5" />
              <ellipse cx="58" cy="34" rx="4" ry="5" fill="#ffd6a5" />

              <path d="M22,28 Q22,12 40,11 Q58,12 58,28 Q55,20 40,18 Q25,20 22,28 Z" fill="#1a0a00" />
              <path d="M22,26 Q18,22 20,16 Q22,12 26,14 Q23,18 24,24 Z" fill="#1a0a00" />
              <path d="M58,26 Q62,22 60,16 Q58,12 54,14 Q57,18 56,24 Z" fill="#1a0a00" />
              <path d="M40,11 Q42,5 46,3 Q48,8 44,14 Z" fill="#1a0a00" />
              <path d="M34,14 Q36,12 40,13" stroke="#4a2800" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />

              <g className="boy-face">
                <ellipse cx="32" cy="33" rx="5" ry="6" fill="white" />
                <ellipse cx="32" cy="34" rx="4" ry="5" fill="#3a86ff" />
                <ellipse cx="32" cy="34" rx="2.5" ry="3.5" fill="#1a3a7a" />
                <ellipse cx="32" cy="34" rx="1.2" ry="1.8" fill="#000" />
                <ellipse cx="33.5" cy="32.5" rx="1" ry="1.2" fill="white" />

                <ellipse cx="48" cy="33" rx="5" ry="6" fill="white" />
                <ellipse cx="48" cy="34" rx="4" ry="5" fill="#3a86ff" />
                <ellipse cx="48" cy="34" rx="2.5" ry="3.5" fill="#1a3a7a" />
                <ellipse cx="48" cy="34" rx="1.2" ry="1.8" fill="#000" />
                <ellipse cx="49.5" cy="32.5" rx="1" ry="1.2" fill="white" />

                <path d="M27,26 Q32,24 36,26" stroke="#1a0a00" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <path d="M44,26 Q48,24 53,26" stroke="#1a0a00" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <ellipse cx="40" cy="40" rx="1.5" ry="1" fill="#d4a574" />
                <path d="M36,44 Q40,47 44,44" stroke="#c0836e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <ellipse cx="26" cy="40" rx="5" ry="3" fill="#ffaaaa" opacity="0.35" />
                <ellipse cx="54" cy="40" rx="5" ry="3" fill="#ffaaaa" opacity="0.35" />
              </g>

              <path d="M30,48 Q40,56 50,48 Q48,54 40,58 Q32,54 30,48 Z" fill="#e63946" />
              <path d="M38,58 Q40,65 38,72" stroke="#e63946" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M30,49 Q40,57 50,49" stroke="#c1121f" strokeWidth="0.5" fill="none" opacity="0.5" />

              <ellipse cx="40" cy="16" rx="20" ry="5" fill="#2d3561" />
              <path d="M30,16 Q40,3 50,16" fill="#2d3561" />
              <path d="M30,16 Q40,12 50,16" stroke="#e63946" strokeWidth="2" fill="none" />
              <ellipse cx="40" cy="4" rx="2" ry="2" fill="#e63946" />

              <path
                className="boy-scarf-tail"
                d="M19,53 Q8,63 12,76"
                stroke="#f25f6c"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="anime-loader__progress">
          <div className="anime-loader__progress-fill" />
        </div>
      </div>
    </div>
  );
}
