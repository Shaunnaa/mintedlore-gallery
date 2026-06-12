import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

// PUT /api/community/[slug] — update theme_settings (and other fields)
export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { ownerWallet, themeSettings, preferredView, name, description } =
      await request.json();

    if (!ownerWallet) {
      return NextResponse.json({ error: "ownerWallet required" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Verify ownership before updating
    const { data: community } = await supabase
      .from("communities")
      .select("id, owner_wallet")
      .eq("slug", params.slug)
      .single();

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }
    if (community.owner_wallet !== ownerWallet) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updates: Record<string, unknown> = {};
    if (themeSettings !== undefined) updates.theme_settings = themeSettings;
    if (preferredView  !== undefined) updates.preferred_view = preferredView;
    if (name           !== undefined) updates.name = name;
    if (description    !== undefined) updates.description = description;

    const { data, error } = await supabase
      .from("communities")
      .update(updates)
      .eq("slug", params.slug)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, community: data });
  } catch (err: unknown) {
    console.error("[PUT /api/community/[slug]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/community/[slug] — fetch a single community
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .eq("slug", params.slug)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ community: data });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
