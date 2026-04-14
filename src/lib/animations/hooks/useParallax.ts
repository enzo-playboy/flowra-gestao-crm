"use client";

import { useEffect, useRef, useState } from "react";

interface UseParallaxOptions {
  strength?: number;
  direction?: "vertical" | "horizontal";
}

export function useParallax({
  strength = 0.5,
  direction = "vertical",
}: UseParallaxOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const distance = elementCenter - viewportCenter;

      setOffset(distance * strength);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [strength, direction]);

  const transform =
    direction === "vertical"
      ? `translateY(${offset}px)`
      : `translateX(${offset}px)`;

  return { ref, offset, transform };
}
