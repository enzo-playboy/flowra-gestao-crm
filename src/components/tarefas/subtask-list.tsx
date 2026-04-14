"use client";

import { useState, useEffect } from "react";
import { getSubtarefas, createSubtarefa, updateSubtarefa, deleteSubtarefa } from "@/lib/supabase/mutations";
import type { Subtarefa } from "@/types/database";
import { Plus, Check, Trash2, ListTodo, AlertCircle, Loader2, Minus, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SubtaskListProps {
  tarefaId: string;
  onProgressChange?: (progress: number) => void;
}

export function SubtaskList({ tarefaId, onProgressChange }: SubtaskListProps) {
  const [subtarefas, setSubtarefas] = useState<Subtarefa[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loadSubtarefas();
  }, [tarefaId]);

  async function loadSubtarefas() {
    setFetching(true);
    try {
      const data = await getSubtarefas(tarefaId);
      setSubtarefas(data || []);
      updateProgress(data || []);
    } finally {
      setFetching(false);
    }
  }

  function updateProgress(subs: Subtarefa[]) {
    if (subs.length === 0) {
      onProgressChange?.(0);
      return;
    }
    
    // Progresso baseado nos estados: pendente=0, em_progresso=50, concluido=100
    const totalPoints = subs.reduce((acc, s) => {
      if (s.status === "concluido") return acc + 100;
      if (s.status === "em_progresso") return acc + 50;
      return acc;
    }, 0);
    
    onProgressChange?.(Math.round(totalPoints / subs.length));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!newSubtask.trim()) return;

    setLoading(true);
    try {
      const result = await createSubtarefa({
        tarefa_id: tarefaId,
        titulo: newSubtask.trim(),
        ordem: subtarefas.length,
      });
      if (result) {
        const updated = [...subtarefas, result];
        setSubtarefas(updated);
        updateProgress(updated);
        setNewSubtask("");
      }
    } catch (error) {
      console.error("Erro ao adicionar subtarefa:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCycleStatus(subtarefa: Subtarefa) {
    const previousSubtarefas = [...subtarefas];
    
    // Ciclo: pendente -> em_progresso -> concluido -> pendente
    let nextStatus: Subtarefa["status"];
    if (subtarefa.status === "pendente") nextStatus = "em_progresso";
    else if (subtarefa.status === "em_progresso") nextStatus = "concluido";
    else nextStatus = "pendente";

    const updated = subtarefas.map((s) => 
      s.id === subtarefa.id ? { ...s, status: nextStatus } : s
    );
    setSubtarefas(updated);
    updateProgress(updated);

    try {
      const result = await updateSubtarefa(subtarefa.id, { status: nextStatus });
      if (!result) {
        setSubtarefas(previousSubtarefas);
        updateProgress(previousSubtarefas);
      }
    } catch (error) {
      setSubtarefas(previousSubtarefas);
      updateProgress(previousSubtarefas);
    }
  }

  async function handleDelete(id: string) {
    const previousSubtarefas = [...subtarefas];
    const updated = subtarefas.filter((s) => s.id !== id);
    setSubtarefas(updated);
    updateProgress(updated);

    try {
      const success = await deleteSubtarefa(id);
      if (!success) {
        setSubtarefas(previousSubtarefas);
        updateProgress(previousSubtarefas);
      }
    } catch (error) {
      setSubtarefas(previousSubtarefas);
      updateProgress(previousSubtarefas);
    }
  }

  const completedCount = subtarefas.filter((s) => s.status === "concluido").length;
  const inProgressCount = subtarefas.filter((s) => s.status === "em_progresso").length;

  const getStatusIcon = (status: Subtarefa["status"]) => {
    switch (status) {
      case "concluido": return <Check className="w-3.5 h-3.5" />;
      case "em_progresso": return <Minus className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const getStatusClass = (status: Subtarefa["status"]) => {
    switch (status) {
      case "concluido": return "bg-accent border-accent text-white shadow-lg shadow-accent/20";
      case "em_progresso": return "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20";
      default: return "border-border/50 bg-background/50 hover:border-accent hover:bg-accent/5";
    }
  };

  return (
    <div 
      className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-accent" />
          <span className="text-xs font-black uppercase tracking-widest text-foreground/70">
            Checklist de Tarefas
          </span>
        </div>
        <div className="flex gap-2">
          {inProgressCount > 0 && (
            <div className="px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20">
              <span className="text-[10px] font-bold text-blue-500">
                {inProgressCount} EM CURSO
              </span>
            </div>
          )}
          <div className="px-2 py-0.5 bg-accent/10 rounded-full border border-accent/20">
            <span className="text-[10px] font-bold text-accent">
              {completedCount} / {subtarefas.length} PRONTO
            </span>
          </div>
        </div>
      </div>

      {fetching ? (
        <div className="flex items-center gap-2 py-4 justify-center text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs font-medium">Buscando itens...</span>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {subtarefas.map((subtarefa) => (
              <motion.div
                key={subtarefa.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex items-center gap-3 p-3 bg-muted/5 border border-border/50 rounded-2xl hover:bg-muted/10 transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCycleStatus(subtarefa);
                }}
              >
                <div
                  className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-xl border flex items-center justify-center transition-all",
                    getStatusClass(subtarefa.status)
                  )}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={subtarefa.status}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      {getStatusIcon(subtarefa.status)}
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                <span className={cn(
                  "flex-1 text-sm font-medium transition-all select-none",
                  subtarefa.status === "concluido" 
                    ? "text-muted-foreground line-through opacity-50" 
                    : subtarefa.status === "em_progresso"
                    ? "text-blue-500"
                    : "text-foreground/80"
                )}>
                  {subtarefa.titulo}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(subtarefa.id);
                  }}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {!fetching && subtarefas.length === 0 && (
            <div className="py-8 px-4 border border-dashed border-border/50 rounded-2xl text-center flex flex-col items-center gap-2">
              <AlertCircle className="w-6 h-6 opacity-20" />
              <p className="text-xs font-medium text-muted-foreground opacity-50">Sua lista está vazia</p>
            </div>
          )}
        </div>
      )}

      <form 
        onSubmit={handleAdd} 
        className="relative mt-4"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="O que precisa ser feito? (Aperte Enter)"
          className="w-full pl-5 pr-14 py-4 bg-muted/20 border-2 border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent font-medium hover:bg-muted/30 focus:bg-background shadow-inner relative z-[100] pointer-events-auto cursor-text block"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading || !newSubtask.trim()}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-accent text-white rounded-xl hover:bg-accent/90 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-accent/20 active:scale-95 z-[110] pointer-events-auto"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}

