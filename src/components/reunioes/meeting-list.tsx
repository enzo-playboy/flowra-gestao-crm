"use client";

import { useEffect, useState } from "react";
import { AnimatedCard } from "@/components/shared/animated-card";
import { getReunioes } from "@/lib/supabase/queries";
import { deleteReuniao, cancelReuniao, updateReuniao } from "@/lib/supabase/mutations";
import type { Reuniao } from "@/types/database";
import { getStatusColor, formatDateTime } from "@/lib/utils";
import { 
  Plus, 
  Calendar, 
  Tag, 
  AlertCircle, 
  Edit2, 
  Trash2, 
  XCircle, 
  FileText, 
  Clock, 
  MapPin,
  ChevronRight,
  MoreVertical,
  CalendarDays,
  UserPlus
} from "lucide-react";
import { MeetingModal } from "./meeting-modal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function MeetingList() {
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Reuniao | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesMeeting, setNotesMeeting] = useState<Reuniao | null>(null);
  const [notesText, setNotesText] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const data = await getReunioes();
      setReunioes(data);
    } catch (error) {
      console.error("Erro ao carregar reunioes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta reunião?")) return;
    const success = await deleteReuniao(id);
    if (success) {
      setReunioes((prev) => prev.filter((r) => r.id !== id));
    }
  }

  async function handleCancel(id: string) {
    const result = await cancelReuniao(id);
    if (result) {
      setReunioes((prev) => prev.map((r) => (r.id === id ? result : r)));
    }
  }

  function handleEdit(meeting: Reuniao) {
    setEditingMeeting(meeting);
    setShowModal(true);
  }

  function handleOpenNotes(meeting: Reuniao) {
    setNotesMeeting(meeting);
    setNotesText(meeting.notas || "");
    setShowNotesModal(true);
  }

  async function handleSaveNotes() {
    if (!notesMeeting) return;
    const result = await updateReuniao(notesMeeting.id, { notas: notesText });
    if (result) {
      setReunioes((prev) => prev.map((r) => (r.id === notesMeeting.id ? result : r)));
      setShowNotesModal(false);
      setNotesMeeting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse text-sm font-medium">Carregando sua agenda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-muted/5 p-4 rounded-2xl border border-border/40 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-accent" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground/80">{reunioes.length} Reuniões</span>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Agenda Semanal</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingMeeting(null);
            setShowModal(true);
          }}
          className="group flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 hover:shadow-accent/40 active:scale-95"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          Nova Reunião
        </button>
      </div>

      {reunioes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-border/50 rounded-3xl bg-muted/5 backdrop-blur-[2px] text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/10 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-semibold text-foreground/80 mb-1">Tudo calmo por aqui</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Você ainda não tem nenhuma reunião agendada. Que tal criar uma agora?
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-foreground/5 hover:bg-foreground/10 text-foreground text-sm font-bold rounded-xl transition-all border border-border/50"
          >
            Agendar Primeira Reunião
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {reunioes.map((reuniao, index) => (
              <motion.div
                key={reuniao.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="group relative glass-card p-5 hover:bg-white/[0.02] border-border/50 transition-all overflow-hidden">
                  {/* Decorative background pulse for active/today meetings */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-accent/10 transition-colors" />
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          reuniao.status === "agendada" ? "bg-warning animate-pulse" : 
                          reuniao.status === "confirmada" ? "bg-success" :
                          reuniao.status === "realizada" ? "bg-accent" : "bg-danger"
                        )} />
                        <h3 className="font-bold text-lg text-foreground/90 group-hover:text-accent transition-colors">
                          {reuniao.titulo}
                        </h3>
                        {reuniao.lead_nome && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
                            <UserPlus className="w-3.5 h-3.5 text-accent" />
                            <span className="text-accent font-bold text-xs">{reuniao.lead_nome}</span>
                          </div>
                        )}
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                          reuniao.status === "agendada" ? "bg-warning/10 text-warning border-warning/20" : 
                          reuniao.status === "confirmada" ? "bg-success/10 text-success border-success/20" :
                          reuniao.status === "realizada" ? "bg-accent/10 text-accent border-accent/20" : 
                          "bg-danger/10 text-danger border-danger/20"
                        )}>
                          {reuniao.status.replace("_", " ")}
                        </span>
                        {reuniao.created_by_agent && (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-accent-soft text-accent border border-accent/20">
                            Bot WhatsApp
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-sm text-muted-foreground font-medium mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-muted/5 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-accent/70" />
                          </div>
                          {formatDateTime(reuniao.data_hora)}
                        </div>
                        {reuniao.tipo && (
                          <div className="flex items-center gap-2.5 capitalize">
                            <div className="w-8 h-8 rounded-lg bg-muted/5 flex items-center justify-center">
                              <Tag className="w-4 h-4 text-accent/70" />
                            </div>
                            {reuniao.tipo}
                          </div>
                        )}
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-muted/5 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-accent/70" />
                          </div>
                          Online / Meet
                        </div>
                      </div>

                      {reuniao.necessidades && (
                        <p className="text-sm text-muted-foreground/80 line-clamp-2 bg-muted/5 p-3 rounded-xl border border-border/30 italic">
                          "{reuniao.necessidades}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 ml-6 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenNotes(reuniao)}
                        className="p-2.5 rounded-xl hover:bg-accent/10 hover:text-accent transition-all text-muted-foreground"
                        title="Notas detalhadas"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                      
                      {reuniao.status !== "cancelada" && reuniao.status !== "realizada" && (
                        <>
                          <button
                            onClick={() => handleEdit(reuniao)}
                            className="p-2.5 rounded-xl hover:bg-accent/10 hover:text-accent transition-all text-muted-foreground"
                            title="Editar reunião"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleCancel(reuniao.id)}
                            className="p-2.5 rounded-xl hover:bg-danger/10 hover:text-danger transition-all text-muted-foreground"
                            title="Cancelar reunião"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(reuniao.id)}
                        className="p-2.5 rounded-xl hover:bg-danger/10 hover:text-danger transition-all text-muted-foreground"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <MeetingModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingMeeting(null);
        }}
        onSuccess={fetchData}
        meeting={editingMeeting}
      />

      {/* Notes Modal refined with glassmorphism */}
      <AnimatePresence>
        {showNotesModal && notesMeeting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotesModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-card p-6 shadow-2xl border-accent/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-accent/10 rounded-2xl">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Notas de Reunião</h3>
                  <p className="text-xs text-muted-foreground font-medium">{notesMeeting.titulo}</p>
                </div>
              </div>
              
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Descreva as conclusões e próximos passos..."
                className="w-full px-5 py-4 bg-muted/10 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all resize-none min-h-[220px] placeholder:text-muted-foreground/30 font-medium"
              />
              
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="px-8 py-2.5 bg-accent text-white rounded-xl text-sm font-black shadow-lg shadow-accent/20 active:scale-95 transition-all"
                >
                  Salvar Notas
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
