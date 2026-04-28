import { LeadList } from "@/components/leads/lead-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function LeadsPage() {
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
      <LeadList />
    </div>
  );
}
