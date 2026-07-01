import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

// GET /api/promotions
export async function GET() {
  try {
    const supabase = getSupabase();
    
    // We only fetch active promotions
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Filter dates on server side
    const now = new Date().getTime();
    const validPromotions = data.filter((ad: any) => {
      if (ad.start_date && new Date(ad.start_date).getTime() > now) return false;
      if (ad.end_date && new Date(ad.end_date).getTime() < now) return false;
      return true;
    });

    return NextResponse.json({ promotions: validPromotions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
