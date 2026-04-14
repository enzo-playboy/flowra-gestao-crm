"use client";

import { useState, useRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useMagneticHover } from "@/lib/animations/hooks/useMagneticHover";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "glass" | "glow" | "gradient";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "default",
  size = "md",
  loading = false,
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { ref: magneticRef, position } = useMagneticHover({ strength: 0.2, radius: 80 });

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    onClick?.(e);
  };

  const variantClasses = {
    default: "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20",
    glass: "glass-card text-foreground hover:border-accent/30",
    glow: "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/30 glass-glow",
    gradient: "gradient-border text-foreground shimmer",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      ref={(node) => {
        buttonRef.current = node;
        (magneticRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }}
      className={cn(
        "relative overflow-hidden rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-transparent",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onClick={handleRipple}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}

      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-accent/30 pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animation: "ripple 0.6s ease-out forwards",
          }}
        />
      ))}
    </button>
  );
}
