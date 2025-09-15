import { useEffect, useState } from "react";

export default function Cursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    // Track mouse position
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);

    // Detect hover on interactive elements
    const handleHover = (e) => {
      if (e.target.tagName === "BUTTON" || e.target.tagName === "A") {
        setHovering(true);
      } else {
        setHovering(false);
      }
    };
    window.addEventListener("mouseover", handleHover);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", handleHover);
    };
  }, []);

  return (
    <div
      className={`cursor ${hovering ? "hovering" : ""}`}
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
    />
  );
}
