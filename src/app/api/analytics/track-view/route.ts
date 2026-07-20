import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    const { collection_id, stories_id, page_type } = await req.json();
    
    if (!collection_id && !stories_id && page_type !== "homepage") {
      return NextResponse.json({ error: "Missing ID or page_type" }, { status: 400 });
    }

    const supabase = getSupabase();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // 1. Check if record exists for today
    let query = supabase
      .from("analytics_daily_views")
      .select("analytics_daily_views_id, view_count")
      .eq("view_date", today);
      
    if (collection_id) query = query.eq("collection_id", collection_id);
    else query = query.is("collection_id", null);
    
    if (stories_id) query = query.eq("stories_id", stories_id);
    else query = query.is("stories_id", null);

    const { data: existingRecords, error: selectError } = await query;

    if (selectError) {
      throw new Error(selectError.message);
    }

    if (existingRecords && existingRecords.length > 0) {
      // 2. Update existing record
      const record = existingRecords[0];
      const { error: updateError } = await supabase
        .from("analytics_daily_views")
        .update({ view_count: record.view_count + 1 })
        .eq("analytics_daily_views_id", record.analytics_daily_views_id);
        
      if (updateError) throw new Error(updateError.message);
    } else {
      // 3. Insert new record
      const { error: insertError } = await supabase
        .from("analytics_daily_views")
        .insert({
          collection_id: collection_id || null,
          stories_id: stories_id || null,
          view_date: today,
          view_count: 1
        });
        
      if (insertError) throw new Error(insertError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
