"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/modal";
import { createMetrica } from "@/lib/supabase/mutations";
import { 
  DollarSign, 
  TrendingDown, 
  BarChart3, 
  Calendar,
  Save,
  X,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";

interface MetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MetricModal({ isOpen, onClose, onSuccess }: MetricModalProps) {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [receita, setReceita] = useState("");
  const [despesas, setDespesas] = useState("");
  const [gastosDia, setGastosDia] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const receitaVal = parseFloat(receita) || 0;
      const despesasVal = parseFloat(despesas) || 0;
      const gastosDiaVal = parseFloat(gastosDia) || 0;
      const lucro = receitaVal - despesasVal - gastosDiaVal;

      await createMetrica({
        data,
        receita: receitaVal,
        lucro,
        despesas: despesasVal,
        gastos_dia: gastosDiaVal
      });

      onSuccess();
      onClose();
      // Reset form
      setReceita("");
      setDespesas("");
      setGastosDia("");
    } catch (error) {
      console.error("Erro ao salvar métrica:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lançar Métrica Diária"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <div className="space-y-4">
          {/* Data */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
              <Calendar className="w-3 h-3 text-accent" />
              Data do Lançamento
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-4 py-3 bg-muted/10 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all [color-scheme:dark]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Receita */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                <DollarSign className="w-3 h-3 text-success" />
                Receita Bruta (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={receita}
                onChange={(e) => setReceita(e.target.value)}
                placeholder="0,00"
                className="w-full px-4 py-3 bg-muted/10 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all"
                required
              />
            </div>

            {/* Gastos Dia (Ads/CPA) */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                <TrendingDown className="w-3 h-3 text-rose-500" />
                Gastos com Tráfego (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={gastosDia}
                onChange={(e) => setGastosDia(e.target.value)}
                placeholder="0,00"
                className="w-full px-4 py-3 bg-muted/10 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all"
                required
              />
            </div>
          </div>

          {/* Outras Despesas */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
              <BarChart3 className="w-3 h-3 text-orange-500" />
              Outras Despesas (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={despesas}
              onChange={(e) => setDespesas(e.target.value)}
              placeholder="0,00"
              className="w-full px-4 py-3 bg-muted/10 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all"
              required
            />
          </div>

          {/* Quick Summary View */}
          <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-accent/60">Estimativa de Lucro Diário</span>
            <span className="text-xl font-black text-accent font-mono">
              R$ {((parseFloat(receita) || 0) - (parseFloat(despesas) || 0) - (parseFloat(gastosDia) || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-black text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-accent text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? "Salvando..." : "Salvar Lançamento"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
