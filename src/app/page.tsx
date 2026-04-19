"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RevenueVsGoals } from "@/components/dashboard/revenue-vs-goals";
import { AiAgentMetrics } from "@/components/dashboard/ai-agent-metrics";
import { InstagramMetrics } from "@/components/dashboard/instagram-metrics";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { getDashboardStats, getMetricas, type DashboardStats } from "@/lib/supabase/queries";
import type { Metrica } from "@/types/database";
import { AnimatedCard } from "@/components/shared/animated-card";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/notifications/notification-provider";
import { Plus, TrendingUp, Zap } from "lucide-react";

function SkeletonCard() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-accent/10 rounded w-24" />
          <div className="h-8 bg-accent/10 rounded w-16" />
        </div>
        <div className="h-10 w-10 bg-accent/10 rounded-lg" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    leadsQualificados: 0,
    tarefasPendentes: 0,
    reunioesHoje: 0,
    mrr: 0,
    conversao: 0,
    totalMensagens: 0,
    gastosDia: 0,
    lucro: 0,
    despesas: 0,
  });
  const [metricas, setMetricas] = useState<Metrica[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, metricasData] = await Promise.all([
          getDashboardStats(),
          getMetricas(),
        ]);
        setStats(statsData);
        setMetricas(metricasData);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        addNotification({
          type: "error",
          title: "Erro ao carregar dados",
          message: "Nao foi possivel carregar as informacoes do dashboard.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [addNotification]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-accent/10 rounded animate-pulse" />
            <div className="h-4 w-48 bg-accent/10 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="flex items-center justify-between"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted mt-1">Visao geral do seu CRM</p>
        </div>
        <div className="flex gap-2">
          <Button variant="glass" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
          <Button variant="glow" size="sm">
            <Zap className="w-4 h-4 mr-2" />
            Acoes Rapidas
          </Button>
        </div>
      </motion.div>

      <StatsCards stats={stats} />

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-4 gap-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <RevenueVsGoals metricas={metricas} />
        <AiAgentMetrics />
        <InstagramMetrics />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <FinancialSummary gastosDia={stats.gastosDia} lucro={stats.lucro} despesas={stats.despesas} />
      </motion.div>

      {stats.totalLeads > 0 && stats.totalLeads % 10 === 0 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring" }}
        >
          <AnimatedCard variant="glow" className="text-center">
            <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="font-medium">Parabens! Voce atingiu {stats.totalLeads} leads!</p>
            <p className="text-sm text-muted mt-1">Continue assim para alcancar suas metas</p>
          </AnimatedCard>
        </motion.div>
      )}
    </motion.div>
  );
}
