import Link from "next/link";
import Image from "next/image";
import { getSupabase, mapCommunityRecord } from "@/lib/supabase";
import GallerySearch from "./GallerySearch";
import GalleryGrid from "./GalleryGrid";

export const revalidate = 0;

export default async function NftGalleryPage() {
  const supabase = getSupabase();
  const { data: records } = await supabase
    .from("communities")
    .select("*")
    .order("created_at", { ascending: false });

  const allCommunities = (records || [])
    .map(mapCommunityRecord)
    // Exclude game-type communities (e.g. star_atlas)
    .filter((c) => c.collectionType !== "type_game" && c.collectionAddress !== "star_atlas");

  const typeACommunities = allCommunities.filter(c => c.collectionType === "type_a");
  const typeBCommunities = allCommunities.filter(c => c.collectionType === "type_b");

  return (
    <main className="min-h-screen bg-neutral-950 text-stone-50">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 py-10 sm:px-8 lg:px-10">
        {/* ── Header ── */}
        <header className="border-b border-white/10 pb-10">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 bg-emerald-300" />
            </span>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
              NFT Story & Gallery
            </p>
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Explore Community Stories
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-400">
            Browse NFT collections with custom timeline stories, lore, and curated gallery experiences built by community owners.
          </p>
        </header>

        {/* ── Search Bar ── */}
        <GallerySearch
          items={[
            ...typeACommunities.map(c => ({ name: c.name, slug: c.slug, type: "Community" })),
            ...typeBCommunities.map(c => ({ name: c.name, slug: c.slug, type: "Story" })),
          ]}
        />

        {/* ── Grid with Filters ── */}
        <GalleryGrid
          communities={typeACommunities}
          subCommunities={typeBCommunities}
        />
      </section>
    </main>
  );
}
