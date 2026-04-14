import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log("Checking tables...");
  
  const { data: tarefas, error: errorTarefas } = await supabase
    .from("tarefas")
    .select("count", { count: "exact", head: true });
    
  if (errorTarefas) {
    console.error("Error with 'tarefas' table:", errorTarefas.message);
    if (errorTarefas.message.includes("relation \"tarefas\" does not exist")) {
      console.log(">>> TABLE 'tarefas' DOES MISSING! <<<");
    }
  } else {
    console.log("'tarefas' table exists.");
  }

  const { data: subtarefas, error: errorSubtarefas } = await supabase
    .from("subtarefas")
    .select("count", { count: "exact", head: true });

  if (errorSubtarefas) {
    console.error("Error with 'subtarefas' table:", errorSubtarefas.message);
  } else {
    console.log("'subtarefas' table exists.");
  }
}

checkTables();
