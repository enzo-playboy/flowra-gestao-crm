"use client";

import { motion } from "framer-motion";
import { CreditCard, CheckCircle2, XCircle, Clock, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Lead } from "@/types/database";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PaymentListProps {
  leads: Lead[];
}

export function PaymentList({ leads }: PaymentListProps) {
  const [search, setSearch] = useState("");

  const filteredLeads = leads
    .filter(lead => lead.payment_status && lead.payment_status !== "pendente") // Show those who interacted with billing
    .filter(lead => lead.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const totalPaid = leads
    .filter(l => l.payment_status === "pago")
    .reduce((acc, curr) => acc + (curr.payment_value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-accent rounded-full" />
          <h2 className="text-xl font-black uppercase tracking-tight">Pagamentos de Clientes</h2>
          <span className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-black rounded-full">
            TOTAL: {formatCurrency(totalPaid)}
          </span>
        </div>
        
        <div className="relative group w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/10 border border-border/50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead, i) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="group flex flex-col md:flex-row md:items-center justify-between p-4 glass-card hover:border-accent/30 transition-all gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-lg",
                  lead.payment_status === "pago" 
                    ? "bg-success/20 border-success/30 text-success shadow-success/10" 
                    : "bg-rose-500/20 border-rose-500/30 text-rose-500 shadow-rose-500/10"
                )}>
                  {lead.payment_status === "pago" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-foreground/80 group-hover:text-foreground transition-colors">{lead.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <CreditCard className="w-3 h-3 text-muted-foreground/40" />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                      {lead.payment_status === "pago" ? "Pagamento Confirmado" : "Falha no Pagamento"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-8 pr-2">
                <div className="text-right">
                  <span className="block text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-0.5">Valor Bruto</span>
                  <span className="text-sm font-black text-foreground">{formatCurrency(lead.payment_value || 0)}</span>
                </div>
                
                <div className="text-right border-l border-border/20 pl-6">
                  <span className="block text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-0.5">Data</span>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Clock className="w-3 h-3 text-muted-foreground/40" />
                    <span className="text-[10px] font-black opacity-60 uppercase tracking-tighter">
                      {new Date(lead.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border/50 rounded-3xl bg-muted/5">
            <CreditCard className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">Nenhum pagamento registrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
