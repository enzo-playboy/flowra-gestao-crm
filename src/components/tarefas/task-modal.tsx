"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/shared/modal";
import { createTarefa, updateTarefa } from "@/lib/supabase/mutations";
import { getLeads } from "@/lib/supabase/queries";
import type { Tarefa, Lead } from "@/types/database";
import { 
  Type, 
  AlignLeft, 
  BarChart3, 
  Calendar, 
  UserPlus, 
  CheckCircle2, 
  X, 
  ChevronRight,
  AlertCircle,
  Clock,
  AtSign,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: Tarefa | null;
}

export function TaskModal({ isOpen, onClose, onSuccess, task }: TaskModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dificuldade, setDificuldade] = useState<"facil" | "medio" | "dificil">("medio");
  const [dataVencimento, setDataVencimento] = useState("");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  
  // Lead Search State
  const [leadSearch, setLeadSearch] = useState("");
  const [showLeadResults, setShowLeadResults] = useState(false);
  
  // Mention states
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLeads();
    }
  }, [isOpen]);

  async function fetchLeads() {
    const data = await getLeads();
    setLeads(data);
  }

  useEffect(() => {
    if (task) {
      setTitulo(task.titulo);
      setDescricao(task.descricao || "");
      setDificuldade(task.dificuldade);
      setDataVencimento(task.data_vencimento ? task.data_vencimento.slice(0, 16) : "");
      setLeadId(task.lead_id || null);
    } else {
      setTitulo("");
      setDescricao("");
      setDificuldade("medio");
      setDataVencimento("");
      setLeadId(null);
    }
    setLeadSearch("");
    setShowLeadResults(false);
    setShowMentionList(false);
  }, [task, isOpen]);

  const handleDescricaoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const pos = e.target.selectionStart ?? 0;
    setDescricao(value);
    setCursorPos(pos);

    const textBeforeCursor = value.slice(0, pos);
    const atIndex = textBeforeCursor.lastIndexOf("@");

    if (atIndex !== -1) {
      const afterAt = textBeforeCursor.slice(atIndex + 1);
      const hasSpaceAfterAt = afterAt.includes(" ");
      if (!hasSpaceAfterAt) {
        setMentionSearch(afterAt);
        setShowMentionList(true);
        return;
      }
    }
    setShowMentionList(false);
  };

  const insertLeadMention = (lead: Lead) => {
    const textBeforeAt = descricao.substring(0, descricao.lastIndexOf("@", cursorPos - 1));
    const textAfterCursor = descricao.substring(cursorPos);
    const mention = `@${lead.name} `;

    const newDescricao = textBeforeAt + mention + textAfterCursor;
    setDescricao(newDescricao);
    setLeadId(lead.id);
    setShowMentionList(false);

    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = textBeforeAt.length + mention.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const filteredLeadsForInput = leads.filter((lead) =>
    (lead.name ?? "").toLowerCase().includes(leadSearch.toLowerCase())
  );

  const filteredLeadsForMention = leads.filter((lead) =>
    (lead.name ?? "").toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const selectedLead = leads.find((l) => l.id === leadId);

  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorStatus(null);
    try {
      const data = {
        titulo,
        descricao,
        dificuldade,
        data_vencimento: dataVencimento ? new Date(dataVencimento).toISOString() : null,
        lead_id: leadId || null,
      };

      let result;
      if (task) {
        result = await updateTarefa(task.id, data);
      } else {
        result = await createTarefa(data as any);
      }

      if (!result) {
        throw new Error("Falha ao salvar no banco de dados. Verifique se a tabela 'tarefas' existe.");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar tarefa:", error);
      setErrorStatus(error.message || "Erro desconhecido ao salvar tarefa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? "Editar Tarefa" : "Nova Tarefa"}
      size="lg"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorStatus && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-medium"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {errorStatus}
          </motion.div>
        )}
        {/* Título */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 ml-1">
            <Type className="w-4 h-4 text-accent" />
            Título da Tarefa
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="O que precisa ser feito?"
            className="w-full px-4 py-3 bg-muted/10 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all placeholder:text-muted-foreground/30"
            required
          />
        </div>

        {/* Descrição com Mentions */}
        <div className="space-y-2 relative">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 ml-1">
            <AlignLeft className="w-4 h-4 text-accent" />
            Descrição <span className="text-[10px] text-muted-foreground uppercase tracking-widest ml-auto">(use @ para mencionar)</span>
          </label>
          <div className="relative group">
            <textarea
              ref={textareaRef}
              value={descricao}
              onChange={handleDescricaoChange}
              placeholder="Detalhes da tarefa..."
              className="w-full px-4 py-3 bg-muted/10 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all min-h-[100px] resize-none placeholder:text-muted-foreground/30"
            />
            
            <AnimatePresence>
              {showMentionList && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute left-0 bottom-full mb-2 w-64 glass-card shadow-2xl z-20 border border-accent/20 overflow-hidden"
                >
                  <div className="p-1 max-h-48 overflow-y-auto">
                    {filteredLeadsForMention.map((lead) => (
                      <button
                        key={lead.id}
                        type="button"
                        onClick={() => insertLeadMention(lead)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent/10 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <AtSign className="w-3 h-3 text-accent" />
                        <span className="truncate flex-1">{lead.name}</span>
                      </button>
                    ))}
                    {filteredLeadsForMention.length === 0 && (
                      <div className="p-3 text-xs text-muted-foreground text-center">Nenhum lead encontrado</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dificuldade */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 ml-1">
              <BarChart3 className="w-4 h-4 text-accent" />
              Dificuldade
            </label>
            <div className="flex p-1 bg-muted/10 border border-border/50 rounded-2xl gap-1">
              {(["facil", "medio", "dificil"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDificuldade(d)}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                    dificuldade === d 
                      ? "bg-accent text-white shadow-lg shadow-accent/20" 
                      : "text-muted-foreground hover:bg-muted/20"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Vencimento */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 ml-1">
              <Clock className="w-4 h-4 text-accent" />
              Vencimento
            </label>
            <input
              type="datetime-local"
              value={dataVencimento}
              onChange={(e) => setDataVencimento(e.target.value)}
              className="w-full px-4 py-3 bg-muted/10 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Vincular Lead */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 ml-1">
            <UserPlus className="w-4 h-4 text-accent" />
            Vincular a Lead
          </label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              value={leadSearch}
              onFocus={() => setShowLeadResults(true)}
              onChange={(e) => {
                setLeadSearch(e.target.value);
                setShowLeadResults(true);
              }}
              placeholder="Pesquisar lead para vincular..."
              className="w-full pl-11 pr-4 py-3 bg-muted/10 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all placeholder:text-muted-foreground/30"
            />
            
            <AnimatePresence>
              {showLeadResults && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-0"
                    onClick={() => setShowLeadResults(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-10 w-full mt-2 glass-card overflow-hidden shadow-2xl border border-accent/20"
                  >
                    <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
                      {filteredLeadsForInput.map((lead) => (
                        <button
                          key={lead.id}
                          type="button"
                          onClick={() => {
                            setLeadId(lead.id);
                            setLeadSearch("");
                            setShowLeadResults(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-accent/10 rounded-xl transition-all flex items-center justify-between group"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground/80">{lead.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{lead.status}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </button>
                      ))}
                      {filteredLeadsForInput.length === 0 && (
                        <div className="px-4 py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                          <AlertCircle className="w-6 h-6 opacity-20" />
                          <p className="text-xs font-medium opacity-50">Nenhum lead encontrado</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {selectedLead && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between px-4 py-3 bg-accent/5 border border-accent/20 rounded-2xl"
              >
                <div className="flex items-center gap-3 text-sm text-accent font-bold">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  Lead vinculado: {selectedLead.name}
                </div>
                <button
                  type="button"
                  onClick={() => setLeadId(null)}
                  className="p-1.5 rounded-xl hover:bg-accent/10 transition-colors text-accent/50 hover:text-accent"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? "Salvando..." : task ? "Salvar Alterações" : "Criar Tarefa"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
