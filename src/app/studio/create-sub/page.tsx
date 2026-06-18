"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Step = 1 | 2 | 3;

type NftPreview = {
  tokenMint: string;
  name: string;
  image: string | null;
  priceLamports: number;
};

function CreateSubCommunityForm() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const searchParams = useSearchParams();

  const preselectedParent = searchParams.get("parent");
  const preselectedSymbol = searchParams.get("symbol");

  const [step, setStep] = useState<Step>(1);

  // Step 1 fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  // Step 2 — Type B specific
  const [parentId, setParentId] = useState<string>(preselectedParent ?? "");
  const [collectionSymbol, setCollectionSymbol] = useState(preselectedSymbol ?? "");
  
  const [nfts, setNfts] = useState<NftPreview[]>([]);
  const [nftsLoading, setNftsLoading] = useState(false);
  const [selectedMints, setSelectedMints] = useState<string[]>([]);
  const [assetDescriptions, setAssetDescriptions] = useState<Record<string, string>>({});
  const [nftSearch, setNftSearch] = useState("");

  // Step 3
  const [preferredView, setPreferredView] = useState("timeline5");
  const [vipThreshold, setVipThreshold] = useState(1);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from name
  useEffect(() => {
    setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }, [name]);

  // Set parent defaults if present
  useEffect(() => {
    if (preselectedParent) setParentId(preselectedParent);
    if (preselectedSymbol) setCollectionSymbol(preselectedSymbol);
  }, [preselectedParent, preselectedSymbol]);

  // Load NFTs from parent Type A collection for the picker (Type B)
  const loadParentNfts = useCallback(async (symbol: string) => {
    if (!symbol) return;
    setNftsLoading(true);
    try {
      const res = await fetch(`/api/listings?symbol=${symbol}&limit=100`);
      const data = await res.json();
      setNfts(data.listings ?? []);
    } catch {
      setNfts([]);
    } finally {
      setNftsLoading(false);
    }
  }, []);

  // Auto-load NFTs on mount
  useEffect(() => {
    if (preselectedSymbol) {
      loadParentNfts(preselectedSymbol);
    }
  }, [preselectedSymbol, loadParentNfts]);

  const toggleMint = (mint: string) => {
    setSelectedMints(prev => {
      if (prev.includes(mint)) {
        setAssetDescriptions(descriptions => {
          const next = { ...descriptions };
          delete next[mint];
          return next;
        });
        return prev.filter(m => m !== mint);
      }
      return [...prev, mint];
    });
  };

  const isGameStory = collectionSymbol === "star_atlas";
  const canProceedStep1 = name.trim().length >= 3 && slug.length >= 2;
  const canProceedStep2 = isGameStory ? true : selectedMints.length > 0;

  const handleSubmit = async () => {
    if (!publicKey) return;
    setSubmitting(true);
    setError(null);
    try {
      const firstSelectedNft = nfts.find(n => n.tokenMint === selectedMints[0]);
      
      const body = {
        ownerWallet: publicKey.toBase58(),
        name,
        slug,
        description,
        collectionType: "type_b",
        collectionAddress: isGameStory ? "star_atlas" : collectionSymbol,
        parentCommunityId: parentId,
        preferredView,
        vipThreshold,
        selectedMints: selectedMints,
        assetDescriptions,
        meSymbol: null,
        image: firstSelectedNft?.image || null,
      };
      const res = await fetch("/api/community/create", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to create");
      router.push("/studio");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNfts = nfts.filter(n => n.name.toLowerCase().includes(nftSearch.toLowerCase()));

  if (!connected) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#07070e] text-white">
        <p className="text-stone-400">Please connect your wallet to create a community.</p>
        <Link href="/studio" className="text-sm text-cyan-400 underline">← Back to Studio</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07070e] text-stone-50">
      <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">

        {/* Header */}
        <Link href="/studio" className="mb-8 inline-flex items-center gap-2 text-xs text-stone-500 hover:text-stone-300">
          ← Back to Studio
        </Link>
        <h1 className="mt-2 text-3xl font-black text-white">Create Story</h1>

        {/* Step progress */}
        <div className="mt-6 mb-10 flex items-center gap-2">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${step >= s ? "bg-cyan-500 text-neutral-950" : "border border-white/10 text-stone-600"}`}>
                {s}
              </div>
              {s < 3 && <div className={`h-px w-12 transition ${step > s ? "bg-cyan-500" : "bg-white/10"}`} />}
            </div>
          ))}
          <span className="ml-3 text-xs text-stone-500">
            {step === 1 ? "Details" : step === 2 ? "Select NFTs" : "Appearance"}
          </span>
        </div>

        {/* ── STEP 1: Details ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 mb-6">
              <p className="text-sm font-semibold text-cyan-400">NFT Story</p>
              <p className="mt-1 text-xs text-stone-300">
                You are creating a focused, narrative-driven story using NFTs from the <strong className="text-white">{collectionSymbol}</strong> community.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-stone-400">Story Name</label>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-stone-600 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
                placeholder="e.g. The Genesis Artifacts"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-stone-400">URL Slug</label>
              <div className="flex items-center gap-0">
                <span className="rounded-l-lg border border-r-0 border-white/10 bg-white/[0.02] px-3 py-3 text-xs text-stone-600">/</span>
                <input
                  className="flex-1 rounded-r-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-stone-600 outline-none focus:border-cyan-500/60"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-stone-400">Description <span className="text-stone-600">(optional)</span></label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-stone-600 outline-none focus:border-cyan-500/60"
                placeholder="Tell the story..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <button
              disabled={!canProceedStep1}
              onClick={() => setStep(2)}
              className="w-full rounded-xl bg-cyan-600 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next: Select NFTs →
            </button>
          </div>
        )}

        {/* ── STEP 2: Selection ── */}
        {step === 2 && (
          <div className="space-y-6">
            {!preselectedParent ? (
              <div className="flex flex-col gap-5">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-stone-400">Parent Type A On-Chain Address</label>
                  <input
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-stone-600 outline-none focus:border-cyan-500/60"
                    placeholder="e.g. 5PA..."
                    value={parentId}
                    onChange={e => setParentId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-stone-400">Parent Magic Eden Symbol</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-stone-600 outline-none focus:border-cyan-500/60"
                      placeholder="e.g. mad_lads"
                      value={collectionSymbol}
                      onChange={e => setCollectionSymbol(e.target.value.toLowerCase())}
                    />
                    <button
                      onClick={() => loadParentNfts(collectionSymbol)}
                      disabled={!collectionSymbol || nftsLoading}
                      className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-40"
                    >
                      {nftsLoading ? "…" : "Load NFTs"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <p className="text-xs font-semibold text-cyan-400">Parent Collection Linked ✓</p>
                <p className="mt-1 text-sm text-stone-300">
                  Loading assets for: <strong className="text-white">{collectionSymbol}</strong>
                </p>
              </div>
            )}

            {isGameStory ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">Game Integration Story</p>
                <p className="mt-3 text-sm text-stone-300">
                  Game assets will be configured dynamically in the editor after creation.
                </p>
              </div>
            ) : nfts.length > 0 ? (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    Select NFTs <span className="text-cyan-400">({selectedMints.length} selected)</span>
                  </label>
                  <input
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-stone-600 outline-none focus:border-cyan-500/60"
                    placeholder="Search..."
                    value={nftSearch}
                    onChange={e => setNftSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
                  {filteredNfts.map(nft => {
                    const selectedIdx = selectedMints.indexOf(nft.tokenMint);
                    const selected = selectedIdx !== -1;
                    return (
                      <button
                        key={nft.tokenMint}
                        onClick={() => toggleMint(nft.tokenMint)}
                        className={`group relative overflow-hidden rounded-lg border-2 text-left transition ${selected ? "border-emerald-500 bg-emerald-500/10" : "border-white/5 bg-white/5 hover:border-white/20"}`}
                      >
                        <div className="aspect-square w-full bg-black/50">
                          {nft.image && <img src={nft.image} alt={nft.name} className="h-full w-full object-cover" />}
                        </div>
                        <div className="p-2">
                          <p className="truncate text-[10px] font-bold text-white">{nft.name}</p>
                        </div>
                        {selected && (
                          <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-neutral-950">
                            {selectedIdx + 1}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedMints.length > 0 && (
                  <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                        Selected Assets Order
                      </label>
                      <span className="text-xs font-bold text-emerald-500">{selectedMints.length} Selected</span>
                    </div>
                    <div className="flex flex-col gap-4 mt-4">
                      {selectedMints.map((mint, index) => {
                        const nft = nfts.find(n => n.tokenMint === mint);
                        if (!nft) return null;
                        return (
                          <div key={mint} className="flex flex-col gap-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                                  {index + 1}
                                </span>
                                <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-black/50">
                                  {nft.image && <img src={nft.image} alt={nft.name} className="h-full w-full object-cover" />}
                                </div>
                                <span className="truncate text-xs font-bold text-white">{nft.name}</span>
                              </div>
                              <div className="flex shrink-0 items-center gap-1">
                                <button
                                  onClick={() => {
                                    if (index === 0) return;
                                    setSelectedMints(prev => {
                                      const next = [...prev];
                                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                                      return next;
                                    });
                                  }}
                                  disabled={index === 0}
                                  className="flex h-6 w-6 items-center justify-center rounded bg-white/5 text-stone-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                                  title="Move Up"
                                >
                                  ↑
                                </button>
                                <button
                                  onClick={() => {
                                    if (index === selectedMints.length - 1) return;
                                    setSelectedMints(prev => {
                                      const next = [...prev];
                                      [next[index + 1], next[index]] = [next[index], next[index + 1]];
                                      return next;
                                    });
                                  }}
                                  disabled={index === selectedMints.length - 1}
                                  className="flex h-6 w-6 items-center justify-center rounded bg-white/5 text-stone-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                                  title="Move Down"
                                >
                                  ↓
                                </button>
                                <button
                                  onClick={() => toggleMint(mint)}
                                  className="ml-2 flex h-6 w-6 items-center justify-center rounded bg-red-500/10 text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
                                  title="Remove"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                            <div>
                              <textarea
                                rows={2}
                                value={assetDescriptions[mint] || ""}
                                onChange={(e) => setAssetDescriptions(prev => ({ ...prev, [mint]: e.target.value }))}
                                placeholder={`Write a story line or lore snippet for ${nft.name}...`}
                                className="mt-2 w-full resize-none rounded-lg border border-white/5 bg-black/50 px-3 py-2 text-[11px] text-white outline-none focus:border-emerald-500/50 focus:bg-black/80"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : nftsLoading ? (
               <div className="py-10 text-center text-sm text-stone-500">Loading assets...</div>
            ) : null}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-bold text-stone-400 transition hover:border-white/20 hover:text-white">
                ← Back
              </button>
              <button
                disabled={!canProceedStep2}
                onClick={() => {
                  if (isGameStory) setPreferredView("custom_code");
                  setStep(3);
                }}
                className="flex-1 rounded-xl bg-cyan-600 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next: Appearance →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Appearance ── */}
        {step === 3 && (
          <div className="space-y-6">
            {isGameStory ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">Game Hub Layout</p>
                <p className="mt-3 text-sm text-stone-300">
                  Web3 Games use a bespoke layout specifically tailored to their API.
                </p>
                <p className="mt-2 text-xs text-emerald-300/80">
                  ✨ After publishing, you can inject a custom story using the <strong>HTML Editor</strong>.
                </p>
              </div>
            ) : (
              <div>
                <label className="mb-3 block text-xs font-semibold uppercase tracking-widest text-stone-400">Page Style</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    { value: "timeline1",     icon: "📜", label: "Timeline 1",         desc: "Alternating card layout" },
                    { value: "timeline2",     icon: "🎨", label: "Timeline 2",         desc: "Visual timeline" },
                    { value: "timeline3",     icon: "⚡", label: "Timeline 3",         desc: "Progress style" },
                    { value: "timeline4",     icon: "📖", label: "Story Mode",         desc: "Chapter cards" },
                    { value: "timeline5",     icon: "🚀", label: "Scroll Story",       desc: "Cinematic space journey" },
                    { value: "custom_code",   icon: "💻", label: "HTML Code",          desc: "Write raw HTML layout" },
                  ].map(v => (
                    <button
                      key={v.value}
                      onClick={() => setPreferredView(v.value)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${preferredView === v.value ? "border-cyan-500 bg-cyan-500/10" : "border-white/10 hover:border-white/20"}`}
                    >
                      <span className="text-xl shrink-0">{v.icon}</span>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold ${preferredView === v.value ? "text-cyan-300" : "text-white"}`}>{v.label}</p>
                        <p className="text-xs text-stone-500">{v.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}



            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-bold text-stone-400 transition hover:border-white/20 hover:text-white">
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-xl bg-cyan-600 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Creating…" : "Publish Story 🚀"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CreateSubCommunityPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <CreateSubCommunityForm />
    </Suspense>
  );
}
