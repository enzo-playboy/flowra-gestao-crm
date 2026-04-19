"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatedCard } from "@/components/shared/animated-card";
import { getLead, addLeadMessage } from "@/lib/supabase/queries";
import type { Lead } from "@/types/database";
import { getStatusColor } from "@/lib/utils";
import { Mail, Phone, Instagram, Calendar, ArrowLeft, Send, User, Bot, Clock, Tag, Flame, Star } from "lucide-react";
import Link from "next/link";

interface LeadDetailProps {
  id: string;
}

export function LeadDetail({ id }: LeadDetailProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getLead(id);
        setLead(data);
      } catch (error) {
        console.error("Erro ao carregar lead:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lead?.conversa]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !lead) return;

    setSending(true);
    const message = {
      role: "assistant",
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    try {
      const updatedLead = await addLeadMessage(lead.id, message);
      if (updatedLead) {
        setLead(updatedLead);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setSending(false);
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
             <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
               {lead.status.toUpperCase()}
             </span>
             <button className="text-xs text-muted hover:text-foreground transition-colors">
               Editar Lead
             </button>
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
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/5 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted">Email</p>
                        <p className="text-sm truncate font-medium">{lead.email}</p>
                      </div>
                    </a>
                  )}
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/5 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted">WhatsApp / Tel</p>
                        <p className="text-sm truncate font-medium">{lead.phone}</p>
                      </div>
                    </a>
                  )}
                  {lead.instagram && (
                    <a href={`https://instagram.com/${lead.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/5 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                        <Instagram className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted">Instagram</p>
                        <p className="text-sm truncate font-medium">{lead.instagram}</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Avaliação do Lead</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">Temperatura:</span>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                      lead.temperature === 'quente' ? 'bg-orange-500/10 text-orange-500' :
                      lead.temperature === 'morno' ? 'bg-yellow-500/10 text-yellow-600' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      <Flame className="w-3.5 h-3.5" />
                      {(lead.temperature || 'FRIO').toUpperCase()}
                    </div>
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

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Categorias / Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {(lead.tags ?? []).length > 0 ? (
                    (lead.tags ?? []).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-accent/10 text-accent border border-accent/20">
                        <Tag className="w-3 h-3" />
                        {tag.toUpperCase()}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted italic">Nenhuma tag adicionada</span>
                  )}
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Chat History */}
        <div className="lg:col-span-2 flex flex-col h-[600px] lg:h-[700px]">
          <AnimatedCard className="flex-1 flex flex-col p-0 overflow-hidden relative" delay={0.1}>
            <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <h3 className="font-medium">Histórico de Mensagens</h3>
              </div>
              <div className="text-xs text-muted">
                {lead.conversa?.length || 0} mensagens trocadas
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
              {lead.conversa && lead.conversa.length > 0 ? (
                lead.conversa.map((msg: any, index: number) => {
                  const isAssistant = msg.role === "assistant" || msg.role === "admin";
                  return (
                    <div 
                      key={index} 
                      className={`flex ${isAssistant ? "justify-end" : "justify-start"} animate-scale-in`}
                    >
                      <div className={`max-w-[80%] flex items-end gap-2 ${isAssistant ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isAssistant ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                        }`}>
                          {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div className={`group relative p-3 rounded-2xl text-sm ${
                          isAssistant 
                            ? "bg-accent text-white rounded-br-none shadow-lg" 
                            : "bg-muted/30 text-foreground rounded-bl-none border border-border"
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <span className={`text-[10px] block mt-1 opacity-50 ${isAssistant ? "text-right" : "text-left"}`}>
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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
        </div>
      </div>
    </div>
  );
}
