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

interface RevenueVsGoalsProps {
  metricas: Metrica[];
}

export function RevenueVsGoals({ metricas }: RevenueVsGoalsProps) {
  const data = metricas.slice(0, 7).reverse().map((m) => ({
    data: new Date(m.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    receita: m.receita,
    meta: m.receita * 1.2,
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
    <AnimatedCard delay={0.35} className="col-span-2">
      <h3 className="text-sm font-medium text-muted mb-4">Receita vs Meta</h3>
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
  );
}
