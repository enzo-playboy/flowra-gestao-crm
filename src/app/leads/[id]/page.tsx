import { LeadDetail } from "@/components/leads/lead-detail";

export const dynamic = "force-dynamic";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="space-y-6">
      <LeadDetailWrapper params={params} />
    </div>
  );
}

async function LeadDetailWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LeadDetail id={id} />;
}
