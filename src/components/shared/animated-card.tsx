"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMagneticHover } from "@/lib/animations/hooks/useMagneticHover";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "default" | "glass" | "glow" | "gradient";
  magnetic?: boolean;
  glow?: boolean;
  shimmer?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  variant = "glass",
  magnetic = false,
  glow = false,
  shimmer = false,
  onClick,
}: AnimatedCardProps) {
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);
  const { ref: magneticRef, position } = useMagneticHover({ strength: 0.15, radius: 120 });

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
    });
  }, [controls, delay]);

  const variantClasses = {
    default: "bg-card border border-border hover:border-accent/30",
    glass: "glass-card",
    glow: "glass-card glass-glow",
    gradient: "gradient-border shimmer",
  };

  const combinedRef = (node: HTMLDivElement | null) => {
    cardRef.current = node;
    if (magnetic) {
      (magneticRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  return (
    <motion.div
      ref={combinedRef}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      onClick={onClick}
      style={
        magnetic
          ? {
              transform: `translate(${position.x}px, ${position.y}px)`,
              transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }
          : undefined
      }
      className={cn(
        "rounded-xl p-5 transition-all duration-300",
        variantClasses[variant],
        glow && "glass-glow",
        shimmer && "shimmer",
        className,
        onClick && "cursor-pointer"
      )}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}
