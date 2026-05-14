import { updateLead } from "../src/lib/supabase/queries";

async function main() {
  const result = await updateLead("a6c05e7a-7dba-43ea-b9fa-40443eaf8bc0", {
    name: "",
    email: "",
    phone: "",
    instagram: "",
    nicho: "",
    estado: "",
    status: "novo",
  });
  console.log("Result:", result);
}

main();
