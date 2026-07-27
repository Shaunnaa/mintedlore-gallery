import Image from "next/image";
import Link from "next/link";
import { getSupabase, mapCommunityRecord } from "@/lib/supabase";

export const revalidate = 0; // Ensure fresh data

export default async function Home() {
  const supabase = getSupabase();
  const { data: records } = await supabase.from("communities").select("*").order("created_at", { ascending: false });
  const communities = (records || [])
    .map(mapCommunityRecord)
    .filter((c) => c.collectionType !== "type_b");

  return (
    <main className="min-h-screen bg-neutral-950 text-stone-50">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 py-8 sm:px-8 lg:px-10">
        <header className="min-h-[72vh] border-b border-white/10 py-10 lg:py-16">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 bg-emerald-300" />
            </span>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
              Live Solana Community Platform
            </p>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="max-w-5xl text-5xl font-semibold tracking-normal text-white sm:text-7xl lg:text-8xl">
                Discover the Stories Behind the Art.
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-8 text-stone-300">
                The premier hub for Solana NFT communities.
              </p>
              <p className="mt-5 max-w-3xl text-base leading-7 text-stone-400">
                Explore curated group profiles, live marketplace metrics, active
                NFT galleries, and timeline-driven stories in one premium Web3
                experience.
              </p>
            </div>

            <div className="border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
              <p className="text-sm text-stone-400">Platform Index</p>
              <p className="mt-2 text-4xl font-semibold text-white">
                {communities.length}
              </p>
              <p className="mt-2 text-sm text-stone-400">
                communities ready for gallery and timeline exploration
              </p>
            </div>
          </div>
        </header>

        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
                Select a community
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                Community Hubs
              </h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {communities.map((community) => (
              <Link
                key={community.id}
                href={`/${community.slug}`}
                className="group grid gap-6 border border-white/10 bg-white/[0.02] p-4 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/[0.04] sm:grid-cols-[140px_1fr] sm:items-center rounded-xl"
              >
                <div className="relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-neutral-950 rounded-lg">
                  {community.image === "/window.svg" ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-900/40 to-neutral-950 transition duration-500 group-hover:scale-110">
                      <span className="text-5xl font-black uppercase text-white/10">{community.name.substring(0, 2)}</span>
                    </div>
                  ) : (
                    <Image
                      src={community.image}
                      alt={community.name}
                      fill
                      className="object-cover opacity-60 transition duration-500 group-hover:scale-110 group-hover:opacity-100"
                      unoptimized
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center p-2 sm:p-0">
                  <h3 className="text-3xl font-bold text-white transition group-hover:text-emerald-300">
                    {community.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
