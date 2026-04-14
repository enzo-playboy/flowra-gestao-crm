"use client";

import { Search, Filter, ArrowUpDown, Tag, CheckCircle2, LayoutGrid, Calendar, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  difficultyFilter: string;
  onDifficultyFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
}

export function TaskFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  difficultyFilter,
  onDifficultyFilterChange,
  sortBy,
  onSortByChange,
}: TaskFiltersProps) {
  return (
    <div className="space-y-6 bg-card/30 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-2xl shadow-accent/5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
            <Filter className="w-4 h-4 text-accent" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-foreground/80">Filtrar Tarefas</h2>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-accent transition-colors" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Pesquisar por título, descrição ou @lead..."
          className="w-full pl-11 pr-4 py-3.5 bg-muted/10 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all placeholder:text-muted-foreground/20 font-medium"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
            <CheckCircle2 className="w-3 h-3 text-accent/50" />
            Status
          </label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-muted/10 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all text-foreground/80 font-medium cursor-pointer"
            >
              <option value="">Todos os Status</option>
              <option value="pendente">Pendente</option>
              <option value="em_progresso">Em Progresso</option>
              <option value="concluido">Concluido</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
            <Tag className="w-3 h-3 text-accent/50" />
            Dificuldade
          </label>
          <div className="relative">
            <select
              value={difficultyFilter}
              onChange={(e) => onDifficultyFilterChange(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-muted/10 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all text-foreground/80 font-medium cursor-pointer"
            >
              <option value="">Qualquer Dificuldade</option>
              <option value="facil">Fácil</option>
              <option value="medio">Médio</option>
              <option value="dificil">Difícil</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
            <ArrowUpDown className="w-3 h-3 text-accent/50" />
            Ordenar por
          </label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-muted/10 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all text-foreground/80 font-medium cursor-pointer"
            >
              <option value="created_at">Data de Criação</option>
              <option value="data_vencimento">Data de Vencimento</option>
              <option value="dificuldade">Nível de Dificuldade</option>
              <option value="titulo">Título A-Z</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
