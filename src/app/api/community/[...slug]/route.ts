import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

async function resolveCommunity(supabase: ReturnType<typeof getSupabase>, slugArray: string[]) {
  if (slugArray.length === 1) {
    const { data: collection } = await supabase.from("collection").select("*").eq("slug", slugArray[0]).maybeSingle();
    if (collection) return { table: "collection", id: collection.collection_id, community: collection, slug: slugArray[0] };

    // Fallback for standalone stories
    const { data: story } = await supabase.from("stories").select("*").eq("slug", slugArray[0]).maybeSingle();
    if (story) return { table: "stories", id: story.stories_id, community: story, slug: slugArray[0] };
  } else if (slugArray.length === 2) {
    const { data: collection } = await supabase.from("collection").select("collection_id").eq("slug", slugArray[0]).maybeSingle();
    if (collection) {
      const { data: story } = await supabase.from("stories").select("*").eq("slug", slugArray[1]).eq("collection_id", collection.collection_id).maybeSingle();
      if (story) return { table: "stories", id: story.stories_id, community: story, slug: slugArray[1] };
    }
  }
  return null;
}

// PUT /api/community/[...slug] — update theme_settings (and other fields)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { ownerWallet, themeSettings, preferredView, name, description, vipThreshold, image } =
      await request.json();

    if (!ownerWallet) {
      return NextResponse.json({ error: "ownerWallet required" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { slug: slugArray } = await params;
    const resolved = await resolveCommunity(supabase, slugArray);

    if (!resolved) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }
    
    // Admins bypass ownership check
    const { data: userRole } = await supabase.from("app_users").select("role").eq("wallet_address", ownerWallet).maybeSingle();
    if (resolved.community.wallet_address !== ownerWallet && userRole?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updates: Record<string, unknown> = {};
    if (themeSettings !== undefined) updates.theme_settings = themeSettings;
    if (preferredView  !== undefined) updates.preferred_view = preferredView;
    if (name           !== undefined) updates.name = name;
    if (description    !== undefined) updates.description = description;
    if (vipThreshold   !== undefined) updates.vip_threshold = vipThreshold;
    if (image          !== undefined) updates.image = image;

    // Use primary key for update to ensure we hit the exact row
    const pkColumn = resolved.table === "collection" ? "collection_id" : "stories_id";
    const { data, error } = await supabase
      .from(resolved.table)
      .update(updates)
      .eq(pkColumn, resolved.id)
      .select()
      .single();

    if (error) throw error;

    // Sync stories_selection if this is a stories table update
    if (resolved.table === "stories" && themeSettings?.assetIds) {
      await supabase.from("stories_selection").delete().eq("stories_id", resolved.id);
      
      if (themeSettings.assetIds.length > 0) {
        // Need to get collection_id for the stories_selection insert
        const { data: fullStory } = await supabase.from("stories").select("collection_id").eq("stories_id", resolved.id).single();
        
        const rows = themeSettings.assetIds.map((mint: string) => ({
          stories_id: resolved.id,
          collection_id: fullStory?.collection_id,
          mint_address: mint,
        }));
        const { error: nftError } = await supabase.from("stories_selection").insert(rows);
        if (nftError) throw nftError;
      }
    }

    return NextResponse.json({ success: true, community: data });
  } catch (err: unknown) {
    console.error("[PUT /api/community/[...slug]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/community/[...slug] — fetch a single community
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const supabase = getSupabase();
    const { slug: slugArray } = await params;
    const resolved = await resolveCommunity(supabase, slugArray);
    
    if (!resolved) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let communityData;
    if (resolved.table === "collection") {
      communityData = {
        ...resolved.community,
        id: resolved.id,
        owner_wallet: resolved.community.wallet_address,
        collection_type: (resolved.community.collection_address === "star_atlas" || resolved.community.category === "game") ? "type_game" : "type_a",
      };
    } else {
      communityData = {
        ...resolved.community,
        id: resolved.id,
        owner_wallet: resolved.community.wallet_address,
        collection_type: "type_b",
        parent_community_id: resolved.community.collection_id,
      };
    }

    return NextResponse.json({ community: communityData });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/community/[...slug] — delete a community
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { ownerWallet } = await request.json();

    if (!ownerWallet) {
      return NextResponse.json({ error: "ownerWallet required" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { slug: slugArray } = await params;
    const resolved = await resolveCommunity(supabase, slugArray);

    if (!resolved) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }
    
    if (resolved.community.wallet_address !== ownerWallet) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete community using underlying table and PK
    const pkColumn = resolved.table === "collection" ? "collection_id" : "stories_id";
    const { error } = await supabase
      .from(resolved.table)
      .delete()
      .eq(pkColumn, resolved.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[DELETE /api/community/[...slug]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
