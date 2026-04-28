export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  instagram: string;
  source?: string;
  tags: string[];
  status: string;
  nicho?: string;
  estado?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  fase_atendimento?: string;
  payment_status?: "pago" | "pendente" | "falhou";
  payment_value?: number;
  Temperatura?: "frio" | "morno" | "quente";
  score?: number; // 1 to 5
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  progresso: number;
  dificuldade: "facil" | "medio" | "dificil";
  status: "pendente" | "em_progresso" | "concluido";
  data_vencimento: string | null;
  ordem: number;
  lead_id: string | null;
  created_at: string;
  completed_at: string | null;
  lead_nome?: string;
}

export interface Subtarefa {
  id: string;
  tarefa_id: string;
  titulo: string;
  status: "pendente" | "em_progresso" | "concluido";
  ordem: number;
  created_at: string;
}

export interface Reuniao {
  id: string;
  lead_id: string | null;
  titulo: string;
  data_hora: string;
  tags: string[];
  necessidades: string;
  tipo: "problema" | "venda" | "outro";
  status: "agendada" | "confirmada" | "realizada" | "cancelada";
  notas: string | null;
  created_by_agent: boolean;
  created_at: string;
  lead_nome?: string;
}

export interface Anotacao {
  id: string;
  titulo: string;
  conteudo: string;
  arquivos: string[];
  created_at: string;
  updated_at: string;
}

export interface Projeto {
  id: string;
  lead_id: string;
  nome: string;
  progresso_site: number;
  progresso_automacao: number;
  progresso_reunioes: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Metrica {
  id: string;
  data: string;
  gastos_dia: number;
  receita: number;
  meta: number;
  despesas: number;
  lucro: number;
}

export type PipelineStatus = "novo" | "contato" | "qualificado" | "proposta" | "fechado";

export interface PipelineLead extends Lead {
  pipeline_status: PipelineStatus;
}

export interface Agente {
  id: string;
  tipo: "whatsapp" | "instagram";
  nome: string;
  instrucoes: string;
  status: "ativo" | "inativo";
  configuracoes: Record<string, unknown>;
  last_active: string;
  created_at: string;
  updated_at: string;
}
