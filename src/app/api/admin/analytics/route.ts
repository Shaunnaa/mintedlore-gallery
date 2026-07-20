import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");
    const filter = searchParams.get("filter") || "all"; // 'day', 'week', 'month', 'year', 'all'

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

    // Determine date filter
    const now = new Date();
    let startDate = new Date(0); // Epoch

    if (filter === "day") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1);
    } else if (filter === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (filter === "month") {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    } else if (filter === "year") {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const startDateStr = startDate.toISOString().split("T")[0];

    // Fetch analytics data
    const { data: views, error } = await supabase
      .from("analytics_daily_views")
      .select("*")
      .gte("view_date", startDateStr)
      .order("view_date", { ascending: true });

    if (error) throw error;

    // We also need the names of the collections and stories to display in the top chart
    // We can fetch all collections and stories (this also gives us the total count)
    const { data: collections, count: totalCollections } = await supabase.from("collection").select("collection_id, name", { count: 'exact' });
    const { data: stories, count: totalStories } = await supabase.from("stories").select("stories_id, name", { count: 'exact' });
    
    // Also fetch total public profiles
    const { count: totalProfiles } = await supabase.from("public_profile").select("public_profile_id", { count: 'exact', head: true });

    const nameMap: Record<string, string> = {};
    collections?.forEach(c => (nameMap[`col_${c.collection_id}`] = c.name));
    stories?.forEach(s => (nameMap[`story_${s.stories_id}`] = s.name));

    // Aggregate Data
    let totalViews = 0;
    const viewsByDate: Record<string, number> = {};
    const viewsByEntity: Record<string, { id: string, name: string, type: string, count: number }> = {};

    (views || []).forEach(v => {
      totalViews += v.view_count;

      // Group by date
      if (!viewsByDate[v.view_date]) viewsByDate[v.view_date] = 0;
      viewsByDate[v.view_date] += v.view_count;

      // Group by entity
      let entityKey = "";
      let type = "";
      let id = "";
      if (v.stories_id) {
        entityKey = `story_${v.stories_id}`;
        type = "Story";
        id = String(v.stories_id);
      } else if (v.collection_id) {
        entityKey = `col_${v.collection_id}`;
        type = "Collection";
        id = String(v.collection_id);
      } else {
        entityKey = "page_homepage";
        type = "Page";
        id = "home";
      }

      if (entityKey) {
        if (!viewsByEntity[entityKey]) {
          viewsByEntity[entityKey] = {
            id,
            name: entityKey === "page_homepage" ? "Homepage" : (nameMap[entityKey] || `Unknown ${type} ${id}`),
            type,
            count: 0
          };
        }
        viewsByEntity[entityKey].count += v.view_count;
      }
    });

    // Format for charts
    const chartData = Object.keys(viewsByDate).map(date => ({
      date,
      views: viewsByDate[date]
    }));

    const topPerformers = Object.values(viewsByEntity)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    return NextResponse.json({
      totalViews,
      chartData,
      topPerformers,
      platformTotals: {
        profiles: totalProfiles || 0,
        collections: totalCollections || 0,
        stories: totalStories || 0
      }
    });
  } catch (err: unknown) {
    console.error("[/api/admin/analytics]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
