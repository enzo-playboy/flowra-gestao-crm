import { supabase } from "./client";
import type { Lead, Tarefa, Reuniao, Anotacao, Projeto, Metrica, Agente } from "@/types/database";

export async function getLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select(`
      *,
      anotacoes:anotacoes(count),
      tarefas:tarefas(count),
      projetos:projetos(count)
    `)
    .order("created_at", { ascending: false });
    
  if (error) { console.warn("Supabase:", error); return []; }
  
  // Transform counts from array/object to simple numbers
  const transformed = (data as any[]).map(lead => ({
    ...lead,
    notes_count: lead.anotacoes?.[0]?.count || 0,
    tasks_count: lead.tarefas?.[0]?.count || 0,
    projects_count: lead.projetos?.[0]?.count || 0
  }));
  
  return transformed as Lead[];
}

export async function getLead(id: string): Promise<Lead | null> {
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).single();
  if (error) { console.warn("Supabase:", error); return null; }
  return data as Lead;
}

export async function createLead(lead: Partial<Lead>): Promise<{ data: Lead | null; error: any }> {
  // Lista de campos permitidos para insercao
  const allowedFields = [
    'name', 'email', 'phone', 'instagram', 'nicho', 'estado', 
    'status', 'tags', 'source', 'company'
  ];

  const cleanLead: any = {};
  allowedFields.forEach(field => {
    const value = (lead as any)[field];
    if (value !== undefined) {
      // Se for string vazia em campos de contato, mandamos NULL para evitar erros de unique constraint
      if (typeof value === 'string' && value.trim() === '' && ['email', 'phone', 'instagram'].includes(field)) {
        cleanLead[field] = null;
      } else {
        cleanLead[field] = value;
      }
    }
  });

  // Novos campos que podem ter sido adicionados ao schema mas nao estao no allowedFields original
  if ((lead as any).fase_atendimento) cleanLead.fase_atendimento = (lead as any).fase_atendimento;
  if ((lead as any).Temperatura) cleanLead.Temperatura = (lead as any).Temperatura;
  
  const { data, error } = await supabase.from("leads").insert(cleanLead).select();
  if (error) { 
    console.error("Supabase Error:", error); 
    return { data: null, error }; 
  }
  return { data: data ? (data[0] as Lead) : null, error: null };
}

export async function getTarefas(): Promise<Tarefa[]> {
  const { data, error } = await supabase
    .from("tarefas")
    .select("*, lead_info:leads!tarefas_lead_id_fkey(name)")
    .order("created_at", { ascending: false });
  if (error) { console.warn("Supabase:", error); return []; }
  
  const transformed = (data as any[]).map(t => ({
    ...t,
    lead_nome: t.lead_info?.name
  }));
  
  return transformed as Tarefa[];
}

export async function getTarefasByLeadId(leadId: string): Promise<Tarefa[]> {
  const { data, error } = await supabase
    .from("tarefas")
    .select("*, lead_info:leads!tarefas_lead_id_fkey(name)")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) { console.warn("Supabase:", error); return []; }
  
  const transformed = (data as any[]).map(t => ({
    ...t,
    lead_nome: t.lead_info?.name
  }));
  
  return transformed as Tarefa[];
}

export async function getReunioes(): Promise<Reuniao[]> {
  const { data, error } = await supabase
    .from("reunioes")
    .select("*, lead_info:leads!reunioes_lead_id_fkey(name)")
    .order("data_hora", { ascending: true });
  if (error) { console.warn("Supabase:", error); return []; }
  
  const transformed = (data as any[]).map(r => ({
    ...r,
    lead_nome: r.lead_info?.name
  }));
  
  return transformed as Reuniao[];
}

export async function getAnotacoes(): Promise<Anotacao[]> {
  const { data, error } = await supabase.from("anotacoes").select("*").order("updated_at", { ascending: false });
  if (error) { console.warn("Supabase:", error); return []; }
  return (data as Anotacao[]) ?? [];
}

export async function getProjetos(): Promise<Projeto[]> {
  const { data, error } = await supabase.from("projetos").select("*").order("created_at", { ascending: false });
  if (error) { console.warn("Supabase:", error); return []; }
  return (data as Projeto[]) ?? [];
}

export async function getProjetosByLeadId(leadId: string): Promise<Projeto[]> {
  const { data, error } = await supabase.from("projetos").select("*").eq("lead_id", leadId).order("created_at", { ascending: false });
  if (error) { console.warn("Supabase:", error); return []; }
  return (data as Projeto[]) ?? [];
}

export async function getMetricas(): Promise<Metrica[]> {
  const { data, error } = await supabase.from("metricas").select("*").order("data", { ascending: false }).limit(30);
  if (error) { console.warn("Supabase:", error); return []; }
  return (data as Metrica[]) ?? [];
}

export interface DashboardStats {
  totalLeads: number;
  leadsQualificados: number;
  tarefasPendentes: number;
  reunioesHoje: number;
  mrr: number;
  conversao: number;
  totalMensagens: number;
  gastosDia: number;
  lucro: number;
  despesas: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [leads, tarefas, reunioes, metricas] = await Promise.all([
    getLeads(),
    getTarefas(),
    getReunioes(),
    getMetricas(),
  ]);

  const leadsQualificados = leads.filter((l) => l.status === "qualificado").length;
  const tarefasPendentes = tarefas.filter((t) => t.status !== "concluido").length;
  const reunioesHoje = reunioes.filter((r) => {
    const data = new Date(r.data_hora);
    const hoje = new Date();
    return data.toDateString() === hoje.toDateString();
  }).length;

  const ultimaMetrica = metricas[0];
  const mrr = ultimaMetrica?.receita ?? 0;

  const totalLeads = leads.length;
  const conversao = totalLeads > 0 ? (leadsQualificados / totalLeads) * 100 : 0;

  const { count: msgCount, error: msgError } = await supabase
    .from("conversas")
    .select("*", { count: "exact", head: true });

  if (msgError) console.warn("Supabase:", msgError);
  const totalMensagens: number = msgCount ?? 0;

  return {
    totalLeads,
    leadsQualificados,
    tarefasPendentes,
    reunioesHoje,
    mrr,
    conversao,
    totalMensagens,
    gastosDia: ultimaMetrica?.gastos_dia ?? 0,
    lucro: ultimaMetrica?.lucro ?? 0,
    despesas: ultimaMetrica?.despesas ?? 0,
  };
}
export async function updateLead(id: string, updates: Partial<Lead>): Promise<{ data: Lead | null; error: any }> {
  // Lista de campos permitidos para atualizacao via form manual
  const allowedFields = [
    'name', 'email', 'phone', 'instagram', 'nicho', 'estado', 
    'status', 'tags', 'source', 'company', 'payment_status', 
    'payment_value', 'score'
  ];

  const cleanUpdates: any = {};
  
  allowedFields.forEach(field => {
    const value = (updates as any)[field];
    if (value !== undefined) {
      // Se for string vazia em campos de contato, mandamos NULL para evitar erros de unique constraint
      if (typeof value === 'string' && value.trim() === '' && ['email', 'phone', 'instagram'].includes(field)) {
        cleanUpdates[field] = null;
      } else {
        cleanUpdates[field] = value;
      }
    }
  });

  // Tratamento para novos campos e ENUMs
  if ((updates as any).Temperatura) cleanUpdates.Temperatura = (updates as any).Temperatura;
  if ((updates as any).fase_atendimento) cleanUpdates.fase_atendimento = (updates as any).fase_atendimento;

  const { data, error } = await supabase.from("leads").update(cleanUpdates).eq("id", id).select();
  if (error) { 
    console.error("Supabase Update Error:", error); 
    return { data: null, error }; 
  }
  return { data: data ? (data[0] as Lead) : null, error: null };
}

export async function getLeadMessages(phone?: string, instagram?: string): Promise<any[]> {
  if (!phone && !instagram) return [];
  
  let query = supabase.from("conversas").select("*");
  
  if (phone && instagram) {
    query = query.or(`whatsapp_id.eq.${phone},instagram_id.eq.${instagram}`);
  } else if (phone) {
    query = query.eq("whatsapp_id", phone);
  } else if (instagram) {
    query = query.eq("instagram_id", instagram);
  }
  
  const { data, error } = await query.order("created_at", { ascending: true });
  
  if (error) { console.warn("Supabase:", error); return []; }
  
  return (data || []).map(msg => ({
    id: msg.id,
    role: msg.role || (msg.mensagem_ia ? "assistant" : "user"),
    content: msg.mensagem_ia || msg.mensagem_usuario,
    platform: msg.platform || (msg.whatsapp_id ? "whatsapp" : "instagram"),
    created_at: msg.created_at || new Date().toISOString()
  }));
}

export async function addLeadMessage(phone: string | null, instagram: string | null, message: { role: string; content: string; platform: string }): Promise<any> {
  const payload: any = {
    whatsapp_id: phone,
    instagram_id: instagram,
    role: message.role, // "admin" ou "assistant"
    platform: message.platform,
    created_at: new Date().toISOString(),
  };

  if (message.role === "assistant" || message.role === "admin") {
    payload.mensagem_ia = message.content;
  } else {
    payload.mensagem_usuario = message.content;
  }

  const { data, error } = await supabase.from("conversas").insert(payload).select().single();
  
  if (error) { console.warn("Supabase:", error); return null; }
  
  return {
    id: data.id,
    role: data.role,
    content: data.mensagem_ia || data.mensagem_usuario,
    platform: data.platform,
    created_at: data.created_at
  };
}

export async function updateMetrica(id: string, updates: Partial<Metrica>): Promise<any> {
  const { data, error } = await supabase.from("metricas").update(updates).eq("id", id).select().single();
  if (error) { console.error("Supabase Error:", error); return null; }
  return data;
}

export async function getAgentes(): Promise<Agente[]> {
  const { data, error } = await supabase.from("agentes").select("*");
  if (error) { console.warn("Supabase:", error); return []; }
  return (data as Agente[]) ?? [];
}

export async function updateAgente(id: string, updates: Partial<Agente>): Promise<any> {
  const { data, error } = await supabase.from("agentes").update(updates).eq("id", id).select().single();
  if (error) { console.error("Supabase Error:", error); return null; }
  return data;
}
export async function getProjetoByLeadId(leadId: string): Promise<Projeto | null> {
  const { data, error } = await supabase.from("projetos").select("*").eq("lead_id", leadId).maybeSingle();
  if (error) { console.warn("Supabase:", error); return null; }
  return data as Projeto;
}

export async function getAnotacoesByLeadId(leadId: string): Promise<Anotacao[]> {
  const { data, error } = await supabase.from("anotacoes").select("*").eq("lead_id", leadId).order("created_at", { ascending: false });
  if (error) { console.warn("Supabase:", error); return []; }
  return (data as Anotacao[]) ?? [];
}
