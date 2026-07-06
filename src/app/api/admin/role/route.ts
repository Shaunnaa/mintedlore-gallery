import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// GET /api/admin/role?wallet=<wallet_address>
// Returns the role of the given wallet from app_users table
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json({ role: null });
    }

    const supabase = getSupabase();
    const { data } = await supabase
      .from("app_users")
      .select("role")
      .eq("wallet_address", wallet)
      .maybeSingle();

    return NextResponse.json({ role: data?.role ?? null });
  } catch (err) {
    console.error("[/api/admin/role]", err);
    return NextResponse.json({ role: null });
  }
}
