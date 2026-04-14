import * as fs from "fs";

let env = "";
try { env = fs.readFileSync(".env", "utf8"); } catch (e) {}

const getEnv = (key) => {
  const match = env.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : null;
};

const SUPABASE_URL = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_KEY = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

async function run() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reunioes?select=*&limit=1`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    }
  });

  const data = await res.json();
  if (data.length > 0) {
    console.log("COLUMNS:", Object.keys(data[0]));
  } else {
    console.log("NO DATA");
  }
}

run();
