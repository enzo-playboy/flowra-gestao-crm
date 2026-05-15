"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatedCard } from "@/components/shared/animated-card";
import { getAnotacoes, getAnotacoesByLeadId, getLeads } from "@/lib/supabase/queries";
import type { Anotacao, Lead } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { Plus, Search, StickyNote, Trash2, X, Image as ImageIcon, Paperclip, Save, Calendar, Clock, ChevronRight, Loader2, ExternalLink, User } from "lucide-react";
import { createAnotacao, deleteAnotacao, updateAnotacao } from "@/lib/supabase/mutations";
import { supabase } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";

interface NoteListProps {
  leadId?: string;
}

export function NoteList({ leadId }: NoteListProps = {}) {
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Anotacao | null>(null);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = leadId ? await getAnotacoesByLeadId(leadId) : await getAnotacoes();
      setAnotacoes(data);
    } catch (error) {
      console.error("Erro ao carregar anotações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [leadId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir esta anotação?")) return;
    const success = await deleteAnotacao(id);
    if (success) {
      setAnotacoes((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const filtered = anotacoes.filter(
    (a) =>
      a.titulo.toLowerCase().includes(search.toLowerCase()) ||
      a.conteudo.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted/40 group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar insights ou pensamentos estratégicos..."
            className="w-full pl-14 pr-6 h-16 bg-zinc-100/50 dark:bg-zinc-900/40 border-none rounded-2xl text-lg focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all placeholder:text-muted/40 font-medium"
          />
        </div>
        {!showForm && !editingNote && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-3 px-8 h-16 bg-accent text-white rounded-2xl text-base font-bold hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 active:scale-95 shrink-0"
          >
            <Plus className="w-6 h-6" />
            NOVO INSIGHT
          </button>
        )}
      </div>

      {/* Modern Form Section */}
      {(showForm || editingNote) && (
        <NoteForm 
          initialData={editingNote} 
          onSuccess={() => {
            setShowForm(false);
            setEditingNote(null);
            fetchData();
          }} 
          onCancel={() => {
            setShowForm(false);
            setEditingNote(null);
          }}
        />
      )}

      {/* Grid Display */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-[40px] border-2 border-dashed border-border/40">
          <div className="w-20 h-20 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <StickyNote className="w-10 h-10 text-muted/30" />
          </div>
          <h3 className="text-xl font-bold text-muted/60">Sua mente está limpa</h3>
          <p className="text-muted/40 mt-2">Clique em 'Novo Insight' para registrar uma ideia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((anotacao, index) => (
            <AnimatedCard 
              key={anotacao.id} 
              delay={index * 0.05} 
              onClick={() => {
                setEditingNote(anotacao);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group cursor-pointer border-none bg-white dark:bg-zinc-900 shadow-sm hover:shadow-2xl hover:shadow-accent/10 transition-all p-6 rounded-[32px] overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-accent/0 group-hover:bg-accent transition-colors" />
              
              <div className="flex flex-col gap-6 h-full font-sans">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-accent/5 dark:bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-500">
                    <StickyNote className="w-7 h-7" />
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, anotacao.id)}
                    className="opacity-0 group-hover:opacity-100 p-3 rounded-2xl hover:bg-danger/10 text-muted hover:text-danger transition-all duration-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 space-y-3">
                  <h3 className="font-black text-2xl tracking-tight leading-tight group-hover:text-accent transition-colors truncate">
                    {anotacao.titulo}
                  </h3>
                  <p className="text-base text-muted/70 line-clamp-3 leading-relaxed font-medium">
                    {anotacao.conteudo}
                  </p>

                  {anotacao.arquivos && anotacao.arquivos.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                       {anotacao.arquivos.slice(0, 3).map((arq, i) => (
                         <div key={i} className="w-8 h-8 rounded-lg overflow-hidden border border-border/20 bg-accent/5 flex items-center justify-center">
                            {arq.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <img src={arq} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Paperclip className="w-3.5 h-3.5 text-accent" />
                            )}
                         </div>
                       ))}
                       {anotacao.arquivos.length > 3 && (
                         <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black">
                            +{anotacao.arquivos.length - 3}
                         </div>
                       )}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-muted/40 uppercase tracking-widest leading-none">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(anotacao.updated_at)}
                  </div>
                  <ChevronRight className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteForm({ initialData, onSuccess, onCancel }: { 
  initialData?: Anotacao | null, 
  onSuccess: () => void,
  onCancel: () => void
}) {
  const [titulo, setTitulo] = useState(initialData?.titulo || "");
  const [conteudo, setConteudo] = useState(initialData?.conteudo || "");
  const [arquivos, setArquivos] = useState<string[]>(initialData?.arquivos || []);
  const [leadId, setLeadId] = useState<string | undefined>(initialData?.lead_id);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [mentionList, setMentionList] = useState<Lead[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionField, setMentionField] = useState<"titulo" | "conteudo" | null>(null);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tituloRef = useRef<HTMLInputElement>(null);
  const conteudoRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      const data = await getLeads();
      console.log("Leads carregados para marcação:", data.length);
      setAllLeads(data);
    };
    fetchLeads();
  }, []);

  useEffect(() => {
    if (initialData) {
      setTitulo(initialData.titulo);
      setConteudo(initialData.conteudo);
      setArquivos(initialData.arquivos || []);
      setLeadId(initialData.lead_id);
    }
  }, [initialData]);

  const handleTextChange = (field: "titulo" | "conteudo", value: string, element: HTMLInputElement | HTMLTextAreaElement) => {
    if (field === "titulo") setTitulo(value);
    else setConteudo(value);

    const selectionStart = element.selectionStart || 0;
    const textBeforeCursor = value.substring(0, selectionStart);
    const lastAt = textBeforeCursor.lastIndexOf("@");

    if (lastAt !== -1 && (lastAt === 0 || textBeforeCursor[lastAt - 1] === " ")) {
      const query = textBeforeCursor.substring(lastAt + 1);
      if (!query.includes(" ")) {
        setMentionQuery(query);
        setMentionField(field);
        setShowMentions(true);
        
        // Simple position calculation
        const rect = element.getBoundingClientRect();
        setMentionPosition({ 
          top: rect.top + window.scrollY - 100, 
          left: rect.left + (selectionStart * 8) % rect.width 
        });

        const filtered = allLeads.filter(l => 
          l.name.toLowerCase().includes(query.toLowerCase()) ||
          l.company?.toLowerCase().includes(query.toLowerCase())
        );
        setMentionList(filtered.slice(0, 5));
        console.log("Marcação detectada:", field, "Query:", query, "Resultados:", filtered.length);
        return;
      }
    }
    
    setShowMentions(false);
  };

  const selectLead = (lead: Lead) => {
    const field = mentionField;
    const value = field === "titulo" ? titulo : conteudo;
    const element = field === "titulo" ? tituloRef.current : conteudoRef.current;
    if (!element) return;

    const selectionStart = element.selectionStart || 0;
    const textBeforeCursor = value.substring(0, selectionStart);
    const textAfterCursor = value.substring(selectionStart);
    const lastAt = textBeforeCursor.lastIndexOf("@");

    const newValue = textBeforeCursor.substring(0, lastAt) + `@${lead.name} ` + textAfterCursor;
    
    if (field === "titulo") setTitulo(newValue);
    else setConteudo(newValue);

    setLeadId(lead.id);
    setShowMentions(false);
    element.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !conteudo.trim()) return;
    
    setLoading(true);
    try {
      if (initialData) {
        await updateAnotacao(initialData.id, { titulo, conteudo, arquivos, lead_id: leadId });
      } else {
        await createAnotacao({ titulo, conteudo, arquivos, lead_id: leadId });
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro crítico ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      try {
        const { data, error } = await supabase.storage
          .from('anotacoes')
          .upload(filePath, file);

        if (error) {
          if (error.message.includes("Bucket not found")) {
            alert("O bucket 'anotacoes' não foi encontrado. Por favor, crie-o no painel do Supabase com acesso público.");
            break;
          }
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('anotacoes')
          .getPublicUrl(filePath);

        newUrls.push(publicUrl);
      } catch (error) {
        console.error('Erro no upload:', error);
        alert('Erro ao fazer upload do arquivo.');
        break;
      }
    }

    setArquivos(prev => [...prev, ...newUrls]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setArquivos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <AnimatedCard className="border-none bg-zinc-100/80 dark:bg-zinc-950/40 backdrop-blur-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] rounded-[48px] p-8 mb-12 relative overflow-visible">
      <form onSubmit={handleSubmit} className="relative z-10 font-sans">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent/20">
                <StickyNote className="w-6 h-6" />
             </div>
             <div>
                <h2 className="text-3xl font-black tracking-tighter">
                  {initialData ? "Refinando Insight" : "Capturando Nova Ideia"}
                </h2>
                <p className="text-sm text-muted font-medium leading-none mt-1">Os insights moldam o sucesso do seu CRM.</p>
             </div>
          </div>
          <button type="button" onClick={onCancel} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-2xl transition-all shadow-sm">
            <X className="w-6 h-6 text-muted" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-3 relative">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-accent ml-1 font-sans">Contexto / Título</label>
              <input
                ref={tituloRef}
                type="text"
                value={titulo}
                onChange={(e) => handleTextChange("titulo", e.target.value, e.target)}
                placeholder="Ex: Estratégia Mensal..."
                className="w-full px-6 h-16 bg-zinc-50/50 dark:bg-zinc-100/10 border-none shadow-sm rounded-2xl text-lg font-bold focus:ring-4 focus:ring-accent/10 transition-all placeholder:text-muted/40"
                required
                autoFocus
              />
              <AnimatePresence>
                {showMentions && mentionField === "titulo" && mentionList.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-border/10 overflow-hidden z-[100]"
                  >
                    <div className="p-3 bg-accent/5 border-b border-border/10">
                      <p className="text-[10px] font-black text-accent uppercase tracking-widest">Marcar Cliente</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {mentionList.map((lead) => (
                        <button
                          key={lead.id}
                          type="button"
                          onClick={() => selectLead(lead)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent/5 transition-colors text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{lead.name}</p>
                            {lead.company && <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{lead.company}</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {initialData && (
              <div className="p-6 bg-zinc-50/50 dark:bg-zinc-100/10 rounded-3xl space-y-4 border border-border/20 font-sans">
                <h3 className="text-[10px] font-black text-muted uppercase tracking-widest">Linha do Tempo</h3>
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted" />
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Criado em</p>
                        <p className="text-xs font-bold leading-none">{new Date(initialData.created_at).toLocaleString()}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted" />
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Última Edição</p>
                        <p className="text-xs font-bold leading-none">{new Date(initialData.updated_at).toLocaleString()}</p>
                      </div>
                   </div>
                </div>
              </div>
            )}

            <div className="space-y-4 font-sans">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-accent ml-1">Anexos & Prévia</h3>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                multiple
                accept="image/*,application/pdf,.doc,.docx,.txt"
              />

              <div className="flex flex-col gap-2">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={uploading}
                  className="flex items-center justify-between w-full p-4 bg-zinc-50/50 dark:bg-zinc-100/10 rounded-2xl hover:bg-accent hover:text-white transition-all group border-none shadow-sm font-sans disabled:opacity-50"
                >
                   <div className="flex items-center gap-3">
                     {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5 text-muted group-hover:text-white" />}
                     <span className="text-sm font-bold">{uploading ? "Subindo..." : "Adicionar Arquivo"}</span>
                   </div>
                   <Plus className="w-4 h-4 opacity-40" />
                </button>
              </div>

              {arquivos.length > 0 && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {arquivos.map((url, i) => {
                    const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                    return (
                      <div key={i} className="relative group/file overflow-hidden rounded-2xl bg-zinc-50/50 dark:bg-zinc-900 border border-border/10 aspect-video shadow-sm">
                        {isImage ? (
                          <img src={url} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover/file:scale-110" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <Paperclip className="w-6 h-6 text-accent" />
                            <span className="text-[9px] font-black text-muted uppercase tracking-tighter">Documento</span>
                          </div>
                        )}
                        
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/file:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <a href={url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg flex items-center justify-center text-white transition-all">
                              <ExternalLink className="w-4 h-4" />
                           </a>
                           <button type="button" onClick={() => removeFile(i)} className="w-8 h-8 bg-danger/20 hover:bg-danger/40 backdrop-blur-md rounded-lg flex items-center justify-center text-white transition-all">
                              <X className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Content Column - Message Style */}
          <div className="lg:col-span-8 flex flex-col font-sans">
            <div className="space-y-3 flex-1 flex flex-col">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-accent ml-1 font-sans">Reflexão / Conteúdo</label>
              <div className="flex-1 relative group bg-zinc-50/50 dark:bg-zinc-100/10 rounded-[32px] shadow-2xl shadow-black/5 flex flex-col border-2 border-transparent focus-within:border-accent/30 transition-all font-sans">
                <textarea
                  ref={conteudoRef}
                  value={conteudo}
                  onChange={(e) => handleTextChange("conteudo", e.target.value, e.target)}
                  placeholder="Descreva seu insight aqui. Use @ para marcar um cliente..."
                  className="flex-1 w-full px-8 py-8 bg-transparent text-xl leading-relaxed focus:outline-none resize-none font-medium placeholder:text-muted/30"
                  required
                />

                <AnimatePresence>
                  {showMentions && mentionField === "conteudo" && mentionList.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-8 bottom-[calc(100%+10px)] w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-border/10 overflow-hidden z-[100]"
                    >
                      <div className="p-3 bg-accent/5 border-b border-border/10">
                        <p className="text-[10px] font-black text-accent uppercase tracking-widest">Marcar Cliente</p>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {mentionList.map((lead) => (
                          <button
                            key={lead.id}
                            type="button"
                            onClick={() => selectLead(lead)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent/5 transition-colors text-left group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold">{lead.name}</p>
                              {lead.company && <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{lead.company}</p>}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Save Footer inside "Message Box" */}
                <div className="p-6 bg-zinc-50/50 dark:bg-zinc-800/10 border-t border-border/10 flex items-center justify-between font-sans">
                   <p className="text-[10px] font-black text-muted/30 uppercase tracking-tighter">MODO DE EDIÇÃO ATIVO • AUTO-SAVE READY</p>
                   <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 h-12 text-sm font-black text-muted hover:text-foreground transition-all uppercase tracking-widest font-sans"
                      >
                        DESCARTAR
                      </button>
                      <button
                        type="submit"
                        disabled={loading || uploading}
                        className="px-10 h-12 bg-accent text-white rounded-2xl text-sm font-black hover:bg-accent/90 transition-all shadow-xl shadow-accent/30 active:scale-95 disabled:opacity-50 flex items-center gap-2 font-sans"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {initialData ? "ATUALIZAR INSIGHT" : "FIXAR IDEIA"}
                          </>
                        )}
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AnimatedCard>
  );
}
