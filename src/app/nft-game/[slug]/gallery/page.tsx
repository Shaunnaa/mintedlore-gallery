import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase, mapCommunityRecord } from "@/lib/supabase";
import { fetchActiveListings, fetchCollectionStats, LISTINGS_PAGE_SIZE } from "@/services/magicEden";
import { StarAtlasHub } from "@/components/games/StarAtlasHub";

type GameGalleryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 0;

export default async function GameGalleryPage({ params }: GameGalleryPageProps) {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data: record } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  const community = record ? mapCommunityRecord(record) : undefined;

  if (!community || community.collectionType !== "type_game") {
    notFound();
  }

  // Load stats & listings for the whole game collection (same as before)
  const [statsResult, listingsResult] = await Promise.all([
    fetchCollectionStats(community.collectionAddress),
    fetchActiveListings(0, LISTINGS_PAGE_SIZE, community.collectionAddress),
  ]);

  const finalListings = listingsResult.data || [];

  return (
    <StarAtlasHub
      community={community}
      stats={statsResult.data}
      listings={finalListings}
    />
  );
}
