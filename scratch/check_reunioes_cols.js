
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

async function checkCols() {
  const { data, error } = await supabase.from('reunioes').select('*').limit(1);
  if (data && data.length > 0) {
    console.log('Columns in reunioes:', Object.keys(data[0]));
  } else {
    // If no data, we can't easily see columns with anon key without definitions
    console.log('No data in reunioes to check columns');
  }
}

checkCols();
