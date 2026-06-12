"use client";

import { ListingGallery } from "@/components/market/ListingGallery";
import { SpecialNftChecker } from "@/components/wallet/SpecialNftChecker";
import { StatsCard } from "@/components/market/StatsCard";
import { StoryTimeline } from "@/components/demos/StoryTimeline";
import type { MagicEdenListing } from "@/services/magicEden";
import { useState } from "react";

type ViewMode = "collection" | "story";

type CollectionStorySwitcherProps = {
  listings: MagicEdenListing[];
  collectionSymbol: string;
  totalCount: number;
  pageSize: number;
  floorPrice?: number;
  totalVolume?: number;
  statsError?: string | null;
  listingsError?: string | null;
};

const viewOptions: {
  id: ViewMode;
  label: string;
  eyebrow: string;
  description: string;
}[] = [
    {
      id: "collection",
      label: "Collection",
      eyebrow: "Market + Wallet",
      description: "Stats, special access, active listings",
    },
    {
      id: "story",
      label: "Timeline",
      eyebrow: "Story Mode",
      description: "Collection history, utility, roadmap",
    },
  ];

export function CollectionStorySwitcher({
  listings,
  collectionSymbol,
  totalCount,
  pageSize,
  floorPrice,
  totalVolume,
  statsError,
  listingsError,
}: CollectionStorySwitcherProps) {
  const [activeView, setActiveView] = useState<ViewMode>("collection");

  return (
    <>
      <section className="grid gap-3 rounded-none border border-white/10 bg-white/[0.035] p-2 sm:grid-cols-2">
        {viewOptions.map((option) => {
          const isActive = activeView === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setActiveView(option.id)}
              aria-pressed={isActive}
              className={
                isActive
                  ? "min-h-32 border border-cyan-300/60 bg-cyan-300 p-5 text-left text-stone-950 shadow-xl shadow-cyan-950/30 transition duration-200"
                  : "min-h-32 border border-white/10 bg-[#101014] p-5 text-left text-white transition duration-200 hover:border-cyan-300/50 hover:bg-white/[0.06]"
              }
            >
              <span
                className={
                  isActive
                    ? "text-xs font-semibold uppercase tracking-[0.2em] text-stone-800"
                    : "text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300"
                }
              >
                {option.eyebrow}
              </span>
              <span className="mt-3 block text-3xl font-semibold">
                {option.label}
              </span>
              <span
                className={
                  isActive
                    ? "mt-2 block text-sm text-stone-800"
                    : "mt-2 block text-sm text-stone-400"
                }
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </section>

      {activeView === "collection" ? (
        <>
          <StatsCard
            floorPrice={floorPrice}
            totalVolume={totalVolume}
            error={statsError}
          />

          <SpecialNftChecker />

          <ListingGallery
            listings={listings}
            collectionSymbol={collectionSymbol}
            totalCount={totalCount}
            pageSize={pageSize}
            error={listingsError}
          />
        </>
      ) : (
        <StoryTimeline />
      )}
    </>
  );
}
