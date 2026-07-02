"use client";

import Link from "next/link";
import SearchBar from "@/components/search/SearchBar";
import Image from "next/image";
import { useState, useEffect } from "react";
// removed unused router import

export default function HomeRedesign() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSidebarSlide, setCurrentSidebarSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [sidebarAds, setSidebarAds] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/promotions")
      .then(async r => {
        if (!r.ok) throw new Error("Failed to fetch promotions");
        const text = await r.text();
        return text ? JSON.parse(text) : {};
      })
      .then(d => {
        if (d.promotions) {
          const hero = d.promotions.filter((p: any) => p.placement === "hero");
          if (hero.length > 0) setHeroSlides(hero);
          
          const sidebar = d.promotions.filter((p: any) => p.placement === "sidebar");
          if (sidebar.length > 0) setSidebarAds(sidebar);
        }
      })
      .catch(console.error);
  }, []);

// Dropdown handling moved inside SearchBar

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setCurrentSidebarSlide((prev) => (prev + 1) % sidebarAds.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered, heroSlides, sidebarAds]);

  const slide = heroSlides[currentSlide];

  return (
    <main className="min-h-screen bg-neutral-950 text-stone-50 font-sans pb-20">
      
      {/* ── 1. HERO SLIDER ── */}
      {heroSlides.length > 0 && (
      <section 
        className="group relative w-full h-[60vh] min-h-[500px] bg-stone-900 overflow-hidden flex items-end transition-colors duration-1000"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Image & Overlays */}
        <div className={`absolute inset-0 bg-neutral-950 transition-colors duration-1000`}>
           {heroSlides.map((s, index) => (
             <div 
               key={index} 
               className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? "opacity-100" : "opacity-0"}`}
             >
               <Image 
                 src={s.imgUrl || s.image_url} 
                 alt={s.title} 
                 fill 
                 className="object-cover opacity-50"
                 unoptimized
               />
               <div className={`absolute inset-0 bg-gradient-to-br ${s.bgClass || "from-emerald-900/80"} to-transparent mix-blend-multiply`}></div>
             </div>
           ))}
           <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay z-10"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent z-10"></div>
        </div>

        {/* Tag Badge */}
        {/* Removed absolute positioning to bring it closer to the title */}

        {/* Manual Slide Arrows */}
        <button 
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-5 sm:left-8 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-black/20 border border-white/10 text-white hover:bg-black/50 transition backdrop-blur-sm opacity-0 group-hover:opacity-100"
        >
          <svg className="w-5 h-5 pr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button 
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-black/20 border border-white/10 text-white hover:bg-black/50 transition backdrop-blur-sm opacity-0 group-hover:opacity-100"
        >
          <svg className="w-5 h-5 pl-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </button>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pb-16 pl-20 sm:pl-28">
          
          <div key={currentSlide} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {(slide.tag || slide.badge_text) && (
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 mb-6 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-white animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-stone-200">{slide.tag || slide.badge_text}</span>
              </div>
            )}
            
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4 max-w-3xl">
              {slide.highlight ? (
                <>{slide.title.replace(slide.highlight, "")} <span className="text-white brightness-150 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{slide.highlight}</span></>
              ) : (
                <>{slide.title}</>
              )}
            </h1>
            <p className="text-lg text-stone-300 max-w-2xl mb-8 leading-relaxed">
              {slide.desc || slide.description}
            </p>
            <div className="flex items-center gap-4">
              {(slide.btn1 || slide.button_text) && (
                <Link href={slide.link || slide.button_url || "#"} className="rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-black transition hover:bg-stone-200 hover:scale-105 transform duration-200">
                  {slide.btn1 || slide.button_text}
                </Link>
              )}
              {(slide.btn2 || slide.button_2_text) && (
                <Link href={slide.link || slide.button_2_url || "#"} className="rounded-xl bg-white/5 border border-white/10 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
                  {slide.btn2 || slide.button_2_text}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {heroSlides.map((_, index) => (
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
      )}

      {/* Add spacing after hero banner */}
      <div className="mb-8"></div>

      {/* ── SEARCH & DISCOVERY BAR ── */}
      <SearchBar
        placeholder="Search collections, games, and stories..."
        filterOptions={["All", "Collection", "Games", "Stories"]}
        items={[]}
        className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 mt-8 mb-8"
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 mt-12 space-y-20">
        
        {/* ── 2. NEWLY MINTED LORE (New Stories) ── */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Newly Minted Lore</h2>
              <p className="text-sm text-stone-400 mt-1">The latest chapters published across the ecosystem.</p>
            </div>
            <Link href="/nft-gallery" className="text-sm font-bold text-emerald-400 hover:text-emerald-300 hidden sm:block">View All</Link>
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
              <h2 className="text-2xl font-bold text-white tracking-tight">Top Read Collections</h2>
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

          {/* ── 4. PROMOTIONAL ADS (SIDEBAR) ── */}
          <section className="lg:col-span-1 flex flex-col gap-6">
             {sidebarAds.length > 0 && (
             <div className="w-full h-full rounded-3xl bg-gradient-to-b from-stone-900 to-black border border-white/10 p-8 flex flex-col items-center text-center justify-center relative overflow-hidden group min-h-[400px]">
                
                {sidebarAds[currentSidebarSlide].image_url && (
                  <div className="absolute inset-0 z-0">
                    <img src={sidebarAds[currentSidebarSlide].image_url} alt="Background" className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                  </div>
                )}
                
                <div className="relative z-10 w-full flex flex-col items-center">
                  <div className="absolute -top-4 -right-4 p-3">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">{sidebarAds[currentSidebarSlide].badge_text || ""}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 mt-4">{sidebarAds[currentSidebarSlide].title || "Build Your Hub"}</h3>
                  <p className="text-sm text-stone-400 mb-8 leading-relaxed line-clamp-3">
                    {sidebarAds[currentSidebarSlide].description || "Is your NFT collection missing a home? Create a branded community page and start publishing lore in minutes."}
                  </p>
                  
                  {(sidebarAds[currentSidebarSlide].button_text || sidebarAds[currentSidebarSlide].button_url) && (
                    <Link href={sidebarAds[currentSidebarSlide].button_url || "#"} className="w-full rounded-xl bg-white text-black px-6 py-3.5 text-sm font-bold hover:bg-stone-200 transition-colors">
                      {sidebarAds[currentSidebarSlide].button_text || "Learn More"}
                    </Link>
                  )}
                </div>

                {sidebarAds.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                    {sidebarAds.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSidebarSlide(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          currentSidebarSlide === index ? "w-6 bg-emerald-400" : "w-1.5 bg-white/20 hover:bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
             )}
          </section>
        </div>

      </div>
    </main>
  );
}
