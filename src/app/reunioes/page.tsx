"use client";

import { useState } from "react";
import { MeetingList } from "@/components/reunioes/meeting-list";
import { CalendarView } from "@/components/reunioes/calendar-view";
import type { Reuniao } from "@/types/database";
import { List, Calendar, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";

export default function ReunioesPage() {
  const [view, setView] = useState<"list" | "calendar">("list");

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-accent" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-accent/60">Controle de Agenda</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground/90 sm:text-5xl">
            Reuniões
          </h1>
          <p className="text-muted-foreground font-medium max-w-md">
            Organize seus compromissos, agende novas conversas e mantenha o histórico de alinhamento com seus leads.
          </p>
        </div>
        
        <div className="flex items-center p-1 bg-muted/5 border border-border/40 rounded-2xl backdrop-blur-sm self-start md:self-auto">
          <button
            onClick={() => setView("list")}
            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              view === "list"
                ? "text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {view === "list" && (
              <motion.div
                layoutId="view-bg"
                className="absolute inset-0 bg-accent rounded-xl shadow-lg shadow-accent/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <List className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Lista</span>
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              view === "calendar"
                ? "text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {view === "calendar" && (
              <motion.div
                layoutId="view-bg"
                className="absolute inset-0 bg-accent rounded-xl shadow-lg shadow-accent/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Calendar className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Calendário</span>
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {view === "list" ? <MeetingList /> : <CalendarView />}
      </motion.div>
    </div>
  );
}
