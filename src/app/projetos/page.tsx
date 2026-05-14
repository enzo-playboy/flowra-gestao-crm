import { ProjectList } from "@/components/projetos/project-list";
import { Suspense } from "react";

export default function ProjetosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Projetos</h2>
        <p className="text-muted mt-1">Acompanhe o progresso dos seus projetos</p>
      </div>
      <Suspense fallback={<p className="text-muted">Carregando projetos...</p>}>
        <ProjectList />
      </Suspense>
    </div>
  );
}
