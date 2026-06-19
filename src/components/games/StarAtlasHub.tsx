"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Community } from "@/lib/communities";
import { HolderBadge } from "@/components/wallet/HolderBadge";
import Link from "next/link";
import { ListingGallery } from "@/components/market/ListingGallery";
import { TimelineView } from "@/components/templates/TimelineView";
import type { MagicEdenStats, MagicEdenListing } from "@/services/magicEden";

type StarAtlasHubProps = {
  community: Community;
  storyCommunity?: Community;
  stats?: MagicEdenStats | null;
  listings: MagicEdenListing[];
  relatedChapters?: {slug: string; name: string}[];
  isStoryRoute?: boolean;
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

export function StarAtlasHub({ community, storyCommunity, stats, listings, relatedChapters = [], isStoryRoute = false }: StarAtlasHubProps) {
  const [items, setItems] = useState<StarAtlasNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ship" | "resource" | "structure" | "crew" | "all">("ship");
  
  // We no longer need local tab state for stories since they are fully routed now
  const [activeTab, setActiveTab] = useState<string>(isStoryRoute ? "stories" : "hub");

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
    if (activeTab === "stories" && !loading) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('story-anim-active');
          }
        });
      }, { threshold: 0.3 });

      // Small timeout to ensure DOM is fully painted after loading=false
      setTimeout(() => {
        const elements = document.querySelectorAll('.story-anim-trigger');
        elements.forEach(el => observer.observe(el));
      }, 50);

      return () => observer.disconnect();
    }
  }, [activeTab, loading]);

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

            <Link 
              href={`/nft-game/${community.parentCommunityId ? community.parentCommunityId : community.slug}`}
              onClick={() => setActiveTab("nft")}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition ${activeTab === "nft" ? "bg-purple-500/10 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "border-white/10 text-stone-400 hover:border-white/30"}`}
            >
              <span className="text-sm font-bold uppercase tracking-widest">
                NFT Gallery
              </span>
            </Link>

            <button 
              onClick={() => setActiveTab("stories")}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition ${activeTab === "stories" ? "bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-white/10 text-stone-400 hover:border-white/30"}`}
            >
              <span className="text-sm font-bold uppercase tracking-widest">
                Story Gallery
              </span>
            </button>
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
        {activeTab === "stories" && (
          <>
            <div className="mt-4 flex flex-wrap gap-4 border-b border-white/5 pb-6">
              {/* Render Database Type B stories */}
              {relatedChapters.length > 0 && relatedChapters.map((story) => (
                <Link
                  key={story.slug}
                  href={`/nft-game/${community.slug}/${story.slug}`}
                  className={`rounded-full px-5 py-2 text-sm font-bold uppercase tracking-widest transition-all ${isStoryRoute && storyCommunity?.slug === story.slug ? "bg-emerald-500 text-neutral-950" : "bg-white/5 text-stone-400 hover:bg-white/10 hover:text-white"}`}
                >
                  {story.name}
                </Link>
              ))}

              {relatedChapters.length === 0 && (
                <div className="text-stone-500">No stories available.</div>
              )}
            </div>

            {/* If we are actively on a story route, it means the TimelineView or CustomCode should render! */}
            {isStoryRoute && storyCommunity && storyCommunity.collectionType === "type_b" && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="prose prose-invert max-w-none">
                  {storyCommunity.preferredView === "custom_code" && storyCommunity.themeSettings?.customHtml ? (
                    loading ? (
                      <div className="flex min-h-[40vh] items-center justify-center text-emerald-500/50">
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                          <p className="font-mono text-sm uppercase tracking-widest">Loading Game Assets...</p>
                        </div>
                      </div>
                    ) : (() => {
                      let html = storyCommunity.themeSettings.customHtml as string;
                      const assetIds = storyCommunity.themeSettings.assetIds as string[] | undefined;
                      
                      // Process template tags just like the legacy code did
                      if (assetIds && assetIds.length > 0) {
                        assetIds.forEach((id: string, idx: number) => {
                          if (!id) return;
                          
                          let assetImage = "";
                          let assetName = "";
                          let assetDesc = storyCommunity.themeSettings?.assetDescriptions?.[id] || "";
                          
                          // 1. Try finding it in Star Atlas items (match by mint or _id)
                          const saAsset = items.find((a: any) => a.mint === id || a._id === id);
                          if (saAsset) {
                            assetImage = saAsset.image || "";
                            assetName = saAsset.name || "";
                          } else {
                            // 2. Fallback to finding it in Magic Eden listings (standard NFTs)
                            const meAsset = listings.find((l: any) => l.tokenMint === id);
                            if (meAsset) {
                              assetImage = meAsset.image || "";
                              assetName = meAsset.name || "";
                            }
                          }
                          
                          if (assetImage && assetName) {
                            
                            html = html.replaceAll(`{{NFT_IMAGE_${idx + 1}}}`, assetImage);
                            html = html.replaceAll(`{{NFT_NAME_${idx + 1}}}`, assetName);
                            html = html.replaceAll(`{{NFT_DESC_${idx + 1}}}`, assetDesc);
                            
                            // Support generic un-numbered tags for the very first asset
                            if (idx === 0) {
                              html = html.replaceAll('{{NFT_IMAGE}}', assetImage);
                              html = html.replaceAll('{{NFT_NAME}}', assetName);
                              html = html.replaceAll('{{NFT_DESC}}', assetDesc);
                            }
                          }
                        });
                      }
                      
                      // Cleanup any remaining unmatched placeholders to prevent 404s
                      for (let i = 1; i <= 10; i++) {
                        html = html.replaceAll(`{{NFT_IMAGE_${i}}}`, '');
                        html = html.replaceAll(`{{NFT_NAME_${i}}}`, '');
                        html = html.replaceAll(`{{NFT_DESC_${i}}}`, '');
                      }
                      html = html.replaceAll('{{NFT_IMAGE}}', '');
                      html = html.replaceAll('{{NFT_NAME}}', '');
                      html = html.replaceAll('{{NFT_DESC}}', '');
                      
                      return (
                        <div 
                          dangerouslySetInnerHTML={{ __html: html }}
                          className="story-content-wrapper text-stone-300"
                        />
                      );
                    })()
                  ) : storyCommunity.preferredView.startsWith("timeline") ? (
                    <TimelineView community={storyCommunity} stats={stats ?? null} listings={listings} />
                  ) : (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center text-emerald-300">
                      Story content loaded for: {storyCommunity.name}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

      </section>
    </main>
  );
}
