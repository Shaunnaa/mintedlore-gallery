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

    // Verify ownership before updating
    const { slug } = await params;
    const { data: community } = await supabase
      .from("communities")
      .select("id, owner_wallet, collection_type")
      .eq("slug", slug)
      .maybeSingle();

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
    if (vipThreshold   !== undefined) updates.vip_threshold = vipThreshold;
    if (image          !== undefined) updates.image = image;

    const { data, error } = await supabase
      .from("communities")
      .update(updates)
      .eq("slug", slug)
      .select()
      .single();

    if (error) throw error;

    // Sync community_nfts if this is a type_b community
    if (community.collection_type === "type_b" && themeSettings?.assetIds) {
      // Remove all existing to ensure clean sync of order/removals
      await supabase.from("community_nfts").delete().eq("community_id", community.id);
      
      if (themeSettings.assetIds.length > 0) {
        const rows = themeSettings.assetIds.map((mint: string) => ({
          community_id: community.id,
          mint_address: mint,
        }));
        const { error: nftError } = await supabase.from("community_nfts").insert(rows);
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
