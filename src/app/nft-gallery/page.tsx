import Link from "next/link";
import Image from "next/image";
import { getSupabase, mapCommunityRecord } from "@/lib/supabase";
import GallerySearch from "./GallerySearch";

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
          items={allCommunities.map(c => ({ name: c.name, slug: c.slug, type: "Community" }))}
        />

        {/* ── Grid ── */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
                All Collections
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white">
                {typeACommunities.length} {typeACommunities.length === 1 ? "Community" : "Communities"}
              </h2>
            </div>
          </div>

          {typeACommunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] py-24 text-center">
              <svg className="h-12 w-12 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p className="mt-4 text-stone-500">No NFT communities found yet.</p>
              <Link href="/studio/create" className="mt-6 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400">
                Create a Community
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {typeACommunities.map((community) => {
                const children = typeBCommunities.filter(b => b.parentCommunityId === community.id);
                return (
                  <div
                    key={community.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-xl shadow-black/20 transition duration-300 hover:border-emerald-400/40 hover:bg-white/[0.05]"
                  >
                    <Link href={`/${community.slug}`} className="flex flex-1 flex-col">
                      {/* Image */}
                      <div className="flex h-48 w-full items-center justify-center bg-neutral-950 border-b border-white/10 overflow-hidden relative shrink-0">
                        {community.image === "/window.svg" ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-900/40 to-neutral-950 transition duration-500 group-hover:scale-110">
                            <span className="text-7xl font-black text-white/10 uppercase">{community.name.substring(0, 2)}</span>
                          </div>
                        ) : (
                          <Image
                            src={community.image}
                            alt={community.name}
                            fill
                            className="object-cover opacity-70 transition duration-500 group-hover:opacity-100 group-hover:scale-110"
                            unoptimized
                          />
                        )}
                      </div>
  
                      {/* Info */}
                      <div className="flex flex-col p-6 items-center text-center">
                        <h3 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition line-clamp-2">
                          {community.name}
                        </h3>
                      </div>
                    </Link>

                    {/* Sub-collections Area */}
                    <div className="mt-auto flex h-[190px] flex-col border-t border-white/5 bg-black/20 p-4">
                      {children.length > 0 ? (
                        <>
                          <p className="mb-3 shrink-0 text-center text-[10px] font-bold uppercase tracking-widest text-emerald-400">Stories</p>
                          <div className="grid grid-cols-2 gap-2">
                            {(() => {
                              const showSeeMore = children.length > 6;
                              const displayedChildren = children.slice(0, showSeeMore ? 5 : 6);
                              const emptySlotsCount = 6 - displayedChildren.length - (showSeeMore ? 1 : 0);

                              return (
                                <>
                                  {displayedChildren.map(child => (
                                    <Link
                                      key={child.id}
                                      href={`/${community.slug}/${child.slug}`}
                                      className="flex items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 transition hover:border-emerald-500/30 hover:bg-emerald-500/10"
                                    >
                                      <span className="truncate text-sm font-semibold text-stone-200">{child.name}</span>
                                    </Link>
                                  ))}
                                  {showSeeMore && (
                                    <Link
                                      href={`/${community.slug}`}
                                      className="flex items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 transition hover:border-emerald-500/30 hover:bg-emerald-500/10"
                                    >
                                      <span className="truncate text-sm font-bold text-emerald-400">See More →</span>
                                    </Link>
                                  )}
                                  {emptySlotsCount > 0 && Array.from({ length: emptySlotsCount }).map((_, i) => (
                                    <div
                                      key={`empty-${i}`}
                                      className="rounded-lg border border-white/5 border-dashed bg-white/[0.01] px-3 py-2.5"
                                    />
                                  ))}
                                </>
                              );
                            })()}
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center opacity-40">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">No Stories Yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
