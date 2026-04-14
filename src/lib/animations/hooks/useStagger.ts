"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

interface UseStaggerOptions {
  duration?: number;
  delay?: number;
  stagger?: number;
  easing?: string;
}

export function useStagger({
  duration = 400,
  delay = 0,
  stagger: staggerValue = 50,
  easing = "easeOutCubic",
}: UseStaggerOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const animateChildren = () => {
    if (!containerRef.current) return;

    const children = Array.from(containerRef.current.children);
    if (!children.length) return;

    animate(children, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration,
      delay: stagger(staggerValue, { start: delay }),
      easing,
    });
  };

  useEffect(() => {
    animateChildren();
  }, []);

  return { containerRef, animate: animateChildren };
}
