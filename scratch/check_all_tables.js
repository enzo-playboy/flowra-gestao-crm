
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const getEnv = (key) => {
  const match = env.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = ['leads', 'tarefas', 'subtarefas', 'reunioes', 'anotacoes', 'projetos', 'metricas'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`${table}: Error - ${error.message}`);
    } else {
      console.log(`${table}: Exists`);
    }
  }
}

checkTables();
