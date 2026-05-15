"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  onOpenChange?: (isOpen: boolean) => void;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  className,
  label,
  onOpenChange,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  const handleOpenChange = (newIsOpen: boolean) => {
    setIsOpen(newIsOpen);
    onOpenChange?.(newIsOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isOpen) handleOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", isOpen && "z-[1000]", className)} ref={containerRef}>
      {label && <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 ml-1">{label}</label>}
      
      <button
        type="button"
        onClick={() => handleOpenChange(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2.5 bg-card/50 backdrop-blur-md border border-border rounded-xl text-sm transition-all hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20",
          isOpen && "border-accent ring-2 ring-accent/20 shadow-lg shadow-accent/5"
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          <span className={cn(
            "truncate font-medium",
            !selectedOption && "text-muted-foreground",
            selectedOption?.color
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted transition-transform duration-300", isOpen && "rotate-180 text-accent")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute z-[1000] w-full mt-1 bg-card/90 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
            style={{ 
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5), 0 0 20px rgba(var(--accent-rgb), 0.05)"
            }}
          >
            <div className="p-1.5 space-y-0.5">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    handleOpenChange(false);
                  }}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all group",
                    value === option.value 
                      ? "bg-accent text-white" 
                      : "text-foreground hover:bg-accent/10"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && (
                      <div className={cn(
                        "transition-colors",
                        value === option.value ? "text-white" : option.color
                      )}>
                        {option.icon}
                      </div>
                    )}
                    <span className={cn(
                      "truncate font-medium",
                      value !== option.value && option.color
                    )}>
                      {option.label}
                    </span>
                  </div>
                  {value === option.value && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check className="w-3.5 h-3.5" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
