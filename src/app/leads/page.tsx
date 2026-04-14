import { LeadList } from "@/components/leads/lead-list";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
        <p className="text-muted mt-1">Gerencie seus leads e contatos</p>
      </div>
      <LeadList />
    </div>
  );
}
