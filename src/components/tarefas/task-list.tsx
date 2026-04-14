"use client";

import { useEffect, useState, useMemo } from "react";
import { AnimatedCard } from "@/components/shared/animated-card";
import { getTarefas } from "@/lib/supabase/queries";
import { deleteTarefa, updateTarefa } from "@/lib/supabase/mutations";
import type { Tarefa } from "@/types/database";
import { Plus, CheckCircle2, Clock, AlertCircle, Edit2, Trash2, Calendar, ChevronDown, ChevronUp, AtSign, UserPlus, Tag, Target, RefreshCw } from "lucide-react";
import { TaskModal } from "./task-modal";
import { TaskFilters } from "./task-filters";
import { SubtaskList } from "./subtask-list";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function TaskList() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Tarefa | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [taskProgress, setTaskProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const data = await getTarefas();
      setTarefas(data || []);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    const success = await deleteTarefa(id);
    if (success) {
      setTarefas((prev) => prev.filter((t) => t.id !== id));
    }
  }

  function handleEdit(task: Tarefa) {
    setEditingTask(task);
    setShowModal(true);
  }

  function toggleTask(id: string) {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleProgressChange(taskId: string, progress: number) {
    setTaskProgress((prev) => ({ ...prev, [taskId]: progress }));
    
    // Sincroniza o progresso com o banco de dados
    try {
      await updateTarefa(taskId, { progresso: progress });
    } catch (error) {
      console.error("Erro ao atualizar progresso no banco:", error);
    }
  }

  const filteredAndSortedTarefas = useMemo(() => {
    let result = [...tarefas];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.titulo.toLowerCase().includes(searchLower) ||
          (t.descricao && t.descricao.toLowerCase().includes(searchLower)) ||
          (t.lead_nome && t.lead_nome.toLowerCase().includes(searchLower.replace("@", "")))
      );
    }

    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (difficultyFilter) {
      result = result.filter((t) => t.dificuldade === difficultyFilter);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "data_vencimento": {
          const dateA = a.data_vencimento ? new Date(a.data_vencimento).getTime() : 0;
          const dateB = b.data_vencimento ? new Date(b.data_vencimento).getTime() : 0;
          return dateA - dateB;
        }
        case "dificuldade": {
          const order = { facil: 0, medio: 1, dificil: 2 };
          return (order[a.dificuldade] ?? 0) - (order[b.dificuldade] ?? 0);
        }
        case "titulo":
          return a.titulo.localeCompare(b.titulo);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [tarefas, search, statusFilter, difficultyFilter, sortBy]);

  function isOverdue(task: Tarefa) {
    if (!task.data_vencimento || task.status === "concluido") return false;
    return new Date(task.data_vencimento) < new Date();
  }

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "facil": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "medio": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "dificil": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default: return "bg-muted/10 text-muted border-muted/20";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "concluido": return "bg-accent/10 text-accent border-accent/20";
      case "em_progresso": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/50">Carregando Tarefas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground/90">Gestão de Tarefas</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Você tem <span className="text-accent font-bold">{tarefas.filter(t => t.status !== "concluido").length}</span> tarefas pendentes hoje.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTask(null);
            setShowModal(true);
          }}
          className="group relative flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Plus className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Nova Tarefa</span>
        </button>
      </div>

      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        difficultyFilter={difficultyFilter}
        onDifficultyFilterChange={setDifficultyFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedTarefas.map((tarefa, index) => (
            <div 
              key={tarefa.id} 
              className="group bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden hover:border-accent/30 transition-all duration-300 shadow-xl shadow-accent/5"
            >
              <div className="relative p-6">
                <div className="flex items-start gap-6">
                  {/* Status Indicator & Cycle */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={async () => {
                        const statuses: Tarefa["status"][] = ["pendente", "em_progresso", "concluido"];
                        const currentIndex = statuses.indexOf(tarefa.status);
                        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                        
                        // Optimistic UI update
                        setTarefas(prev => prev.map(t => t.id === tarefa.id ? { ...t, status: nextStatus, progresso: nextStatus === "concluido" ? 100 : t.progresso } : t));
                        
                        try {
                          await updateTarefa(tarefa.id, { 
                            status: nextStatus,
                            progresso: nextStatus === "concluido" ? 100 : undefined 
                          });
                        } catch (error) {
                          console.error("Erro ao atualizar status:", error);
                          fetchData(); // Rollback
                        }
                      }}
                      className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-2xl border flex items-center justify-center transition-all group/btn relative",
                        tarefa.status === "concluido" ? "bg-accent border-accent text-white shadow-lg shadow-accent/20" : 
                        tarefa.status === "em_progresso" ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20" :
                        "bg-muted/5 border-border/50 hover:border-accent/40 group-hover:bg-accent/5"
                      )}
                    >
                      {tarefa.status === "concluido" ? (
                        <CheckCircle2 className="w-6 h-6 animate-in zoom-in-50 duration-300" />
                      ) : tarefa.status === "em_progresso" ? (
                        <RefreshCw className="w-5 h-5 animate-spin-slow" />
                      ) : (
                        <Target className="w-5 h-5 text-muted-foreground/40 group-hover:text-accent transition-colors" />
                      )}
                      
                      {/* Hover Label */}
                      <div className="absolute top-full mt-2 opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                        <div className="bg-foreground text-background text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-xl">
                          Próximo: {
                            tarefa.status === "pendente" ? "Em Progresso" :
                            tarefa.status === "em_progresso" ? "Concluir" : "Reiniciar"
                          }
                        </div>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => toggleTask(tarefa.id)}
                      className="p-1 text-muted-foreground/30 hover:text-accent transition-colors"
                    >
                      {expandedTasks.has(tarefa.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 
                        onClick={() => toggleTask(tarefa.id)}
                        className={cn(
                          "text-lg font-bold truncate transition-all cursor-pointer hover:text-accent decoration-accent/30",
                          tarefa.status === "concluido" ? "text-muted-foreground line-through opacity-60" : "text-foreground/90"
                        )}
                      >
                        {tarefa.titulo}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                        {tarefa.lead_nome && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-accent/5 border border-accent/20 rounded-full">
                            <AtSign className="w-3 h-3 text-accent" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-accent">{tarefa.lead_nome}</span>
                          </div>
                        )}
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                          getStatusBadge(tarefa.status)
                        )}>
                          {tarefa.status.replace("_", " ")}
                        </span>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                          getDifficultyBadge(tarefa.dificuldade)
                        )}>
                          {tarefa.dificuldade}
                        </span>
                      </div>
                    </div>

                    <p 
                      onClick={() => toggleTask(tarefa.id)}
                      className={cn(
                        "text-sm leading-relaxed mb-4 line-clamp-2 cursor-pointer hover:text-foreground/70 transition-colors",
                        tarefa.status === "concluido" ? "text-muted-foreground/40" : "text-muted-foreground"
                      )}
                    >
                      {tarefa.descricao || "Nenhuma descrição fornecida."}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      {tarefa.data_vencimento && (
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-xl border",
                          isOverdue(tarefa) ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-muted/5 border-border/50"
                        )}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {new Date(tarefa.data_vencimento).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' })}
                            {isOverdue(tarefa) && " • ATRASADA"}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-[200px] flex items-center gap-4">
                        <div className="flex-1 bg-muted/20 rounded-full h-1.5 overflow-hidden border border-border/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${taskProgress[tarefa.id] ?? tarefa.progresso}%` }}
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              tarefa.status === "concluido" ? "bg-accent" : "bg-accent/60"
                            )}
                          />
                        </div>
                        <span className="text-accent">{taskProgress[tarefa.id] ?? tarefa.progresso}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEdit(tarefa)}
                      className="p-3 rounded-2xl bg-muted/5 hover:bg-accent/10 text-muted-foreground hover:text-accent border border-border/30 hover:border-accent/20 transition-all shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tarefa.id)}
                      className="p-3 rounded-2xl bg-muted/5 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 border border-border/30 hover:border-rose-500/20 transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedTasks.has(tarefa.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-8 pt-8 border-t border-border/50">
                        <SubtaskList
                          tarefaId={tarefa.id}
                          onProgressChange={(progress) => handleProgressChange(tarefa.id, progress)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </AnimatePresence>

        {filteredAndSortedTarefas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/5 border-2 border-dashed border-border/50 rounded-3xl">
            <AlertCircle className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-bold text-foreground/40">Nenhuma tarefa encontrada</h3>
            <p className="text-sm text-muted-foreground/40">Tente ajustar seus filtros de busca.</p>
          </div>
        )}
      </div>

      <TaskModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTask(null);
        }}
        onSuccess={fetchData}
        task={editingTask}
      />
    </div>
  );
}
