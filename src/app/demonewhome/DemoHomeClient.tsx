"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Community } from "@/lib/communities";

type DemoHomeClientProps = {
  communities: Community[];
};

export function DemoHomeClient({ communities }: DemoHomeClientProps) {
  const [filter, setFilter] = useState<"all" | "nft" | "game">("all");

  // Mock categorizing based on name/slug for the demo
  const isGame = (c: Community) => 
    c.slug.includes("staratlas") || c.name.toLowerCase().includes("game");

  const filteredCommunities = communities.filter(c => {
    if (filter === "all") return true;
    if (filter === "game") return isGame(c);
    if (filter === "nft") return !isGame(c);
    return true;
  });

  return (
    <section>
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
            Select a community
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            Community Hubs
          </h2>
        </div>
        
        {/* The New Toggle Selection */}
        <div className="inline-flex rounded-xl bg-[#0a0a0f] p-1.5 shadow-inner ring-1 ring-white/10">
          <button
            onClick={() => setFilter("all")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold tracking-wide transition-all ${filter === "all" ? "bg-emerald-500/10 text-emerald-300 shadow-sm ring-1 ring-emerald-500/30" : "text-stone-400 hover:text-white"}`}
          >
            🌟 All
          </button>
          <button
            onClick={() => setFilter("nft")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold tracking-wide transition-all ${filter === "nft" ? "bg-emerald-500/10 text-emerald-300 shadow-sm ring-1 ring-emerald-500/30" : "text-stone-400 hover:text-white"}`}
          >
            🎨 Pure NFT
          </button>
          <button
            onClick={() => setFilter("game")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold tracking-wide transition-all ${filter === "game" ? "bg-cyan-500/10 text-cyan-300 shadow-sm ring-1 ring-cyan-500/30" : "text-stone-400 hover:text-white"}`}
          >
            🎮 NFT / SFT Game
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {filteredCommunities.map((community) => (
          <Link
            key={community.id}
            href={`/${community.slug}`}
            className="group grid gap-5 border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/50 hover:bg-white/[0.065] lg:grid-cols-[120px_1fr]"
          >
            <div className="flex aspect-square items-center justify-center border border-white/10 bg-neutral-950 p-8">
              <Image
                src={community.image}
                alt=""
                width={72}
                height={72}
                className="opacity-80 transition duration-300 group-hover:opacity-100"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Group {community.id} / {community.preferredView}
                {isGame(community) && <span className="ml-2 text-cyan-400 font-bold">[GAME]</span>}
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">
                {community.name}
              </h3>
              <p className="mt-3 text-sm leading-6 text-stone-400">
                {community.description}
              </p>
              <p className="mt-5 font-mono text-sm text-stone-500">
                {community.collectionAddress}
              </p>
            </div>
          </Link>
        ))}
        {filteredCommunities.length === 0 && (
          <div className="col-span-2 py-20 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-stone-500 text-lg">No communities found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
}
