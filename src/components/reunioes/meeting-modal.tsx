"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/shared/modal";
import { createReuniao, updateReuniao } from "@/lib/supabase/mutations";
import { getLeads, getReunioes } from "@/lib/supabase/queries";
import type { Reuniao, Lead } from "@/types/database";
import { 
  Search, 
  Calendar as CalendarIcon, 
  Type, 
  UserPlus, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ChevronRight,
  AtSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  meeting?: Reuniao | null;
}

export function MeetingModal({ isOpen, onClose, onSuccess, meeting }: MeetingModalProps) {
  const [titulo, setTitulo] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [tipo, setTipo] = useState<"problema" | "venda" | "outro">("venda");
  const [necessidades, setNecessidades] = useState("");
  const [leadId, setLeadId] = useState<string>("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadSearch, setLeadSearch] = useState("");
  const [showLeadResults, setShowLeadResults] = useState(false);
  const [loading, setLoading] = useState(false);
  
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
    if (meeting) {
      setTitulo(meeting.titulo);
      setDataHora(meeting.data_hora ? meeting.data_hora.slice(0, 16) : "");
      setTipo(meeting.tipo);
      setNecessidades(meeting.necessidades || "");
      setLeadId(meeting.lead_id || "");
    } else {
      setTitulo("");
      setDataHora("");
      setTipo("venda");
      setNecessidades("");
      setLeadId("");
    }
    setLeadSearch("");
    setShowLeadResults(false);
    setShowMentionList(false);
  }, [meeting, isOpen]);

  const filteredLeadsForInput = leads.filter((lead) => {
    const term = leadSearch.replace("@", "").toLowerCase().trim();
    return (lead.name ?? "").toLowerCase().includes(term);
  });

  const filteredLeadsForMention = leads.filter((lead) => {
    const term = mentionSearch.replace("@", "").toLowerCase();
    return (lead.name ?? "").toLowerCase().includes(term);
  });

  const selectedLead = leads.find((l) => l.id === leadId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataHora) return;

    setLoading(true);
    try {
      const selectedDate = new Date(dataHora);
      
      // Validation: Check for meetings within 30 minutes
      const existingMeetings = await getReunioes();
      const conflict = existingMeetings.find(m => {
        if (meeting && m.id === meeting.id) return false; // Ignore current meeting if editing
        const mDate = new Date(m.data_hora);
        const diffInMinutes = Math.abs(selectedDate.getTime() - mDate.getTime()) / (1000 * 60);
        return diffInMinutes < 30;
      });

      if (conflict) {
        alert(`Conflito de horário! Existe uma reunião ("${conflict.titulo}") agendada para ${new Date(conflict.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Por favor, escolha um horário com pelo menos 30 minutos de diferença.`);
        setLoading(false);
        return;
      }

      const payload: any = {
        titulo,
        data_hora: selectedDate.toISOString(),
        tipo,
        necessidades,
        lead_id: leadId || null,
      };

      if (meeting) {
        await updateReuniao(meeting.id, payload);
      } else {
        await createReuniao(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar reuniao:", error);
      alert("Erro ao salvar reunião. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const selectionStart = e.target.selectionStart;
    setNecessidades(value);
    setCursorPos(selectionStart);

    // Detect @ mention
    const textBeforeCursor = value.substring(0, selectionStart);
    const lastAtIdx = textBeforeCursor.lastIndexOf("@");

    if (lastAtIdx !== -1) {
      const query = textBeforeCursor.substring(lastAtIdx + 1);
      // Check if there's no space between @ and cursor
      if (!query.includes(" ")) {
        setMentionSearch(query);
        setShowMentionList(true);
        return;
      }
    }
    setShowMentionList(false);
  };

  const handleSelectMention = (lead: Lead) => {
    const textBeforeAt = necessidades.substring(0, necessidades.lastIndexOf("@", cursorPos - 1));
    const textAfterCursor = necessidades.substring(cursorPos);
    
    const newValue = `${textBeforeAt}@${lead.name}${textAfterCursor}`;
    setNecessidades(newValue);
    setLeadId(lead.id);
    setShowMentionList(false);
    
    // Focus back and set cursor
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = textBeforeAt.length + lead.name.length + 1;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={meeting ? "Editar Reunião" : "Nova Reunião"}
      size="lg"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Título */}
          <div className="space-y-2 col-span-full">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 ml-1">
              <Type className="w-4 h-4 text-accent" />
              Título da Reunião
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Alinhamento de Vendas"
              className="w-full px-4 py-3 bg-muted/10 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all placeholder:text-muted-foreground/50"
              required
            />
          </div>

          {/* Data e Hora */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 ml-1">
              <CalendarIcon className="w-4 h-4 text-accent" />
              Data e Hora
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={dataHora}
                onChange={(e) => setDataHora(e.target.value)}
                className="w-full px-4 py-3 bg-muted/10 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all [color-scheme:dark]"
                required
              />
            </div>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 ml-1">
              <Clock className="w-4 h-4 text-accent" />
              Tipo de Reunião
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as "problema" | "venda" | "outro")}
              className="w-full px-4 py-3 bg-muted/10 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all appearance-none"
            >
              <option value="venda">💼 Venda</option>
              <option value="problema">🛠️ Problema / Suporte</option>
              <option value="outro">✨ Outro</option>
            </select>
          </div>
        </div>

        {/* Vincular a Lead */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 ml-1">
            <UserPlus className="w-4 h-4 text-accent" />
            Vincular a Lead
          </label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              value={leadSearch}
              onFocus={() => setShowLeadResults(true)}
              onChange={(e) => {
                setLeadSearch(e.target.value);
                setShowLeadResults(true);
              }}
              placeholder="Pesquisar lead por nome ou @mencionar abaixo..."
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
                          <p className="text-xs font-medium opacity-50">Nenhum lead encontrado para "{leadSearch}"</p>
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
                className="flex items-center justify-between px-4 py-2.5 bg-accent/10 border border-accent/20 rounded-2xl"
              >
                <div className="flex items-center gap-2 text-sm text-accent font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Lead vinculado: {selectedLead.name}
                </div>
                <button
                  type="button"
                  onClick={() => setLeadId("")}
                  className="text-xs text-muted-foreground hover:text-danger hover:bg-danger/10 px-2 py-1 rounded-lg transition-all"
                >
                  Remover
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Necessidades com Mention */}
        <div className="space-y-2 relative">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 ml-1">
            <MessageSquare className="w-4 h-4 text-accent" />
            Necessidades e Observações
            <span className="text-[10px] text-muted-foreground font-normal ml-auto flex items-center gap-1">
              <AtSign className="w-3 h-3" /> Use @ para vincular lead
            </span>
          </label>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={necessidades}
              onChange={handleTextareaChange}
              placeholder="Descreva o que será discutido..."
              className="w-full px-4 py-3 bg-muted/10 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all resize-none min-h-[140px] placeholder:text-muted-foreground/50"
              rows={4}
            />

            {/* Mention Popup */}
            <AnimatePresence>
              {showMentionList && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: -10, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="absolute bottom-full left-0 z-50 w-64 mb-2 glass-card shadow-2xl overflow-hidden border-accent/20"
                >
                  <div className="p-1 uppercase text-[10px] font-bold text-accent/60 tracking-wider bg-accent/5 px-3 py-1.5 border-b border-border/50">
                    Vincular Lead
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1">
                    {filteredLeadsForMention.map((lead) => (
                      <button
                        key={lead.id}
                        type="button"
                        onClick={() => handleSelectMention(lead)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent/20 rounded-lg transition-all flex items-center gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                          {lead.name.charAt(0)}
                        </div>
                        <span className="truncate">{lead.name}</span>
                      </button>
                    ))}
                    {filteredLeadsForMention.length === 0 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground italic">
                        Sem resultados...
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-gradient-to-r from-accent to-accent/80 text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </div>
            ) : meeting ? "Salvar Alterações" : "Criar Reunião"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
