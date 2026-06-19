import { config } from "dotenv";
config({ path: ".env.local" });
import { getSupabase } from "./src/lib/supabase";

async function run() {
  const supabase = getSupabase();
  const { data } = await supabase.from("communities").select("theme_settings").eq("slug", "crew");
  console.dir(data, { depth: null });
}
run();
