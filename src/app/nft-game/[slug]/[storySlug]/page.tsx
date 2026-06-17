import Link from "next/link";
import { getSupabase, mapCommunityRecord } from "@/lib/supabase";
import { StarAtlasHub } from "@/components/games/StarAtlasHub";
import { fetchActiveListings, fetchCollectionStats, LISTINGS_PAGE_SIZE } from "@/services/magicEden";
import { notFound } from "next/navigation";

type GameStoryPageProps = {
  params: Promise<{
    slug: string;          // parent game slug
    storySlug: string;     // child story slug
  }>;
};

export const revalidate = 0;

export default async function GameStoryPage({ params }: GameStoryPageProps) {
  const { slug, storySlug } = await params;
  const supabase = getSupabase();

  // Verify parent game exists
  const { data: gameRec } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  const gameCommunity = gameRec ? mapCommunityRecord(gameRec) : undefined;
  if (!gameCommunity || gameCommunity.collectionType !== "type_game") notFound();

  // Load the story that belongs to this game
  const { data: storyRec } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", storySlug)
    .eq("parent_community_id", gameCommunity.id)
    .maybeSingle();
  const storyCommunity = storyRec ? mapCommunityRecord(storyRec) : undefined;
  if (!storyCommunity) notFound();

  // Fetch stats for the story's collection (inherits same address as the game)
  const [statsResult, listingsResult] = await Promise.all([
    fetchCollectionStats(storyCommunity.collectionAddress),
    fetchActiveListings(0, LISTINGS_PAGE_SIZE, storyCommunity.collectionAddress),
  ]);

  const finalListings = listingsResult.data || [];

  // Load all child stories for the parent game to render the toggle
  const { data: storyRows } = await supabase
    .from("communities")
    .select("slug,name,preferred_view")
    .eq("parent_community_id", gameCommunity.id)
    .eq("collection_type", "type_b");
  const stories = storyRows || [];

  return (
    <StarAtlasHub
      community={gameCommunity}
      storyCommunity={storyCommunity}
      stats={statsResult.data}
      listings={finalListings}
      relatedChapters={stories}
      isStoryRoute={true}
    />
  );
}
