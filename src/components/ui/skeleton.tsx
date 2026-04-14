import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rounded" | "card";
}

export function Skeleton({ className, variant = "rounded" }: SkeletonProps) {
  const variantClasses = {
    text: "h-4 w-full",
    circular: "rounded-full",
    rounded: "rounded",
    card: "rounded-xl p-5",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 shimmer",
        variantClasses[variant],
        className
      )}
    />
  );
}
