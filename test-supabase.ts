import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data, error } = await supabase
    .from("reunioes")
    .insert({
      titulo: "Test Meeting",
      data_hora: new Date().toISOString(),
      tipo: "venda",
      necessidades: "Test",
      Lead_id: null,
      status: "agendada",
      created_by_agent: false,
    })
    .select();

  if (error) {
    console.error("Error inserting:", error);
  } else {
    console.log("Success:", data);
  }
}

testInsert();
