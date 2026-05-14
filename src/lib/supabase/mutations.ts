import { supabase } from "./client";
import type { Tarefa, Reuniao, Subtarefa, Projeto } from "@/types/database";

export async function createTarefa(data: {
  titulo: string;
  descricao?: string;
  dificuldade?: "facil" | "medio" | "dificil";
  data_vencimento?: string;
  ordem?: number;
  lead_id?: string;
}): Promise<Tarefa | null> {
  const { data: result, error } = await supabase
    .from("tarefas")
    .insert({
      titulo: data.titulo,
      descricao: data.descricao ?? "",
      dificuldade: data.dificuldade ?? "medio",
      status: "pendente",
      progresso: 0,
      data_vencimento: data.data_vencimento ?? null,
      ordem: data.ordem ?? 0,
      lead_id: data.lead_id ?? null,
    })
    .select()
    .single();
  if (error) { console.warn("Supabase:", error); return null; }
  return result as Tarefa;
}

export async function updateTarefa(id: string, updates: Partial<Tarefa>): Promise<Tarefa | null> {
  const { data: result, error } = await supabase
    .from("tarefas")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) { console.warn("Supabase:", error); return null; }
  return result as Tarefa;
}

export async function deleteTarefa(id: string): Promise<boolean> {
  const { error } = await supabase.from("tarefas").delete().eq("id", id);
  if (error) { console.warn("Supabase:", error); return false; }
  return true;
}

export async function createReuniao(data: {
  titulo: string;
  data_hora: string;
  tipo?: "problema" | "venda" | "outro";
  necessidades?: string;
  lead_id?: string;
  notas?: string;
}): Promise<Reuniao | null> {
  const { data: result, error } = await supabase
    .from("reunioes")
    .insert({
      titulo: data.titulo,
      data_hora: data.data_hora,
      tipo: data.tipo ?? "outro",
      necessidades: data.necessidades ?? "",
      lead_id: data.lead_id ?? null,
      notas: data.notas ?? null,
      status: "agendada",
      created_by_agent: false,
      tags: [],
    })
    .select()
    .single();
  if (error) { console.warn("Supabase:", error); return null; }
  return result as Reuniao;
}

export async function updateReuniao(id: string, updates: any): Promise<Reuniao | null> {
  const updatePayload = { ...updates };

  const { data: result, error } = await supabase
    .from("reunioes")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();
  if (error) { console.warn("Supabase:", error); return null; }
  return result as Reuniao;
}

export async function deleteReuniao(id: string): Promise<boolean> {
  const { error } = await supabase.from("reunioes").delete().eq("id", id);
  if (error) { console.warn("Supabase:", error); return false; }
  return true;
}

export async function cancelReuniao(id: string): Promise<Reuniao | null> {
  return updateReuniao(id, { status: "cancelada" });
}

export async function createSubtarefa(data: {
  tarefa_id: string;
  titulo: string;
  ordem?: number;
}): Promise<Subtarefa | null> {
  const { data: result, error } = await supabase
    .from("subtarefas")
    .insert({
      tarefa_id: data.tarefa_id,
      titulo: data.titulo,
      status: "pendente",
      ordem: data.ordem ?? 0,
    })
    .select()
    .single();
  if (error) { console.warn("Supabase:", error); return null; }
  return result as Subtarefa;
}

export async function updateSubtarefa(id: string, updates: Partial<Subtarefa>): Promise<Subtarefa | null> {
  const { data: result, error } = await supabase
    .from("subtarefas")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) { console.warn("Supabase:", error); return null; }
  return result as Subtarefa;
}

export async function deleteSubtarefa(id: string): Promise<boolean> {
  const { error } = await supabase.from("subtarefas").delete().eq("id", id);
  if (error) { console.warn("Supabase:", error); return false; }
  return true;
}

export async function getSubtarefas(tarefaId: string): Promise<Subtarefa[]> {
  const { data, error } = await supabase
    .from("subtarefas")
    .select("*")
    .eq("tarefa_id", tarefaId)
    .order("ordem", { ascending: true });
  if (error) { console.warn("Supabase:", error); return []; }
  return (data as Subtarefa[]) ?? [];
}

export async function createAnotacao(data: {
  titulo: string;
  conteudo: string;
  arquivos?: string[];
  lead_id?: string;
}): Promise<any | null> {
  const { data: result, error } = await supabase
    .from("anotacoes")
    .insert({
      titulo: data.titulo,
      conteudo: data.conteudo,
      arquivos: data.arquivos || [],
      lead_id: data.lead_id || null,
    })
    .select();
  if (error) { console.warn("Supabase:", error); return null; }
  return result ? result[0] : null;
}

export async function updateAnotacao(
  id: string,
  updates: Partial<{ titulo: string; conteudo: string; arquivos: string[] }>
): Promise<any | null> {
  const { data, error } = await supabase
    .from("anotacoes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) { console.warn("Supabase:", error); return null; }
  return data;
}

export async function deleteAnotacao(id: string): Promise<boolean> {
  const { error } = await supabase.from("anotacoes").delete().eq("id", id);
  if (error) { console.warn("Supabase:", error); return false; }
  return true;
}

export async function createMetrica(data: {
  data: string;
  receita: number;
  lucro: number;
  despesas: number;
  gastos_dia: number;
}): Promise<any | null> {
  const { data: result, error } = await supabase
    .from("metricas")
    .insert(data)
    .select()
    .single();
  if (error) { console.warn("Supabase:", error); return null; }
  return result;
}

export async function createProjeto(data: Partial<Projeto>): Promise<{ data: Projeto | null; error: any }> {
  const { data: result, error } = await supabase
    .from("projetos")
    .insert({
      lead_id: data.lead_id,
      nome: data.nome,
      status: data.status || "planejamento",
      progresso_site: data.progresso_site || 0,
      progresso_automacao: data.progresso_automacao || 0,
      progresso_reunioes: data.progresso_reunioes || 0,
      valor_projeto: data.valor_projeto || 0,
      observacoes: data.observacoes || "",
      site_atividades: data.site_atividades || "",
      n8n_automacao: data.n8n_automacao || "",
      agente_ia: data.agente_ia || "",
      obsidian_link: data.obsidian_link || "",
    })
    .select()
    .single();
  
  if (error) { 
    console.warn("Supabase Project Error:", error); 
    return { data: null, error }; 
  }
  return { data: result as Projeto, error: null };
}

export async function updateProjeto(id: string, updates: Partial<Projeto>): Promise<{ data: Projeto | null; error: any }> {
  const { data: result, error } = await supabase
    .from("projetos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
    
  if (error) { 
    console.warn("Supabase Project Update Error:", error); 
    return { data: null, error }; 
  }
  return { data: result as Projeto, error: null };
}
