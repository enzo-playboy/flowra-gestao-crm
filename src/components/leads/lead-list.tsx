"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatedCard } from "@/components/shared/animated-card";
import { getLeads } from "@/lib/supabase/queries";
import type { Lead } from "@/types/database";
import { getStatusColor } from "@/lib/utils";
import { Mail, Phone, Instagram, ChevronRight, Tag, Search, X, Flame, Star } from "lucide-react";

const tagColors: Record<string, string> = {
  novo: "bg-blue-500/10 text-blue-400",
  qualificado: "bg-accent/10 text-accent",
  quente: "bg-orange-500/10 text-orange-400",
  frio: "bg-muted/10 text-muted",
};

export function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getLeads();
        setLeads(data);
      } catch (error) {
        console.error("Erro ao carregar leads:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const allTags = Array.from(new Set(leads.flatMap((l) => l.tags ?? [])));
  
  const filteredLeads = leads.filter((lead) => {
    const matchesFilter = filter === "todos" || (lead.tags ?? []).includes(filter);
    const lowerSearch = searchTerm.toLowerCase();
    const leadName = (lead.name || "").toLowerCase();
    const leadEmail = (lead.email || "").toLowerCase();
    const leadInstagram = (lead.instagram || "").toLowerCase();
    
    const matchesSearch = 
      leadName.includes(lowerSearch) ||
      leadEmail.includes(lowerSearch) ||
      leadInstagram.includes(lowerSearch);
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-card rounded-xl border border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col gap-6">
        {/* Search Bar - Larger and centered-ish */}
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou @instagram..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-muted/10 border border-border rounded-2xl pl-12 pr-12 py-4 text-base focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all placeholder:text-muted-foreground shadow-sm"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1 hover:bg-muted/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tags Filter - Better layout */}
        <div className="flex flex-wrap items-center gap-2 p-1 bg-muted/5 rounded-2xl">
          <button
            onClick={() => setFilter("todos")}
            className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              filter === "todos" ? "bg-accent text-white shadow-lg scale-105" : "text-muted hover:text-foreground hover:bg-muted/10"
            }`}
          >
            Todos
          </button>
          
          {/* Default Categories suggested in audio */}
          {["novo", "cliente", "lead", "qualificado"].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all uppercase tracking-wider ${
                filter === tag ? "bg-accent text-white shadow-lg scale-105" : "text-muted hover:text-foreground hover:bg-muted/10"
              }`}
            >
              {tag}
            </button>
          ))}

          {/* Dynamic Tags from DB that are not in defaults */}
          {allTags.filter(tag => !["novo", "cliente", "lead", "qualificado"].includes(tag)).map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all uppercase tracking-wider ${
                filter === tag ? "bg-accent text-white shadow-lg scale-105" : "text-muted hover:text-foreground hover:bg-muted/10"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <p className="text-muted text-center py-12">Nenhum lead encontrado</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLeads.map((lead, index) => {
            return (
              <AnimatedCard key={lead.id} delay={index * 0.05} className="group hover:scale-[1.02] transition-all duration-300 p-4">
                <Link href={`/leads/${lead.id}`} className="block h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold group-hover:bg-accent group-hover:text-white transition-all duration-300">
                        {lead.name ? lead.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate group-hover:text-accent transition-colors mb-1">
                        {lead.name || "Sem nome"}
                      </h3>
                      <div className="space-y-1.5">
                        {lead.email && (
                          <div className="flex items-center gap-2 text-[10px] text-muted truncate">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                        )}
                        {lead.instagram && (
                          <div className="flex items-center gap-2 text-[10px] text-muted truncate">
                            <Instagram className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{lead.instagram}</span>
                          </div>
                        )}
                        
                        {/* Temperatura e Score */}
                        <div className="flex items-center gap-3 mt-2">
                          {lead.Temperatura && (
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                              lead.Temperatura === 'quente' ? 'bg-orange-500/10 text-orange-500' :
                              lead.Temperatura === 'morno' ? 'bg-yellow-500/10 text-yellow-600' :
                              'bg-blue-500/10 text-blue-500'
                            }`}>
                              <Flame className="w-2.5 h-2.5" />
                              {lead.Temperatura.toUpperCase()}
                            </div>
                          )}
                          {(lead.score !== undefined && lead.score > 0) && (
                            <div className="flex items-center gap-0.5 text-yellow-500">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span className="text-[9px] font-bold">{lead.score}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                      <div className="flex -space-x-2">
                         {(lead.tags ?? []).slice(0, 2).map((tag) => (
                           <div key={tag} className="w-5 h-5 rounded-full bg-muted border border-background flex items-center justify-center" title={tag}>
                              <Tag className="w-2 h-2 text-muted-foreground" />
                           </div>
                         ))}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-accent/5 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
