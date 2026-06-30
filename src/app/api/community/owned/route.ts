import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

// GET /api/community/owned?wallet=<address>
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json({ error: "wallet param required" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: collections, error: err1 } = await supabase
      .from("collection")
      .select("collection_id, name, slug, collection_address, preferred_view, description, vip_threshold, created_at, category")
      .eq("wallet_address", wallet);

    const { data: stories, error: err2 } = await supabase
      .from("stories")
      .select("stories_id, name, slug, collection_address, preferred_view, description, vip_threshold, created_at, collection_id")
      .eq("wallet_address", wallet);

    if (err1 || err2) throw err1 || err2;

    const mappedCollections = (collections || []).map(c => ({
      id: c.collection_id,
      name: c.name,
      slug: c.slug,
      collection_address: c.collection_address,
      preferred_view: c.preferred_view,
      description: c.description,
      vip_threshold: c.vip_threshold,
      created_at: c.created_at,
      parent_community_id: null,
      collection_type: (c.collection_address === "star_atlas" || c.category === "game") ? "type_game" : "type_a",
    }));

    const mappedStories = (stories || []).map(s => ({
      id: s.stories_id,
      name: s.name,
      slug: s.slug,
      collection_address: s.collection_address,
      preferred_view: s.preferred_view,
      description: s.description,
      vip_threshold: s.vip_threshold,
      created_at: s.created_at,
      parent_community_id: s.collection_id,
      collection_type: "type_b",
    }));

    const data = [...mappedCollections, ...mappedStories].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return NextResponse.json({ communities: data ?? [] });
  } catch (err: unknown) {
    console.error("[/api/community/owned]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
