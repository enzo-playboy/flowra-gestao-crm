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

async function checkPhoneFormats() {
  console.log("Fetching a few leads to check phone format...");
  const { data: leads, error: leadError } = await supabase.from('leads').select('id, name, phone').limit(5);
  if (leadError) console.error("Error fetching leads:", leadError);
  console.log("Leads:", leads);

  console.log("\nFetching a few conversas to check whatsapp_id format...");
  const { data: conversas, error: convError } = await supabase.from('conversas').select('id, whatsapp_id').limit(5);
  if (convError) console.error("Error fetching conversas:", convError);
  console.log("Conversas:", conversas);
}

checkPhoneFormats();
