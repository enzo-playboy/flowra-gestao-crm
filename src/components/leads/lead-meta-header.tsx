"use client";

import { motion } from "framer-motion";
import { Zap, Flame, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadMetaHeaderProps {
  completed: number;
  total: number;
  streak: number;
}

export function LeadMetaHeader({ completed, total, streak }: LeadMetaHeaderProps) {
  const progress = (completed / total) * 100;

  return (
    <div className="bg-accent/5 border border-accent/20 rounded-3xl p-6 mb-8 relative overflow-hidden backdrop-blur-md">
      {/* Glow Effect */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Zap className="w-6 h-6 fill-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">Meta de Ligações</h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Aumente sua conversão hoje</p>
          </div>
        </div>

        <div className="flex-1 max-w-md w-full">
          <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-tighter">
            <span className="text-muted-foreground">Progresso Diário</span>
            <span className="text-primary">{completed} / {total} Leads</span>
          </div>
          <div className="h-3 w-full bg-accent/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="flex items-center gap-1.5 text-orange-500 mb-0.5">
              <Flame className="w-5 h-5 fill-orange-500" />
              <span className="text-xl font-black">{streak}</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Ofensiva</p>
          </div>
          <div className="h-10 w-px bg-border/50 hidden md:block" />
          <div className="text-center">
            <div className="text-xl font-black text-foreground mb-0.5">{total - completed}</div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Restantes</p>
          </div>
        </div>
      </div>

      {completed >= total && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-primary/5 flex items-center justify-center backdrop-blur-[1px] pointer-events-none"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-xs font-bold shadow-lg shadow-primary/40">
            <CheckCircle2 className="w-4 h-4" />
            META BATIDA! DOPAMINA LIBERADA 🚀
          </div>
        </motion.div>
      )}
    </div>
  );
}
