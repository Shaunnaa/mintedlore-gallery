"use client";

import { GalleryView } from "@/components/templates/GalleryView";
import { TimelineView as Timeline1View } from "@/components/templates/TimelineView";
import { Timeline2View } from "@/components/templates/Timeline2View";
import { Timeline3View } from "@/components/templates/Timeline3View";
import { Timeline4View } from "@/components/templates/Timeline4View";
import { Timeline5View } from "@/components/templates/Timeline5View";
import { CustomCodeView } from "@/components/templates/CustomCodeView";
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
  const [activeTab, setActiveTab] = useState<"story" | "gallery">(view === "gallery" ? "gallery" : "story");

  return (
    <CurrencyProvider>
      {view !== "gallery" && (
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-xl bg-[#0a0a0f] p-1.5 shadow-inner ring-1 ring-white/10">
            <button
              onClick={() => setActiveTab("story")}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold tracking-wide transition-all ${activeTab === "story" ? "bg-emerald-500/10 text-emerald-300 shadow-sm ring-1 ring-emerald-500/30" : "text-stone-400 hover:text-white"}`}
            >
              📖 Story / Timeline
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold tracking-wide transition-all ${activeTab === "gallery" ? "bg-emerald-500/10 text-emerald-300 shadow-sm ring-1 ring-emerald-500/30" : "text-stone-400 hover:text-white"}`}
            >
              🖼️ Gallery
            </button>
          </div>
        </div>
      )}
      {/* ── Primary view (timeline / custom) ─────────────────────────────── */}
      {activeTab === "story" && view !== "gallery" && (
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
          {(view === "timeline5" || view === "custom_nocode") && (
            <Timeline5View community={community} stats={stats} listings={listings} statsError={statsError} ownedMints={ownedMints} />
          )}
          {view === "custom_code" && (
            <CustomCodeView community={community} />
          )}
        </div>
      )}

      {/* ── Gallery ─────────────────────────── */}
      {activeTab === "gallery" && (
        <div>
          <GalleryView
            community={community}
            stats={stats}
            listings={listings}
            statsError={statsError}
            listingsError={listingsError}
            ownedMints={ownedMints}
          />
        </div>
      )}
    </CurrencyProvider>
  );
}
