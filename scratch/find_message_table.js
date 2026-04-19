
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

let env = "";
try { env = fs.readFileSync('.env', 'utf8'); } catch (e) {}

const getEnv = (key) => {
  const match = env.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

async function findMessageTable() {
  const tables = ['messages', 'mensagens', 'conversas', 'conversations', 'history', 'historico'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      console.log(`FOUND TABLE: ${table}`);
      return;
    }
  }
  console.log("NO MESSAGE TABLES FOUND");
}

findMessageTable();
