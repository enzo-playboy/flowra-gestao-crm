"use client";

import { useEffect, useState } from "react";
import { AnimatedCard } from "@/components/shared/animated-card";
import { getProjetos } from "@/lib/supabase/queries";
import type { Projeto } from "@/types/database";
import { getStatusColor } from "@/lib/utils";
import { Plus, Globe, Workflow, Calendar } from "lucide-react";

export function ProjectList() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getProjetos();
        setProjetos(data);
      } catch (error) {
        console.error("Erro ao carregar projetos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <p className="text-muted">Carregando projetos...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{projetos.length} projetos</span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Projeto
        </button>
      </div>

      {showForm && <ProjectForm onSuccess={() => setShowForm(false)} />}

      {projetos.length === 0 ? (
        <p className="text-muted text-center py-12">Nenhum projeto encontrado</p>
      ) : (
        <div className="space-y-4">
          {projetos.map((projeto, index) => (
            <AnimatedCard key={projeto.id} delay={index * 0.05}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium">{projeto.nome}</h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(projeto.status)}`}>
                    {projeto.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <ProgressBar
                  icon={Globe}
                  label="Site Antigravity"
                  progress={projeto.progresso_site}
                />
                <ProgressBar
                  icon={Workflow}
                  label="Automacao n8n"
                  progress={projeto.progresso_automacao}
                />
                <ProgressBar
                  icon={Calendar}
                  label="Reunioes com Cliente"
                  progress={projeto.progresso_reunioes}
                />
              </div>
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
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-accent" />
          <span className="text-sm text-muted">{label}</span>
        </div>
        <span className="text-sm font-mono">{progress}%</span>
      </div>
      <div className="w-full bg-background rounded-full h-2">
        <div
          className="bg-accent h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function ProjectForm({ onSuccess }: { onSuccess: () => void }) {
  const [nome, setNome] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ nome });
    onSuccess();
  };

  return (
    <AnimatedCard>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do Projeto</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            required
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onSuccess}
            className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Criar Projeto
          </button>
        </div>
      </form>
    </AnimatedCard>
  );
}
