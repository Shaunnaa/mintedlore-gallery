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

// PUT /api/admin/promotions/[id]?wallet=<address>
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  if (!(await verifyAdmin(wallet))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  // Remove id fields from update body
  delete body.promotions_id;
  delete body.created_at;
  body.updated_at = new Date().toISOString();

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("promotions")
    .update(body)
    .eq("promotions_id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ promotion: data });
}

// DELETE /api/admin/promotions/[id]?wallet=<address>
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(_request.url);
  const wallet = searchParams.get("wallet");
  if (!(await verifyAdmin(wallet))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const supabase = getSupabase();
  const { error } = await supabase.from("promotions").delete().eq("promotions_id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
