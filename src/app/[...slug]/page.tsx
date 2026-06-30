import Link from "next/link";
import { CommunityViewSwitcher } from "@/components/templates/CommunityViewSwitcher";
import { WalletChecker } from "@/components/wallet/WalletChecker";
import { HolderBadge } from "@/components/wallet/HolderBadge";
import { redirect } from "next/navigation";
import { StarAtlasHub } from "@/components/games/StarAtlasHub";
import { getSupabase, mapCollectionRecord, mapStoryRecord } from "@/lib/supabase";
import {
  fetchActiveListings,
  fetchCollectionStats,
  fetchTokensByMints,
  LISTINGS_PAGE_SIZE,
} from "@/services/magicEden";
import { getCollectionAssets } from "@/services/metaplex";

type GroupPageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export const revalidate = 0; // Ensure fresh data

export default async function GroupPage({ params }: GroupPageProps) {
  const { slug } = await params;
  if (!slug || slug.length === 0 || slug.length > 2) return null;

  const targetSlug = slug[slug.length - 1];

  const supabase = getSupabase();
  let community = undefined;
  
  const { data: collectionRecord } = await supabase.from("collection").select("*").eq("slug", targetSlug).maybeSingle();
  if (collectionRecord) {
    community = mapCollectionRecord(collectionRecord);
  } else {
    const { data: storyRecord } = await supabase.from("stories").select("*").eq("slug", targetSlug).maybeSingle();
    if (storyRecord) {
      community = mapStoryRecord(storyRecord);
    }
  }

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

  // Fetch related chapters (stories) for this collection
  let relatedRecords: any[] = [];
  let parentRecord: any = null;

  if (community.collectionType === "type_b") {
    const { data: parent } = await supabase.from("collection").select("*").eq("collection_id", community.parentCommunityId).maybeSingle();
    parentRecord = parent;
    const { data: stories } = await supabase.from("stories").select("*").eq("collection_id", community.parentCommunityId).order("created_at");
    relatedRecords = stories || [];
  } else {
    parentRecord = collectionRecord; // Since they are on the parent page
    const { data: stories } = await supabase.from("stories").select("*").eq("collection_id", community.id).order("created_at");
    relatedRecords = stories || [];
  }

  // Determine parent slug for building nested routes
  const parentSlug = parentRecord?.slug || community.slug;

  // Redirect if someone visits a child directly at the root (e.g., /fox-2 -> /fox/fox-2)
  if (slug.length === 1 && community.collectionType === "type_b" && parentSlug !== community.slug) {
    redirect(`/${parentSlug}/${community.slug}`);
  }

  const relatedChapters = [
    {
      slug: parentSlug,
      name: parentRecord?.name || community.name,
      type: "type_a",
      view: parentRecord?.preferred_view || community.preferredView
    },
    ...relatedRecords.map(r => ({
      slug: `${parentSlug}/${r.slug}`,
      name: r.name,
      type: "type_b",
      view: r.preferred_view
    }))
  ];

  // ── Primary Source: DAS API vs Magic Eden ──
  const isDasAddress = community.collectionAddress.length > 30;
  const meSymbol = community.themeSettings?.magicEdenSymbol;

  let finalListings: any[] = [];
  let statsData: any = null;
  let statsError: string | null = null;
  let listingsError: string | null = null;

  if (isDasAddress) {
    // Use DAS API (Primary Source) for assets - fetch 50 items for gallery
    const { data, error } = await getCollectionAssets(community.collectionAddress, 50);
    finalListings = data || [];
    listingsError = error;

    // Use Magic Eden API for stats and prices if symbol was provided
    if (meSymbol) {
      const [statsResult, meListingsResult] = await Promise.all([
        fetchCollectionStats(meSymbol),
        fetchActiveListings(0, 100, meSymbol)
      ]);

      statsData = statsResult.data;
      statsError = statsResult.error;

      // Merge ME listing prices into DAS data
      if (meListingsResult.data) {
        const priceMap = new Map(meListingsResult.data.map(l => [l.tokenMint, l.priceLamports]));
        finalListings = finalListings.map(item => ({
          ...item,
          priceLamports: priceMap.get(item.tokenMint) || 0
        }));
      }
    } else {
      statsData = null;
    }
  } else {
    // Legacy fallback using Magic Eden for both assets and stats
    const querySymbol = meSymbol || community.collectionAddress;
    const [statsResult, listingsResult] = await Promise.all([
      fetchCollectionStats(querySymbol),
      fetchActiveListings(0, LISTINGS_PAGE_SIZE, querySymbol),
    ]);
    statsData = statsResult.data;
    statsError = statsResult.error;
    finalListings = listingsResult.data || [];
    listingsError = listingsResult.error;
  }

  // ── Route to Game Integration Hub if applicable ──
  if (community.collectionType === "type_game" || community.collectionAddress === "star_atlas") {
    redirect(`/nft-game/${community.slug}`);
  }

  if (community.collectionType === "type_b") {
    const { data: nfts } = await supabase
      .from("stories_selection")
      .select("mint_address")
      .eq("stories_id", community.id);

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
                Verified On-Chain Community
              </p>
              <h1 className="mt-3 flex flex-wrap items-center text-4xl font-semibold tracking-normal text-white sm:text-6xl">
                {parentRecord?.name || community.name}
                <HolderBadge
                  collectionAddress={community.collectionAddress}
                  communitySlug={community.slug}
                  vipThreshold={community.vipThreshold ?? 1}
                />
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-stone-300">
                {parentRecord?.description || community.description}
              </p>
            </div>

            <div className="border border-white/10 bg-white/[0.04] px-5 py-4">
              <p className="text-sm text-stone-400">On-Chain Address</p>
              <p className="mt-1 font-mono text-sm font-semibold text-white break-all">
                {community.collectionAddress.length > 30 
                  ? `${community.collectionAddress.slice(0, 6)}...${community.collectionAddress.slice(-6)}` 
                  : community.collectionAddress}
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
          stats={statsData}
          listings={finalListings}
          statsError={statsError}
          listingsError={listingsError}
          relatedChapters={relatedChapters}
        />
      </section>
    </main>
  );
}
