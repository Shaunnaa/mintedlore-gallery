import Link from "next/link";
import Image from "next/image";
import { getSupabase, mapCommunityRecord } from "@/lib/supabase";

export const revalidate = 0;

export default async function NftGalleryPage() {
  const supabase = getSupabase();
  const { data: records } = await supabase
    .from("communities")
    .select("*")
    .order("created_at", { ascending: false });

  const communities = (records || [])
    .map(mapCommunityRecord)
    // Exclude game-type communities (e.g. star_atlas)
    .filter((c) => c.collectionType !== "type_game" && c.collectionAddress !== "star_atlas");

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

        {/* ── Grid ── */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
                All Collections
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white">
                {communities.length} {communities.length === 1 ? "Community" : "Communities"}
              </h2>
            </div>
          </div>

          {communities.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] py-24 text-center">
              <svg className="h-12 w-12 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p className="mt-4 text-stone-500">No NFT communities found yet.</p>
              <Link href="/dashboard/create" className="mt-6 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400">
                Create a Community
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {communities.map((community) => (
                <Link
                  key={community.id}
                  href={`/${community.slug}`}
                  className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/[0.06]"
                >
                  {/* Image */}
                  <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-neutral-950">
                    <Image
                      src={community.image}
                      alt={community.name}
                      width={80}
                      height={80}
                      className="opacity-80 transition duration-300 group-hover:opacity-100 group-hover:scale-110"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      {community.preferredView.replace("_", " ")}
                    </p>
                    <h3 className="text-xl font-semibold text-white group-hover:text-emerald-300 transition">
                      {community.name}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-6 text-stone-400">
                      {community.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="font-mono text-xs text-stone-600 truncate max-w-[160px]">
                      {community.collectionAddress}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      View →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
