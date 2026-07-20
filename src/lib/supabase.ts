import { createClient } from "@supabase/supabase-js";
import { Community } from "./communities";

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

// Maps new `collection` table to the existing UI Community type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCollectionRecord(row: any): Community {
  return {
    id: row.collection_id,
    name: row.name,
    slug: row.slug,
    collectionAddress: row.collection_address,
    preferredView: row.preferred_view,
    description: row.description || "",
    image: row.image || "/window.svg",
    themeSettings: row.theme_settings,
    vipThreshold: row.vip_threshold,
    collectionType: (row.collection_address === "star_atlas" || row.category === "game") ? "type_game" : "type_a",
    parentCommunityId: null,
  };
}

// Maps new `stories` table to the existing UI Community type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapStoryRecord(row: any): Community {
  return {
    id: row.stories_id,
    name: row.name,
    slug: row.slug,
    collectionAddress: row.collection_address,
    preferredView: row.preferred_view,
    description: row.description || "",
    image: row.image || "/window.svg",
    themeSettings: row.theme_settings,
    vipThreshold: row.vip_threshold,
    collectionType: "type_b",
    parentCommunityId: row.collection_id,
  };
}
