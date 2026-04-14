import { ProjectList } from "@/components/projetos/project-list";

export default function ProjetosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Projetos</h2>
        <p className="text-muted mt-1">Acompanhe o progresso dos seus projetos</p>
      </div>
      <ProjectList />
    </div>
  );
}
