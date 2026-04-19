"use client";

import { useEffect, useState } from "react";
import { AnimatedCard } from "@/components/shared/animated-card";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardsProps {
  stats: {
    totalLeads: number;
    leadsQualificados: number;
    tarefasPendentes: number;
    reunioesHoje: number;
    mrr: number;
    conversao: number;
    totalMensagens: number;
    gastosDia: number;
    lucro: number;
    despesas: number;
  };
}

function AnimatedCounter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toFixed(decimals)}</span>;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Total de Leads",
      value: stats.totalLeads,
      icon: Users,
      delay: 0,
      type: "number" as const,
    },
    {
      label: "Leads Qualificados",
      value: stats.leadsQualificados,
      icon: UserCheck,
      delay: 0.05,
      type: "number" as const,
    },
    {
      label: "Taxa de Conversao",
      value: stats.conversao,
      icon: TrendingUp,
      delay: 0.1,
      type: "percent" as const,
    },
    {
      label: "MRR",
      value: stats.mrr,
      icon: DollarSign,
      delay: 0.15,
      type: "currency" as const,
    },
    {
      label: "Reunioes Hoje",
      value: stats.reunioesHoje,
      icon: Calendar,
      delay: 0.2,
      type: "number" as const,
    },
    {
      label: "Follow-ups Pendentes",
      value: stats.tarefasPendentes,
      icon: Clock,
      delay: 0.25,
      type: "number" as const,
    },
    {
      label: "Mensagens Respondidas",
      value: stats.totalMensagens,
      icon: MessageSquare,
      delay: 0.3,
      type: "number" as const,
    },
  ];

  const formatValue = (card: (typeof cards)[0]) => {
    switch (card.type) {
      case "currency":
        return formatCurrency(card.value);
      case "percent":
        return `${card.value.toFixed(1)}%`;
      default:
        return <AnimatedCounter value={card.value} />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <AnimatedCard key={card.label} delay={card.delay} variant="glass" magnetic>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted">{card.label}</p>
                <motion.p
                  className="text-2xl font-bold mt-1 font-mono"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: card.delay + 0.2 }}
                >
                  {formatValue(card)}
                </motion.p>
              </div>
              <motion.div
                className="p-2 bg-accent/10 rounded-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-5 h-5 text-accent" />
              </motion.div>
            </div>
          </AnimatedCard>
        );
      })}
    </div>
  );
}
