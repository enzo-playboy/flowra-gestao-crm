
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

async function checkMetadata() {
  const { data, error } = await supabase.from('leads').select('name, metadata').neq('metadata', null).limit(1);
  if (error) {
    console.log("Error:", error.message);
    return;
  }
  
  if (data && data.length > 0) {
    console.log(`Lead: ${data[0].name}`);
    console.log(`Metadata:`, JSON.stringify(data[0].metadata, null, 2));
  } else {
    console.log("NO METADATA FOUND");
  }
}

checkMetadata();
