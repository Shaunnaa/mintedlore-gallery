import { createClient } from "@supabase/supabase-js";
import { Community } from "./communities";

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

// Maps database snake_case row to camelCase Community type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCommunityRecord(row: any): Community {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    collectionAddress: row.collection_address,
    preferredView: row.preferred_view,
    description: row.description || "",
    image: row.image || "/window.svg",
    themeSettings: row.theme_settings,
    vipThreshold: row.vip_threshold,
    collectionType: (row.collection_address === "star_atlas" && row.collection_type === "type_a") ? "type_game" : row.collection_type,
    parentCommunityId: row.parent_community_id,
  };
}
