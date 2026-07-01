import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json({ isAdmin: false });
    }

    const supabase = getSupabase();
    const { data } = await supabase
      .from("app_users")
      .select("role")
      .eq("wallet_address", wallet)
      .maybeSingle();

    return NextResponse.json({ isAdmin: data?.role === "admin" });
  } catch (err) {
    console.error("[/api/admin/check]", err);
    return NextResponse.json({ isAdmin: false });
  }
}
