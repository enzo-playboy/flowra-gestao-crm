
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugSchema() {
  const { data, error } = await supabase.rpc('get_table_info') // If RPC exists
  if (error) {
    console.log('RPC failed, trying manual queries');
    const tables = ['leads', 'reunioes', 'tarefas', 'subtarefas', 'anotacoes', 'projetos', 'metricas'];
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
          console.error(`Table ${table} error:`, error.message);
      } else {
          console.log(`Table ${table} exists and has ${data.length} records in limited sample.`);
      }
    }
  } else {
    console.log('Table info:', data);
  }
}

debugSchema()
