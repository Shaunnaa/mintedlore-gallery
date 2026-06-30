"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Community {
  id: string;
  name: string;
  slug: string;
  image: string;
  collectionType: string;
  parentCommunityId?: string | null;
}

interface Props {
  communities: Community[];       // type_a only
  subCommunities: Community[];    // type_b only (children)
}

const FILTERS = [
  { key: "all",        label: "All" },
  { key: "has-stories", label: "Has Stories" },
  { key: "no-stories",  label: "No Stories" },
];

export default function GalleryGrid({ communities, subCommunities }: Props) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [layout, setLayout] = useState<"grid" | "list" | "compact">("grid");

  // Build a map of parent_id → children count
  const childrenByParent = subCommunities.reduce<Record<string, Community[]>>((acc, child) => {
    const pid = child.parentCommunityId ?? "";
    if (!acc[pid]) acc[pid] = [];
    acc[pid].push(child);
    return acc;
  }, {});

  const filtered = communities.filter((c) => {
    const hasStories = (childrenByParent[c.id]?.length ?? 0) > 0;
    if (activeFilter === "has-stories") return hasStories;
    if (activeFilter === "no-stories") return !hasStories;
    return true;
  });

  return (
    <section>
      {/* ── Toolbar ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: label + count matching old design */}
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
            All Collections
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            {filtered.length} {filtered.length === 1 ? "Community" : "Communities"}
          </h2>
        </div>

        {/* Right: Grid / List / Compact toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLayout("grid")}
            title="Grid view"
            className={`rounded-lg p-2 transition-colors ${layout === "grid" ? "text-white" : "text-stone-600 hover:text-stone-400"}`}
          >
            {/* Grid: three tall columns */}
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <rect x="2"  y="2" width="4" height="16" rx="1"/>
              <rect x="8"  y="2" width="4" height="16" rx="1"/>
              <rect x="14" y="2" width="4" height="16" rx="1"/>
            </svg>
          </button>
          <span className="h-4 w-px bg-white/10" />
          {/* Compact thumbnail view */}
          <button
            onClick={() => setLayout("compact")}
            title="Compact view"
            className={`rounded-lg p-2 transition-colors ${layout === "compact" ? "text-white" : "text-stone-600 hover:text-stone-400"}`}
          >
            {/* Compact: 3x3 grid of small squares */}
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <rect x="2"  y="2"  width="4" height="4" rx="0.8"/>
              <rect x="8"  y="2"  width="4" height="4" rx="0.8"/>
              <rect x="14" y="2"  width="4" height="4" rx="0.8"/>
              <rect x="2"  y="8"  width="4" height="4" rx="0.8"/>
              <rect x="8"  y="8"  width="4" height="4" rx="0.8"/>
              <rect x="14" y="8"  width="4" height="4" rx="0.8"/>
              <rect x="2"  y="14" width="4" height="4" rx="0.8"/>
              <rect x="8"  y="14" width="4" height="4" rx="0.8"/>
              <rect x="14" y="14" width="4" height="4" rx="0.8"/>
            </svg>
          </button>
          <span className="h-4 w-px bg-white/10" />
          <button
            onClick={() => setLayout("list")}
            title="List view"
            className={`rounded-lg p-2 transition-colors ${layout === "list" ? "text-white" : "text-stone-600 hover:text-stone-400"}`}
          >
            {/* List: clear horizontal bars */}
            <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <line x1="3" y1="5" x2="17" y2="5"/>
              <line x1="3" y1="10" x2="17" y2="10"/>
              <line x1="3" y1="15" x2="17" y2="15"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] py-24 text-center">
          <svg className="h-12 w-12 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <p className="mt-4 text-stone-500">No communities match this filter.</p>
          <button onClick={() => setActiveFilter("all")} className="mt-4 text-sm font-semibold text-emerald-400 hover:text-emerald-300">
            Show All
          </button>
        </div>
      )}

      {/* ── Grid View ── */}
      {filtered.length > 0 && layout === "grid" && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((community) => {
            const children = childrenByParent[community.id] ?? [];
            return (
              <div key={community.id} className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-xl shadow-black/20 transition duration-300 hover:border-emerald-400/40 hover:bg-white/[0.05]">
                <Link href={`/${community.slug}`} className="flex flex-1 flex-col">
                  <div className="flex h-48 w-full items-center justify-center bg-neutral-950 border-b border-white/10 overflow-hidden relative shrink-0">
                    {community.image === "/window.svg" ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-900/40 to-neutral-950 transition duration-500 group-hover:scale-110">
                        <span className="text-7xl font-black text-white/10 uppercase">{community.name.substring(0, 2)}</span>
                      </div>
                    ) : (
                      <Image src={community.image} alt={community.name} fill className="object-cover opacity-70 transition duration-500 group-hover:opacity-100 group-hover:scale-110" unoptimized />
                    )}
                    {/* Stories badge */}
                    {children.length > 0 && (
                      <span className="absolute top-3 right-3 z-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                        {children.length} {children.length === 1 ? "Story" : "Stories"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col p-6 items-center text-center">
                    <h3 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition line-clamp-2">{community.name}</h3>
                  </div>
                </Link>

                <div className="mt-auto flex h-[190px] flex-col border-t border-white/5 bg-black/20 p-4">
                  {children.length > 0 ? (
                    <>
                      <p className="mb-3 shrink-0 text-center text-[10px] font-bold uppercase tracking-widest text-emerald-400">Stories</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(() => {
                          const showSeeMore = children.length > 6;
                          const displayed = children.slice(0, showSeeMore ? 5 : 6);
                          const emptyCount = 6 - displayed.length - (showSeeMore ? 1 : 0);
                          return (
                            <>
                              {displayed.map(child => (
                                <Link key={child.id} href={`/${community.slug}/${child.slug}`} className="flex items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 transition hover:border-emerald-500/30 hover:bg-emerald-500/10">
                                  <span className="truncate text-sm font-semibold text-stone-200">{child.name}</span>
                                </Link>
                              ))}
                              {showSeeMore && (
                                <Link href={`/${community.slug}`} className="flex items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 transition hover:border-emerald-500/30 hover:bg-emerald-500/10">
                                  <span className="truncate text-sm font-bold text-emerald-400">See More →</span>
                                </Link>
                              )}
                              {emptyCount > 0 && Array.from({ length: emptyCount }).map((_, i) => (
                                <div key={`empty-${i}`} className="rounded-lg border border-white/5 border-dashed bg-white/[0.01] px-3 py-2.5" />
                              ))}
                            </>
                          );
                        })()}
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center opacity-40">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">No Stories Yet</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── List View ── */}
      {filtered.length > 0 && layout === "list" && (
        <div className="flex flex-col gap-3">
          {filtered.map((community) => {
            const children = childrenByParent[community.id] ?? [];
            return (
              <Link key={community.id} href={`/${community.slug}`} className="group flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition duration-300 hover:border-emerald-400/40 hover:bg-white/[0.04]">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-900 border border-white/10">
                  {community.image === "/window.svg" ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-900/40 to-neutral-950">
                      <span className="text-xl font-black text-white/20 uppercase">{community.name.substring(0, 2)}</span>
                    </div>
                  ) : (
                    <Image src={community.image} alt={community.name} fill className="object-cover opacity-70 group-hover:opacity-100 transition" unoptimized />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">{community.name}</h3>
                  <p className="text-sm text-stone-500 mt-0.5">
                    {children.length > 0 ? `${children.length} ${children.length === 1 ? "story" : "stories"}` : "No stories yet"}
                  </p>
                </div>
                <svg className="h-5 w-5 text-stone-600 group-hover:text-emerald-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </div>
      )}
      {/* ── Compact Thumbnail View ── */}
      {filtered.length > 0 && layout === "compact" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((community) => {
            const children = childrenByParent[community.id] ?? [];
            return (
              <Link
                key={community.id}
                href={`/${community.slug}`}
                className="group flex flex-col gap-2"
              >
                {/* Square image box */}
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-900 border border-white/10 group-hover:border-emerald-500/40 transition-colors">
                  {community.image === "/window.svg" ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-900/40 to-neutral-950 transition duration-500 group-hover:scale-105">
                      <span className="text-4xl font-black text-white/10 uppercase">{community.name.substring(0, 2)}</span>
                    </div>
                  ) : (
                    <Image src={community.image} alt={community.name} fill className="object-cover opacity-70 transition duration-500 group-hover:opacity-100 group-hover:scale-105" unoptimized />
                  )}
                  {/* Story count badge */}
                  {children.length > 0 && (
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/70 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {children.length} {children.length === 1 ? "story" : "stories"}
                    </span>
                  )}
                </div>
                {/* Name + story count below */}
                <div className="px-0.5">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">{community.name}</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {children.length > 0 ? `${children.length} ${children.length === 1 ? "story" : "stories"}` : "No stories yet"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
