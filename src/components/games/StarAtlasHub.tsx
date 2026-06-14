"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Community } from "@/lib/communities";
import { HolderBadge } from "@/components/wallet/HolderBadge";
import Link from "next/link";
import { ListingGallery } from "@/components/market/ListingGallery";
import type { MagicEdenStats, MagicEdenListing } from "@/services/magicEden";

type StarAtlasHubProps = {
  community: Community;
  stats?: MagicEdenStats | null;
  listings: MagicEdenListing[];
};

// Types based on the actual Star Atlas API (https://galaxy.staratlas.com/nfts)
type StarAtlasNFT = {
  _id: string;
  name: string;
  description: string;
  image: string;
  symbol: string;
  attributes: {
    itemType: string;
    class: string;
    tier: number;
    spec: string;
    make: string;
  };
  tradeSettings?: {
    msrp?: { value: number };
  };
};

export function StarAtlasHub({ community, stats, listings }: StarAtlasHubProps) {
  const [items, setItems] = useState<StarAtlasNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ship" | "resource" | "structure" | "crew" | "all">("ship");
  const [activeTab, setActiveTab] = useState<string>("stories");
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
  const nftStories = community.themeSettings?.nftStories || [];

  useEffect(() => {
    fetch("https://galaxy.staratlas.com/nfts")
      .then(res => res.json())
      .then((data: StarAtlasNFT[]) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch Star Atlas data", err);
        setLoading(false);
      });
  }, []);

  // Automatically animate elements inside the custom HTML
  useEffect(() => {
    if (activeTab === "stories") {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('story-anim-active');
          }
        });
      }, { threshold: 0.3 });

      const elements = document.querySelectorAll('.story-anim-trigger');
      elements.forEach(el => observer.observe(el));

      return () => observer.disconnect();
    }
  }, [activeTab, activeStoryIndex, nftStories]);

  const selectedAssetIds = community.themeSettings?.selectedAssetIds || [];
  
  const filteredItems = items.filter(item => {
    if (selectedAssetIds.length > 0 && !selectedAssetIds.includes(item._id)) {
      return false;
    }
    if (filter === "all") return true;
    return item.attributes?.itemType?.toLowerCase() === filter;
  });

  return (
    <main className="min-h-screen bg-[#050505] text-stone-50 font-sans">
      <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        
        {/* Hub Header */}
        <header className="border-b border-white/10 pb-8 pt-4">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-stone-400 transition hover:text-emerald-300">
            ← Back to Platform
          </Link>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                Official Game Integration
              </p>
              <h1 className="mt-3 flex flex-wrap items-center text-5xl font-black tracking-tight text-white sm:text-7xl">
                {community.name}
                <HolderBadge
                  collectionAddress="star_atlas"
                  communitySlug={community.slug}
                  vipThreshold={community.vipThreshold ?? 1}
                />
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-stone-300">
                {community.description || "Explore the Galactic Marketplace, browse ships, resources, and structures directly from the Star Atlas API."}
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-500">Total Assets Tracked</p>
              <p className="mt-2 font-mono text-4xl font-bold text-cyan-300">
                {loading ? "..." : items.length}
              </p>
              <p className="mt-2 text-xs text-stone-500">Live data from galaxy.staratlas.com</p>
            </div>
          </div>
        </header>

        {/* ── TABS ── */}
        <div className="flex flex-wrap gap-4 border-b border-white/10 pb-6 mt-6">
            <button 
              onClick={() => setActiveTab("hub")}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition ${activeTab === "hub" ? "bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "border-white/10 text-stone-400 hover:border-white/30"}`}
            >
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping bg-cyan-400 opacity-60" />
                <span className="relative inline-flex h-3 w-3 bg-cyan-300" />
              </span>
              <span className="text-sm font-bold uppercase tracking-widest">
                Marketplace Hub
              </span>
            </button>

            <button 
              onClick={() => setActiveTab("nft")}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition ${activeTab === "nft" ? "bg-purple-500/10 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "border-white/10 text-stone-400 hover:border-white/30"}`}
            >
              <span className="text-sm font-bold uppercase tracking-widest">
                NFT Gallery
              </span>
            </button>

            {nftStories.length > 0 && (
              <button 
                onClick={() => setActiveTab("stories")}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition ${activeTab === "stories" ? "bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-white/10 text-stone-400 hover:border-white/30"}`}
              >
                <span className="text-sm font-bold uppercase tracking-widest">
                  Story Gallery
                </span>
              </button>
            )}
          </div>

        {/* ── GAME HUB RENDERER ── */}
        {activeTab === "hub" && (
          <>
            <div className="mt-4 flex flex-wrap gap-4 border-b border-white/5 pb-6">
              {(["all", "ship", "crew", "resource", "structure"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-5 py-2 text-sm font-bold uppercase tracking-widest transition-all ${filter === f ? "bg-cyan-500 text-neutral-950" : "bg-white/5 text-stone-400 hover:bg-white/10 hover:text-white"}`}
                >
                  {f}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredItems.map(item => (
                    <div 
                      key={item._id} 
                      className={`group relative overflow-hidden rounded-2xl border bg-white/[0.02] p-5 transition-all hover:-translate-y-1 border-white/10 hover:border-cyan-500/50 hover:bg-white/[0.04] hover:shadow-[0_8px_30px_rgba(34,211,238,0.1)]`}
                    >
                      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl bg-black/50">
                        <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-cyan-500">
                            {item.attributes?.class || item.attributes?.itemType}
                          </p>
                          <h3 className="mt-1 text-lg font-bold text-white">{item.name}</h3>
                        </div>
                        {item.tradeSettings?.msrp?.value && (
                          <div className="shrink-0 rounded-lg bg-emerald-500/10 px-2 py-1 text-right">
                            <p className="text-[10px] font-bold uppercase text-emerald-500">MSRP</p>
                            <p className="font-mono text-sm font-bold text-emerald-300">${item.tradeSettings.msrp.value.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                ))}
                {filteredItems.length === 0 && (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-stone-500">No assets found for this category.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── NFT GALLERY RENDERER ── */}
        {activeTab === "nft" && (
          <div className="mt-8">
            <ListingGallery listings={listings} collectionSymbol={community.collectionAddress} totalCount={stats?.listedCount || 0} pageSize={20} />
          </div>
        )}
        {/* ── STORY GALLERY RENDERER ── */}
        {activeTab === "stories" && nftStories.length > 0 && (
          <>
            <div className="mt-4 flex flex-wrap gap-4 border-b border-white/5 pb-6">
              {nftStories.map((story: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveStoryIndex(idx)}
                  className={`rounded-full px-5 py-2 text-sm font-bold uppercase tracking-widest transition-all ${activeStoryIndex === idx ? "bg-emerald-500 text-neutral-950" : "bg-white/5 text-stone-400 hover:bg-white/10 hover:text-white"}`}
                >
                  {story.name || `Story ${idx + 1}`}
                </button>
              ))}
            </div>
            <div className="mt-8 min-h-[600px] w-full rounded-2xl border border-white/10 bg-black/50 p-4 sm:p-8">
              {(() => {
                const story = nftStories[activeStoryIndex];
                if (!story) return null;
                
                let html = story.html || "";
                if (story.assetIds && story.assetIds.length > 0) {
                  story.assetIds.forEach((id, idx) => {
                    if (!id) return;
                    const asset = items.find(a => a._id === id);
                    if (asset) {
                      // Support 1-based indexing like {{NFT_IMAGE_1}}, {{NFT_IMAGE_2}}
                      const regexImage = new RegExp(`\\{\\{NFT_IMAGE_${idx + 1}\\}\\}`, 'g');
                      const regexName = new RegExp(`\\{\\{NFT_NAME_${idx + 1}\\}\\}`, 'g');
                      html = html.replace(regexImage, asset.image);
                      html = html.replace(regexName, asset.name);
                      
                      // Also replace the base {{NFT_IMAGE}} with the very first asset for backwards compatibility
                      if (idx === 0) {
                        html = html.replace(/\{\{NFT_IMAGE\}\}/g, asset.image);
                        html = html.replace(/\{\{NFT_NAME\}\}/g, asset.name);
                      }
                    }
                  });
                } else if (story.assetId) {
                  // Backwards compatibility for single assetId
                  const asset = items.find(a => a._id === story.assetId);
                  if (asset) {
                    html = html.replace(/\{\{NFT_IMAGE\}\}/g, asset.image);
                    html = html.replace(/\{\{NFT_NAME\}\}/g, asset.name);
                  }
                }
                return (
                  <div 
                    dangerouslySetInnerHTML={{ __html: html }}
                    className="story-content-wrapper text-stone-300"
                  />
                );
              })()}
            </div>
          </>
        )}

      </section>
    </main>
  );
}
