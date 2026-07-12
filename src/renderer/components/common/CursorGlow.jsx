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

  return (
    <div
      ref={glowRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "560px",
        height: "560px",
        marginLeft: "-280px",
        marginTop: "-280px",
        background:
          "radial-gradient(circle, rgba(14,165,233,0.4) 0%, rgba(139,92,246,0.32) 40%, transparent 72%)",
        filter: "blur(70px)",
        opacity: 0,
        transition: "opacity 300ms ease",
        pointerEvents: "none",
        zIndex: 40,
        willChange: "transform",
      }}
    />
  );
}
