"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import dynamic from "next/dynamic";

const WalletButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

type Community = {
  id: number;
  name: string;
  slug: string;
  collection_type: "type_a" | "type_b";
  collection_address: string;
  parent_community_id: number | null;
  preferred_view: string;
  description: string;
  created_at: string;
};

function CommunityCard({ community, children }: { community: any, children?: React.ReactNode }) {
  const isGame = community.collection_address === "star_atlas";
  const isTypeA = community.collection_type === "type_a" && !isGame;
  const isTypeB = community.collection_type === "type_b";

  return (
    <div className={`group relative overflow-hidden border bg-[#0d0d12] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] ${isGame ? "border-emerald-500/30 hover:border-emerald-400/60" : isTypeA ? "border-violet-500/30 hover:border-violet-400/60" : "border-cyan-500/20 hover:border-cyan-400/50"}`}>
      {/* Type badge */}
      <div className={`flex items-center gap-2 border-b px-4 py-2 ${isGame ? "border-emerald-500/20 bg-emerald-500/5" : isTypeA ? "border-violet-500/20 bg-violet-500/5" : "border-cyan-500/20 bg-cyan-500/5"}`}>
        <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${isGame ? "bg-emerald-500 text-neutral-950" : isTypeA ? "bg-violet-500 text-white" : "bg-cyan-500 text-neutral-950"}`}>
          {isGame ? "🎮" : isTypeA ? "A" : "B"}
        </span>
        <span className={`text-[10px] font-semibold uppercase tracking-widest ${isGame ? "text-emerald-400" : isTypeA ? "text-violet-400" : "text-cyan-400"}`}>
          {isGame ? "Game Integration" : isTypeA ? "Full Collection" : "Curated Sub-Collection"}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white">{community.name}</h3>
        <p className="mt-1 text-xs text-stone-500">/{community.slug}</p>
        {community.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-400">{community.description}</p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <Link
            href={`/${community.slug}`}
            className="flex-1 rounded-lg border border-white/10 py-2 text-center text-xs font-semibold text-stone-300 transition hover:border-white/30 hover:text-white"
          >
            View Page →
          </Link>
          <Link
            href={`/studio/edit/${community.slug}`}
            className="flex-1 rounded-lg border border-white/10 py-2 text-center text-xs font-semibold text-stone-300 transition hover:border-white/30 hover:text-white"
          >
            Edit
          </Link>
        </div>

        {/* Type B creation button — only shows under Type A cards */}
        {children}
      </div>
    </div>
  );
}

export default function StudioPage() {
  const { connected, publicKey } = useWallet();
  const [typeACommunities, setTypeACommunities] = useState<Community[]>([]);
  const [typeBCommunities, setTypeBCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);

  // Load real communities from Supabase via API
  useEffect(() => {
    if (!connected || !publicKey) return;
    setLoading(true);
    fetch(`/api/community/owned?wallet=${publicKey.toBase58()}`)
      .then(r => r.json())
      .then(data => {
        const all: Community[] = data.communities ?? [];
        setTypeACommunities(all.filter(c => c.collection_type === "type_a"));
        setTypeBCommunities(all.filter(c => c.collection_type === "type_b"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [connected, publicKey]);

  return (
    <main className="min-h-screen bg-[#07070e] text-stone-50">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">

        {/* Header */}
        <div className="mb-12 flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-400">Creator Studio</p>
            <h1 className="mt-3 text-4xl font-black text-white">My Collections</h1>
            <p className="mt-2 text-sm text-stone-400">Create and manage your NFT gallery collections.</p>
          </div>
          {connected && (
            <Link
              href="/studio/create"
              className="flex items-center gap-2 rounded-full border border-violet-500/50 bg-violet-500/10 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.2)] transition hover:bg-violet-500/20"
            >
              <span>+</span> New Community
            </Link>
          )}
        </div>

        {/* Wallet gate */}
        {!connected && (
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-white/[0.03] py-20 text-center">
            <p className="text-stone-400">Connect your wallet to manage your communities.</p>
            <WalletButton />
          </div>
        )}

        {/* Loading */}
        {connected && loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        )}

        {/* Empty state */}
        {connected && !loading && typeACommunities.length === 0 && (
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-white/10 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
              <span className="text-2xl">🏛️</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">No communities yet</p>
              <p className="mt-1 text-sm text-stone-500">Create your first community to get started.</p>
            </div>
            <Link
              href="/studio/create"
              className="rounded-full border border-violet-500/50 bg-violet-500/10 px-6 py-3 text-sm font-bold uppercase tracking-widest text-violet-300 transition hover:bg-violet-500/20"
            >
              Create Community
            </Link>
          </div>
        )}

        {connected && !loading && (
          <div className="space-y-16">
            {/* Game Integrations */}
            {typeACommunities.filter(c => c.collection_address === "star_atlas").length > 0 && (
              <div>
                <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-emerald-400">Game Integrations</h2>
                <div className="space-y-8">
                  {typeACommunities.filter(c => c.collection_address === "star_atlas").map((typeA) => {
                    const children = typeBCommunities.filter(b => b.parent_community_id === typeA.id);
                    return (
                      <div key={typeA.id}>
                        {/* Type A parent */}
                        <CommunityCard community={typeA}>
                          <div className="mt-4 border-t border-white/5 pt-4">
                            <Link
                              href={`/studio/create?type=b&parent=${typeA.id}&symbol=${typeA.collection_address}`}
                              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-500/30 py-2 text-xs font-semibold text-emerald-500 transition hover:border-emerald-400/60 hover:text-emerald-300"
                            >
                              + Add Story Sub-Collection
                            </Link>
                          </div>
                        </CommunityCard>

                        {/* Type B children indented below */}
                        {children.length > 0 && (
                          <div className="ml-8 mt-3 space-y-3 border-l border-emerald-500/20 pl-5">
                            {children.map(typeB => (
                              <CommunityCard key={typeB.id} community={typeB} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Full Collections */}
            {typeACommunities.filter(c => c.collection_address !== "star_atlas").length > 0 && (
              <div>
                <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-violet-400">Full Collections</h2>
                <div className="space-y-8">
                  {typeACommunities.filter(c => c.collection_address !== "star_atlas").map((typeA) => {
                    const children = typeBCommunities.filter(b => b.parent_community_id === typeA.id);
                    return (
                      <div key={typeA.id}>
                        {/* Type A parent */}
                        <CommunityCard community={typeA}>
                          <div className="mt-4 border-t border-white/5 pt-4">
                            <Link
                              href={`/studio/create?type=b&parent=${typeA.id}&symbol=${typeA.collection_address}`}
                              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-cyan-500/30 py-2 text-xs font-semibold text-cyan-500 transition hover:border-cyan-400/60 hover:text-cyan-300"
                            >
                              + Add Type B Sub-Collection
                            </Link>
                          </div>
                        </CommunityCard>

                        {/* Type B children indented below */}
                        {children.length > 0 && (
                          <div className="ml-8 mt-3 space-y-3 border-l border-cyan-500/20 pl-5">
                            {children.map(typeB => (
                              <CommunityCard key={typeB.id} community={typeB} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-16 flex flex-wrap gap-6 border-t border-white/5 pt-8 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[10px] font-black text-white">A</span>
            <span>Full Magic Eden Collection — one per collection symbol</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-black text-neutral-950">B</span>
            <span>Curated Sub-Collection — hand-picked NFTs from a Type A</span>
          </div>
        </div>
      </div>
    </main>
  );
}
