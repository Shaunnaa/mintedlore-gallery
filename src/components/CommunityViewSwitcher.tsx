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

const viewOptions = [
  { id: "timeline", label: "Story Timeline", description: "Immersive narrative view" },
  { id: "gallery", label: "Market Gallery", description: "Standard grid view" },
];

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
  const [activeMode, setActiveMode] = useState<"timeline" | "gallery">(
    community.preferredView === "gallery" ? "gallery" : "timeline"
  );
  
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
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          let fetchedMints = data && Array.isArray(data.ownedMints) ? data.ownedMints : [];
          
          // Demo Hack: Force the first Magic Eden listing to be "owned" so the user can see the badge
          if (community.slug === "demo3" && listings.length > 0) {
            fetchedMints = [...fetchedMints, listings[0].tokenMint];
          }
          
          setOwnedMints(fetchedMints);
        })
        .catch(console.error);
    } else {
      setOwnedMints([]);
    }
  }, [connected, publicKey, community.collectionAddress]);

  // Determine which specific timeline template the admin chose
  const adminTimelineChoice = community.preferredView === "gallery" ? "timeline1" : community.preferredView;

  return (
    <CurrencyProvider>
      <section className="mb-8 grid gap-3 border border-white/10 bg-white/[0.035] p-2 sm:grid-cols-2">
        {viewOptions.map((option) => {
          const isActive = activeMode === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setActiveMode(option.id as "timeline" | "gallery")}
              className={`p-4 text-left transition border ${
                isActive
                  ? "border-emerald-400 bg-emerald-500/20 text-white shadow-[0_0_15px_rgba(52,211,153,0.2)]"
                  : "border-white/10 bg-black/40 text-stone-400 hover:border-emerald-400/50 hover:bg-white/[0.06]"
              }`}
            >
              <span className="block text-sm font-bold uppercase tracking-widest">{option.label}</span>
              <span className="block text-xs text-stone-500 mt-1">{option.description}</span>
            </button>
          );
        })}
      </section>

      {activeMode === "timeline" && adminTimelineChoice === "timeline1" && (
        <Timeline1View community={community} stats={stats} listings={listings} statsError={statsError} ownedMints={ownedMints} />
      )}
      {activeMode === "timeline" && adminTimelineChoice === "timeline2" && (
        <Timeline2View community={community} stats={stats} listings={listings} ownedMints={ownedMints} />
      )}
      {activeMode === "timeline" && adminTimelineChoice === "timeline3" && (
        <Timeline3View community={community} stats={stats} listings={listings} ownedMints={ownedMints} />
      )}
      {activeMode === "timeline" && adminTimelineChoice === "timeline4" && (
        <Timeline4View community={community} stats={stats} listings={listings} statsError={statsError} ownedMints={ownedMints} />
      )}
      {activeMode === "timeline" && adminTimelineChoice === "timeline5" && (
        <Timeline5View community={community} stats={stats} listings={listings} statsError={statsError} ownedMints={ownedMints} />
      )}
      {activeMode === "gallery" && (
        <GalleryView community={community} stats={stats} listings={listings} statsError={statsError} listingsError={listingsError} ownedMints={ownedMints} />
      )}
    </CurrencyProvider>
  );
}
