import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

// GET /api/community/owned?wallet=<address>
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json({ error: "wallet param required" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("communities")
      .select("id, name, slug, collection_type, collection_address, parent_community_id, preferred_view, description, vip_threshold, created_at")
      .eq("owner_wallet", wallet)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ communities: data ?? [] });
  } catch (err: unknown) {
    console.error("[/api/community/owned]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
