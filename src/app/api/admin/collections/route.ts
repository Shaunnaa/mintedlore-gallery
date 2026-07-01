import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// GET /api/admin/collections?wallet=<address>
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json({ error: "wallet param required" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Verify admin role
    const { data: userRole } = await supabase
      .from("app_users")
      .select("role")
      .eq("wallet_address", wallet)
      .maybeSingle();

    if (userRole?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 403 });
    }

    // Fetch ALL collections and stories
    const { data: collections, error: err1 } = await supabase
      .from("collection")
      .select("collection_id, name, slug, collection_address, preferred_view, description, vip_threshold, created_at, category")
      .order("created_at", { ascending: true });

    const { data: stories, error: err2 } = await supabase
      .from("stories")
      .select("stories_id, name, slug, collection_address, preferred_view, description, vip_threshold, created_at, collection_id")
      .order("created_at", { ascending: true });

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

    return NextResponse.json({ collections: data });
  } catch (err: unknown) {
    console.error("[/api/admin/collections]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
