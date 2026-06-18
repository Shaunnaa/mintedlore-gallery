"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Community } from "@/lib/communities";
import type { MagicEdenListing, MagicEdenStats } from "@/services/magicEden";
import { OwnedBadge } from "@/components/wallet/OwnedBadge";

// ─── Tiny reusable SVG pieces ───────────────────────────────────────────────

const STARS = Array.from({ length: 200 }, (_, i) => ({
  x: ((i * 137.5) % 100).toFixed(1),
  y: ((i * 97.3) % 100).toFixed(1),
  r: (0.1 + (i % 6) * 0.07).toFixed(2),
  o: (0.2 + (i % 8) * 0.09).toFixed(2),
  blink: i % 5 === 0,
}));

function StarField({ opacity = 1 }: { opacity?: number }) {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ opacity }}>
      {STARS.map((s, i) => (
        <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.o}>
          {s.blink && <animate attributeName="opacity" values={`${s.o};0.05;${s.o}`} dur={`${2 + (i % 4)}s`} repeatCount="indefinite" />}
        </circle>
      ))}
    </svg>
  );
}

function GlowPlanet({ color, size, cx, cy, rings }: { color: string; size: number; cx: number; cy: number; rings?: boolean }) {
  const id = `gp${color.replace("#", "")}`;
  return (
    <svg className="absolute" style={{ width: size, height: size, left: `${cx}%`, top: `${cy}%`, transform: "translate(-50%,-50%)" }} viewBox="0 0 200 200">
      <defs>
        <radialGradient id={id} cx="35%" cy="35%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#030308" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill={color} fillOpacity="0.08" />
      <circle cx="100" cy="100" r="88" fill={`url(#${id})`} />
      {rings && <ellipse cx="100" cy="100" rx="138" ry="28" fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="10" />}
      <ellipse cx="72" cy="78" rx="18" ry="10" fill="white" fillOpacity="0.04" />
    </svg>
  );
}

function Asteroid({ x, y, size, angle }: { x: number; y: number; size: number; angle: number }) {
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, width: size, height: size * 0.7, transform: `rotate(${angle}deg)`, background: "linear-gradient(135deg,#78716c,#44403c)", borderRadius: "40% 60% 55% 45%", boxShadow: "inset -4px -2px 8px rgba(0,0,0,0.6)" }} />
  );
}

function DomHouse({ x, y, color, img }: { x: number; y: number; color: string; img?: string | null }) {
  return (
    <div className="absolute flex flex-col items-center" style={{ left: x, bottom: y }}>
      <div className="relative" style={{ width: 72, height: 72 }}>
        <div className="absolute -top-5 left-1/2 h-11 w-full -translate-x-1/2 rounded-t-full" style={{ background: `${color}15`, border: `2px solid ${color}50` }} />
        <div className="overflow-hidden rounded-lg border-2" style={{ borderColor: color, boxShadow: `0 0 18px ${color}55`, background: "#0a0a18", width: 72, height: 72 }}>
          {img ? <img src={img} alt="" className="h-full w-full object-cover opacity-85" /> : <div className="h-full w-full" style={{ background: `${color}20` }} />}
        </div>
      </div>
      <div style={{ width: 56, height: 6, background: `${color}40`, borderRadius: 2 }} />
    </div>
  );
}

function Rocket({ bottom, nftSrc }: { bottom: number; nftSrc?: string | null }) {
  return (
    <div className="absolute left-1/2 flex flex-col items-center" style={{ bottom, transform: "translateX(-50%)" }}>
      <div className="overflow-hidden rounded-full border-2 border-cyan-400 mb-1" style={{ width: 52, height: 52, boxShadow: "0 0 24px rgba(34,211,238,0.55)" }}>
        {nftSrc ? <img src={nftSrc} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-cyan-900" />}
      </div>
      <svg width="44" height="76" viewBox="0 0 48 80">
        <defs><linearGradient id="rk" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#64748b" /><stop offset="100%" stopColor="#94a3b8" /></linearGradient></defs>
        <ellipse cx="24" cy="14" rx="12" ry="15" fill="#94a3b8" />
        <rect x="12" y="12" width="24" height="42" fill="url(#rk)" />
        <polygon points="0,54 12,12 12,54" fill="#475569" />
        <polygon points="48,54 36,12 36,54" fill="#475569" />
        <ellipse cx="24" cy="56" rx="9" ry="4" fill="#f97316" opacity="0.9" />
        <ellipse cx="24" cy="63" rx="6" ry="6" fill="#fbbf24" opacity="0.65" />
        <ellipse cx="24" cy="72" rx="3" ry="9" fill="#ef4444" opacity="0.4" />
      </svg>
    </div>
  );
}

type SceneType = "space" | "village" | "launch" | "travel" | "arrival";

type Scene = {
  id: number;
  name: string;
  text: string;
  color: string;
  type: SceneType;
  range: [number, number];
};

const DEFAULT_RAW_SCENES = [
  { id: 0, name: "The Void",       text: "Before time itself was recorded on-chain…", color: "#3b0764", type: "space" as const },
  { id: 1, name: "The Awakening",  text: "Light tore through the dark. The genesis block fired.", color: "#1e1b4b", type: "space" as const },
  { id: 2, name: "The Signal",     text: "A mysterious signal emerged from the coordinates.", color: "#4c1d95", type: "space" as const },
  { id: 3, name: "First Contact",  text: "The explorers approached the alien system cautiously.", color: "#6b21a8", type: "space" as const },
  { id: 4, name: "The Village",    text: "A civilization of NFT holders thrived on the surface.", color: "#6d28d9", type: "village" as const },
  { id: 5, name: "The Oracle",     text: "The ancient tower held the collection's deepest lore.", color: "#5b21b6", type: "village" as const },
  { id: 6, name: "The Market",     text: "Traders gathered beneath the neon-lit exchange arches.", color: "#4c1d95", type: "village" as const },
  { id: 7, name: "Ignition",       text: "Countdown began. One brave holder would carry the mission.", color: "#0c1a2e", type: "launch" as const },
  { id: 8, name: "The Voyage",     text: "Through asteroid fields and nebula clouds they journeyed.", color: "#1e293b", type: "travel" as const },
  { id: 9, name: "New World",      text: "A new planet. A new chapter. The collection had arrived.", color: "#052e16", type: "arrival" as const },
];

function inRange(p: number, lo: number, hi: number) { return p >= lo && p <= hi; }

// Holds at 1.0 for the middle portion, fades in/out at edges only
function sceneFade(p: number, lo: number, hi: number, edgeFraction = 0.18) {
  if (p < lo || p > hi) return 0;
  const range = hi - lo;
  const fadeW = range * edgeFraction;
  if (fadeW === 0) return 1;
  if (p < lo + fadeW) return (p - lo) / fadeW;
  if (p > hi - fadeW) return (hi - p) / fadeW;
  return 1;
}

// ─── Main component ──────────────────────────────────────────────────────────

export function Timeline5View({ community, listings, ownedMints = [] }: {
  community: Community; stats: MagicEdenStats | null;
  listings: MagicEdenListing[]; statsError?: string | null; ownedMints?: string[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const navH = 80; // navbar height in px
        const visibleScrollStart = navH;
        const totalScroll = el.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        setP(Math.min(1, Math.max(0, scrolled / totalScroll)));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const rawScenes = community.themeSettings?.story?.scenes?.length
    ? community.themeSettings.story.scenes
    : DEFAULT_RAW_SCENES;

  const SCENES: Scene[] = rawScenes.map((s, i) => ({
    ...s,
    range: [i / rawScenes.length, (i + 1) / rawScenes.length],
  }));

  const activeScene = SCENES.find(s => p >= s.range[0] && p <= s.range[1]) ?? SCENES[SCENES.length - 1];

  // Helper to compute opacity for a specific scene type
  const getOpacity = (type: SceneType, edgeFraction = 0.18) => {
    const ranges: [number, number][] = [];
    let current: [number, number] | null = null;
    for (const s of SCENES) {
      if (s.type === type) {
        if (!current) {
          current = [...s.range];
        } else if (Math.abs(current[1] - s.range[0]) < 0.001) {
          current[1] = s.range[1];
        } else {
          ranges.push(current);
          current = [...s.range];
        }
      } else if (current) {
        ranges.push(current);
        current = null;
      }
    }
    if (current) ranges.push(current);

    return Math.min(1, ranges.reduce((acc, r) => acc + sceneFade(p, r[0], r[1], edgeFraction), 0));
  };

  const isTypeB = community.collectionType === "type_b";
  const displayListings = isTypeB && community.themeSettings?.assetIds?.length
    ? community.themeSettings.assetIds.map(id => listings.find(l => l.tokenMint === id)).filter(Boolean) as MagicEdenListing[]
    : listings;

  const nft = (i: number) => displayListings[i] ?? null;

  // Derived parallax values
  const planetSize   = 80  + p * 480;
  const planetY      = 110 - p * 60;
  const rocketBottom = Math.max(-200, (p - 0.74) * 1800 - 80);
  const starOpacity  = Math.max(0.05, 1 - p * 0.5);
  const nebulaColor1 = p < 0.5 ? "#3b076488" : "#0f3460aa";

  return (
    <div ref={ref} style={{ height: "1800vh" }} className="relative">
      <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-hidden bg-[#03030c]">

        {/* Stars */}
        <StarField opacity={starOpacity} />

        {/* Nebula layers — no transition, instant on scroll */}
        <div className="pointer-events-none absolute inset-0" style={{
          background: `radial-gradient(ellipse at 15% 40%, ${nebulaColor1} 0%, transparent 55%), radial-gradient(ellipse at 85% 70%, ${p > 0.6 ? "#16325588" : "#1e1b4b88"} 0%, transparent 50%)`,
        }} />

        {/* Surface horizon glow (village) */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48" style={{
          background: "linear-gradient(to top, #2e1065aa, transparent)",
          opacity: getOpacity("village"),
        }} />

        {/* Green world glow (arrival) */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-64" style={{
          background: "linear-gradient(to top, #14532daa, transparent)",
          opacity: getOpacity("arrival", 0.15),
        }} />

        {/* ── Main planet ── */}
        <div className="absolute inset-0" style={{ transform: `translateY(${(p - 0.4) * -60}px)` }}>
          <GlowPlanet color={activeScene.color} size={planetSize} cx={50} cy={planetY} rings={p < 0.65} />
        </div>

        {/* ── Village ground & houses ── */}
        <div className="absolute bottom-0 left-0 right-0" style={{ opacity: getOpacity("village"), transform: `translateY(${getOpacity("village") < 0.05 ? 40 : 0}px)` }}>
          <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to top, #1a0a3b, transparent)" }} />
          {([
            { x: 60,  y: 60,  c: "#a78bfa", ni: 1 },
            { x: 180, y: 80,  c: "#60a5fa", ni: 2 },
            { x: 320, y: 55,  c: "#34d399", ni: 3 },
            { x: 460, y: 75,  c: "#f472b6", ni: 4 },
            { x: 600, y: 60,  c: "#fb923c", ni: 5 },
            { x: 740, y: 80,  c: "#facc15", ni: 6 },
            { x: 880, y: 58,  c: "#818cf8", ni: 7 },
            { x: 1020,y: 70,  c: "#2dd4bf", ni: 8 },
          ] as {x:number;y:number;c:string;ni:number}[]).map((h) => (
            <DomHouse key={h.x} x={h.x} y={h.y} color={h.c} img={nft(h.ni)?.image} />
          ))}
        </div>

        {/* ── Launchpad + rocket on pad ── */}
        <div className="absolute bottom-0 left-0 right-0" style={{ opacity: getOpacity("launch") }}>
          <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to top, #0c1a2e, transparent)" }} />
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 h-3 w-48 rounded" style={{ background: "#334155", boxShadow: "0 0 20px rgba(34,211,238,0.4)" }} />
          <div className="absolute bottom-18 left-1/3 -translate-x-1/2 h-20 w-1 rounded-full" style={{ background: "linear-gradient(to top, #f97316, transparent)" }} />
          <div className="absolute bottom-18 left-2/3 -translate-x-1/2 h-20 w-1 rounded-full" style={{ background: "linear-gradient(to top, #f97316, transparent)" }} />
          <Rocket bottom={64} nftSrc={nft(1)?.image} />
        </div>

        {/* ── Flying rocket (travel) ── */}
        {getOpacity("travel") > 0 && <Rocket bottom={rocketBottom} nftSrc={nft(1)?.image} />}

        {/* ── Asteroids (travel) ── */}
        <div className="absolute inset-0" style={{ opacity: getOpacity("travel") }}>
          {[{x:15,y:20,s:32,a:25},{x:80,y:35,s:20,a:-15},{x:30,y:60,s:44,a:40},{x:70,y:70,s:26,a:-30},{x:50,y:15,s:18,a:60},{x:88,y:55,s:36,a:10}].map((ast,i)=>
            <Asteroid key={i} x={ast.x} y={ast.y} size={ast.s} angle={ast.a} />
          )}
        </div>

        {/* ── FINAL ENDING SCREEN (arrival) ── */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ opacity: getOpacity("arrival", 0.10), pointerEvents: activeScene.type === "arrival" ? "auto" : "none" }}
        >
          {/* Dark overlay with scanlines for cinematic feel */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #030310ee, #061a0fcc)" }} />
          <div className="pointer-events-none absolute inset-0" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)",
          }} />

          {/* Radial light burst from planet */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{
            width: 800, height: 800,
            background: "radial-gradient(circle, rgba(22,163,74,0.18) 0%, transparent 65%)",
            borderRadius: "50%",
          }} />

          {/* Content — scrollable inside the sticky frame */}
          <div className="absolute inset-0 flex flex-col items-center justify-start overflow-y-auto py-12 px-6">

            {/* Chapter label */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-16 bg-emerald-500/40" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-400">Final Chapter — The Arrival</p>
              <div className="h-px w-16 bg-emerald-500/40" />
            </div>

            {/* Epic title */}
            <h2 className="text-center text-5xl font-black leading-tight text-white drop-shadow-[0_0_40px_rgba(52,211,153,0.4)] md:text-6xl">
              {community.name}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-center text-sm leading-relaxed text-stone-400">
              {community.description}
            </p>

            {/* Divider */}
            <div className="my-8 flex w-full max-w-xl items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-500/30" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-600">The Collection</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-500/30" />
            </div>

            {/* NFT Grid — full display */}
            <div className="grid grid-cols-4 gap-3 w-full max-w-xl sm:grid-cols-4 md:grid-cols-4">
              {displayListings.slice(0, 12).map((l, i) => (
                <a
                  key={l.tokenMint}
                  href={`https://magiceden.io/item-details/${l.tokenMint}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative overflow-hidden border border-white/10 transition-all duration-300 hover:border-emerald-500/60 hover:shadow-[0_0_24px_rgba(52,211,153,0.25)] hover:-translate-y-1"
                  style={{ borderRadius: 12, aspectRatio: "1" }}
                >
                  {l.image && <Image src={l.image} alt={l.name} fill className="object-cover" unoptimized />}

                  {/* Hover overlay with name + price */}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="truncate text-xs font-bold text-white">{l.name}</p>
                    {community.themeSettings?.assetDescriptions?.[l.tokenMint] && (
                      <p className="mt-1 line-clamp-3 text-[10px] leading-snug text-stone-300">
                        {community.themeSettings.assetDescriptions[l.tokenMint]}
                      </p>
                    )}
                    {l.priceLamports > 0 && (
                      <p className="mt-2 text-[10px] font-semibold text-emerald-400">{(l.priceLamports / 1e9).toFixed(2)} SOL</p>
                    )}
                  </div>

                  {/* Owned badge */}
                  {ownedMints.includes(l.tokenMint) && (
                    <div className="absolute left-1.5 top-1.5 rounded-full bg-blue-500/80 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                      Owned
                    </div>
                  )}
                </a>
              ))}
            </div>

            {/* CTA button */}
            <a
              href={`https://magiceden.io/marketplace/${listings[0]?.tokenMint ?? ""}`}
              target="_blank"
              rel="noreferrer"
              className="mt-10 flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-8 py-3 text-sm font-bold uppercase tracking-widest text-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.2)] transition-all hover:bg-emerald-500/20 hover:shadow-[0_0_50px_rgba(52,211,153,0.4)]"
            >
              <span>Explore Full Collection</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>

            {/* Final tagline */}
            <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-stone-700">
              End of Transmission
            </p>

          </div>
        </div>

        {/* ── Narrative overlay text ── */}
        <div className="pointer-events-none absolute left-6 top-8 max-w-xs" style={{ opacity: activeScene.type === "arrival" ? 0 : 1 }}>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: activeScene.color }}>{activeScene.name}</p>
          <p className="mt-1 text-sm font-light italic text-stone-300">{activeScene.text}</p>
        </div>

        {/* ── Progress scrollbar (right side) ── */}
        <div className="absolute right-0 top-0 bottom-0 w-5 flex items-stretch py-3 bg-black/25 backdrop-blur-sm border-l border-white/5">
          {/* Full-height track */}
          <div className="relative mx-auto w-0.5 flex-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>

            {/* Glowing thumb — slides with scroll */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-1.5 rounded-full"
              style={{
                background: "linear-gradient(to bottom, #8b5cf6, #22d3ee, #34d399)",
                boxShadow: "0 0 8px rgba(34,211,238,0.7)",
                height: `${100 / SCENES.length}%`,
                top: `${Math.min(p * 100, 100 - 100 / SCENES.length)}%`,
              }}
            />

            {/* Scene dots — fixed at proportional positions inside track */}
            {SCENES.map((s, i) => {
              const isActive = p >= s.range[0] && p <= s.range[1];
              const isPast   = p > s.range[1];
              return (
                <div
                  key={i}
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    top: `${s.range[0] * 100}%`,
                    width:  isActive ? 7 : 4,
                    height: isActive ? 7 : 4,
                    background: isActive ? "#a78bfa" : isPast ? "#6d28d9" : "#374151",
                    boxShadow: isActive ? "0 0 8px #a78bfa" : "none",
                    transition: "width 0.15s, height 0.15s",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* ── Scroll hint ── */}
        {p < 0.04 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-stone-500">
            <span>Scroll to begin</span>
            <div className="h-8 w-px animate-bounce bg-gradient-to-b from-violet-400 to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
