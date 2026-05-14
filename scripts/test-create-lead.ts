import { createLead } from "../src/lib/supabase/queries";

async function main() {
  const result = await createLead({
    name: "Test Lead",
    instagram: "",
    email: "",
    phone: "",
    estado: "",
    nicho: "",
    status: "novo",
    tags: [],
  });
  console.log("Result:", result);
}

main();
