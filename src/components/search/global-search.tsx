"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "page" | "action" | "recent";
  label: string;
  href: string;
  icon?: React.ReactNode;
  shortcut?: string[];
}

const searchResults: SearchResult[] = [
  { id: "1", type: "page", label: "Dashboard", href: "/", shortcut: ["G", "D"] },
  { id: "2", type: "page", label: "Leads", href: "/leads", shortcut: ["G", "L"] },
  { id: "3", type: "page", label: "Tarefas", href: "/tarefas", shortcut: ["G", "T"] },
  { id: "4", type: "page", label: "Reunioes", href: "/reunioes", shortcut: ["G", "R"] },
  { id: "5", type: "page", label: "Anotacoes", href: "/anotacoes" },
  { id: "6", type: "page", label: "Projetos", href: "/projetos" },
  { id: "7", type: "page", label: "Pipeline", href: "/pipeline" },
  { id: "8", type: "action", label: "Novo Lead", href: "/leads?new=true" },
  { id: "9", type: "action", label: "Nova Tarefa", href: "/tarefas?new=true" },
  { id: "10", type: "action", label: "Nova Reuniao", href: "/reunioes?new=true" },
];

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  const filteredResults = searchResults.filter((result) =>
    result.label.toLowerCase().includes(query.toLowerCase())
  );

  const groupedResults = {
    recent: query === "" ? recentSearches.map((label) => ({
      id: `recent-${label}`,
      type: "recent" as const,
      label,
      href: searchResults.find((r) => r.label === label)?.href || "/",
    })) : [],
    pages: filteredResults.filter((r) => r.type === "page"),
    actions: filteredResults.filter((r) => r.type === "action"),
  };

  const allResults = [...groupedResults.recent, ...groupedResults.pages, ...groupedResults.actions];

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const handleSelect = useCallback(
    (href: string, label: string) => {
      setRecentSearches((prev) => {
        const updated = [label, ...prev.filter((s) => s !== label)].slice(0, 5);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
        return updated;
      });
      handleClose();
      router.push(href);
    },
    [handleClose, router]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        isOpen ? handleClose() : handleOpen();
      }
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
      if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % allResults.length);
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + allResults.length) % allResults.length);
        }
        if (e.key === "Enter" && allResults[selectedIndex]) {
          handleSelect(allResults[selectedIndex].href, allResults[selectedIndex].label);
        }
      }
    },
    [isOpen, handleOpen, handleClose, allResults, selectedIndex, handleSelect]
  );

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4"
            onClick={handleClose}
          >
            <motion.div
              className="absolute inset-0 bg-black/60"
              style={{ backdropFilter: "blur(8px)" }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-2xl glass-card overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
                <Search className="w-5 h-5 text-muted" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Buscar paginas, acoes..."
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted"
                  autoFocus
                />
                <kbd className="text-xs bg-accent/10 px-2 py-1 rounded">ESC</kbd>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {groupedResults.recent.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-muted px-2 py-1">Recentes</p>
                    {groupedResults.recent.map((result, index) => (
                      <SearchResultItem
                        key={result.id}
                        result={result}
                        index={index}
                        selectedIndex={selectedIndex}
                        onSelect={() => handleSelect(result.href, result.label)}
                        icon={<Clock className="w-4 h-4" />}
                      />
                    ))}
                  </div>
                )}

                {groupedResults.pages.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-muted px-2 py-1">Paginas</p>
                    {groupedResults.pages.map((result, index) => {
                      const globalIndex = groupedResults.recent.length + index;
                      return (
                        <SearchResultItem
                          key={result.id}
                          result={result}
                          index={globalIndex}
                          selectedIndex={selectedIndex}
                          onSelect={() => handleSelect(result.href, result.label)}
                          icon={<ArrowRight className="w-4 h-4" />}
                        />
                      );
                    })}
                  </div>
                )}

                {groupedResults.actions.length > 0 && (
                  <div>
                    <p className="text-xs text-muted px-2 py-1">Acoes</p>
                    {groupedResults.actions.map((result, index) => {
                      const globalIndex =
                        groupedResults.recent.length + groupedResults.pages.length + index;
                      return (
                        <SearchResultItem
                          key={result.id}
                          result={result}
                          index={globalIndex}
                          selectedIndex={selectedIndex}
                          onSelect={() => handleSelect(result.href, result.label)}
                          icon={<ArrowRight className="w-4 h-4" />}
                        />
                      );
                    })}
                  </div>
                )}

                {allResults.length === 0 && (
                  <div className="py-8 text-center text-muted">
                    <p>Nenhum resultado encontrado</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SearchResultItem({
  result,
  index,
  selectedIndex,
  onSelect,
  icon,
}: {
  result: { label: string; shortcut?: string[] };
  index: number;
  selectedIndex: number;
  onSelect: () => void;
  icon: React.ReactNode;
}) {
  return (
    <motion.button
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
        index === selectedIndex
          ? "bg-accent/10 text-accent"
          : "text-foreground hover:bg-accent/5"
      )}
      onClick={onSelect}
      onMouseEnter={(e) => {
        e.currentTarget.classList.add("bg-accent/10");
      }}
      onMouseLeave={(e) => {
        e.currentTarget.classList.remove("bg-accent/10");
      }}
    >
      {icon}
      <span className="flex-1 text-left">{result.label}</span>
      {result.shortcut && (
        <div className="flex gap-1">
          {result.shortcut.map((key) => (
            <kbd
              key={key}
              className="text-xs bg-accent/10 px-1.5 py-0.5 rounded"
            >
              {key}
            </kbd>
          ))}
        </div>
      )}
    </motion.button>
  );
}
