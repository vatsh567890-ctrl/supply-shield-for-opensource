"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ShieldScene } from "./ShieldScene";
import { ShieldSilhouetteSvg } from "./ShieldSilhouetteSvg";

interface ShieldCanvasProps {
  className?: string;
}

export const ShieldCanvas: React.FC<ShieldCanvasProps> = ({ className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [renderError, setRenderError] = useState(false);

  const scrollProgressRef = useRef<number>(0);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 1. Detect WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  // 2. Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mql.matches);

    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // 3. Scroll tracking: 0 at top of page, 1 at the end of Section C (#how-it-works)
  useEffect(() => {
    if (typeof window === "undefined" || isReducedMotion) return;

    const handleScroll = () => {
      const sectionC = document.getElementById("how-it-works");
      if (!sectionC) {
        scrollProgressRef.current = 0;
        return;
      }
      const rect = sectionC.getBoundingClientRect();
      const sectionBottomInDoc = window.scrollY + rect.bottom;
      const scrollMax = Math.max(sectionBottomInDoc - window.innerHeight, 1);
      const current = window.scrollY;
      const progress = Math.min(Math.max(current / scrollMax, 0), 1);
      scrollProgressRef.current = progress;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isReducedMotion]);

  // 4. Pointer tracking: normalized -1 to +1 coordinates
  useEffect(() => {
    if (typeof window === "undefined" || isReducedMotion) return;

    const handlePointerMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      pointerRef.current = { x, y };
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("mousemove", handlePointerMove);
  }, [isReducedMotion]);

  // 5. IntersectionObserver: Stop rendering while canvas is off-screen
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === "undefined") {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.05, rootMargin: "80px" }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Fallback rendering if WebGL is unsupported or runtime error caught
  if (hasWebGL === false || renderError) {
    return (
      <div ref={containerRef} className={`w-full h-full min-h-[360px] ${className}`}>
        <ShieldSilhouetteSvg />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[360px] flex items-center justify-center ${className}`}
    >
      {!isIntersecting && <ShieldSilhouetteSvg />}

      {isIntersecting && (
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 45 }}
          dpr={[1, 2]}
          frameloop={isIntersecting ? "always" : "never"}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = 3; // ACESFilmicToneMapping
            gl.toneMappingExposure = 1.0;
          }}
          onError={() => setRenderError(true)}
          className="w-full h-full !absolute inset-0"
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 6, 5]} intensity={1.5} color="#FFFFFF" />
          <directionalLight position={[-4, -3, -3]} intensity={0.4} color="#FBE4EA" />
          <ShieldScene
            scrollProgressRef={scrollProgressRef}
            pointerRef={pointerRef}
            isReducedMotion={isReducedMotion}
          />
        </Canvas>
      )}
    </div>
  );
};

export default ShieldCanvas;
