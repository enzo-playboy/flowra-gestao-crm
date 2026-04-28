"use client";

import { AnimatedCard } from "@/components/shared/animated-card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Metrica } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Modal } from "@/components/shared/modal";
import { Edit2, Save, Loader2 } from "lucide-react";
import { updateMetrica } from "@/lib/supabase/queries";
import { useNotification } from "@/components/notifications/notification-provider";

interface RevenueVsGoalsProps {
  metricas: Metrica[];
}

export function RevenueVsGoals({ metricas }: RevenueVsGoalsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();
  
  // Use the latest metric for editing
  const latestMetrica = metricas[0];
  const [formData, setFormData] = useState({
    receita: latestMetrica?.receita || 0,
    meta: latestMetrica?.meta || 0,
  });

  const handleSave = async () => {
    if (!latestMetrica) return;
    setLoading(true);
    try {
      await updateMetrica(latestMetrica.id, formData);
      addNotification({
        type: "success",
        title: "Metricas atualizadas",
        message: "Os valores de receita e meta foram salvos com sucesso.",
      });
      setIsEditing(false);
      // In a real app, you'd want to refresh the data here
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      addNotification({
        type: "error",
        title: "Erro ao salvar",
        message: "Nao foi possivel atualizar as metricas.",
      });
    } finally {
      setLoading(false);
    }
  };

  const data = metricas.slice(0, 7).reverse().map((m) => ({
    data: new Date(m.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    receita: m.receita,
    meta: m.meta || m.receita * 1.2, // Fallback if meta is 0
  }));

  if (data.length === 0) {
    return (
      <AnimatedCard delay={0.35}>
        <h3 className="text-sm font-medium text-muted mb-4">Receita vs Meta</h3>
        <p className="text-muted text-sm">Sem dados disponiveis</p>
      </AnimatedCard>
    );
  }

  return (
    <>
      <AnimatedCard delay={0.35} className="col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted">Receita vs Meta</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-foreground"
            title="Editar Metas"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="data" stroke="#71717A" fontSize={12} />
              <YAxis stroke="#71717A" fontSize={12} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#141416",
                  border: "1px solid #27272A",
                  borderRadius: "8px",
                  color: "#FAFAFA",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="receita" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Receita" />
              <Bar dataKey="meta" fill="#27272A" radius={[4, 4, 0, 0]} name="Meta" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AnimatedCard>

      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Ajustar Receita e Meta"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted mb-1.5 block">Receita Atual (R$)</label>
            <input
              type="number"
              value={formData.receita}
              onChange={(e) => setFormData({ ...formData, receita: Number(e.target.value) })}
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted mb-1.5 block">Meta do Mês (R$)</label>
            <input
              type="number"
              value={formData.meta}
              onChange={(e) => setFormData({ ...formData, meta: Number(e.target.value) })}
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
          </div>
          <p className="text-[10px] text-muted italic">
            * Estas alterações serão refletidas no gráfico após salvar.
          </p>
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-accent text-accent-foreground font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salvar Alterações
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
