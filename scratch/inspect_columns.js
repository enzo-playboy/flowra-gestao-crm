
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

async function inspectConversas() {
  const { data, error } = await supabase.from('conversas').select('*').limit(1);
  if (error) {
    console.error("Error fetching from conversas:", error);
    return;
  }
  if (data && data.length > 0) {
    console.log("Columns in 'conversas':", Object.keys(data[0]));
    console.log("Example record:", data[0]);
  } else {
    console.log("Table 'conversas' exists but is empty.");
  }
}

inspectConversas();
