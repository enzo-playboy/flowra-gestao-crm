"use client";

import { useState, createContext, useContext } from "react";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
        <main 
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-300",
            isCollapsed ? "ml-20" : "ml-64"
          )}
        >
          <div className="p-8 pb-32">{children}</div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
