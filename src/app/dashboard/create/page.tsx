"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Step = 1 | 2 | 3;
type CollectionType = "type_a" | "type_b" | "type_game";

type NftPreview = {
  tokenMint: string;
  name: string;
  image: string | null;
  priceLamports: number;
};

const VIEWS = ["timeline1", "timeline2", "timeline3", "timeline4", "timeline5", "gallery"];

function CreateCommunityForm() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const searchParams = useSearchParams();

  const preselectedType  = (searchParams.get("type") === "b" ? "type_b" : null) as CollectionType | null;
  const preselectedParent = searchParams.get("parent");
  const preselectedSymbol = searchParams.get("symbol");

  const [step, setStep]           = useState<Step>(1);
  const [collectionType, setCollectionType] = useState<CollectionType>(preselectedType ?? "type_a");

  // Step 1 fields
  const [name, setName]           = useState("");
  const [slug, setSlug]           = useState("");
  const [description, setDescription] = useState("");

  // Step 2 — Type A
  const [collectionAddress, setCollectionAddress] = useState("");
  const [collectionSymbol, setCollectionSymbol] = useState(preselectedSymbol ?? "");
  const [preview, setPreview]     = useState<{ floor: number; count: number } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [symbolLookupLoading, setSymbolLookupLoading] = useState(false);

  // Step 2 — Type B
  const [parentId, setParentId]   = useState<string>(preselectedParent ?? "");
  const [nfts, setNfts]           = useState<NftPreview[]>([]);
  const [nftsLoading, setNftsLoading] = useState(false);
  const [selectedMints, setSelectedMints] = useState<Set<string>>(new Set());
  const [nftSearch, setNftSearch] = useState("");

  // Step 3
  const [preferredView, setPreferredView] = useState("timeline1");
  const [vipThreshold, setVipThreshold] = useState(1);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // Auto-generate slug from name
  useEffect(() => {
    setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }, [name]);

  // Load NFTs from parent Type A collection for the picker (Type B)
  const loadParentNfts = useCallback(async (symbol: string) => {
    if (!symbol) return;
    setNftsLoading(true);
    try {
      const res = await fetch(`/api/listings?symbol=${symbol}&limit=40`);
      const data = await res.json();
      setNfts(data.listings ?? []);
    } catch {
      setNfts([]);
    } finally {
      setNftsLoading(false);
    }
  }, []);

  // Auto-load NFTs if preselected
  useEffect(() => {
    if (preselectedType === "type_b" && preselectedSymbol) {
      loadParentNfts(preselectedSymbol);
    }
  }, [preselectedType, preselectedSymbol, loadParentNfts]);

  // Reverse-lookup ME symbol from On-Chain Address
  useEffect(() => {
    if (collectionAddress.length >= 32 && !collectionSymbol) {
      const lookupSymbol = async () => {
        setSymbolLookupLoading(true);
        try {
          const res = await fetch(`/api/magic-eden/reverse-lookup?address=${collectionAddress}`);
          if (res.ok) {
            const data = await res.json();
            if (data.symbol) setCollectionSymbol(data.symbol);
          }
        } catch (err) {
          console.error("Failed to lookup symbol", err);
        } finally {
          setSymbolLookupLoading(false);
        }
      };
      // Add a slight debounce to not fire on every keystroke as they paste
      const timeoutId = setTimeout(lookupSymbol, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [collectionAddress, collectionSymbol]);

  const previewCollection = async () => {
    if (!collectionSymbol) return;
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/stats?symbol=${collectionSymbol}`);
      const data = await res.json();
      
      if (data.stats) {
        setPreview({ floor: data.stats.floorPrice ? data.stats.floorPrice / 1e9 : 0, count: data.stats.listedCount ?? 0 });
      } else {
        setPreview(null);
      }
    } catch {
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const toggleMint = (mint: string) => {
    setSelectedMints(prev => {
      const next = new Set(prev);
      next.has(mint) ? next.delete(mint) : next.add(mint);
      return next;
    });
  };

  const canProceedStep1 = name.trim().length >= 3 && slug.length >= 2;
  const canProceedStep2 = 
    collectionType === "type_a" ? collectionAddress.trim().length > 30 :
    collectionType === "type_game" ? collectionSymbol === "star_atlas" :
    collectionAddress.trim().length > 30 && selectedMints.size > 0;

  const handleSubmit = async () => {
    if (!publicKey) return;
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        ownerWallet: publicKey.toBase58(),
        name,
        slug,
        description,
        collectionType,
        collectionAddress: collectionType === "type_game" ? "star_atlas" : collectionAddress,
        parentCommunityId: collectionType === "type_b" ? parentId : null,
        preferredView,
        vipThreshold,
        selectedMints: collectionType === "type_b" ? Array.from(selectedMints) : [],
        meSymbol: collectionSymbol || null,
      };
      const res = await fetch("/api/community/create", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to create");
      router.push("/dashboard");
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
        <Link href="/dashboard" className="text-sm text-violet-400 underline">← Back to Dashboard</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07070e] text-stone-50">
      <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">

        {/* Header */}
        <Link href="/dashboard" className="mb-8 inline-flex items-center gap-2 text-xs text-stone-500 hover:text-stone-300">
          ← Back to Dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-black text-white">Create Community</h1>

        {/* Step progress */}
        <div className="mt-6 mb-10 flex items-center gap-2">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${step >= s ? "bg-violet-500 text-white" : "border border-white/10 text-stone-600"}`}>
                {s}
              </div>
              {s < 3 && <div className={`h-px w-12 transition ${step > s ? "bg-violet-500" : "bg-white/10"}`} />}
            </div>
          ))}
          <span className="ml-3 text-xs text-stone-500">
            {step === 1 ? "Details" : step === 2 ? "Collection" : "Appearance"}
          </span>
        </div>

        {/* ── STEP 1: Name & Type ── */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Type selector */}
            <div>
              <label className="mb-3 block text-xs font-semibold uppercase tracking-widest text-stone-400">Community Type</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(["type_a", "type_b", "type_game"] as CollectionType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCollectionType(t)}
                    className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition ${collectionType === t ? (t === "type_a" ? "border-violet-500 bg-violet-500/10" : t === "type_b" ? "border-cyan-500 bg-cyan-500/10" : "border-emerald-500 bg-emerald-500/10") : "border-white/10 hover:border-white/20"}`}
                  >
                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${t === "type_a" ? "bg-violet-500 text-white" : t === "type_b" ? "bg-cyan-500 text-neutral-950" : "bg-emerald-500 text-neutral-950"}`}>
                      {t === "type_a" ? "A" : t === "type_b" ? "B" : "🎮"}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {t === "type_a" ? "Full Collection" : t === "type_b" ? "Curated Sub-Collection" : "Game Integration"}
                    </span>
                    <span className="text-xs text-stone-500">
                      {t === "type_a" ? "Link to a full Magic Eden collection" : t === "type_b" ? "Hand-pick NFTs from an existing Type A community" : "Bespoke hub for Web3 Games (e.g. Star Atlas)"}
                    </span>
                    {t === "type_b" && (
                      <span className="text-[10px] font-semibold text-amber-400">Requires a Type A community first</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-stone-400">Community Name</label>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-stone-600 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30"
                placeholder="e.g. Laser Eyes Club"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-stone-400">URL Slug</label>
              <div className="flex items-center gap-0">
                <span className="rounded-l-lg border border-r-0 border-white/10 bg-white/[0.02] px-3 py-3 text-xs text-stone-600">/</span>
                <input
                  className="flex-1 rounded-r-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-stone-600 outline-none focus:border-violet-500/60"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-stone-400">Description <span className="text-stone-600">(optional)</span></label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-stone-600 outline-none focus:border-violet-500/60"
                placeholder="Tell the story of this community..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <button
              disabled={!canProceedStep1}
              onClick={() => setStep(2)}
              className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next: Collection →
            </button>
          </div>
        )}

        {/* ── STEP 2: Collection ── */}
        {step === 2 && (
          <div className="space-y-6">
            {collectionType === "type_a" && (
              <>
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-stone-400">On-Chain Collection Address (Required)</label>
                    <input
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-stone-600 outline-none focus:border-violet-500/60"
                      placeholder="e.g. 5PA... (Base58 Address)"
                      value={collectionAddress}
                      onChange={e => setCollectionAddress(e.target.value)}
                    />
                    <p className="mt-2 text-[10px] text-stone-500">Used by Metaplex DAS API to fetch the collection NFTs.</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-stone-400">
                      Magic Eden Symbol <span className="text-stone-600">(Optional)</span>
                      {symbolLookupLoading && <span className="ml-2 text-violet-400 animate-pulse">Auto-detecting...</span>}
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-stone-600 outline-none focus:border-violet-500/60"
                        placeholder="e.g. mad_lads"
                        value={collectionSymbol}
                        onChange={e => setCollectionSymbol(e.target.value.toLowerCase())}
                      />
                      <button
                        onClick={previewCollection}
                        disabled={!collectionSymbol || previewLoading}
                        className="rounded-lg border border-violet-500/50 bg-violet-500/10 px-4 py-3 text-sm font-bold text-violet-300 transition hover:bg-violet-500/20 disabled:opacity-40"
                      >
                        {previewLoading ? "…" : "Preview"}
                      </button>
                    </div>
                    <p className="mt-2 text-[10px] text-stone-500">Used to pull floor prices and marketplace data.</p>
                  </div>
                </div>
                {preview && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-xs font-semibold text-emerald-400">Collection found ✓</p>
                    <div className="mt-2 flex gap-6 text-sm text-stone-300">
                      <span>Floor: <strong className="text-white">{preview.floor.toFixed(2)} SOL</strong></span>
                      <span>Listed: <strong className="text-white">{preview.count}</strong></span>
                    </div>
                  </div>
                )}
              </>
            )}

            {collectionType === "type_b" && (
              <>
                {!preselectedParent ? (
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-stone-400">Parent Type A On-Chain Address</label>
                      <input
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-stone-600 outline-none focus:border-cyan-500/60"
                        placeholder="e.g. 5PA..."
                        value={collectionAddress}
                        onChange={e => setCollectionAddress(e.target.value)}
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
                    <p className="text-xs font-semibold text-cyan-400">Parent Collection Auto-linked ✓</p>
                    <p className="mt-1 text-sm text-stone-300">
                      Loading NFTs from: <strong className="text-white">{collectionSymbol}</strong>
                    </p>
                  </div>
                )}

                {nfts.length > 0 && (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                        Select NFTs <span className="text-cyan-400">({selectedMints.size} selected)</span>
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
                        const selected = selectedMints.has(nft.tokenMint);
                        return (
                          <button
                            key={nft.tokenMint}
                            onClick={() => toggleMint(nft.tokenMint)}
                            className={`relative aspect-square overflow-hidden rounded-lg border-2 transition ${selected ? "border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.4)]" : "border-white/10 hover:border-white/30"}`}
                          >
                            {nft.image && <Image src={nft.image} alt={nft.name} fill className="object-cover" unoptimized />}
                            {selected && (
                              <div className="absolute inset-0 flex items-center justify-center bg-cyan-500/20">
                                <span className="text-lg font-black text-cyan-300">✓</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {selectedMints.size > 0 && (
                      <p className="mt-2 text-xs text-stone-500">
                        {selectedMints.size} NFT{selectedMints.size > 1 ? "s" : ""} will define membership in this community
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {collectionType === "type_game" && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-stone-400">Supported Web3 Games</label>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setCollectionSymbol("star_atlas")}
                      className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition ${collectionSymbol === "star_atlas" ? "border-emerald-500 bg-emerald-500/10" : "border-white/10 hover:border-white/20"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">✨</span>
                        <div>
                          <span className="text-sm font-bold text-white">Star Atlas</span>
                          <p className="text-xs text-stone-500">Galactic Marketplace Integration</p>
                        </div>
                        {collectionSymbol === "star_atlas" && (
                          <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-400">✓</span>
                        )}
                      </div>
                    </button>
                    <div className="rounded-xl border border-dashed border-white/5 p-4 text-center">
                      <p className="text-xs text-stone-600">More games coming soon...</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-bold text-stone-400 transition hover:border-white/20 hover:text-white">
                ← Back
              </button>
              <button
                disabled={!canProceedStep2}
                onClick={() => {
                  if (collectionType === "type_game") setPreferredView("custom_code");
                  setStep(3);
                }}
                className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next: Appearance →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Appearance ── */}
        {step === 3 && (
          <div className="space-y-6">
            {collectionType === "type_game" ? (
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
                    { value: "custom_nocode", icon: "✨", label: "Custom (No Code)",   desc: "Visual scene builder — edit after creating" },
                    { value: "custom_code",   icon: "💻", label: "Custom (With Code)", desc: "Write raw JSON config for full control" },
                  ].map(v => (
                    <button
                      key={v.value}
                      onClick={() => setPreferredView(v.value)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${preferredView === v.value ? "border-violet-500 bg-violet-500/10" : "border-white/10 hover:border-white/20"}`}
                    >
                      <span className="text-xl shrink-0">{v.icon}</span>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold ${preferredView === v.value ? "text-violet-300" : "text-white"}`}>{v.label}</p>
                        <p className="text-xs text-stone-500">{v.desc}</p>
                      </div>
                      {(v.value === "custom_nocode" || v.value === "custom_code") && (
                        <span className="ml-auto shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-400">New</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Hints for custom modes */}
                {preferredView === "custom_nocode" && (
                  <p className="mt-3 rounded-lg border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-xs text-violet-300">
                    ✨ After publishing, go to <strong>My Communities → Edit</strong> to visually build your story scenes — drag, color, and write narration with no code.
                  </p>
                )}
                {preferredView === "custom_code" && (
                  <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300">
                    💻 After publishing, go to <strong>My Communities → Edit</strong> to write raw <code className="rounded bg-amber-900/30 px-1">theme_settings</code> JSON — full control over scenes, colors, and behavior.
                  </p>
                )}

                <p className="mt-3 text-[10px] text-stone-600">
                  💡 The gallery view is always shown below your page.
                </p>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-stone-400">
                VIP Threshold — NFTs required to be a holder
              </label>
              <input
                type="number"
                min={1}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-violet-500/60"
                value={vipThreshold}
                onChange={e => setVipThreshold(Number(e.target.value))}
              />
              <p className="mt-1.5 text-xs text-stone-600">Users must hold at least this many NFTs to show the Verified Holder badge.</p>
            </div>

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
                className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Creating…" : "Publish Community 🚀"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CreateCommunityPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <CreateCommunityForm />
    </Suspense>
  );
}
