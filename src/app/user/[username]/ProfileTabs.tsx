"use client";

import { useState } from "react";

export default function ProfileTabs({ nfts }: { nfts: any[] }) {
  const [activeTab, setActiveTab] = useState<"showcase" | "all">("showcase");

  const showcasedNfts = nfts.filter((nft) => nft.isPublic);
  const displayedNfts = activeTab === "showcase" ? showcasedNfts : nfts;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("showcase")}
          className={`text-lg font-bold transition-colors ${
            activeTab === "showcase" ? "text-emerald-400 border-b-2 border-emerald-400 pb-4 -mb-[18px]" : "text-stone-500 hover:text-stone-300"
          }`}
        >
          Showcase ({showcasedNfts.length})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`text-lg font-bold transition-colors ${
            activeTab === "all" ? "text-white border-b-2 border-white pb-4 -mb-[18px]" : "text-stone-500 hover:text-stone-300"
          }`}
        >
          All Collected ({nfts.length})
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
        {displayedNfts.map((nft) => (
          <div key={nft.id} className="group rounded-2xl border border-white/10 bg-[#0c0c10] overflow-hidden hover:border-emerald-500/50 transition-colors shadow-xl relative">
            
            {/* Lock Overlay for Hidden NFTs (only shows in 'All Collected' tab) */}
            {!nft.isPublic && activeTab === "all" && (
              <div className="absolute top-2 right-2 z-10 rounded-full bg-black/60 backdrop-blur-md px-2 py-1 flex items-center gap-1 border border-white/10">
                <svg className="w-3 h-3 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Hidden</span>
              </div>
            )}

            {/* Image Placeholder */}
            <div className={`aspect-square w-full bg-stone-900 relative ${!nft.isPublic && activeTab === "all" ? "opacity-50 grayscale" : ""}`}>
               <div className="absolute inset-0 flex items-center justify-center text-stone-700 font-bold">
                 {nft.collection.substring(0, 3).toUpperCase()}
               </div>
            </div>
            
            <div className="p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1 truncate">{nft.collection}</p>
              <p className="text-sm font-bold text-white truncate">{nft.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
