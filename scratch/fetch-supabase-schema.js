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
  const res = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_KEY}`);
  const text = await res.json();
  console.log(Object.keys(text.definitions || {}));
}

run();
