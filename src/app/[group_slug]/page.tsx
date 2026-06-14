import Link from "next/link";
import { CommunityViewSwitcher } from "@/components/templates/CommunityViewSwitcher";
import { WalletChecker } from "@/components/wallet/WalletChecker";
import { HolderBadge } from "@/components/wallet/HolderBadge";
import { StarAtlasHub } from "@/components/games/StarAtlasHub";
import { getSupabase, mapCommunityRecord } from "@/lib/supabase";
import {
  fetchActiveListings,
  fetchCollectionStats,
  fetchTokensByMints,
  LISTINGS_PAGE_SIZE,
} from "@/services/magicEden";

type GroupPageProps = {
  params: Promise<{
    group_slug: string;
  }>;
};

export const revalidate = 0; // Ensure fresh data

export default async function GroupPage({ params }: GroupPageProps) {
  const { group_slug } = await params;
  const supabase = getSupabase();
  const { data: record } = await supabase.from("communities").select("*").eq("slug", group_slug).maybeSingle();
  const community = record ? mapCommunityRecord(record) : undefined;

  if (!community) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-5 text-stone-50">
        <section className="max-w-xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
            404
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Community Not Found
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            This community hub does not exist yet.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-11 items-center justify-center border border-emerald-300/50 bg-emerald-300 px-5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
          >
            Back to Platform
          </Link>
        </section>
      </main>
    );
  }

  // ── Standard Magic Eden Logic ──
  const [statsResult, listingsResult] = await Promise.all([
    fetchCollectionStats(community.collectionAddress),
    fetchActiveListings(0, LISTINGS_PAGE_SIZE, community.collectionAddress),
  ]);

  let finalListings = listingsResult.data || [];

  // ── Route to Game Integration Hub if applicable ──
  if (community.collectionType === "type_game" && community.collectionAddress === "star_atlas") {
    return <StarAtlasHub community={community} stats={statsResult.data} listings={finalListings} />;
  }


  if (community.collectionType === "type_b") {
    const { data: nfts } = await supabase
      .from("community_nfts")
      .select("mint_address")
      .eq("community_id", community.id);

    if (nfts && nfts.length > 0) {
      const mints = nfts.map(n => n.mint_address);
      // Fetch the specific tokens so we don't rely on the first 20 active listings page
      const specificTokensResult = await fetchTokensByMints(mints);
      finalListings = specificTokensResult.data || [];
    } else {
      finalListings = [];
    }
  }
  return (
    <main className="min-h-screen bg-neutral-950 text-stone-50">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <header className="border-b border-white/10 pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="text-sm font-medium text-stone-400 transition hover:text-emerald-300"
            >
              Back to communities
            </Link>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-3 w-3 bg-emerald-300" />
              </span>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
                Live Community Hub
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Group {community.id} / {community.preferredView}
              </p>
              <h1 className="mt-3 flex flex-wrap items-center text-4xl font-semibold tracking-normal text-white sm:text-6xl">
                {community.name}
                <HolderBadge
                  collectionAddress={community.collectionAddress}
                  communitySlug={community.slug}
                  vipThreshold={community.vipThreshold ?? 1}
                />
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-stone-300">
                {community.description}
              </p>
            </div>

            <div className="border border-white/10 bg-white/[0.04] px-5 py-4">
              <p className="text-sm text-stone-400">Magic Eden Collection</p>
              <p className="mt-1 font-mono text-lg font-semibold text-white">
                {community.collectionAddress}
              </p>
            </div>
          </div>
        </header>

        <WalletChecker
          collectionAddress={community.collectionAddress}
          communitySlug={community.slug}
          vipThreshold={community.vipThreshold ?? 1}
        />

        <CommunityViewSwitcher
          key={community.slug}
          community={community}
          stats={statsResult.data}
          listings={finalListings}
          statsError={statsResult.error}
          listingsError={listingsResult.error}
        />
      </section>
    </main>
  );
}
