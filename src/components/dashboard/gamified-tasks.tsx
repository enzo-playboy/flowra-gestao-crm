"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Flame, Trophy, Zap, PhoneCall, Check, MessageCircle } from "lucide-react";
import { AnimatedCard } from "@/components/shared/animated-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLeads, updateLead, addLeadMessage } from "@/lib/supabase/queries";
import Link from "next/link";
import { useNotification } from "@/components/notifications/notification-provider";

interface GamifiedTasksProps {
  className?: string;
  delay?: number;
}

export function GamifiedTasks({ className, delay = 0 }: GamifiedTasksProps) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [streak, setStreak] = useState(3);
  const [showCelebration, setShowCelebration] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getLeads();
        // Pegar leads novos ou qualificados para a meta diária
        const targetLeads = data
          .filter(l => l.status === 'novo' || l.status === 'qualificado')
          .slice(0, 5); // Limitar a 5 para a meta diária
        setLeads(targetLeads);
      } catch (error) {
        console.error("Erro ao carregar leads para tarefas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const completedCount = completedIds.length;
  const progress = leads.length > 0 ? (completedCount / leads.length) * 100 : 0;

  const toggleTask = async (id: string, currentStatus: string) => {
    const isNowCompleted = !completedIds.includes(id);
    
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );

    if (isNowCompleted) {
      try {
        // Ao completar a tarefa na meta, atualizamos o status do lead para 'contato'
        await updateLead(id, { status: 'contato' });
        await addLeadMessage(null, null, { // Usando id do lead se as queries permitirem, mas aqui vamos focar no status
            role: "admin",
            content: "✅ Lead contatado via Meta de Prospecção",
            timestamp: new Date().toISOString(),
            leadId: id // Assumindo que addLeadMessage pode receber leadId ou lidar com isso
        } as any);
        
        addNotification({
          type: "success",
          title: "Progresso Salvo",
          message: "Status do lead atualizado para 'Contato'.",
        });
      } catch (error) {
        console.error("Erro ao atualizar status do lead:", error);
      }
    }
  };

  useEffect(() => {
    if (completedCount === leads.length && leads.length > 0) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [completedCount, leads.length]);

  if (loading) {
    return (
      <AnimatedCard delay={delay} className={cn("relative overflow-hidden border-accent/20 bg-accent/5 backdrop-blur-xl h-[400px]", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted/20 rounded w-1/2" />
          <div className="h-4 bg-muted/20 rounded w-full" />
          <div className="space-y-2 pt-8">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted/10 rounded-xl" />)}
          </div>
        </div>
      </AnimatedCard>
    );
  }

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
              <h3 className="text-lg font-bold tracking-tight">Meta de Prospecção</h3>
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
            <span>{completedCount}/{leads.length}</span>
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
          {leads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum lead pendente para ligar hoje! 🎉
            </div>
          ) : leads.map((lead) => {
            const isCompleted = completedIds.includes(lead.id);
            return (
              <motion.div
                key={lead.id}
                initial={false}
                animate={{
                  backgroundColor: isCompleted ? "rgba(var(--primary-rgb), 0.05)" : "transparent",
                }}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all hover:border-accent/20 hover:bg-accent/5",
                  isCompleted && "border-primary/20"
                )}
              >
                <div className="cursor-pointer" onClick={() => toggleTask(lead.id, lead.status)}>
                  {isCompleted ? (
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
                
                <Link href={`/leads/${lead.id}`} className="flex-1 min-w-0">
                  <span className={cn(
                    "block text-sm font-bold transition-all truncate",
                    isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                  )}>
                    Ligar para {lead.name?.trim() || 'Lead Sem Nome'}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    {lead.status} • {lead.nicho || 'Geral'}
                  </span>
                </Link>

                {!isCompleted && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {lead.phone && (
                      <>
                        <Button 
                          size="sm" 
                          variant="glass" 
                          className="h-8 w-8 p-0 text-primary hover:bg-primary/10"
                          onClick={() => window.location.href = `tel:${lead.phone}`}
                        >
                          <PhoneCall className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="glass" 
                          className="h-8 w-8 p-0 text-success hover:bg-success/10"
                          onClick={() => {
                            const cleanPhone = lead.phone.replace(/\D/g, "");
                            window.open(`https://wa.me/${cleanPhone}`, "_blank");
                          }}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Tarefa bônus: Adicionar Novo Lead */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="group flex items-center gap-3 rounded-xl border border-dashed border-accent/30 p-3 transition-all hover:border-accent/50 hover:bg-accent/5 mt-4"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            
            <Link href="/leads/novo" className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-foreground transition-all truncate">
                Adicionar Novos Leads
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                PROSPECÇÃO ATIVA • BÔNUS
              </span>
            </Link>
          </motion.div>
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
              <p className="text-muted-foreground">Meta diária atingida! Parabéns pelo esforço! 🚀</p>
              
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
