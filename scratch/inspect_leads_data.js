
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

async function inspectLeads() {
  const { data, error } = await supabase.from('leads').select('*').limit(5);
  if (error) {
    console.log("Error fetching leads:", error.message);
    return;
  }
  
  if (data && data.length > 0) {
    console.log("COLUMNS:", Object.keys(data[0]));
    data.forEach((lead, i) => {
      console.log(`Lead ${i} (${lead.name}):`, "Conversa exists?", !!lead.conversa);
      if (lead.conversa) {
        console.log(`- Conversa length: ${Array.isArray(lead.conversa) ? lead.conversa.length : 'Not an array'}`);
        console.log(`- Conversa type: ${typeof lead.conversa}`);
        console.log(`- Conversa sample:`, JSON.stringify(lead.conversa).substring(0, 100));
      }
    });
  } else {
    console.log("NO LEADS FOUND IN DATABASE");
  }
}

inspectLeads();
