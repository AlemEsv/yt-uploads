import React, { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    function handleMove(event) {
      const el = glowRef.current;
      if (!el) return;
      el.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
      el.style.opacity = "1";
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return <div ref={glowRef} className="cursor-glow" />;
}
