// Infinite kinetic marquee — a scrolling band of bold display words.
// Renders a doubled row so translateX(-50%) loops seamlessly.
const DEFAULT_WORDS = [
  'CREATIVE TECHNOLOGIST',
  '3D WEB',
  'REACT',
  'GENERATIVE UI',
  'HACKATHON ×3',
  'VISA INTERN',
  'PROBLEM SOLVER',
  'DESIGN ENGINEER',
];

export default function KineticMarquee({ words = DEFAULT_WORDS }) {
  const row = [...words, ...words];
  return (
    <div className="km-band" aria-hidden="true">
      <div className="km-track">
        {row.map((w, i) => (
          <span className="km-item" key={i}>
            {w}
            <span className="km-dot">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
