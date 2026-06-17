"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { Community } from "@/lib/communities";
import type { MagicEdenListing, MagicEdenStats } from "@/services/magicEden";
import { OwnedBadge } from "@/components/wallet/OwnedBadge";
import { useCurrencyConverter } from "@/hooks/useCurrencyConverter";

const CHAPTER_LABELS = [
  { letter: "A", title: "The Awakening",      color: "#a78bfa" },
  { letter: "B", title: "The Convergence",    color: "#60a5fa" },
  { letter: "C", title: "The Ascension",      color: "#34d399" },
  { letter: "D", title: "The Reckoning",      color: "#f472b6" },
  { letter: "E", title: "The Revelation",     color: "#fb923c" },
  { letter: "F", title: "The Transcendence",  color: "#facc15" },
  { letter: "G", title: "The Aftermath",      color: "#818cf8" },
  { letter: "H", title: "The Legacy",         color: "#2dd4bf" },
];

function StoryCard({
  listing,
  index,
  isOwned,
  community,
}: {
  listing: MagicEdenListing;
  index: number;
  isOwned: boolean;
  community: Community;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const chapter = CHAPTER_LABELS[index % CHAPTER_LABELS.length];
  const { formatValue } = useCurrencyConverter();
  const isEven = index % 2 === 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("story-card--visible");
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`story-card relative flex flex-col gap-8 md:flex-row md:items-center ${
        isEven ? "" : "md:flex-row-reverse"
      }`}
    >
      {/* Chapter beacon & connecting line */}
      <div
        className="absolute left-0 top-0 flex h-14 w-14 shrink-0 -translate-x-1/2 items-center justify-center rounded-full border-4 border-neutral-950 shadow-[0_0_30px_var(--chapter-color)] md:relative md:translate-x-0"
        style={{
          backgroundColor: `${chapter.color}22`,
          borderColor: chapter.color,
          "--chapter-color": chapter.color,
        } as React.CSSProperties}
      >
        <span
          className="text-xl font-black"
          style={{ color: chapter.color }}
        >
          {chapter.letter}
        </span>
      </div>

      {/* Card Body */}
      <div
        className={`story-card__body ml-20 flex-1 overflow-hidden rounded-2xl border bg-[#0d0d12] shadow-2xl md:ml-0 ${
          isEven ? "md:mr-4" : "md:ml-4"
        }`}
        style={{ borderColor: `${chapter.color}30` }}
      >
        {/* Top image strip */}
        <div className="relative h-48 w-full overflow-hidden bg-neutral-900 md:h-64">
          {listing.image && (
            <Image
              src={listing.image}
              alt={listing.name}
              fill
              className="object-cover opacity-90 transition-transform duration-[2000ms] group-hover:scale-105"
              unoptimized
            />
          )}
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent 40%, #0d0d12 100%)`,
            }}
          />
          {/* Chapter label inside image */}
          <div
            className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest backdrop-blur-md"
            style={{
              backgroundColor: `${chapter.color}20`,
              color: chapter.color,
              border: `1px solid ${chapter.color}40`,
            }}
          >
            Chapter {chapter.letter} — {chapter.title}
          </div>
          {isOwned && (
            <div className="absolute right-4 top-4">
              <OwnedBadge />
            </div>
          )}
        </div>

        {/* Card content */}
        <div className="p-6 md:p-8">
          <h3 className="text-2xl font-bold text-white md:text-3xl">
            {listing.name}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-stone-400">
            {community.themeSettings?.assetDescriptions?.[listing.tokenMint] || (
              <>
                In this chapter of the{" "}
                <span className="font-medium text-stone-200">{community.name}</span>{" "}
                saga, this legendary piece emerged from the depths of the blockchain.
                Claimed by{" "}
                <span className="font-medium" style={{ color: chapter.color }}>
                  {listing.sellerName}
                </span>
                , it now awaits its next destined keeper.
              </>
            )}
          </p>

          <div
            className="mt-6 flex items-center justify-between border-t pt-5"
            style={{ borderColor: `${chapter.color}20` }}
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-stone-500">
                Current Offering
              </p>
              <p
                className="mt-1 text-2xl font-bold tabular-nums"
                style={{ color: chapter.color }}
              >
                {formatValue(listing.priceLamports)}
              </p>
            </div>
            <a
              href={`https://magiceden.io/item-details/${listing.tokenMint}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{
                backgroundColor: `${chapter.color}20`,
                color: chapter.color,
                border: `1px solid ${chapter.color}50`,
              }}
            >
              Acquire →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Timeline4View({
  community,
  stats,
  listings,
  statsError,
  ownedMints = [],
}: {
  community: Community;
  stats: MagicEdenStats | null;
  listings: MagicEdenListing[];
  statsError?: string | null;
  ownedMints?: string[];
}) {
  const isTypeB = community.collectionType === "type_b";
  const displayListings = isTypeB && community.themeSettings?.assetIds?.length
    ? community.themeSettings.assetIds.map(id => listings.find(l => l.tokenMint === id)).filter(Boolean) as MagicEdenListing[]
    : listings;

  return (
    <>
      <style>{`
        .story-card {
          opacity: 0;
          transform: translateY(48px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .story-card--visible {
          opacity: 1;
          transform: translateY(0);
        }
        .story-card:nth-child(even) {
          transition-delay: 0.1s;
        }
      `}</style>

      {/* Hero intro block */}
      <section className="mb-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-400">
          The Collection Saga
        </p>
        <h1 className="mt-4 text-5xl font-black text-white md:text-7xl">
          {community.name}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-stone-400">
          {community.description}
        </p>

        {/* Stats ribbon */}
        {!statsError && stats && (
          <div className="mx-auto mt-10 flex max-w-lg flex-wrap items-center justify-center gap-6">
            {[
              { label: "Floor", value: `${((stats?.floorPrice || 0) / 1e9).toFixed(2)} SOL` },
              { label: "Volume", value: `${((stats?.volumeAll || 0) / 1e9).toFixed(0)} SOL` },
              { label: "Listed", value: String(stats?.listedCount || 0) },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xs uppercase tracking-widest text-stone-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Scroll cue */}
        <div className="mt-12 flex flex-col items-center gap-2 text-xs tracking-widest text-stone-600">
          <span>SCROLL TO EXPLORE</span>
          <div className="h-8 w-px animate-pulse bg-gradient-to-b from-stone-600 to-transparent" />
        </div>
      </section>

      {/* Story cards with vertical spine */}
      <div className="relative mx-auto max-w-3xl">
        {/* Central spine line */}
        <div className="absolute bottom-0 left-0 top-0 w-px bg-gradient-to-b from-violet-500/60 via-blue-500/30 to-transparent md:left-1/2 md:-ml-px" />

        <div className="flex flex-col gap-24">
          {displayListings.map((listing, index) => (
            <StoryCard
              key={listing.tokenMint}
              listing={listing}
              index={index}
              isOwned={ownedMints.includes(listing.tokenMint)}
              community={community}
            />
          ))}

          {displayListings.length === 0 && (
            <p className="py-20 text-center text-stone-500">
              No chapters available yet — the story is still being written.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
