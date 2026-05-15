"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatedCard } from "@/components/shared/animated-card";
import { getLead, addLeadMessage, getLeadMessages, getProjetoByLeadId } from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";
import type { Lead } from "@/types/database";
import { getStatusColor, cn } from "@/lib/utils";
import { Mail, Phone, Instagram, Calendar, ArrowLeft, Send, User, Bot, Clock, Tag, Flame, Star, Save, X, Edit2, Loader2, Layout, MessageSquare, StickyNote, CheckSquare, FolderGit2 } from "lucide-react";
import Link from "next/link";
import { updateLead, getTarefasByLeadId, getAnotacoesByLeadId } from "@/lib/supabase/queries";
import { useNotification } from "@/components/notifications/notification-provider";
import { NoteList } from "@/components/anotacoes/note-list";
import { TaskList } from "@/components/tarefas/task-list";
import { ProjectList } from "@/components/projetos/project-list";
import { CustomSelect } from "@/components/shared/custom-select";
import { CallActionMenu } from "@/components/leads/call-action-menu";

interface LeadDetailProps {
  id: string;
}

export function LeadDetail({ id }: LeadDetailProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [projeto, setProjeto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [stats, setStats] = useState({
    notes: 0,
    tasks: 0,
    projects: 0,
    pendingTasks: 0
  });
  const [activeTab, setActiveTab] = useState<"mensagens" | "anotacoes" | "tarefas" | "projetos">("mensagens");
  const { addNotification } = useNotification();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const leadData = await getLead(id);
        setLead(leadData);
        if (leadData) {
          setFormData(leadData);
          const [messagesData, projetoData, tasksData, notesData] = await Promise.all([
            getLeadMessages(leadData.phone, leadData.instagram),
            getProjetoByLeadId(id),
            getTarefasByLeadId(id),
            getAnotacoesByLeadId(id)
          ]);
          setMessages(messagesData);
          setProjeto(projetoData);
          setStats({
            notes: notesData.length,
            tasks: tasksData.length,
            projects: projetoData ? 1 : 0,
            pendingTasks: tasksData.filter(t => t.status !== "concluido").length
          });
        }
      } catch (error) {
        console.error("Erro ao carregar lead:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Set up real-time listener if we have a lead ID (will filter inside once we have the lead's phone)
    let channel: any = null;
    
    // We can only subscribe to real-time events for this lead once we know the phone number.
    // The subscription is actually better placed in a separate useEffect that depends on lead?.phone
  }, [id]);

  useEffect(() => {
    if (!lead) return;

    // Supabase Realtime Subscription for both platforms
    const filter = lead.phone && lead.instagram 
      ? `or(whatsapp_id.eq.${lead.phone},instagram_id.eq.${lead.instagram})`
      : lead.phone 
      ? `whatsapp_id.eq.${lead.phone}`
      : `instagram_id.eq.${lead.instagram}`;

    const channel = supabase
      .channel('realtime_conversas')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversas',
        },
        (payload: any) => {
          const { whatsapp_id, instagram_id } = payload.new;
          const isMatch = (lead.phone && whatsapp_id === lead.phone) || 
                          (lead.instagram && instagram_id === lead.instagram);

          if (!isMatch) return;

          const nova_msg = {
            id: payload.new.id,
            role: payload.new.role || (payload.new.mensagem_ia ? "assistant" : "user"),
            content: payload.new.mensagem_ia || payload.new.mensagem_usuario,
            platform: payload.new.platform || (payload.new.whatsapp_id ? "whatsapp" : "instagram"),
            created_at: payload.new.created_at,
          };

          setMessages((prev) => {
            if (prev.some(m => m.id === nova_msg.id)) return prev;
            return [...prev, nova_msg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lead?.phone, lead?.instagram]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, lead?.id]); // Updated dependency to listen to messages changes too


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !lead) return;

    setSending(true);
    const message = {
      role: "admin", // Marcando como admin pois foi enviado pelo CRM
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    try {
      const platform = lead.phone ? "whatsapp" : "instagram";
      const savedMsg = await addLeadMessage(lead.phone, lead.instagram, { ...message, platform });
      if (savedMsg) {
        setMessages(prev => [...prev, savedMsg]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateLeadField = async (field: keyof Lead, value: any) => {
    if (!lead) return;
    try {
      const { data, error } = await updateLead(id, { [field]: value });
      if (data) {
        setLead(data);
        addNotification({
          type: "success",
          title: "Atualizado",
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} atualizado com sucesso.`,
        });
      } else {
        throw error;
      }
    } catch (error) {
      console.error(`Erro ao atualizar ${field}:`, error);
      addNotification({
        type: "error",
        title: "Erro",
        message: "Não foi possível atualizar o campo.",
      });
    }
  };

  const handleUpdateLead = async () => {
    if (!lead) return;
    setLoading(true);
    try {
      const dataToUpdate = { ...formData };
      if (dataToUpdate.email === "") dataToUpdate.email = undefined;
      if (dataToUpdate.phone === "") dataToUpdate.phone = undefined;
      if (dataToUpdate.instagram === "") dataToUpdate.instagram = undefined;

      const { data, error } = await updateLead(id, dataToUpdate);
      if (data) {
        setLead(data);
        setIsEditing(false);
        addNotification({
          type: "success",
          title: "Lead atualizado",
          message: "As informações foram salvas com sucesso.",
        });
      } else {
        console.error("Erro detalhado do banco:", error);
        addNotification({
          type: "error",
          title: "Erro ao salvar",
          message: error?.message || (typeof error === 'string' ? error : JSON.stringify(error)) || "O banco recusou a atualização.",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
      addNotification({
        type: "error",
        title: "Erro ao salvar",
        message: "Não foi possível atualizar as informações.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-24 bg-border rounded" />
        <div className="h-64 bg-card rounded-xl" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-6">
        <Link href="/leads" className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Voltar aos leads
        </Link>
        <AnimatedCard>
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-muted" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Lead não encontrado</h3>
              <p className="text-muted max-w-xs mx-auto mt-2">
                O lead que você está procurando não existe ou foi removido.
              </p>
            </div>
            <Link 
              href="/leads"
              className="inline-block px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              Ver todos os leads
            </Link>
          </div>
        </AnimatedCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/leads" className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Voltar aos leads
        </Link>
        
        <div className="flex items-center gap-3">
             <Link 
               href={`/projetos?leadId=${id}&name=${encodeURIComponent(lead.name || '')}`}
               className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 rounded-lg transition-all text-xs font-medium"
             >
               <Layout className="w-3.5 h-3.5" />
               {projeto ? "Ver Projeto" : "Criar Projeto"}
             </Link>

             <div className="flex items-center gap-2">
               <CustomSelect
                 options={[
                   { value: "novo", label: "NOVO", color: "text-muted-foreground" },
                   { value: "contato", label: "CONTATO", color: "text-accent" },
                   { value: "qualificado", label: "QUALIFICADO", color: "text-accent" },
                   { value: "proposta", label: "PROPOSTA", color: "text-indigo-500" },
                   { value: "fechado", label: "FECHADO", color: "text-success" },
                   { value: "cancelada", label: "CANCELADO", color: "text-danger" },
                 ]}
                 value={lead.status}
                 onChange={(val) => {
                    handleUpdateLeadField('status', val);
                 }}
                 className="w-36"
               />
             </div>
             {isEditing ? (
               <div className="flex gap-2">
                 <button 
                   onClick={() => setIsEditing(false)}
                   className="p-2 rounded-lg bg-muted/20 text-muted hover:text-foreground transition-colors"
                   title="Cancelar"
                 >
                   <X className="w-4 h-4" />
                 </button>
                 <button 
                   onClick={handleUpdateLead}
                   className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all text-xs font-bold shadow-lg shadow-accent/20"
                 >
                   <Save className="w-3.5 h-3.5" />
                   SALVAR
                 </button>
               </div>
             ) : (
               <button 
                 onClick={() => setIsEditing(true)}
                 className="flex items-center gap-2 px-4 py-2 bg-muted/10 text-muted hover:text-foreground hover:bg-muted/20 rounded-lg transition-all text-xs font-medium"
               >
                 <Edit2 className="w-3.5 h-3.5" />
                 Editar Lead
               </button>
             )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <AnimatedCard className="h-full">
            <div className="space-y-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-4 border-2 border-accent/20">
                  <span className="text-2xl font-bold text-accent">
                    {lead.name ? lead.name.charAt(0).toUpperCase() : "?"}
                  </span>
                </div>
                <h2 className="text-xl font-bold">{lead.name || "Lead sem nome"}</h2>
                <p className="text-sm text-muted">Lead desde {new Date(lead.created_at).toLocaleDateString('pt-BR')}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Contato</h3>
                <div className="space-y-3">
                  <div className="p-2 rounded-lg bg-accent/5 group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-muted">Email</p>
                    </div>
                    {isEditing ? (
                      <input 
                        type="email" 
                        value={formData.email || ""} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                      />
                    ) : (
                      <p className="text-sm truncate font-medium pl-11">{lead.email || "Não informado"}</p>
                    )}
                  </div>

                  <div className="p-2 rounded-lg bg-accent/5 group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-muted">WhatsApp / Tel</p>
                    </div>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.phone || ""} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                      />
                    ) : (
                      <p className="text-sm truncate font-medium pl-11">{lead.phone || "Não informado"}</p>
                    )}
                  </div>

                  <div className="p-2 rounded-lg bg-accent/5 group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                        <Instagram className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-muted">Instagram</p>
                    </div>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.instagram || ""} 
                        onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                      />
                    ) : (
                    <div className="text-sm font-medium pl-11 flex items-center justify-between group-hover:pr-2 transition-all">
                      <p className="truncate">{lead.instagram || "Não informado"}</p>
                      {lead.instagram && (
                        <button 
                          onClick={() => window.open(`https://instagram.com/${lead.instagram?.replace('@', '')}`, '_blank')}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-pink-500/10 text-pink-500 rounded-lg transition-all"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-2 rounded-xl bg-accent/5 hover:bg-accent/10 transition-colors group">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted">Ações Rápidas</span>
                    </div>
                  </div>
                  <CallActionMenu 
                    variant="full" 
                    leadId={lead.id} 
                    phone={lead.phone || null} 
                    leadName={lead.name || "Lead"} 
                  />
                </div>
                  
                  {/* Novos campos: Nicho e Estado */}
                  <div className="p-2 rounded-lg bg-accent/5 group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <Tag className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-muted">Nicho</p>
                    </div>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.nicho || ""} 
                        onChange={(e) => setFormData({...formData, nicho: e.target.value})}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                      />
                    ) : (
                      <p className="text-sm truncate font-medium pl-11">{lead.nicho || "Não informado"}</p>
                    )}
                  </div>

                  <div className="p-2 rounded-lg bg-accent/5 group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-muted">Estado / Cidade</p>
                    </div>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.estado || ""} 
                        onChange={(e) => setFormData({...formData, estado: e.target.value})}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                      />
                    ) : (
                      <p className="text-sm truncate font-medium pl-11">{lead.estado || "Não informado"}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Avaliação do Lead</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">Temperatura:</span>
                    <CustomSelect
                      options={[
                        { value: "frio", label: "FRIO", color: "text-blue-500", icon: <Flame className="w-3 h-3" /> },
                        { value: "morno", label: "MORNO", color: "text-yellow-500", icon: <Flame className="w-3 h-3" /> },
                        { value: "quente", label: "QUENTE", color: "text-orange-500", icon: <Flame className="w-3 h-3" /> },
                      ]}
                      value={lead.Temperatura?.toLowerCase() || "frio"}
                      onChange={(val) => handleUpdateLeadField('Temperatura', val)}
                      className="w-32"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">Nota:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-3.5 h-3.5 ${star <= (lead.score || 0) ? 'fill-yellow-500 text-yellow-500' : 'text-muted/30'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Atividade</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-accent/5 border border-accent/10 flex flex-col items-center justify-center gap-1">
                    <FolderGit2 className="w-4 h-4 text-indigo-500" />
                    <span className="text-lg font-bold">{stats.projects}</span>
                    <span className="text-[8px] text-muted uppercase font-black tracking-widest">Projetos</span>
                  </div>
                  <div className="p-3 rounded-xl bg-accent/5 border border-accent/10 flex flex-col items-center justify-center gap-1">
                    <CheckSquare className="w-4 h-4 text-green-500" />
                    <span className="text-lg font-bold">{stats.pendingTasks}</span>
                    <span className="text-[8px] text-muted uppercase font-black tracking-widest">Tarefas</span>
                  </div>
                  <div className="p-3 rounded-xl bg-accent/5 border border-accent/10 flex flex-col items-center justify-center gap-1">
                    <StickyNote className="w-4 h-4 text-amber-500" />
                    <span className="text-lg font-bold">{stats.notes}</span>
                    <span className="text-[8px] text-muted uppercase font-black tracking-widest">Anotações</span>
                  </div>
                  <div className="p-3 rounded-xl bg-accent/5 border border-accent/10 flex flex-col items-center justify-center gap-1">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="text-lg font-bold">{messages.length}</span>
                    <span className="text-[8px] text-muted uppercase font-black tracking-widest">Mensagens</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Financeiro</h3>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted">Status:</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      lead.payment_status === "pago" ? "bg-green-500/10 text-green-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {lead.payment_status || "PENDENTE"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">Investimento:</span>
                    <span className="text-sm font-bold text-foreground">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.payment_value || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Tabs Content */}
        <div className="lg:col-span-2 flex flex-col h-[600px] lg:h-[700px]">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 mb-4 bg-card/50 p-1.5 rounded-xl border border-border">
            <button
              onClick={() => setActiveTab("mensagens")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "mensagens" ? "bg-accent text-white shadow-md" : "text-muted hover:text-foreground hover:bg-muted/10"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Mensagens
            </button>
            <button
              onClick={() => setActiveTab("anotacoes")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "anotacoes" ? "bg-accent text-white shadow-md" : "text-muted hover:text-foreground hover:bg-muted/10"
              }`}
            >
              <StickyNote className="w-4 h-4" />
              Anotações
            </button>
            <button
              onClick={() => setActiveTab("tarefas")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "tarefas" ? "bg-accent text-white shadow-md" : "text-muted hover:text-foreground hover:bg-muted/10"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Tarefas
            </button>
            <button
              onClick={() => setActiveTab("projetos")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "projetos" ? "bg-accent text-white shadow-md" : "text-muted hover:text-foreground hover:bg-muted/10"
              }`}
            >
              <FolderGit2 className="w-4 h-4" />
              Projetos
            </button>
          </div>

          {activeTab === "mensagens" && (
            <AnimatedCard className="flex-1 flex flex-col p-0 overflow-hidden relative" delay={0.1}>
              <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <h3 className="font-medium">Histórico de Mensagens</h3>
                </div>
                <div className="text-xs text-muted">
                  {messages?.length || 0} mensagens trocadas
                </div>
              </div>
  
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
              >
                {messages && messages.length > 0 ? (
                  messages.map((msg: any, index: number) => {
                    const isAssistant = msg.role === "assistant";
                    const isAdmin = msg.role === "admin";
                    const isMeOrAI = isAssistant || isAdmin;
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex ${isMeOrAI ? "justify-end" : "justify-start"} animate-scale-in`}
                      >
                        <div className={`max-w-[80%] flex items-end gap-2 ${isMeOrAI ? "flex-row-reverse" : "flex-row"}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                            isAssistant ? "bg-purple-500 text-white" : 
                            isAdmin ? "bg-accent text-white" : 
                            "bg-muted text-muted-foreground"
                          }`}>
                            {isAssistant ? <Bot className="w-4 h-4" /> : 
                             isAdmin ? <User className="w-4 h-4" /> : 
                             <User className="w-4 h-4" />}
                          </div>
                          <div className={`group relative p-3 rounded-2xl text-sm ${
                            isAdmin 
                              ? "bg-accent text-white rounded-br-none shadow-lg shadow-accent/20" 
                              : isAssistant
                              ? "bg-purple-500 text-white rounded-br-none shadow-lg shadow-purple-500/20"
                              : "bg-muted/30 text-foreground rounded-bl-none border border-border"
                          }`}>
                            <div className="flex items-center justify-between gap-4 mb-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wider opacity-70`}>
                                {isAdmin ? "VOCÊ" : isAssistant ? "IA FLOWRA" : lead.name?.split(' ')[0] || "LEAD"}
                              </span>
                              {msg.platform && (
                                <div className="opacity-40">
                                  {msg.platform === 'whatsapp' ? <Phone className="w-2.5 h-2.5" /> : <Instagram className="w-2.5 h-2.5" />}
                                </div>
                              )}
                            </div>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <span className={`text-[10px] block mt-1 opacity-50 ${isMeOrAI ? "text-right" : "text-left"}`}>
                              {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted space-y-2">
                    <Calendar className="w-8 h-8 opacity-20" />
                    <p className="text-sm">Nenhuma mensagem registrada</p>
                  </div>
                )}
              </div>
  
              <form 
                onSubmit={handleSendMessage}
                className="p-4 border-t border-border bg-muted/10 rounded-b-xl"
              >
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escreva uma mensagem ou nota sobre o contato..."
                    className="w-full bg-[#FAFAFA] text-[#0A0A0B] border border-border rounded-xl pl-4 pr-24 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm placeholder:text-muted-foreground"
                    disabled={sending}
                  />
                  <div className="absolute right-2 flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="flex items-center gap-2 px-4 py-1.5 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-bold"
                    >
                      {sending ? (
                        <Clock className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <span>ENVIAR</span>
                          <Send className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-muted mt-2 text-center">
                  As mensagens enviadas aqui ficarão registradas no histórico do lead no Flowra CRM.
                </p>
              </form>
            </AnimatedCard>
          )}

          {activeTab === "anotacoes" && (
            <div className="flex-1 overflow-y-auto p-1">
              <NoteList leadId={id} />
            </div>
          )}

          {activeTab === "tarefas" && (
            <div className="flex-1 overflow-y-auto p-1">
              <TaskList leadId={id} />
            </div>
          )}

          {activeTab === "projetos" && (
            <div className="flex-1 overflow-y-auto p-1">
              <ProjectList leadId={id} initialName={lead.name || ""} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
