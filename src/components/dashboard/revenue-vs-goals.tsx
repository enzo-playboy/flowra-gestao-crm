"use client";

import { AnimatedCard } from "@/components/shared/animated-card";
import {
  AreaChart,
  Area,
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
      <AnimatedCard delay={0.35} className="col-span-1 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted">Receita vs Meta</h3>
        </div>
        <div className="h-64 flex items-center justify-center border border-dashed border-white/5 rounded-xl bg-accent/5">
          <p className="text-muted text-sm">Sem dados disponíveis</p>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <>
      <AnimatedCard delay={0.35} className="col-span-1 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted">Receita vs Meta</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-all text-xs font-medium"
            title="Editar Metas"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Editar Metas
          </button>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#27272A" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#27272A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
              <XAxis dataKey="data" stroke="#71717A" fontSize={10} tickMargin={10} />
              <YAxis stroke="#71717A" fontSize={10} tickFormatter={(v) => formatCurrency(v)} tickMargin={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#141416",
                  border: "1px solid #27272A",
                  borderRadius: "8px",
                  color: "#FAFAFA",
                  fontSize: "12px",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area 
                type="monotone" 
                dataKey="meta" 
                stroke="#52525B" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorMeta)" 
                name="Meta" 
              />
              <Area 
                type="monotone" 
                dataKey="receita" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorReceita)" 
                name="Receita" 
              />
            </AreaChart>
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
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted mb-1.5 block">Meta do Mês (R$)</label>
            <input
              type="number"
              value={formData.meta}
              onChange={(e) => setFormData({ ...formData, meta: Number(e.target.value) })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
          </div>
          <p className="text-[10px] text-muted italic">
            * Estas alterações serão refletidas no gráfico após salvar.
          </p>
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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

