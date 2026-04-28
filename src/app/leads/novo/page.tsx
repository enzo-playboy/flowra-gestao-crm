import { LeadForm } from "@/components/leads/lead-form";

export default function NewLeadPage() {
  return (
    <div className="py-10">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
          Cadastrar Lead
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Insira as informações do potencial cliente para iniciar o acompanhamento no CRM.
        </p>
      </div>
      
      <LeadForm />
    </div>
  );
}
