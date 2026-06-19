const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function getEnv(key) {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const match = envFile.match(new RegExp(`${key}=(.*)`));
  return match ? match[1] : null;
}

async function run() {
  const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'));
  const { data } = await supabase.from("communities").select("theme_settings").eq("slug", "crew");
  console.dir(data, { depth: null });
}
run();
