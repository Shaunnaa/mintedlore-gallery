import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

async function verifyAdmin(wallet: string | null) {
  if (!wallet) return false;
  const supabase = getSupabase();
  const { data } = await supabase.from("app_users").select("role").eq("wallet_address", wallet).maybeSingle();
  return data?.role === "admin";
}

// GET /api/admin/promotions?wallet=<address>
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  if (!(await verifyAdmin(wallet))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ promotions: data });
}

// POST /api/admin/promotions?wallet=<address>
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  if (!(await verifyAdmin(wallet))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await request.json();
  const supabase = getSupabase();
  const { data, error } = await supabase.from("promotions").insert([body]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ promotion: data });
}
