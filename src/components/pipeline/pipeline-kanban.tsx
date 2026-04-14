"use client";

import { useEffect, useState } from "react";
import { AnimatedCard } from "@/components/shared/animated-card";
import { getLeads } from "@/lib/supabase/queries";
import type { Lead, PipelineStatus } from "@/types/database";
import { getStatusColor } from "@/lib/utils";
import { Mail, Phone, Instagram } from "lucide-react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const columns: { id: PipelineStatus; label: string }[] = [
  { id: "novo", label: "Novo" },
  { id: "contato", label: "Contato" },
  { id: "qualificado", label: "Qualificado" },
  { id: "proposta", label: "Proposta" },
  { id: "fechado", label: "Fechado" },
];

interface PipelineLead extends Lead {
  pipeline_status: PipelineStatus;
}

export function PipelineKanban() {
  const [leads, setLeads] = useState<PipelineLead[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getLeads();
        const pipelineLeads: PipelineLead[] = data.map((lead) => ({
          ...lead,
          pipeline_status: (lead.status as PipelineStatus) || "novo",
        }));
        setLeads(pipelineLeads);
      } catch (error) {
        console.error("Erro ao carregar leads:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const overColumn = columns.find((col) => col.id === over.id);
    if (!overColumn) return;

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === active.id ? { ...lead, pipeline_status: overColumn.id as PipelineStatus } : lead
      )
    );
  }

  if (loading) {
    return <p className="text-muted">Carregando pipeline...</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.map((column) => {
          const columnLeads = leads.filter((l) => l.pipeline_status === column.id);
          return (
            <div key={column.id} className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">{column.label}</h3>
                <span className="text-xs text-muted bg-card px-2 py-0.5 rounded-full">
                  {columnLeads.length}
                </span>
              </div>
              <SortableContext items={columnLeads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <div
                  className="min-h-[200px] p-2 bg-card/50 rounded-xl border border-border border-dashed"
                  data-column-id={column.id}
                >
                  {columnLeads.map((lead, index) => (
                    <SortableLeadCard key={lead.id} lead={lead} index={index} />
                  ))}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
    </DndContext>
  );
}

function SortableLeadCard({ lead, index }: { lead: PipelineLead; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const leadName = (lead.name || "");

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-2 last:mb-0 cursor-grab active:cursor-grabbing">
      <AnimatedCard delay={0} className="p-3">
        <h4 className="font-bold text-xs truncate flex-1 group-hover:text-accent transition-colors mb-2">
          {leadName || "Sem Nome"}
        </h4>
        <div className="space-y-1">
          {lead.email && (
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Mail className="w-3 h-3" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          {lead.instagram && (
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Instagram className="w-3 h-3" />
              {lead.instagram}
            </div>
          )}
        </div>
        {(lead.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {lead.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-accent/10 text-accent">
                {tag}
              </span>
            ))}
          </div>
        )}
      </AnimatedCard>
    </div>
  );
}
