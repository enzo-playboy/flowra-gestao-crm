import { supabase } from "./client";
import type { Lead, Tarefa, Reuniao, Anotacao, Projeto, Metrica } from "@/types/database";

export async function getLeads(): Promise<Lead[]> {
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) { console.warn("Supabase:", error); return []; }
  return (data as Lead[]) ?? [];
}

export async function getLead(id: string): Promise<Lead | null> {
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).single();
  if (error) { console.warn("Supabase:", error); return null; }
  return data as Lead;
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
export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  const { data, error } = await supabase.from("leads").update(updates).eq("id", id).select().single();
  if (error) { console.warn("Supabase:", error); return null; }
  return data as Lead;
}

export async function getLeadMessages(phone: string): Promise<any[]> {
  if (!phone) return [];
  
  const { data, error } = await supabase
    .from("conversas")
    .select("*")
    .eq("whatsapp_id", phone)
    .order("created_at", { ascending: true });
  
  if (error) { console.warn("Supabase:", error); return []; }
  
  // Map Supabase columns to UI format
  return (data || []).map(msg => ({
    id: msg.id,
    role: msg.mensagem_ia ? "assistant" : "user",
    content: msg.mensagem_ia || msg.mensagem_usuario,
    created_at: msg.created_at || new Date().toISOString()
  }));
}

export async function addLeadMessage(phone: string, message: { role: string; content: string }): Promise<any> {
  const payload: any = {
    whatsapp_id: phone,
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
    role: data.mensagem_ia ? "assistant" : "user",
    content: data.mensagem_ia || data.mensagem_usuario,
    created_at: data.created_at
  };
}
