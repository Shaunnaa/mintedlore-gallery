import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// GET /api/profile?wallet=<wallet_address>
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "Missing wallet" }, { status: 400 });

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("public_profile")
    .select("*")
    .eq("wallet_address", wallet)
    .single();

  if (error || !data) {
    return NextResponse.json({ profile: null });
  }

  return NextResponse.json({ profile: data });
}

// POST /api/profile — Create a new profile
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { wallet_address, username, twitter_handle, telegram_handle } = body;

  if (!wallet_address || !username) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const supabase = getSupabase();

  // Check if username is already taken
  const { data: existing } = await supabase
    .from("public_profile")
    .select("public_profile_id")
    .eq("username", username.toLowerCase())
    .single();

  if (existing) {
    return NextResponse.json({ error: "This username is already taken. Please choose another." }, { status: 409 });
  }

  // Check if wallet already has a profile
  const { data: walletExisting } = await supabase
    .from("public_profile")
    .select("public_profile_id")
    .eq("wallet_address", wallet_address)
    .single();

  if (walletExisting) {
    return NextResponse.json({ error: "This wallet already has a profile." }, { status: 409 });
  }

  // Create the profile
  const { data, error } = await supabase
    .from("public_profile")
    .insert({
      wallet_address,
      username: username.toLowerCase(),
      twitter_handle: twitter_handle || null,
      telegram_handle: telegram_handle || null,
      public_nfts: [],
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}

// PATCH /api/profile — Update an existing profile
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { wallet_address, username, twitter_handle, telegram_handle, public_nfts } = body;

  if (!wallet_address) {
    return NextResponse.json({ error: "Missing wallet_address." }, { status: 400 });
  }

  const supabase = getSupabase();

  // If username is being changed, check it's not taken by another wallet
  if (username) {
    const { data: existing } = await supabase
      .from("public_profile")
      .select("wallet_address")
      .eq("username", username.toLowerCase())
      .single();

    if (existing && existing.wallet_address !== wallet_address) {
      return NextResponse.json({ error: "This username is already taken." }, { status: 409 });
    }
  }

  // Build the update object dynamically (only update fields that were sent)
  const updateData: Record<string, any> = {};
  if (username !== undefined) updateData.username = username?.toLowerCase();
  if (twitter_handle !== undefined) updateData.twitter_handle = twitter_handle || null;
  if (telegram_handle !== undefined) updateData.telegram_handle = telegram_handle || null;
  if (public_nfts !== undefined) updateData.public_nfts = public_nfts;

  const { data, error } = await supabase
    .from("public_profile")
    .update(updateData)
    .eq("wallet_address", wallet_address)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
