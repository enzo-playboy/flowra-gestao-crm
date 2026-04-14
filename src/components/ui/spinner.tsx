import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
      <div
        className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin"
        style={{ borderTopColor: "transparent" }}
      />
      <div
        className="absolute inset-0 rounded-full border-2 border-accent/50 animate-ping"
        style={{ animationDuration: "1.5s" }}
      />
    </div>
  );
}
