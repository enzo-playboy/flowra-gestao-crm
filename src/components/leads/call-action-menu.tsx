"use client";

import { useState } from "react";
import { Phone, CheckCircle, Clock, XCircle, ChevronDown, MessageCircle } from "lucide-react";
import { updateLead, addLeadMessage } from "@/lib/supabase/queries";
import { useNotification } from "@/components/notifications/notification-provider";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CallActionMenuProps {
  leadId: string;
  phone: string | null;
  leadName: string;
  onActionComplete?: () => void;
  className?: string;
  variant?: "compact" | "full";
  onOpenChange?: (isOpen: boolean) => void;
}

export function CallActionMenu({ leadId, phone, leadName, onActionComplete, className, variant = "compact", onOpenChange }: CallActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { addNotification } = useNotification();

  const handleOpenChange = (newIsOpen: boolean) => {
    setIsOpen(newIsOpen);
    onOpenChange?.(newIsOpen);
  };

  const handleOutcome = async (outcome: string, newStatus?: string) => {
    setIsUpdating(true);
    handleOpenChange(false);
    try {
      if (newStatus) {
        await updateLead(leadId, { status: newStatus });
      }
      
      await addLeadMessage(null, null, {
        role: "admin",
        content: `📞 Registro de Ligação: ${outcome}`,
        timestamp: new Date().toISOString(),
        leadId: leadId
      } as any);

      addNotification({
        type: "success",
        title: "Ligação Registrada",
        message: `Resultado salvo: ${outcome}`,
      });
      
      onActionComplete?.();
    } catch (error) {
      console.error("Erro ao registrar ligação:", error);
      addNotification({
        type: "error",
        title: "Erro",
        message: "Não foi possível registrar a ligação.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const outcomes = [
    { label: "Sucesso (Atendeu)", icon: <CheckCircle className="w-4 h-4 text-green-500" />, action: () => handleOutcome("Atendeu e conversou", "contato") },
    { label: "Não Atendeu", icon: <XCircle className="w-4 h-4 text-red-500" />, action: () => handleOutcome("Não Atendeu", "frio") },
    { label: "Ocupado / Cx Postal", icon: <Clock className="w-4 h-4 text-orange-500" />, action: () => handleOutcome("Ocupado / Caixa Postal") },
    { label: "Agendar Retorno", icon: <Phone className="w-4 h-4 text-blue-500" />, action: () => handleOutcome("Pediu para retornar", "morno") },
  ];

  if (!phone) {
    return (
      <div className={cn("text-[10px] text-muted-foreground italic text-center py-2", className)}>
        Sem telefone
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-1">
        <button
          disabled={isUpdating}
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `tel:${phone}`;
            handleOpenChange(!isOpen);
          }}
          className={cn(
            "flex-1 flex items-center justify-between gap-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50",
            variant === "full" 
              ? "py-3 px-4 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25"
              : "py-2 px-3 bg-primary/10 text-primary hover:bg-primary hover:text-white"
          )}
          title="Ligar e registrar resultado"
        >
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3" />
            Ligar
          </div>
          <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
        </button>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            const cleanPhone = phone?.replace(/\D/g, "");
            window.open(`https://wa.me/${cleanPhone}`, "_blank");
          }}
          className={cn(
            "flex items-center justify-center rounded-xl transition-all active:scale-95",
            variant === "full"
              ? "p-3 bg-success text-white hover:bg-success/90 shadow-lg shadow-success/20"
              : "p-2 bg-success/10 text-success hover:bg-success hover:text-white"
          )}
        >
          <MessageCircle className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[900]" 
              onClick={() => handleOpenChange(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 5, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 z-[1000] w-56 mt-1 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-2 border-b border-border/50 bg-muted/5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Resultado da Ligação
                </span>
              </div>
              <div className="p-1.5 space-y-0.5">
                {outcomes.map((outcome, i) => (
                  <button
                    key={i}
                    onClick={outcome.action}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-left hover:bg-accent/10 transition-colors group"
                  >
                    <div className="p-1 rounded-md bg-background group-hover:scale-110 transition-transform shadow-sm">
                      {outcome.icon}
                    </div>
                    <span className="font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                      {outcome.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
