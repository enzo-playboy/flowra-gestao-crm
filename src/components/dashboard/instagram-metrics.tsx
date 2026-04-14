"use client";

import { AnimatedCard } from "@/components/shared/animated-card";
import { Instagram, MessageCircle, UserPlus } from "lucide-react";

export function InstagramMetrics() {
  const metrics = [
    { label: "Engajamento", value: "--", icon: Instagram },
    { label: "Novos Leads via DM", value: "--", icon: UserPlus },
    { label: "Taxa de Resposta", value: "--", icon: MessageCircle },
  ];

  return (
    <AnimatedCard delay={0.45}>
      <h3 className="text-sm font-medium text-muted mb-4">Metricas Instagram</h3>
      <div className="space-y-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-accent/10 rounded">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm text-muted">{metric.label}</span>
              </div>
              <span className="text-sm font-mono">{metric.value}</span>
            </div>
          );
        })}
      </div>
    </AnimatedCard>
  );
}
