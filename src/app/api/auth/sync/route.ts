import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { wallet_address } = await req.json();

    if (!wallet_address) {
      return NextResponse.json({ error: "Missing wallet_address" }, { status: 400 });
    }

    const supabase = getSupabase();

    // 1. Check if the user already exists to protect existing roles (e.g., admin)
    const { data: existingUser, error: checkError } = await supabase
      .from("app_users")
      .select("role")
      .eq("wallet_address", wallet_address)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is fine. Other errors are bad.
      throw checkError;
    }

    // 2. If the user does not exist, insert them with the default 'user' role
    if (!existingUser) {
      const { error: insertError } = await supabase
        .from("app_users")
        .insert({
          wallet_address,
          role: "user",
        });

      if (insertError) {
        // If it fails because of a race condition (someone else just inserted it), ignore it
        if (insertError.code !== "23505") { // 23505 is unique violation
          throw insertError;
        }
      }
      return NextResponse.json({ success: true, message: "User synced", isNew: true });
    }

    // 3. User already exists, do nothing to protect their role
    return NextResponse.json({ success: true, message: "User already exists", isNew: false });

  } catch (err: any) {
    console.error("[/api/auth/sync]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
