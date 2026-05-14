"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Flame, Trophy, Zap, PhoneCall, Check } from "lucide-react";
import { AnimatedCard } from "@/components/shared/animated-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface GamifiedTasksProps {
  className?: string;
  delay?: number;
}

export function GamifiedTasks({ className, delay = 0 }: GamifiedTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", text: "Ligar para Lead #1", completed: false },
    { id: "2", text: "Ligar para Lead #2", completed: false },
    { id: "3", text: "Ligar para Lead #3", completed: false },
    { id: "4", text: "Ligar para Lead #4", completed: false },
    { id: "5", text: "Ligar para Lead #5", completed: false },
  ]);

  const [streak, setStreak] = useState(3);
  const [showCelebration, setShowCelebration] = useState(false);

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  useEffect(() => {
    if (completedCount === tasks.length && tasks.length > 0) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [completedCount, tasks.length]);

  return (
    <AnimatedCard delay={delay} className={cn("relative overflow-hidden border-accent/20 bg-accent/5 backdrop-blur-xl", className)}>
      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Zap className="h-6 w-6 fill-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Meta de Dopamina</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Ligações Diárias</p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1 text-orange-500">
            <Flame className="h-4 w-4 fill-orange-500" />
            <span className="text-sm font-bold">{streak} Dias</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>Progresso Hoje</span>
            <span>{completedCount}/{tasks.length}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-accent/10">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", bounce: 0, duration: 1 }}
            />
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={false}
              animate={{
                backgroundColor: task.completed ? "rgba(var(--primary-rgb), 0.05)" : "transparent",
              }}
              className={cn(
                "group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all hover:border-accent/20 hover:bg-accent/5",
                task.completed && "border-primary/20"
              )}
              onClick={() => toggleTask(task.id)}
            >
              <div className="cursor-pointer">
                {task.completed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white"
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-accent/30 group-hover:border-primary/50" />
                )}
              </div>
              <span className={cn(
                "flex-1 text-sm font-medium transition-all",
                task.completed ? "text-muted-foreground line-through" : "text-foreground"
              )}>
                {task.text}
              </span>
              {!task.completed && (
                <Button size="sm" variant="default" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                  <PhoneCall className="h-4 w-4 text-primary" />
                </Button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Reward Message */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Trophy className="h-16 w-16 text-yellow-500" />
              </motion.div>
              <h2 className="mt-4 text-2xl font-bold text-foreground">META BATIDA!</h2>
              <p className="text-muted-foreground">Sua dose de dopamina foi liberada 🚀</p>
              
              {/* Partículas Simples */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-2 w-2 rounded-full bg-primary"
                  initial={{ x: 0, y: 0 }}
                  animate={{
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 400,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedCard>
  );
}
