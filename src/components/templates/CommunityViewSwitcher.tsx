
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
  relatedChapters?: {slug: string; name: string; type: string; view: string}[];
};

export function CommunityViewSwitcher({
  community,
  stats,
  listings,
  statsError,
  listingsError,
  relatedChapters = [],
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
  // Type A defaults to gallery, Type B defaults to story
  const [activeTab, setActiveTab] = useState<"gallery" | "story">(community.collectionType === "type_b" ? "story" : "gallery");

  return (
    <CurrencyProvider>
      {/* ── Unified Gallery / Stories Navigation ── */}
      {relatedChapters.length > 0 && (
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {/* Gallery Button */}
          <a
            href={`/${relatedChapters.find(c => c.type === 'type_a')?.slug || community.slug}`}
            onClick={(e) => {
              if (community.collectionType === "type_a") {
                e.preventDefault();
                setActiveTab("gallery");
              }
            }}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold tracking-wide transition-all shadow-inner ${
              community.collectionType === "type_a" && activeTab === "gallery"
                ? "bg-emerald-500/10 text-emerald-300 shadow-emerald-500/20 ring-1 ring-emerald-500/40"
                : "bg-[#0a0a0f] text-stone-400 ring-1 ring-white/10 hover:bg-white/5 hover:text-white"
            }`}
          >
            🖼️ Gallery
          </a>

          {/* Story Buttons (Only Sub-Collections) */}
          {relatedChapters
            .filter((chapter) => chapter.type !== "type_a")
            .map((chapter) => {
            const isCurrentPage = chapter.slug.endsWith("/" + community.slug);

            return (
              <a
                key={chapter.slug}
                href={`/${chapter.slug}`}
                className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold tracking-wide transition-all shadow-inner ${
                  isCurrentPage
                    ? "bg-emerald-500/10 text-emerald-300 shadow-emerald-500/20 ring-1 ring-emerald-500/40"
                    : "bg-[#0a0a0f] text-stone-400 ring-1 ring-white/10 hover:bg-white/5 hover:text-white"
                }`}
              >
                📖 {chapter.name}
              </a>
            );
          })}
        </div>
      )}

      {/* ── Secondary view (gallery fallback) ────────────────────────────── */}
      {activeTab === "gallery" && (
        <GalleryView community={community} stats={stats} listings={listings} statsError={statsError} listingsError={listingsError} ownedMints={ownedMints} />
      )}

      {/* ── Primary view (timeline / custom) ─────────────────────────────── */}
      {activeTab === "story" && (
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
            <CustomCodeView community={community} listings={listings} />
          )}
        </div>
      )}

      {view === "gallery" && (
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
