import React, { useEffect, useState } from "react";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const moveCursor = (e) => {
      const newPos = { x: e.clientX, y: e.clientY, id: Date.now() };
      setPosition({ x: e.clientX, y: e.clientY });

    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);


  const mainCursorStyle = {
    position: "fixed",
    top: position.y,
    left: position.x,
    transform: "translate(-50%, -50%)",
    fontSize: "100px",
    color: "yellow",
    pointerEvents: "none",
    zIndex: 9999,
  };

  return (
    <>
      <div style={mainCursorStyle}>⌖</div>
    </>
  );
};

export default CustomCursor;
