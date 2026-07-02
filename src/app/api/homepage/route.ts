import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabase();

    // 1. Fetch newly minted lore (Top 4 recent stories)
    // We join the collection table to get the community name
    const { data: recentStories, error: storiesError } = await supabase
      .from("stories")
      .select(`
        *,
        collection:collection_id(name)
      `)
      .order("created_at", { ascending: false })
      .limit(4);

    if (storiesError) throw new Error(storiesError.message);

    // 2. Fetch Top Read Collections (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split("T")[0];

    const { data: viewsData, error: viewsError } = await supabase
      .from("analytics_daily_views")
      .select(`
        view_count, 
        collection:collection_id(collection_id, name, slug, image),
        story:stories_id(stories_id, name, slug, image)
      `)
      .gte("view_date", dateStr);

    if (viewsError) throw new Error(viewsError.message);

    // Aggregate views by collection and story in memory
    const collectionStats: Record<string, any> = {};
    const storyStats: Record<string, any> = {};
    
    if (viewsData) {
      for (const row of viewsData) {
        // --- Collection Aggregation ---
        if (row.collection) {
          const coll = Array.isArray(row.collection) ? row.collection[0] : row.collection;
          if (coll && coll.collection_id) {
            const cid = coll.collection_id.toString();
            if (!collectionStats[cid]) {
              collectionStats[cid] = {
                id: coll.collection_id,
                name: coll.name,
                slug: coll.slug,
                image: coll.image,
                total_views: 0
              };
            }
            collectionStats[cid].total_views += row.view_count;
          }
        }
        
        // --- Story Aggregation ---
        if (row.story) {
          const st = Array.isArray(row.story) ? row.story[0] : row.story;
          if (st && st.stories_id) {
            const sid = st.stories_id.toString();
            if (!storyStats[sid]) {
              storyStats[sid] = {
                id: st.stories_id,
                name: st.name,
                slug: st.slug,
                image: st.image,
                total_views: 0
              };
            }
            storyStats[sid].total_views += row.view_count;
          }
        }
      }
    }

    // Sort and take top 5 for both
    const topCollections = Object.values(collectionStats)
      .sort((a, b) => b.total_views - a.total_views)
      .slice(0, 5);
      
    const topStories = Object.values(storyStats)
      .sort((a, b) => b.total_views - a.total_views)
      .slice(0, 5);

    return NextResponse.json({
      recentStories: recentStories || [],
      topCollections: topCollections,
      topStories: topStories
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
