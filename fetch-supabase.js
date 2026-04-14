import * as fs from "fs";

let env = "";
try { env = fs.readFileSync(".env", "utf8"); } catch (e) {}
try { env += fs.readFileSync(".env.local", "utf8"); } catch (e) {}

const getEnv = (key) => {
  const match = env.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : null;
};

const SUPABASE_URL = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_KEY = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

async function run() {
  // Test insert to get the error
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reunioes`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify({
      titulo: "Test Meeting",
      data_hora: new Date().toISOString(),
      tipo: "venda",
      necessidades: "Test",
      Lead_id: null,
      status: "agendada",
      created_by_agent: false,
      tags: []
    })
  });

  const text = await res.text();
  console.log("STATUS:", res.status);
  console.log("RESPONSE:", text);
}

run();
