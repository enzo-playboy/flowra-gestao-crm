"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  StickyNote,
  FolderKanban,
  GitBranch,
  DollarSign,
  Sun,
  Moon,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/tarefas", label: "Tarefas", icon: CheckSquare },
  { href: "/reunioes", label: "Reunioes", icon: Calendar },
  { href: "/anotacoes", label: "Anotacoes", icon: StickyNote },
  { href: "/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen glass-card border-r border-border/50 flex flex-col z-40 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn("p-6 border-b border-border/50 flex items-center justify-between", isCollapsed && "px-4")}>
        {!isCollapsed && (
          <motion.h1
            className="text-xl font-bold tracking-tight"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-accent">Flowra</span>
            <span className="text-muted ml-1 text-sm font-normal">CRM</span>
          </motion.h1>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-bold text-xl">
            F
          </div>
        )}
        <button 
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors hidden lg:block"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-foreground hover:bg-accent/5",
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? item.label : ""}
              >
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full"
                  />
                )}
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-accent" : "text-muted group-hover:text-foreground")} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-2">
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-accent/5 transition-all",
            isCollapsed && "justify-center px-0"
          )}
          onClick={() => {
            const searchButton = document.querySelector('[data-global-search]') as HTMLElement;
            searchButton?.click();
          }}
          title={isCollapsed ? "Search (K)" : ""}
        >
          <Search className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Busca</span>}
        </button>

        {mounted && (
          <button
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-accent/5 transition-all text-left",
              isCollapsed && "justify-center px-0"
            )}
            onClick={handleThemeToggle}
            title={isCollapsed ? (theme === "dark" ? "Light Mode" : "Dark Mode") : ""}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {!isCollapsed && <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
