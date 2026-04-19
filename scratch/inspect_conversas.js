
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
    console.log("Error:", error.message);
    return;
  }
  
  if (data && data.length > 0) {
    console.log("COLUMNS:", Object.keys(data[0]));
    console.log("Sample:", JSON.stringify(data[0], null, 2));
  } else {
    console.log("TABLE IS EMPTY");
    // Try to get columns anyway via dynamic select (might work if we just want keys)
    const { data: cols } = await supabase.from('conversas').select('*').limit(0);
    console.log("Empty table columns:", cols);
  }
}

inspectConversas();
