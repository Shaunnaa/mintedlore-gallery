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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { ownerWallet, themeSettings, preferredView, name, description, vipThreshold, image } =
      await request.json();

    if (!ownerWallet) {
      return NextResponse.json({ error: "ownerWallet required" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Check collection first
    const { slug } = await params;
    let table = "collection";
    let { data: community } = await supabase
      .from("collection")
      .select("collection_id as id, wallet_address, category")
      .eq("slug", slug)
      .maybeSingle();

    if (!community) {
      table = "stories";
      const { data: story } = await supabase
        .from("stories")
        .select("stories_id as id, wallet_address")
        .eq("slug", slug)
        .maybeSingle();
      community = story;
    }

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }
    
    // Admins bypass ownership check
    const { data: userRole } = await supabase.from("app_users").select("role").eq("wallet_address", ownerWallet).maybeSingle();
    if (community.wallet_address !== ownerWallet && userRole?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updates: Record<string, unknown> = {};
    if (themeSettings !== undefined) updates.theme_settings = themeSettings;
    if (preferredView  !== undefined) updates.preferred_view = preferredView;
    if (name           !== undefined) updates.name = name;
    if (description    !== undefined) updates.description = description;
    if (vipThreshold   !== undefined) updates.vip_threshold = vipThreshold;
    if (image          !== undefined) updates.image = image;

    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq("slug", slug)
      .select()
      .single();

    if (error) throw error;

    // Sync stories_selection if this is a stories table update
    if (table === "stories" && themeSettings?.assetIds) {
      await supabase.from("stories_selection").delete().eq("stories_id", community.id);
      
      if (themeSettings.assetIds.length > 0) {
        // Need to get collection_id for the stories_selection insert
        const { data: fullStory } = await supabase.from("stories").select("collection_id").eq("stories_id", community.id).single();
        
        const rows = themeSettings.assetIds.map((mint: string) => ({
          stories_id: community.id,
          collection_id: fullStory?.collection_id,
          mint_address: mint,
        }));
        const { error: nftError } = await supabase.from("stories_selection").insert(rows);
        if (nftError) throw nftError;
      }
    }

    return NextResponse.json({ success: true, community: data });
  } catch (err: unknown) {
    console.error("[PUT /api/community/[slug]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/community/[slug] — fetch a single community
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = getSupabase();
    const { slug } = await params;
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ community: data });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/community/[slug] — delete a community
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { ownerWallet } = await request.json();

    if (!ownerWallet) {
      return NextResponse.json({ error: "ownerWallet required" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { slug } = await params;

    // Verify ownership before deleting
    const { data: community } = await supabase
      .from("communities")
      .select("id, owner_wallet")
      .eq("slug", slug)
      .maybeSingle();

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }
    if (community.owner_wallet !== ownerWallet) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete community
    const { error } = await supabase
      .from("communities")
      .delete()
      .eq("slug", slug);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[DELETE /api/community/[slug]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
