"use client";

import { AnimatedCard } from "@/components/shared/animated-card";
import { Bot, Instagram, Zap, Clock, CheckCircle2, AlertCircle, Settings, ArrowLeft, Save, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Modal } from "@/components/shared/modal";
import { getAgentes, updateAgente } from "@/lib/supabase/queries";
import type { Agente } from "@/types/database";
import { useNotification } from "@/components/notifications/notification-provider";

export function AgentStatus() {
  const [agents, setAgents] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agente | null>(null);
  const [view, setView] = useState<"details" | "config">("details");
  const [isSaving, setIsSaving] = useState(false);
  const { addNotification } = useNotification();

  // Local form state
  const [configForm, setConfigForm] = useState({
    nome: "",
    instrucoes: "",
    status: "ativo" as "ativo" | "inativo",
  });

  useEffect(() => {
    async function fetchData() {
      const data = await getAgentes();
      setAgents(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      setConfigForm({
        nome: selectedAgent.nome,
        instrucoes: selectedAgent.instrucoes,
        status: selectedAgent.status,
      });
      setView("details");
    }
  }, [selectedAgent]);

  const handleSaveConfig = async () => {
    if (!selectedAgent) return;
    setIsSaving(true);
    try {
      await updateAgente(selectedAgent.id, configForm);
      addNotification({
        type: "success",
        title: "Agente atualizado",
        message: "As configuracoes do agente foram salvas.",
      });
      // Refresh local state
      setAgents(agents.map(a => a.id === selectedAgent.id ? { ...a, ...configForm } : a));
      setView("details");
      setSelectedAgent(prev => prev ? { ...prev, ...configForm } : null);
    } catch (error) {
      console.error(error);
      addNotification({
        type: "error",
        title: "Erro ao salvar",
        message: "Nao foi possivel atualizar o agente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getAgentIcon = (tipo: string) => {
    return tipo === "whatsapp" ? Bot : Instagram;
  };

  const getAgentColor = (tipo: string) => {
    return tipo === "whatsapp" ? "text-success" : "text-accent";
  };

  if (loading) {
    return (
      <AnimatedCard delay={0.35} className="lg:col-span-2 animate-pulse">
        <div className="h-4 w-32 bg-accent/10 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-20 bg-accent/10 rounded-xl" />
          <div className="h-20 bg-accent/10 rounded-xl" />
        </div>
      </AnimatedCard>
    );
  }

  return (
    <>
      <AnimatedCard delay={0.35} className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-medium text-muted">Status dos Agentes</h3>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/10 border border-success/20">
            <motion.div 
              className="w-1.5 h-1.5 rounded-full bg-success"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[10px] font-bold text-success uppercase tracking-wider">Sistemas Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent, i) => {
            const Icon = getAgentIcon(agent.tipo);
            const color = getAgentColor(agent.tipo);
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedAgent(agent)}
                className="p-4 rounded-xl bg-accent/5 border border-white/5 flex items-start gap-4 hover:bg-accent/10 transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div className={`p-2.5 rounded-lg bg-background/50 border border-white/5 ${color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold truncate">{agent.nome}</h4>
                    <span className={`text-[10px] ${agent.status === 'ativo' ? 'text-success' : 'text-muted'} font-medium flex items-center gap-1`}>
                      <Zap className={`w-2.5 h-2.5 ${agent.status === 'ativo' ? 'fill-success' : 'fill-muted'}`} />
                      {agent.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1 truncate">
                    {agent.tipo === 'whatsapp' ? 'Atendimento & Agendamento' : 'Comentarios & Posts'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatedCard>

      <Modal
        isOpen={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
        title={selectedAgent?.nome || ""}
      >
        <AnimatePresence mode="wait">
          {view === "details" ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 p-4 rounded-xl bg-accent/5 border border-white/5">
                <div className={`p-3 rounded-xl bg-background border border-white/5 ${getAgentColor(selectedAgent?.tipo || "")}`}>
                  {selectedAgent && (
                    <div className="w-8 h-8 flex items-center justify-center">
                      {selectedAgent.tipo === 'whatsapp' ? <Bot className="w-8 h-8" /> : <Instagram className="w-8 h-8" />}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {selectedAgent?.tipo === 'whatsapp' ? 'Atendimento & Agendamento' : 'Comentarios & Posts'}
                  </p>
                  <p className="text-xs text-muted mt-1">{selectedAgent?.instrucoes.substring(0, 100)}...</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-accent/5 border border-white/5 text-center">
                  <p className="text-[10px] text-muted uppercase tracking-wider">Status</p>
                  <p className="text-sm font-bold mt-1 text-success capitalize">{selectedAgent?.status}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/5 border border-white/5 text-center">
                  <p className="text-[10px] text-muted uppercase tracking-wider">Ativo Desde</p>
                  <p className="text-sm font-bold mt-1">24 Abr</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/5 border border-white/5 text-center">
                  <p className="text-[10px] text-muted uppercase tracking-wider">Uso</p>
                  <p className="text-sm font-bold mt-1">85%</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  Atividade Recente
                </h4>
                <div className="space-y-2 text-xs text-muted">
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5" />
                    Processou {selectedAgent?.tipo === 'whatsapp' ? 'lead de WhatsApp' : 'comentario de Instagram'}
                  </div>
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5" />
                    Sistema em conformidade
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setView("config")}
                  className="flex-1 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Configurar Agente
                </button>
                <button className="flex-1 py-2 rounded-lg bg-white/5 text-sm font-semibold hover:bg-white/10 transition-colors">
                  Ver Logs
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="config"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <button 
                onClick={() => setView("details")}
                className="text-xs text-muted hover:text-foreground flex items-center gap-1 mb-2 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                Voltar aos detalhes
              </button>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted mb-1 block">Nome do Agente</label>
                  <input
                    type="text"
                    value={configForm.nome}
                    onChange={(e) => setConfigForm({ ...configForm, nome: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent/50 outline-none"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-muted mb-1 block">Instrucoes / Prompt</label>
                  <textarea
                    value={configForm.instrucoes}
                    onChange={(e) => setConfigForm({ ...configForm, instrucoes: e.target.value })}
                    rows={4}
                    className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent/50 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted mb-1 block">Status de Operacao</label>
                  <select
                    value={configForm.status}
                    onChange={(e) => setConfigForm({ ...configForm, status: e.target.value as any })}
                    className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent/50 outline-none"
                  >
                    <option value="ativo">Ativo - Respondendo</option>
                    <option value="inativo">Inativo - Pausado</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveConfig}
                    disabled={isSaving}
                    className="w-full py-2.5 rounded-xl bg-accent text-accent-foreground font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Salvar Configuracoes
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </>
  );
}
