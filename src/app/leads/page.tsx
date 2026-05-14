"use client";

import { LeadList } from "@/components/leads/lead-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { LeadMetaHeader } from "@/components/leads/lead-meta-header";
import { useState } from "react";

export default function LeadsPage() {
  // Mock state for now, can be connected to DB/LocalStorage later
  const [completed, setCompleted] = useState(0);
  const goal = 5; // 30 per week / ~5 per day

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
          <p className="text-muted mt-1">Gerencie seus leads e contatos</p>
        </div>
        <Link href="/leads/novo">
          <Button variant="glass" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </Link>
      </div>

      <LeadMetaHeader completed={completed} total={goal} streak={3} />
      
      <LeadList onCallMade={() => setCompleted(prev => Math.min(prev + 1, goal))} />
    </div>
  );
}
