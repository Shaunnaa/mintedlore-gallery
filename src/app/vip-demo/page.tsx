"use client";

import { useState } from "react";
import Link from "next/link";
import { StampCard } from "@/components/wallet/StampCard";

type AccessLevel = "none" | "half" | "complete";

export default function VIPDemoPage() {
  const [access, setAccess] = useState<AccessLevel>("none");
  const [threshold, setThreshold] = useState(4);

  const heldCount = access === "none" ? 0 : access === "half" ? Math.ceil(threshold / 2) : threshold;

  return (
    <main className="min-h-screen bg-neutral-950 text-stone-50 font-sans">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        
        {/* ── Header ── */}
        <header className="border-b border-white/10 pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="text-sm font-medium text-stone-400 transition hover:text-emerald-300">
              ← Back to platform
            </Link>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping bg-amber-400 opacity-60" />
                <span className="relative inline-flex h-3 w-3 bg-amber-300" />
              </span>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-300">Interactive Demo</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Verified On-Chain Community</p>
              <h1 className="mt-3 flex flex-wrap items-center text-4xl font-semibold tracking-normal text-white sm:text-6xl gap-3">
                VIP Access <span className="text-emerald-400">Demo</span>
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-stone-300">
                This is an interactive simulation showing how your galleries and stories dynamically adapt based on the NFTs held in a user&apos;s wallet. Adjust the stamp count and wallet state below.
              </p>
            </div>
            <div className="border border-white/10 bg-white/[0.04] px-5 py-4">
              <p className="text-sm text-stone-400">On-Chain Address</p>
              <p className="mt-1 font-mono text-sm font-semibold text-white break-all">DEMO_CONTRACT_ADDRESS_12345</p>
            </div>
          </div>
        </header>

        {/* ── Simulator Controls ── */}
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0c0c10] p-6 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-emerald-400">Simulator Controls</h2>

          {/* Threshold Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                VIP Threshold (stamps required)
              </label>
              <span className="text-lg font-black text-emerald-400">{threshold}</span>
            </div>
            <input
              type="range" min={1} max={12} value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="w-full h-2 cursor-pointer appearance-none rounded-full bg-stone-800 accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-stone-600 mt-1">
              <span>1</span><span>6</span><span>12</span>
            </div>
          </div>

          {/* Access State Buttons */}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setAccess("none")}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all ${access === "none" ? "border-stone-500 bg-stone-500/20 text-stone-200" : "border-white/10 text-stone-500 hover:border-white/30"}`}>
              0 / {threshold} NFTs
              <span className="block text-[10px] font-normal mt-0.5 opacity-60">No Access</span>
            </button>
            <button onClick={() => setAccess("half")}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all ${access === "half" ? "border-amber-500 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "border-white/10 text-stone-500 hover:border-white/30"}`}>
              {Math.ceil(threshold / 2)} / {threshold} NFTs
              <span className="block text-[10px] font-normal mt-0.5 opacity-60">Partial Access</span>
            </button>
            <button onClick={() => setAccess("complete")}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all ${access === "complete" ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-white/10 text-stone-500 hover:border-white/30"}`}>
              {threshold} / {threshold} NFTs
              <span className="block text-[10px] font-normal mt-0.5 opacity-60">VIP Complete</span>
            </button>
          </div>

          {/* Stamp Card */}
          <div className="mt-6">
            {heldCount === 0 ? (
              <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center shadow-2xl">
                <p className="text-stone-300">You don&apos;t own any art from this collection yet.</p>
              </div>
            ) : (
              <StampCard count={heldCount} threshold={threshold} isGranted={access === "complete"} />
            )}
          </div>
        </div>

        {/* ── Content Sections ── */}
        {/* <div className="space-y-8"> */}

          {/* Public Section */}
          {/* <section className="rounded-2xl border border-white/10 bg-white/5 p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-stone-500" />
            <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Public — Everyone sees this</p>
            <h3 className="text-2xl font-bold text-white mb-2">Prologue</h3>
            <p className="text-stone-400">This text is visible to everyone. It tells the basic lore of your collection to entice users to acquire the NFTs. In the year 2045, the first digital artifacts were discovered...</p>
          </section> */}

          {/* Half Access Section */}
          {/* <section className={`rounded-2xl border transition-all duration-500 relative overflow-hidden ${heldCount > 0 ? "border-cyan-500/30 bg-cyan-500/10" : "border-white/5 bg-white/5"} p-8`}>
            <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${heldCount > 0 ? "bg-cyan-400" : "bg-stone-700"}`} />
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${heldCount > 0 ? "text-cyan-500" : "text-stone-600"}`}>
                  Unlocked with 1+ NFT
                </p>
                <h3 className="text-2xl font-bold text-white">Chapter 1: The Artifact</h3>
              </div>
              {heldCount === 0 && (
                <span className="flex items-center gap-2 rounded-full bg-stone-800 px-3 py-1 text-xs font-bold text-stone-400 shrink-0">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  LOCKED
                </span>
              )}
            </div>
            {heldCount === 0 ? (
              <div className="blur-sm select-none opacity-40 pointer-events-none">
                <p className="text-stone-400">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, voluptatum. Aliquid, quia perspiciatis! Voluptatum consequatur, doloremque, quae, quam distinctio...</p>
                <div className="mt-4 h-32 w-full rounded-xl bg-stone-800" />
              </div>
            ) : (
              <div>
                <p className="text-cyan-100/80">Congratulations! You now have partial access to the lore. The glowing runes indicate a path to the inner sanctum — you will need the complete collection to proceed...</p>
                <div className="mt-4 flex items-center justify-center h-32 w-full rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-900/40 to-[#0c0c10]">
                  <span className="text-cyan-400 font-mono tracking-widest text-sm">TRANSMISSION DECODED</span>
                </div>
              </div>
            )}
          </section> */}

          {/* Complete VIP Section */}
          {/* <section className={`rounded-2xl border transition-all duration-500 relative overflow-hidden ${access === "complete" ? "border-amber-500/50 bg-amber-500/10 shadow-[0_0_40px_rgba(245,158,11,0.1)]" : "border-white/5 bg-white/5"} p-8`}>
            <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${access === "complete" ? "bg-amber-400" : "bg-stone-700"}`} />
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${access === "complete" ? "text-amber-500" : "text-stone-600"}`}>
                  Unlocked with all {threshold} NFTs
                </p>
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  {access === "complete" && <span className="text-3xl">👑</span>}
                  The VIP Inner Sanctum
                </h3>
              </div>
              {access !== "complete" && (
                <span className="flex items-center gap-2 rounded-full bg-stone-800 px-3 py-1 text-xs font-bold text-stone-400 shrink-0">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  REQUIRES ALL {threshold} NFTS
                </span>
              )}
            </div>
            {access !== "complete" ? (
              <div className="blur-md select-none opacity-20 pointer-events-none">
                <p className="text-stone-400">Lorem ipsum dolor sit amet consectetur adipisicing elit. Welcome to the ultimate VIP experience! By holding the complete collection, you have unlocked the final secrets...</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="h-40 rounded-xl bg-stone-800" />
                  <div className="h-40 rounded-xl bg-stone-800" />
                </div>
              </div>
            ) : (
              <div>
                <p className="text-amber-100/80 mb-6">Welcome to the ultimate VIP experience! You now have access to exclusive airdrops, full high-res artwork downloads, and the secret developer discord channel.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="group relative overflow-hidden rounded-xl border border-amber-500/30 bg-black aspect-video flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-amber-400 font-bold tracking-widest text-sm z-10">SECRET ARTWORK 1</span>
                  </div>
                  <div className="group relative overflow-hidden rounded-xl border border-amber-500/30 bg-black aspect-video flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-bl from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-amber-400 font-bold tracking-widest text-sm z-10">SECRET ARTWORK 2</span>
                  </div>
                </div>
              </div>
            )}
          </section> */}

        {/* </div> */}
      </section>
    </main>
  );
}
