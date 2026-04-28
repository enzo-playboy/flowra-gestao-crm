"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { createLead } from "@/lib/supabase/queries";
import { useNotification } from "@/components/notifications/notification-provider";
import { 
  User, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin, 
  Tag, 
  ChevronRight, 
  ArrowLeft,
  Sparkles,
  Loader2
} from "lucide-react";
import Link from "next/link";

export function LeadForm() {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    instagram: "",
    email: "",
    phone: "",
    estado: "",
    nicho: "",
    status: "novo",
    tags: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      addNotification({
        type: "error",
        title: "Campo obrigatório",
        message: "O nome do lead é obrigatório.",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await createLead(formData);
      if (data) {
        addNotification({
          type: "success",
          title: "Lead cadastrado",
          message: `${formData.name} foi adicionado com sucesso!`,
        });
        router.push("/leads");
        router.refresh();
      } else {
        console.error("Erro detalhado do banco:", error);
        addNotification({
          type: "error",
          title: "Erro ao salvar",
          message: error?.message || (typeof error === 'string' ? error : JSON.stringify(error)) || "O banco de dados recusou o cadastro.",
        });
      }
    } catch (error: any) {
      console.error(error);
      addNotification({
        type: "error",
        title: "Erro inesperado",
        message: error?.message || "Não foi possível cadastrar o lead.",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-background/50 border border-border rounded-xl px-12 py-3 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-muted-foreground/50";
  const labelClasses = "block text-xs font-bold text-muted uppercase tracking-wider mb-2 ml-1";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center text-muted hover:text-foreground transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Voltar</span>
        </Link>
        <div className="flex items-center gap-2 text-accent">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-tighter">Novo Registro</span>
        </div>
      </div>

      <div className="glass-card p-8 md:p-10 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div className="md:col-span-2">
              <label className={labelClasses}>Nome do Lead *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  placeholder="Ex: Serra Grande"
                  className={inputClasses}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Instagram */}
            <div>
              <label className={labelClasses}>Instagram</label>
              <div className="relative">
                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  placeholder="@usuario"
                  className={inputClasses}
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                />
              </div>
            </div>

            {/* Nicho */}
            <div>
              <label className={labelClasses}>Nicho / Ramo</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  placeholder="Ex: Gastronomia"
                  className={inputClasses}
                  value={formData.nicho}
                  onChange={(e) => setFormData({ ...formData, nicho: e.target.value })}
                />
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className={labelClasses}>Estado / Cidade</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  placeholder="Ex: MT - Cuiabá"
                  className={inputClasses}
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label className={labelClasses}>WhatsApp / Telefone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  placeholder="(65) 99999-9999"
                  className={inputClasses}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className={labelClasses}>E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="email"
                  placeholder="contato@empresa.com"
                  className={inputClasses}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button 
              type="submit" 
              variant="glow" 
              className="w-full h-14 text-lg font-bold group"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Cadastrar Lead
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      
      <p className="text-center text-muted-foreground text-xs mt-6">
        Ao cadastrar, o lead será automaticamente adicionado ao seu funil como <span className="text-accent font-bold">NOVO</span>.
      </p>
    </motion.div>
  );
}
