"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMetricas, getDashboardStats, getLeads } from "@/lib/supabase/queries";
import type { Metrica, Lead } from "@/types/database";
import { AnimatedCard } from "@/components/shared/animated-card";
import { cn, formatCurrency } from "@/lib/utils";
import { MetricModal } from "@/components/financeiro/metric-modal";
import { PaymentList } from "@/components/financeiro/payment-list";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  Plus,
  Calendar,
  Wallet,
  Activity,
  RefreshCw,
  Zap,
  CreditCard,
  History
} from "lucide-react";

export default function FinanceiroPage() {
  const [metricas, setMetricas] = useState<Metrica[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState({
    mrr: 0,
    lucro: 0,
    despesas: 0,
    gastosDia: 0,
  });

  const fetchData = async () => {
    try {
      const [metricasData, statsData, leadsData] = await Promise.all([
        getMetricas(),
        getDashboardStats(),
        getLeads(),
      ]);
      setMetricas(metricasData);
      setStats(statsData);
      setLeads(leadsData);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSyncStripe = async () => {
    setIsSyncing(true);
    // Simulating deep sync with Stripe
    await new Promise(resolve => setTimeout(resolve, 2000));
    await fetchData();
    setIsSyncing(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-accent/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-accent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/50 animate-pulse">Calculando Fortuna...</p>
      </div>
    );
  }

  const roi = stats.gastosDia > 0 ? (stats.lucro / stats.gastosDia) * 100 : 0;
  const cpa = metricas.length > 0 ? stats.gastosDia / (metricas.length) : 0; 

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-20 px-4 md:px-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8 pt-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Activity className="w-5 h-5 text-accent" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground/90 uppercase">Finanças</h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
            Gestão estratégica de receita, ROI e investimentos em tráfego.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSyncStripe}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-3 bg-muted/10 hover:bg-muted/20 border border-border/50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group"
          >
            <RefreshCw className={cn("w-3 h-3 text-muted-foreground group-hover:text-accent transition-colors", isSyncing && "animate-spin")} />
            {isSyncing ? "Sincronizando..." : "Sincronizar Stripe"}
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group relative flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Plus className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Inserir Dados</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedCard variant="glow" delay={0.1} className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-24 h-24 text-accent" />
          </div>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-accent/10 rounded-2xl">
              <Wallet className="w-6 h-6 text-accent" />
            </div>
            <div className="px-2 py-1 bg-success/10 text-success text-[10px] font-black rounded-lg flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              12.5%
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Faturamento (MRR)</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-foreground">{formatCurrency(stats.mrr)}</span>
            <span className="text-xs text-muted-foreground font-black">/mês</span>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.2} className="relative group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-success/10 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div className="px-2 py-1 bg-success/20 text-success text-[10px] font-black rounded-lg">
              SAUDÁVEL
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Lucro Líquido</p>
          <p className="text-3xl font-black text-foreground">{formatCurrency(stats.lucro)}</p>
        </AnimatedCard>

        <AnimatedCard delay={0.3} className="relative group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-rose-500/10 rounded-2xl">
              <TrendingDown className="w-6 h-6 text-rose-500" />
            </div>
            <div className="px-2 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black rounded-lg">
              MANTER
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Despesas Fixas</p>
          <p className="text-3xl font-black text-foreground">{formatCurrency(stats.despesas)}</p>
        </AnimatedCard>

        <AnimatedCard delay={0.4} variant="gradient" className="relative group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <Target className="w-6 h-6 text-blue-500" />
            </div>
            <div className="px-2 py-1 bg-blue-500/20 text-blue-500 text-[10px] font-black rounded-lg">
              ROI {roi.toFixed(1)}%
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Investimento Dia</p>
          <p className="text-3xl font-black text-foreground">{formatCurrency(stats.gastosDia)}</p>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Performance Visualization */}
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-card p-8 min-h-[500px] flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-accent rounded-full" />
                <h2 className="text-xl font-black uppercase tracking-tight">Performance 15 Dias</h2>
              </div>
              <div className="flex bg-muted/10 p-1 rounded-xl border border-border/50">
                {['RECEITA', 'LUCRO'].map((type) => (
                  <button key={type} className={cn(
                    "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                    type === 'RECEITA' ? "bg-accent text-white shadow-xl shadow-accent/20" : "text-muted-foreground"
                  )}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 flex items-end justify-between gap-1.5 relative pt-10 px-4">
              {/* Reference Lines */}
              <div className="absolute inset-0 flex flex-col justify-between py-10 pointer-events-none opacity-10">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full h-[1px] bg-foreground border-t border-dashed border-foreground" />
                ))}
              </div>

              {metricas.slice(0, 15).reverse().map((m, i) => {
                const maxVal = Math.max(...metricas.map(met => met.receita), 1);
                const heightRec = (m.receita / maxVal) * 100;
                const heightLuc = (m.lucro / maxVal) * 100;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center group/item h-full justify-end relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-4 opacity-0 group-hover/item:opacity-100 transition-all pointer-events-none scale-90 group-hover/item:scale-100 bg-foreground text-background p-3 rounded-xl text-[10px] font-black shadow-2xl z-10 w-32 border border-white/10">
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground/60">REC:</span>
                        <span>{formatCurrency(m.receita)}</span>
                      </div>
                      <div className="flex justify-between text-accent">
                        <span>LUC:</span>
                        <span>{formatCurrency(m.lucro)}</span>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-foreground" />
                    </div>

                    <div className="w-full flex flex-col items-stretch h-full justify-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightRec}%` }}
                        className="w-full bg-accent/20 border-x border-t border-accent/30 rounded-t-sm group-hover/item:bg-accent/40 transition-all flex flex-col justify-end overflow-hidden"
                      >
                         <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(heightLuc / heightRec) * 100}%` }}
                            className="w-full bg-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] min-h-[2px]"
                          />
                      </motion.div>
                    </div>
                    
                    <span className="text-[8px] font-black text-muted-foreground/40 mt-4 block whitespace-nowrap -rotate-45 md:rotate-0">
                      {new Date(m.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* New Payment List Section */}
          <div className="glass-card p-8">
            <PaymentList leads={leads} />
          </div>
        </div>

        {/* Sidebar info */}
        <div className="lg:col-span-4 space-y-8">
          {/* Recent metrics history */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                <History className="w-4 h-4" />
                Histórico Recente
              </h3>
              <button className="text-[10px] font-black text-accent hover:underline uppercase tracking-widest">Ver Tudo</button>
            </div>
            
            <div className="space-y-3">
              {metricas.slice(0, 4).map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="group flex flex-col gap-3 p-4 glass-card hover:border-accent/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border/50 text-xs font-black">
                        {new Date(m.data).getDate()}
                      </div>
                      <span className="text-sm font-bold opacity-80 uppercase tracking-tighter">
                        {new Date(m.data).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-black text-foreground">{formatCurrency(m.receita)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/20">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-success" />
                      <span className="text-[9px] font-black text-success/80">LUCRO: {formatCurrency(m.lucro)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span className="text-[9px] font-black text-rose-500/80">ADS: {formatCurrency(m.gastos_dia)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stripe Status Card */}
          <div className="relative group">
            <div className="absolute inset-x-0 -top-px h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="glass-card p-6 border-dashed border-accent/20">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-[#635BFF]/10 rounded-xl">
                  <CreditCard className="w-5 h-5 text-[#635BFF]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] font-black text-success uppercase tracking-widest">Monitorando</span>
                </div>
              </div>
              <h4 className="text-sm font-black uppercase tracking-tight mb-2">Conectado ao Stripe</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
                Flowra Labs account está sincronizada. Assinaturas e pagamentos são atualizados em tempo real.
              </p>
              <div className="flex items-center gap-4 py-3 border-y border-border/30 mb-4">
                <div className="flex-1">
                  <span className="block text-[8px] font-black text-muted-foreground/60 uppercase">Subscrições</span>
                  <span className="text-sm font-bold">128 ativas</span>
                </div>
                <div className="flex-1 border-l border-border/30 pl-4">
                  <span className="block text-[8px] font-black text-muted-foreground/60 uppercase">Chur rate</span>
                  <span className="text-sm font-bold text-rose-500">2.1%</span>
                </div>
              </div>
              <button className="w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-[#635BFF] hover:bg-[#635BFF]/5 rounded-xl transition-colors">
                Ver faturas no Stripe
              </button>
            </div>
          </div>
        </div>
      </div>

      <MetricModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData}
      />
    </div>
  );
}
