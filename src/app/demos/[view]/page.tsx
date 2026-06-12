import { notFound } from "next/navigation";
import Link from "next/link";
import { CommunityViewSwitcher } from "@/components/templates/CommunityViewSwitcher";
import { WalletChecker } from "@/components/wallet/WalletChecker";
import { HolderBadge } from "@/components/wallet/HolderBadge";
import { COMMUNITIES } from "@/lib/communities";
import type { CommunityView } from "@/lib/communities";
import {
  fetchActiveListings,
  fetchCollectionStats,
  LISTINGS_PAGE_SIZE,
} from "@/services/magicEden";

type DemoPageProps = {
  params: Promise<{
    view: string;
  }>;
};

// Must be one of these to be valid
const VALID_VIEWS: CommunityView[] = [
  "timeline1",
  "timeline2",
  "timeline3",
  "timeline4",
  "timeline5",
  "gallery",
  "custom_nocode",
  "custom_code",
];

export default async function DemoViewPage({ params }: DemoPageProps) {
  const { view } = await params;

  if (!VALID_VIEWS.includes(view as CommunityView)) {
    notFound();
  }

  // Use the first mock community but override its preferredView
  const baseCommunity = COMMUNITIES[0];
  const community = {
    ...baseCommunity,
    preferredView: view as CommunityView,
  };

  // Fetch real Magic Eden data for the demo!
  const [statsResult, listingsResult] = await Promise.all([
    fetchCollectionStats(community.collectionAddress),
    fetchActiveListings(0, LISTINGS_PAGE_SIZE, community.collectionAddress),
  ]);

  return (
    <main className="min-h-screen bg-neutral-950 text-stone-50">
      {/* Demo Banner */}
      <div className="bg-emerald-500/10 px-4 py-2 text-center text-xs font-semibold tracking-widest text-emerald-400">
        MOCK DEMO MODE — RENDERING {view.toUpperCase()}
      </div>

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

        {/* Render the specific timeline via the switcher */}
        <CommunityViewSwitcher
          community={community}
          stats={statsResult.data}
          listings={listingsResult.data || []}
          statsError={statsResult.error}
          listingsError={listingsResult.error}
        />
      </section>
    </main>
  );
}
