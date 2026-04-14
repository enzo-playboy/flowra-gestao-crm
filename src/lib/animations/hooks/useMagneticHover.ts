"use client";

import { useEffect, useRef, useState } from "react";

interface UseMagneticHoverOptions {
  strength?: number;
  radius?: number;
}

export function useMagneticHover({
  strength = 0.3,
  radius = 100,
}: UseMagneticHoverOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < radius) {
        const factor = 1 - distance / radius;
        setPosition({
          x: distanceX * strength * factor,
          y: distanceY * strength * factor,
        });
        setIsHovering(true);
      } else {
        setPosition({ x: 0, y: 0 });
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
      setIsHovering(false);
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength, radius]);

  return { ref, position, isHovering };
}
