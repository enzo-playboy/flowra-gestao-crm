import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function run() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reunioes?select=*&limit=1`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  const text = await res.text();
  console.log("STATUS:", res.status);
  console.log("RESPONSE:", text);
}

run();
