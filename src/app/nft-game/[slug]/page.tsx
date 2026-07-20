import Link from "next/link";
import { StarAtlasHub } from "@/components/games/StarAtlasHub";
import { getSupabase, mapCollectionRecord, mapStoryRecord } from "@/lib/supabase";
import {
  fetchActiveListings,
  fetchCollectionStats,
  LISTINGS_PAGE_SIZE,
} from "@/services/magicEden";

type GamePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 0; // Ensure fresh data

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  const supabase = getSupabase();
  let community = undefined;
  
  const { data: collectionRecord } = await supabase.from("collection").select("*").eq("slug", slug).maybeSingle();
  if (collectionRecord) {
    community = mapCollectionRecord(collectionRecord);
  } else {
    const { data: storyRecord } = await supabase.from("stories").select("*").eq("slug", slug).maybeSingle();
    if (storyRecord) {
      community = mapStoryRecord(storyRecord);
    }
  }

  if (!community || (community.collectionType !== "type_game" && community.collectionAddress !== "star_atlas")) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-5 text-stone-50">
        <section className="max-w-xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
            404
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Game Not Found
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            This game hub does not exist or is not categorized as a game.
          </p>
          <Link
            href="/nft-games"
            className="mt-6 inline-flex h-11 items-center justify-center border border-cyan-300/50 bg-cyan-300 px-5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
          >
            Back to Games
          </Link>
        </section>
      </main>
    );
  }

  // ── Load child stories (type B) for this game ──
  const parentId = community.parentCommunityId || community.id;
  const { data: storyRows } = await supabase
    .from("stories")
    .select("slug,name,preferred_view")
    .eq("collection_id", parentId);
  const stories = storyRows || [];

  // ── Standard Magic Eden Logic ──
  const [statsResult, listingsResult] = await Promise.all([
    fetchCollectionStats(community.collectionAddress),
    fetchActiveListings(0, LISTINGS_PAGE_SIZE, community.collectionAddress),
  ]);

  const finalListings = listingsResult.data || [];

  // Render the gallery UI (StarAtlasHub) and pass the stories down to it
  return (
    <StarAtlasHub 
      community={community} 
      stats={statsResult.data} 
      listings={finalListings} 
      relatedChapters={stories}
      isStoryRoute={false}
    />
  );

}
