"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatedCard } from "@/components/shared/animated-card";
import { getProjetos } from "@/lib/supabase/queries";
import { createProjeto, updateProjeto } from "@/lib/supabase/mutations";
import type { Projeto } from "@/types/database";
import { getStatusColor } from "@/lib/utils";
import { Plus, Globe, Workflow, Calendar, Loader2, Edit2, Save, X, ChevronRight, ExternalLink } from "lucide-react";
import { useNotification } from "@/components/notifications/notification-provider";

export function ProjectList({ leadId: propLeadId, initialName: propInitialName }: { leadId?: string, initialName?: string } = {}) {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProjeto, setEditingProjeto] = useState<Projeto | null>(null);
  const searchParams = useSearchParams();
  const leadId = propLeadId || searchParams.get("leadId");
  const initialName = propInitialName || searchParams.get("name");

  const refreshProjects = async () => {
    try {
      let data = await getProjetos();
      if (leadId) {
        const filtered = data.filter(p => p.lead_id === leadId);
        if (filtered.length > 0) {
          setProjetos(filtered);
          return;
        }
      }
      setProjetos(data);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) {
      setShowForm(true);
    }
  }, [leadId]);

  useEffect(() => {
    refreshProjects();
  }, [leadId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Projetos</h2>
        <button
          onClick={() => {
            setEditingProjeto(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Projeto
        </button>
      </div>

      {(showForm || editingProjeto) && (
        <ProjectForm 
          key={editingProjeto?.id || "new"}
          initialData={editingProjeto || { 
            nome: initialName || "", 
            lead_id: leadId || "",
            status: "planejamento",
            progresso_site: 0,
            progresso_automacao: 0,
            progresso_reunioes: 0
          } as Partial<Projeto>} 
          isEditing={!!editingProjeto}
          onSuccess={() => {
            setShowForm(false);
            setEditingProjeto(null);
            setLoading(true);
            refreshProjects();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingProjeto(null);
          }}
        />
      )}

      {projetos.length === 0 ? (
        <AnimatedCard>
          <div className="text-center py-12">
            <p className="text-muted">Nenhum projeto encontrado</p>
          </div>
        </AnimatedCard>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {projetos.map((projeto, index) => (
            <AnimatedCard key={projeto.id} delay={index * 0.05} className="group">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{projeto.nome}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(projeto.status)}`}>
                      {projeto.status}
                    </span>
                  </div>
                  {projeto.obsidian_link && (
                    <a 
                      href={projeto.obsidian_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-accent flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Documentação no Obsidian
                    </a>
                  )}
                </div>
                <button 
                  onClick={() => setEditingProjeto(projeto)}
                  className="p-2 rounded-lg bg-muted/20 text-muted hover:text-accent hover:bg-accent/10 transition-all opacity-0 group-hover:opacity-100"
                  title="Editar Projeto"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ProgressBar
                  icon={Globe}
                  label="Site Antigravity"
                  progress={projeto.progresso_site}
                />
                <ProgressBar
                  icon={Workflow}
                  label="Automação n8n"
                  progress={projeto.progresso_automacao}
                />
                <ProgressBar
                  icon={Calendar}
                  label="Reuniões Cliente"
                  progress={projeto.progresso_reunioes}
                />
              </div>

              {(projeto.site_atividades || projeto.n8n_automacao || projeto.agente_ia) && (
                <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {projeto.site_atividades && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted uppercase">Atividades Site</p>
                      <p className="text-xs line-clamp-2 text-muted-foreground">{projeto.site_atividades}</p>
                    </div>
                  )}
                  {projeto.n8n_automacao && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted uppercase">Fluxos n8n</p>
                      <p className="text-xs line-clamp-2 text-muted-foreground">{projeto.n8n_automacao}</p>
                    </div>
                  )}
                  {projeto.agente_ia && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted uppercase">Agente IA</p>
                      <p className="text-xs line-clamp-2 text-muted-foreground">{projeto.agente_ia}</p>
                    </div>
                  )}
                </div>
              )}
            </AnimatedCard>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ icon: Icon, label, progress }: { icon: React.ElementType; label: string; progress: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-accent" />
          </div>
          <span className="text-xs font-medium text-muted">{label}</span>
        </div>
        <span className="text-xs font-bold">{progress}%</span>
      </div>
      <div className="w-full bg-muted/20 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-accent h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function ProjectForm({ 
  onSuccess, 
  onCancel,
  initialData,
  isEditing = false
}: { 
  onSuccess: () => void;
  onCancel: () => void;
  initialData: Partial<Projeto>;
  isEditing?: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Projeto>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome?.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (isEditing && formData.id) {
        const { error } = await updateProjeto(formData.id, formData);
        if (error) throw error;
        addNotification({
          type: "success",
          title: "Projeto atualizado",
          message: `O projeto "${formData.nome}" foi atualizado com sucesso.`,
        });
      } else {
        const { error } = await createProjeto(formData);
        if (error) throw error;
        addNotification({
          type: "success",
          title: "Projeto criado",
          message: `O projeto "${formData.nome}" foi criado com sucesso.`,
        });
      }
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao salvar projeto:", error);
      addNotification({
        type: "error",
        title: "Erro ao salvar",
        message: error.message || "Ocorreu um erro ao salvar o projeto.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedCard className="border-2 border-accent/20">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-accent uppercase tracking-wider text-sm">
            {isEditing ? "Editar Projeto" : "Novo Projeto"}
          </h3>
          <button type="button" onClick={onCancel} className="text-muted hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase mb-1.5 ml-1">Nome do Projeto</label>
              <input
                type="text"
                value={formData.nome || ""}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                placeholder="Ex: Novo Site - Flowra Labs"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted uppercase mb-1.5 ml-1">Status</label>
              <select
                value={formData.status || "planejamento"}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-all"
                disabled={isSubmitting}
              >
                <option value="planejamento">Planejamento</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted uppercase mb-1.5 ml-1">Link do Obsidian</label>
              <input
                type="url"
                value={formData.obsidian_link || ""}
                onChange={(e) => setFormData({...formData, obsidian_link: e.target.value})}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-all"
                placeholder="https://publish.obsidian.md/..."
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-4 bg-muted/5 p-4 rounded-xl border border-border/50">
            <p className="text-[10px] font-bold text-muted uppercase mb-2">Progresso (%)</p>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[10px] font-medium">Site Antigravity</label>
                  <span className="text-[10px] font-bold">{formData.progresso_site}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={formData.progresso_site || 0}
                  onChange={(e) => setFormData({...formData, progresso_site: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[10px] font-medium">Automação n8n</label>
                  <span className="text-[10px] font-bold">{formData.progresso_automacao}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={formData.progresso_automacao || 0}
                  onChange={(e) => setFormData({...formData, progresso_automacao: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[10px] font-medium">Reuniões Cliente</label>
                  <span className="text-[10px] font-bold">{formData.progresso_reunioes}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={formData.progresso_reunioes || 0}
                  onChange={(e) => setFormData({...formData, progresso_reunioes: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-[10px] font-bold text-muted uppercase mb-1.5 ml-1">Atividades do Site</label>
            <textarea
              value={formData.site_atividades || ""}
              onChange={(e) => setFormData({...formData, site_atividades: e.target.value})}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-accent min-h-[80px] resize-none"
              placeholder="Descreva as atividades..."
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted uppercase mb-1.5 ml-1">Automação n8n</label>
            <textarea
              value={formData.n8n_automacao || ""}
              onChange={(e) => setFormData({...formData, n8n_automacao: e.target.value})}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-accent min-h-[80px] resize-none"
              placeholder="Descreva os fluxos..."
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted uppercase mb-1.5 ml-1">Agente IA</label>
            <textarea
              value={formData.agente_ia || ""}
              onChange={(e) => setFormData({...formData, agente_ia: e.target.value})}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-accent min-h-[80px] resize-none"
              placeholder="Instruções do agente..."
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-2 bg-accent text-white rounded-lg text-sm font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? "SALVAR ALTERAÇÕES" : "CRIAR PROJETO"}
              </>
            )}
          </button>
        </div>
      </form>
    </AnimatedCard>
  );
}
