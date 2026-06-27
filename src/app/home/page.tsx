"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

const HERO_SLIDES = [
  {
    tag: "Featured Story",
    title: "The Lost Archives of IslandDAO",
    highlight: "IslandDAO",
    desc: "Discover the origins of the Citizens and the mysterious energy source hidden deep within the archipelago. Only true holders can unlock the final chapter.",
    link: "/islanddao",
    btn1: "Read Chapter 1",
    btn2: "View Collection",
    bgClass: "from-emerald-900/80",
    imgUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" // Mock Island Landscape
  },
  {
    tag: "New Game Integration",
    title: "Explore the vast universe of Star Atlas",
    highlight: "Star Atlas",
    desc: "Sync your wallet to reveal hidden ship schematics and exclusive faction lore. The galaxy awaits your discovery.",
    link: "/star-atlas",
    btn1: "Enter the Galaxy",
    btn2: "View Stats",
    bgClass: "from-blue-900/80",
    imgUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2048&auto=format&fit=crop" // Mock Space Background
  },
  {
    tag: "Platform News",
    title: "Monetize Your Community Lore",
    highlight: "New Feature",
    desc: "Community owners can now enable affiliate fees for secondary market sales directly within their storytelling hubs.",
    link: "/studio",
    btn1: "Learn More",
    btn2: "Update Hub",
    bgClass: "from-purple-900/80",
    imgUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" // Mock Cyber Background
  }
];

export default function HomeRedesign() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <main className="min-h-screen bg-neutral-950 text-stone-50 font-sans pb-20">
      
      {/* ── 1. HERO BANNER (Auto-sliding Carousel) ── */}
      <section 
        className="group relative w-full h-[60vh] min-h-[500px] bg-stone-900 overflow-hidden flex items-end transition-colors duration-1000"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Image & Overlays */}
        <div className={`absolute inset-0 bg-neutral-950 transition-colors duration-1000`}>
           {HERO_SLIDES.map((s, index) => (
             <div 
               key={index} 
               className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? "opacity-100" : "opacity-0"}`}
             >
               <Image 
                 src={s.imgUrl} 
                 alt={s.title} 
                 fill 
                 className="object-cover opacity-50"
                 unoptimized
               />
               <div className={`absolute inset-0 bg-gradient-to-br ${s.bgClass} to-transparent mix-blend-multiply`}></div>
             </div>
           ))}
           <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay z-10"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent z-10"></div>
        </div>

        {/* Tag Badge */}
        {/* Removed absolute positioning to bring it closer to the title */}

        {/* Manual Slide Arrows */}
        <button 
          onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-5 sm:left-8 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-black/20 border border-white/10 text-white hover:bg-black/50 transition backdrop-blur-sm opacity-0 group-hover:opacity-100"
          aria-label="Previous Slide"
        >
          <svg className="w-5 h-5 pr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button 
          onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
          className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-black/20 border border-white/10 text-white hover:bg-black/50 transition backdrop-blur-sm opacity-0 group-hover:opacity-100"
          aria-label="Next Slide"
        >
          <svg className="w-5 h-5 pl-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </button>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pb-16 pl-20 sm:pl-28">
          
          <div key={currentSlide} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 mb-6 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-white animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-stone-200">{slide.tag}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4 max-w-3xl">
              {slide.title.replace(slide.highlight, "")} <span className="text-white brightness-150 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{slide.highlight}</span>
            </h1>
            <p className="text-lg text-stone-300 max-w-2xl mb-8 leading-relaxed">
              {slide.desc}
            </p>
            <div className="flex items-center gap-4">
              <Link href={slide.link} className="rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-black transition hover:bg-stone-200 hover:scale-105 transform duration-200">
                {slide.btn1}
              </Link>
              <Link href={slide.link} className="rounded-xl bg-white/5 border border-white/10 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
                {slide.btn2}
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === index ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 mt-12 space-y-20">
        
        {/* ── 2. NEWLY MINTED LORE (New Stories) ── */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Newly Minted Lore</h2>
              <p className="text-sm text-stone-400 mt-1">The latest chapters published across the ecosystem.</p>
            </div>
            <Link href="#" className="text-sm font-bold text-emerald-400 hover:text-emerald-300 hidden sm:block">View All</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "The Great Fox Migration", community: "Famous Fox Federation", tag: "Chapter 3", time: "2 hours ago" },
              { title: "Arrival at the Station", community: "Star Atlas", tag: "Prologue", time: "5 hours ago" },
              { title: "Birth of the Lads", community: "Mad Lads", tag: "Lore Update", time: "1 day ago" },
              { title: "The First Dinosaur", community: "Claynosaurz", tag: "Chapter 1", time: "2 days ago" },
            ].map((story, i) => (
              <Link href="#" key={i} className="group flex flex-col gap-4">
                <div className="aspect-[4/3] w-full rounded-2xl bg-stone-900 border border-white/10 overflow-hidden relative group-hover:border-emerald-500/50 transition-colors">
                   <div className="absolute inset-0 flex items-center justify-center text-stone-700 font-bold uppercase tracking-widest text-xs">
                     {story.community.substring(0,3)}
                   </div>
                   <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                     {story.tag}
                   </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1">{story.community}</p>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{story.title}</h3>
                  <p className="text-xs text-stone-500 mt-2">{story.time}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>


        <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
          {/* ── 3. TOP TRENDING (Top Read) ── */}
          <section className="lg:col-span-2">
            <div className="mb-8 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">Trending Communities</h2>
              <p className="text-sm text-stone-400 mt-1">The most read and collected lore this week.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              {[
                { rank: 1, name: "MonkeDAO", readers: "12.4k", unlocked: "85%" },
                { rank: 2, name: "IslandDAO", readers: "8.2k", unlocked: "42%" },
                { rank: 3, name: "Solana Monkey Business", readers: "6.1k", unlocked: "90%" },
                { rank: 4, name: "DeGods", readers: "5.5k", unlocked: "12%" },
              ].map((comm) => (
                <Link href="#" key={comm.rank} className="flex items-center gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-colors">
                  <div className="text-2xl font-black text-stone-700 w-8 text-center">{comm.rank}</div>
                  <div className="h-14 w-14 rounded-xl bg-stone-800 shrink-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-stone-600">{comm.name.substring(0,2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{comm.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-stone-400">
                      <span>👁️ {comm.readers} Readers</span>
                      <span>🔓 {comm.unlocked} VIP Unlocks</span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <button className="rounded-full bg-emerald-500/10 text-emerald-400 px-4 py-1.5 text-xs font-bold hover:bg-emerald-500 hover:text-black transition-colors">
                      Visit Hub
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── 4. PROMOTIONAL AD ── */}
          <section className="lg:col-span-1">
             <div className="h-full w-full rounded-3xl bg-gradient-to-b from-stone-900 to-black border border-white/10 p-8 flex flex-col items-center text-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-600">Sponsored</span>
                </div>
                
                <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
                  <span className="text-3xl">🏛️</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Build Your Hub</h3>
                <p className="text-sm text-stone-400 mb-8 leading-relaxed">
                  Is your NFT collection missing a home? Create a branded community page and start publishing lore in minutes.
                </p>
                <Link href="/studio" className="w-full rounded-xl bg-white text-black px-6 py-3.5 text-sm font-bold hover:bg-stone-200 transition-colors">
                  Start Building — It's Free
                </Link>
             </div>
          </section>
        </div>

      </div>
    </main>
  );
}
