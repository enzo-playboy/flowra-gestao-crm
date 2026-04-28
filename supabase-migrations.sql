
-- =============================================
-- Flowra CRM - Database Initialization & Fixes
-- Execute estas migrações manualmente no console do Supabase (SQL Editor)
-- =============================================

-- =============================================
-- ATENÇÃO: PERMISSÕES DA TABELA CONVERSAS
-- O n8n cria a tabela mas não abre as permissões de leitura (RLS)
-- =============================================
ALTER TABLE conversas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura pública das conversas" ON conversas;
CREATE POLICY "Permitir leitura pública das conversas" ON conversas FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir inserção pública nas conversas" ON conversas;
CREATE POLICY "Permitir inserção pública nas conversas" ON conversas FOR INSERT WITH CHECK (true);


-- 0. Tabela de Leads (Base para todas as outras)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  instagram TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'novo',
  conversa JSONB DEFAULT '[]',
  payment_status TEXT DEFAULT 'pendente',
  payment_value NUMERIC DEFAULT 0,
  temperature TEXT DEFAULT 'frio',
  score INTEGER DEFAULT 0,
  nicho TEXT,
  estado TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas caso a tabela ja exista
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='nicho') THEN
        ALTER TABLE leads ADD COLUMN nicho TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='estado') THEN
        ALTER TABLE leads ADD COLUMN estado TEXT;
    END IF;
END $$;

-- 1. Tabela de Tarefas
CREATE TABLE IF NOT EXISTS tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  progresso INTEGER DEFAULT 0,
  dificuldade TEXT DEFAULT 'medio' CHECK (dificuldade IN ('facil', 'medio', 'dificil')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_progresso', 'concluido')),
  data_vencimento TIMESTAMPTZ,
  ordem INTEGER DEFAULT 0,
  lead_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT tarefas_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

-- 2. Tabela de Subtarefas
CREATE TABLE IF NOT EXISTS subtarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id UUID REFERENCES tarefas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_progresso', 'concluido')),
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scripts extras para atualizar se a tabela ja existir:
-- ALTER TABLE subtarefas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_progresso', 'concluido'));
-- UPDATE subtarefas SET status = CASE WHEN concluido THEN 'concluido' ELSE 'pendente' END;
-- ALTER TABLE subtarefas DROP COLUMN IF EXISTS concluido;

-- 3. Tabela de Projetos
CREATE TABLE IF NOT EXISTS projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID,
  nome TEXT NOT NULL,
  progresso_site INTEGER DEFAULT 0,
  progresso_automacao INTEGER DEFAULT 0,
  progresso_reunioes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT projetos_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

-- 4. Tabela de Anotações
CREATE TABLE IF NOT EXISTS anotacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  arquivos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Reuniões
CREATE TABLE IF NOT EXISTS reunioes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  data_hora TIMESTAMPTZ NOT NULL,
  tags TEXT[] DEFAULT '{}',
  necessidades TEXT DEFAULT '',
  tipo TEXT DEFAULT 'outro',
  status TEXT DEFAULT 'agendada',
  notas TEXT,
  created_by_agent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Métricas
CREATE TABLE IF NOT EXISTS metricas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE DEFAULT CURRENT_DATE,
  gastos_dia NUMERIC DEFAULT 0,
  receita NUMERIC DEFAULT 0,
  despesas NUMERIC DEFAULT 0,
  lucro NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_tarefas_lead_id ON tarefas(lead_id);
CREATE INDEX IF NOT EXISTS idx_subtarefas_tarefa_id ON subtarefas(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_projetos_lead_id ON projetos(lead_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_ordem ON tarefas(ordem);

-- 6. Habilitar RLS e criar políticas de acesso
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON tarefas;
CREATE POLICY "Allow all for anon" ON tarefas FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE subtarefas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON subtarefas;
CREATE POLICY "Allow all for anon" ON subtarefas FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON projetos;
CREATE POLICY "Allow all for anon" ON projetos FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE anotacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON anotacoes;
CREATE POLICY "Allow all for anon" ON anotacoes FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON leads;
CREATE POLICY "Allow all for anon" ON leads FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE reunioes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON reunioes;
CREATE POLICY "Allow all for anon" ON reunioes FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE metricas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON metricas;
CREATE POLICY "Allow all for anon" ON metricas FOR ALL TO anon USING (true) WITH CHECK (true);
