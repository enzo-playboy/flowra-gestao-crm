"use client";

import { AnimatedCard } from "@/components/shared/animated-card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface FinancialSummaryProps {
  gastosDia: number;
  lucro: number;
  despesas: number;
}

export function FinancialSummary({ gastosDia, lucro, despesas }: FinancialSummaryProps) {
  const items = [
    { label: "Gastos do Dia", value: formatCurrency(gastosDia), icon: DollarSign, color: "text-muted" },
    { label: "Despesas", value: formatCurrency(despesas), icon: TrendingDown, color: "text-danger" },
    { label: "Lucro", value: formatCurrency(lucro), icon: TrendingUp, color: "text-success" },
  ];

  return (
    <AnimatedCard delay={0.5}>
      <h3 className="text-sm font-medium text-muted mb-4">Resumo Financeiro</h3>
      <div className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-accent/10 rounded">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-sm text-muted">{item.label}</span>
              </div>
              <span className={`text-sm font-mono ${item.color}`}>{item.value}</span>
            </div>
          );
        })}
      </div>
    </AnimatedCard>
  );
}
