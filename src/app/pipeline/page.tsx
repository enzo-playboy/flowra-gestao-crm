import { PipelineKanban } from "@/components/pipeline/pipeline-kanban";

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Pipeline</h2>
        <p className="text-muted mt-1">Visualize seus leads no funil de vendas</p>
      </div>
      <PipelineKanban />
    </div>
  );
}
