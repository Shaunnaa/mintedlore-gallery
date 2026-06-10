"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Community } from "@/lib/communities";
import type { MagicEdenListing, MagicEdenStats } from "@/services/magicEden";
import { OwnedBadge } from "@/components/OwnedBadge";

/* ─────────────────────────────────────────────────────────────────────────────
   Tiny SVG scene helpers
───────────────────────────────────────────────────────────────────────────── */

function Stars({ count = 120 }: { count?: number }) {
  const dots = Array.from({ length: count }, (_, i) => ({
    cx: (((i * 137.508) % 100)).toFixed(2),
    cy: (((i * 97.3) % 100)).toFixed(2),
    r: (0.1 + (i % 5) * 0.08).toFixed(2),
    o: (0.3 + (i % 7) * 0.1).toFixed(2),
  }));
  return (
    <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      {dots.map((d, i) => (
        <circle key={i} cx={`${d.cx}%`} cy={`${d.cy}%`} r={d.r} fill="white" opacity={d.o} />
      ))}
    </svg>
  );
}

function Planet({ color = "#6d28d9", size = 280, x = 50, y = 60, rings = false }: { color?: string; size?: number; x?: number; y?: number; rings?: boolean }) {
  return (
    <svg className="absolute" style={{ width: size, height: size, left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }} viewBox="0 0 200 200">
      <defs>
        <radialGradient id={`pg-${x}`} cx="35%" cy="35%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor="#050510" stopOpacity="1" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill={`url(#pg-${x})`} />
      <circle cx="100" cy="100" r="90" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
      {/* Surface details */}
      <ellipse cx="70" cy="80" rx="20" ry="12" fill="white" fillOpacity="0.04" />
      <ellipse cx="130" cy="120" rx="14" ry="8" fill="white" fillOpacity="0.03" />
      {rings && (
        <ellipse cx="100" cy="100" rx="130" ry="30" fill="none" stroke={color} strokeOpacity="0.4" strokeWidth="8" />
      )}
    </svg>
  );
}

function House({ x = 0, y = 0, color = "#34d399", nftSrc }: { x?: number; y?: number; color?: string; nftSrc?: string | null }) {
  return (
    <div className="absolute flex flex-col items-center" style={{ left: x, bottom: y }}>
      <div className="relative" style={{ width: 80, height: 80 }}>
        {/* Window / NFT portrait */}
        <div className="absolute inset-0 overflow-hidden rounded-lg border-2" style={{ borderColor: color, boxShadow: `0 0 20px ${color}60`, background: "#0d0d1a" }}>
          {nftSrc ? <img src={nftSrc} alt="resident" className="h-full w-full object-cover opacity-90" /> : <div className="h-full w-full bg-gradient-to-br from-violet-900 to-indigo-950" />}
        </div>
        {/* Dome top */}
        <div className="absolute -top-4 left-1/2 h-10 w-full -translate-x-1/2 rounded-t-full" style={{ background: `${color}22`, border: `2px solid ${color}60` }} />
      </div>
      {/* Base */}
      <div className="h-2 w-16 rounded-sm" style={{ background: color, opacity: 0.4 }} />
    </div>
  );
}

function Rocket({ x = "50%", y = 0, nftSrc }: { x?: string; y?: number; nftSrc?: string | null }) {
  return (
    <div className="absolute flex flex-col items-center" style={{ left: x, bottom: y, transform: "translateX(-50%)" }}>
      {/* NFT window */}
      <div className="relative mb-1 overflow-hidden rounded-full border-2 border-cyan-400" style={{ width: 56, height: 56, boxShadow: "0 0 20px rgba(34,211,238,0.5)" }}>
        {nftSrc ? <img src={nftSrc} alt="pilot" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-cyan-900" />}
      </div>
      {/* Rocket body */}
      <svg width="48" height="80" viewBox="0 0 48 80">
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>
        <ellipse cx="24" cy="16" rx="12" ry="16" fill="#94a3b8" />
        <rect x="12" y="14" width="24" height="40" fill="url(#rg)" />
        <polygon points="0,54 12,14 12,54" fill="#475569" />
        <polygon points="48,54 36,14 36,54" fill="#475569" />
        {/* Exhaust */}
        <ellipse cx="24" cy="56" rx="8" ry="4" fill="#f97316" opacity="0.9" />
        <ellipse cx="24" cy="62" rx="5" ry="5" fill="#fbbf24" opacity="0.6" />
        <ellipse cx="24" cy="70" rx="3" ry="8" fill="#ef4444" opacity="0.4" />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────────────────── */

export function Timeline5View({
  community,
  listings,
  ownedMints = [],
}: {
  community: Community;
  stats: MagicEdenStats | null;
  listings: MagicEdenListing[];
  statsError?: string | null;
  ownedMints?: string[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0..1

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const totalScroll = el.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(Math.min(1, Math.max(0, scrolled / totalScroll)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scene thresholds (0..1)
  const scene1 = progress < 0.2;             // Deep space intro
  const scene2 = progress >= 0.15 && progress < 0.45;  // Village on planet
  const scene3 = progress >= 0.4 && progress < 0.65;   // Rocket on pad
  const scene4 = progress >= 0.6 && progress < 0.85;   // Launch / travel
  const scene5 = progress >= 0.8;            // Arrival

  // Parallax values derived from progress
  const planetY   = 60 - progress * 40;       // planet rises
  const planetSize = 150 + progress * 350;     // planet grows
  const rocketY   = Math.max(0, (progress - 0.6) * 600 - 80); // rocket flies up
  const starsOpacity = Math.max(0, 1 - progress * 0.3);

  const nft = (i: number) => listings[i] ?? null;

  return (
    <div ref={scrollRef} style={{ height: "550vh" }} className="relative">
      {/* STICKY VIEWPORT */}
      <div className="sticky top-0 h-screen overflow-hidden bg-[#04040f]">

        {/* ── Layer 0: Stars ── */}
        <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: starsOpacity }}>
          <Stars count={160} />
        </div>

        {/* ── Layer 1: Nebula gradient ── */}
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: scene5
              ? "radial-gradient(ellipse at 50% 80%, #14532d44 0%, transparent 70%)"
              : scene4
              ? "radial-gradient(ellipse at 50% 100%, #1e3a5f55 0%, transparent 60%)"
              : "radial-gradient(ellipse at 20% 50%, #3b0764aa 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #1e1b4baa 0%, transparent 50%)",
          }}
        />

        {/* ── Layer 2: Planet ── */}
        <div className="absolute inset-0 transition-all duration-700" style={{ transform: `translateY(${(progress - 0.5) * -40}px)` }}>
          <Planet
            color={scene5 ? "#16a34a" : "#6d28d9"}
            size={planetSize}
            x={50}
            y={planetY}
            rings={!scene4 && !scene5}
          />
        </div>

        {/* ── Layer 3: Village (Scene 2) ── */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-700"
          style={{ opacity: scene2 ? 1 : 0, transform: scene2 ? "translateY(0)" : "translateY(60px)" }}
        >
          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-28" style={{ background: "linear-gradient(to top, #1a0a3b, transparent)" }} />
          {/* Houses */}
          <House x={120} y={60} color="#a78bfa" nftSrc={nft(0)?.image ?? null} />
          <House x={260} y={80} color="#60a5fa" nftSrc={nft(1)?.image ?? null} />
          <House x={400} y={55} color="#34d399" nftSrc={nft(2)?.image ?? null} />
          <House x={600} y={70} color="#f472b6" nftSrc={nft(3)?.image ?? null} />
          <House x={760} y={60} color="#fb923c" nftSrc={nft(4)?.image ?? null} />
        </div>

        {/* ── Layer 4: Rocket on launchpad (Scene 3) ── */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{ opacity: scene3 ? 1 : 0 }}
        >
          <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: "linear-gradient(to top, #0f172a, transparent)" }} />
          {/* Launchpad */}
          <div className="absolute bottom-20 left-1/2 h-4 w-40 -translate-x-1/2 rounded-sm" style={{ background: "#334155", boxShadow: "0 0 20px rgba(34,211,238,0.3)" }} />
          <Rocket x="50%" y={rocketY > 0 ? -100 : 80} nftSrc={nft(0)?.image ?? null} />
        </div>

        {/* ── Layer 5: Flying rocket (Scene 4) ── */}
        {scene4 && (
          <div
            className="absolute left-1/2 transition-all duration-300"
            style={{ bottom: rocketY, transform: "translateX(-50%)" }}
          >
            <Rocket y={0} nftSrc={nft(0)?.image ?? null} />
          </div>
        )}

        {/* ── Layer 6: Arrival text (Scene 5) ── */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000"
          style={{ opacity: scene5 ? 1 : 0, transform: scene5 ? "translateY(0)" : "translateY(40px)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-400">Destination Reached</p>
          <h2 className="mt-4 text-center text-5xl font-black text-white md:text-6xl">{community.name}</h2>
          <p className="mx-auto mt-4 max-w-md text-center text-stone-400">{community.description}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {listings.slice(0, 6).map((listing, i) => (
              <a
                key={listing.tokenMint}
                href={`https://magiceden.io/item-details/${listing.tokenMint}`}
                target="_blank"
                rel="noreferrer"
                className="group relative overflow-hidden rounded-xl border border-white/10 transition hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]"
                style={{ width: 100, height: 100 }}
              >
                {listing.image && <Image src={listing.image} alt={listing.name} fill className="object-cover" unoptimized />}
                {ownedMints.includes(listing.tokenMint) && (
                  <div className="absolute inset-0 flex items-end justify-center pb-2">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-blue-300">Owned</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-emerald-500/0 transition group-hover:bg-emerald-500/10" />
              </a>
            ))}
          </div>
        </div>

        {/* ── Scene title HUD ── */}
        <div className="absolute left-6 top-6 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500">
            {scene5 ? "Chapter 5" : scene4 ? "Chapter 4" : scene3 ? "Chapter 3" : scene2 ? "Chapter 2" : "Chapter 1"}
          </p>
          <p className="text-sm font-semibold text-white/80">
            {scene5 ? "New World" : scene4 ? "The Voyage" : scene3 ? "Ignition" : scene2 ? "The Village" : "Deep Space"}
          </p>
        </div>

        {/* ── Progress bar ── */}
        <div className="absolute bottom-4 left-1/2 w-40 -translate-x-1/2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-0.5 rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 transition-all duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* ── Scroll hint ── */}
        {progress < 0.05 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-xs uppercase tracking-widest text-stone-500">
            <span>Scroll to begin</span>
            <div className="h-8 w-px animate-bounce bg-gradient-to-b from-violet-400 to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
