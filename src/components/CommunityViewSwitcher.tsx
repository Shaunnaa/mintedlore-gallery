"use client";

import { GalleryView } from "@/components/GalleryView";
import { TimelineView as Timeline1View } from "@/components/TimelineView";
import { Timeline2View } from "@/components/Timeline2View";
import { Timeline3View } from "@/components/Timeline3View";
import { Timeline4View } from "@/components/Timeline4View";
import { Timeline5View } from "@/components/Timeline5View";
import { CurrencyProvider } from "@/hooks/useCurrencyConverter";
import type { Community, CommunityView } from "@/lib/communities";
import type { MagicEdenListing, MagicEdenStats } from "@/services/magicEden";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

type CommunityViewSwitcherProps = {
  community: Community;
  stats: MagicEdenStats | null;
  listings: MagicEdenListing[];
  statsError?: string | null;
  listingsError?: string | null;
};

export function CommunityViewSwitcher({
  community,
  stats,
  listings,
  statsError,
  listingsError,
}: CommunityViewSwitcherProps) {
  const { connected, publicKey } = useWallet();
  const [ownedMints, setOwnedMints] = useState<string[]>([]);

  useEffect(() => {
    if (connected && publicKey) {
      fetch("/api/check-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          collectionAddress: community.collectionAddress,
          communitySlug: community.slug,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          let fetchedMints = data && Array.isArray(data.ownedMints) ? data.ownedMints : [];

          // Demo Hack: Force the first listing to be "owned" for demo3
          if (community.slug === "demo3" && listings.length > 0) {
            fetchedMints = [...fetchedMints, listings[0].tokenMint];
          }

          setOwnedMints(fetchedMints);
        })
        .catch(console.error);
    } else {
      setOwnedMints([]);
    }
  }, [connected, publicKey, community.collectionAddress, community.slug]);

  const view = community.preferredView;

  return (
    <CurrencyProvider>
      {/* ── Primary view (timeline / custom) ─────────────────────────────── */}
      {view !== "gallery" && (
        <div className="mb-16">
          {view === "timeline1" && (
            <Timeline1View community={community} stats={stats} listings={listings} statsError={statsError} ownedMints={ownedMints} />
          )}
          {view === "timeline2" && (
            <Timeline2View community={community} stats={stats} listings={listings} ownedMints={ownedMints} />
          )}
          {view === "timeline3" && (
            <Timeline3View community={community} stats={stats} listings={listings} ownedMints={ownedMints} />
          )}
          {view === "timeline4" && (
            <Timeline4View community={community} stats={stats} listings={listings} statsError={statsError} ownedMints={ownedMints} />
          )}
          {(view === "timeline5" || view === "custom_nocode" || view === "custom_code") && (
            <Timeline5View community={community} stats={stats} listings={listings} statsError={statsError} ownedMints={ownedMints} />
          )}
        </div>
      )}

      {/* ── Gallery — always shown on every page ─────────────────────────── */}
      <div>
        {view !== "gallery" && (
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/5" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-600">
              Full Collection Gallery
            </p>
            <div className="h-px flex-1 bg-white/5" />
          </div>
        )}
        <GalleryView
          community={community}
          stats={stats}
          listings={listings}
          statsError={statsError}
          listingsError={listingsError}
          ownedMints={ownedMints}
        />
      </div>
    </CurrencyProvider>
  );
}
