"use client";

import { useState } from "react";
import type { Community } from "@/lib/communities";
import type { MagicEdenStats, MagicEdenListing } from "@/services/magicEden";
import { useCurrencyConverter, type Currency } from "@/hooks/useCurrencyConverter";
import Image from "next/image";
import { OwnedBadge } from "@/components/OwnedBadge";

type TimelineViewProps = {
  community: Community;
  stats: MagicEdenStats | null;
  listings: MagicEdenListing[];
  statsError?: string | null;
  ownedMints?: string[];
};

export function TimelineView({
  community,
  stats,
  listings,
  statsError,
  ownedMints = [],
}: TimelineViewProps) {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const { selectedCurrency, setSelectedCurrency, formatValue } = useCurrencyConverter();

  return (
    <div className="flex flex-col gap-12">
      <section className="border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 md:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
          Timeline View
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
          {community.name} Story
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-300 md:text-base md:leading-7">
          {community.description}
        </p>

        {statsError ? (
          <p className="mt-5 border border-red-400/30 bg-red-950/20 px-4 py-3 text-sm text-red-100">
            {statsError}
          </p>
        ) : (
          <div className="mt-8 flex flex-col gap-6">
            {/* Currency Toggle */}
            <div className="flex gap-1 rounded-lg bg-black/40 p-1 w-max border border-white/5">
              {(["SOL", "USD", "THB"] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setSelectedCurrency(cur)}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-md ${
                    selectedCurrency === cur
                      ? "bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.2)]"
                      : "text-stone-500 hover:text-stone-300 hover:bg-white/5"
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border border-white/10 bg-neutral-950 p-5">
                <p className="text-sm font-medium text-stone-400">Floor</p>
                <p className="mt-2 text-3xl font-semibold text-white transition-all duration-300">
                  {formatValue(stats?.floorPrice)}
                </p>
              </div>
              <div className="border border-white/10 bg-neutral-950 p-5">
                <p className="text-sm font-medium text-stone-400">Volume</p>
                <p className="mt-2 text-3xl font-semibold text-white transition-all duration-300">
                  {formatValue(stats?.volumeAll)}
                </p>
              </div>
              <div className="border border-white/10 bg-neutral-950 p-5">
                <p className="text-sm font-medium text-stone-400">Listed</p>
                <p className="mt-2 text-3xl font-semibold text-white transition-all duration-300">
                  {stats?.listedCount ?? 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="relative mx-auto w-full max-w-4xl py-12">
        {/* Central vertical line for desktop, left line for mobile */}
        <div className="absolute bottom-0 left-6 top-0 w-px bg-white/10 md:left-1/2 md:-ml-px" />

        <div className="flex flex-col gap-12">
          {listings.map((listing, index) => {
            const isEven = index % 2 === 0;
            const isOwned = ownedMints.includes(listing.tokenMint);

            return (
              <div
                key={listing.tokenMint}
                className={`relative flex flex-col md:flex-row md:items-center ${
                  isEven ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-6 top-6 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-neutral-950 bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.1)] md:left-1/2 md:top-1/2" />

                {/* Empty half for alignment */}
                <div className="hidden md:block md:w-1/2" />

                {/* Content */}
                <div
                  className={`ml-16 md:ml-0 md:w-1/2 ${
                    isEven ? "md:pr-12" : "md:pl-12"
                  }`}
                >
                  <article className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#121216] p-2 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-emerald-500/30 hover:shadow-emerald-900/20">
                    {/* Glowing background gradient on hover */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    
                    {/* Diagonal pattern background decoration */}
                    <div className="absolute inset-0 -z-10 opacity-0 transition duration-500 group-hover:opacity-100">
                      <svg
                        className="absolute inset-0 h-full w-full"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <pattern
                            id="diagonal-stripe"
                            width="24"
                            height="24"
                            patternTransform="rotate(45 0 0)"
                            patternUnits="userSpaceOnUse"
                          >
                            <line
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="24"
                              stroke="rgba(52,211,153,0.04)"
                              strokeWidth="1"
                            />
                          </pattern>
                        </defs>
                        <rect
                          width="100%"
                          height="100%"
                          fill="url(#diagonal-stripe)"
                        />
                      </svg>
                    </div>

                    <div className="flex flex-col gap-4 p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 ring-1 ring-emerald-400/20 transition-colors group-hover:bg-emerald-400/20 sm:text-xs">
                          Market Listing
                        </span>
                        <div className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 ring-1 ring-white/10 transition-colors group-hover:ring-emerald-500/30">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          </span>
                          <time className="font-mono text-xs font-semibold text-emerald-50">
                            {formatValue(listing.priceLamports)}
                          </time>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-5">
                        <div className="relative w-[140px] aspect-square shrink-0 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 transition-colors duration-500 group-hover:border-emerald-500/40">
                          {listing.image ? (
                            <Image
                              src={listing.image}
                              alt={listing.name}
                              width={140}
                              height={140}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="h-full w-full" />
                          )}
                        </div>
                        
                        <div className="flex flex-col">
                          {isOwned && (
                            <div className="mb-3">
                              <OwnedBadge />
                            </div>
                          )}
                          <h3 className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-emerald-300">
                            {listing.name}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-stone-400">
                            A highly sought-after asset from the <span className="text-stone-300">{community.name}</span> collection. This premium listing was placed on the open market by <span className="font-medium text-emerald-200/80">{listing.sellerName}</span>.
                          </p>
                          <button
                            onClick={() => setSelectedToken(listing.tokenMint)}
                            className="mt-5 w-max inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-2 text-xs font-bold uppercase tracking-wider text-emerald-300 transition-all hover:scale-105 hover:bg-emerald-400 hover:text-neutral-950"
                          >
                            Buy on Magic Eden
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            );
          })}

          {listings.length === 0 && (
            <p className="text-center text-sm text-stone-500 py-10">
              No NFT timeline data available.
            </p>
          )}
        </div>
      </section>

      {/* Confirmation Modal */}
      {selectedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#121216] p-6 shadow-2xl shadow-black">
            <h3 className="text-xl font-bold text-white">Visit Magic Eden</h3>
            <p className="mt-3 text-sm leading-6 text-stone-400">
              You are about to leave the gallery to view this listing on the Magic Eden marketplace. Do you want to continue?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedToken(null)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-stone-400 transition hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>
              <a
                href={`https://magiceden.io/item-details/${selectedToken}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setSelectedToken(null)}
                className="rounded-lg bg-emerald-400 px-5 py-2 text-sm font-bold text-neutral-950 transition hover:bg-emerald-300"
              >
                Continue
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
