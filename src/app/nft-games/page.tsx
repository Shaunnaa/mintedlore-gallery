import Link from "next/link";
import { getSupabase, mapCollectionRecord } from "@/lib/supabase";
import GamesSearch from "./GamesSearch";

export const revalidate = 0;

// Game platform metadata — gives each game a banner colour and tagline
const GAME_META: Record<string, { color: string; tagline: string; icon: string }> = {
  star_atlas: {
    color: "from-cyan-900/60 to-blue-950/80",
    tagline: "Explore the Galia Expanse — ships, crew, and faction stories.",
    icon: "🚀",
  },
};

function getGameMeta(collectionAddress: string) {
  return (
    GAME_META[collectionAddress] ?? {
      color: "from-purple-900/60 to-indigo-950/80",
      tagline: "A Game NFT / SFT storytelling experience.",
      icon: "🎮",
    }
  );
}

export default async function GamesPage() {
  const supabase = getSupabase();
  const { data: collectionsData } = await supabase
    .from("collection")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch child stories to count them
  const { data: storiesData } = await supabase
    .from("stories")
    .select("collection_id");

  const storyCountsByParent = (storiesData || []).reduce((acc: Record<string, number>, child) => {
    if (child.collection_id) {
      acc[child.collection_id] = (acc[child.collection_id] || 0) + 1;
    }
    return acc;
  }, {});

  const communities = (collectionsData || [])
    .map(mapCollectionRecord)
    .filter((c) => c.collectionType === "type_game");

  return (
    <main className="min-h-screen bg-neutral-950 text-stone-50">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 py-10 sm:px-8 lg:px-10">
        {/* ── Header ── */}
        <header className="border-b border-white/10 pb-10">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping bg-cyan-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 bg-cyan-300" />
            </span>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
              Game NFT / SFT Story
            </p>
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Game Story Hubs
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-400">
            Select a game to explore its characters, ships, and custom lore stories created by community owners.
          </p>
        </header>

        {/* ── Search Bar ── */}
        <GamesSearch
          items={communities.map(c => ({ name: c.name, slug: c.slug, type: "Games" }))}
        />

        {/* ── Game Cards Grid ── */}
        <section>
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
              Available Games
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              {communities.length} {communities.length === 1 ? "Game" : "Games"}
            </h2>
          </div>

          {communities.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] py-24 text-center">
              <span className="text-5xl">🎮</span>
              <p className="mt-4 text-stone-500">No game communities found yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {communities.map((community) => {
                const meta = getGameMeta(community.collectionAddress);
                const storyCount = storyCountsByParent[community.id] || 0;

                return (
                  <Link
                    key={community.id}
                    href={`/nft-game/${community.slug}`}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/30 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40"
                  >
                    {/* Banner */}
                    <div className={`relative flex h-52 items-center justify-center bg-gradient-to-br ${meta.color} p-6`}>
                      <span className="text-7xl drop-shadow-2xl transition duration-300 group-hover:scale-110">
                        {meta.icon}
                      </span>
                      {/* Story count badge */}
                      {storyCount > 0 && (
                        <span className="absolute right-4 top-4 rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300 ring-1 ring-emerald-500/30">
                          {storyCount} {storyCount === 1 ? "Story" : "Stories"}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col gap-3 bg-[#0d0d12] p-5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                        Game NFT / SFT
                      </p>
                      <h3 className="text-xl font-semibold text-white transition group-hover:text-cyan-300">
                        {community.name}
                      </h3>
                      <p className="text-sm leading-6 text-stone-400 line-clamp-2">
                        {community.description || meta.tagline}
                      </p>

                      {/* Story list preview */}
                      {storyCount > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(community.themeSettings?.nftStories ?? []).slice(0, 3).map((s, i) => (
                            <span
                              key={i}
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold text-stone-400"
                            >
                              {s.name || `Story ${i + 1}`}
                            </span>
                          ))}
                          {storyCount > 3 && (
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold text-stone-500">
                              +{storyCount - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* CTA */}
                      <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                        <span className="font-mono text-xs text-stone-600">
                          {community.collectionAddress}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-cyan-400 transition group-hover:gap-2.5">
                          View Stories →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
