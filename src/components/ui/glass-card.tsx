import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glow" | "gradient";
  shimmer?: boolean;
  children: React.ReactNode;
}

export function GlassCard({
  variant = "default",
  shimmer = false,
  className,
  children,
  ...props
}: GlassCardProps) {
  const variantClasses = {
    default: "glass-card",
    glow: "glass-card glass-glow",
    gradient: "gradient-border",
  };

  return (
    <div
      className={cn(
        variantClasses[variant],
        shimmer && "shimmer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
