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
  const [recentStories, setRecentStories] = useState<any[]>([]);
  const [topCollections, setTopCollections] = useState<any[]>([]);
  const [topStories, setTopStories] = useState<any[]>([]);

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

    // Fetch Dynamic Homepage Content
    fetch("/api/homepage")
      .then(async r => {
        if (!r.ok) throw new Error("Failed to fetch homepage data");
        const text = await r.text();
        return text ? JSON.parse(text) : {};
      })
      .then(d => {
        if (d.recentStories) setRecentStories(d.recentStories);
        if (d.topCollections) setTopCollections(d.topCollections);
        if (d.topStories) setTopStories(d.topStories);
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
          <div className="mb-8 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Newly Minted Lore</h2>
            <p className="text-sm text-stone-400 mt-1">The latest chapters published across the ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentStories.length > 0 ? recentStories.map((story, i) => {
              const communityName = Array.isArray(story.collection) 
                ? story.collection[0]?.name 
                : story.collection?.name || "Unknown";
                
              // Rough mock formatting for time ago
              const publishDate = new Date(story.created_at);
              const isRecent = (Date.now() - publishDate.getTime()) < 86400000;
              const timeDisplay = isRecent ? "Today" : publishDate.toLocaleDateString();

              return (
              <Link href={`/${story.slug}`} key={i} className="group flex flex-col gap-4">
                <div className="aspect-[4/3] w-full rounded-2xl bg-stone-900 border border-white/10 overflow-hidden relative group-hover:border-emerald-500/50 transition-colors">
                   {story.image ? (
                     <img src={story.image} alt={story.name} className="w-full h-full object-cover opacity-80" />
                   ) : (
                     <div className="absolute inset-0 flex items-center justify-center text-stone-700 font-bold uppercase tracking-widest text-xs">
                       {communityName.substring(0,3)}
                     </div>
                   )}
                   <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                     Chapter
                   </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1">{communityName}</p>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{story.name}</h3>
                  <p className="text-xs text-stone-500 mt-2">{timeDisplay}</p>
                </div>
              </Link>
            )}) : (
              <div className="col-span-full py-12 text-center border border-white/10 border-dashed rounded-2xl text-stone-500">
                No recent stories published yet.
              </div>
            )}
          </div>
        </section>
        
        {/* Add spacing between Recent Lore and Ad Banner */}
        <div className="mb-12"></div>

        {/* ── 3. PROMOTED AD (Middle Banner) ── */}
        {sidebarAds.length > 0 && (
          <section className="mb-16 w-full h-[200px] sm:h-[250px] rounded-3xl bg-gradient-to-r from-stone-900 to-black border border-white/10 overflow-hidden relative group flex items-center justify-center">
            {sidebarAds.map((ad, idx) => (
              <div 
                key={idx}
                className={`absolute inset-0 flex items-center transition-all duration-1000 ease-in-out ${
                  idx === currentSidebarSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                {/* Background Image with horizontal gradient fade */}
                {ad.image_url && (
                  <div className="absolute inset-0 z-0">
                    <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-700 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                  </div>
                )}
                
                <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between px-8 sm:px-12 lg:px-20 gap-6">
                  <div className="text-center md:text-left max-w-xl">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-2 block">
                      {ad.badge_text || "Sponsored"}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">{ad.title || "Build Your Hub"}</h3>
                    <p className="text-sm text-stone-300 line-clamp-2">{ad.description}</p>
                  </div>
                  
                  {(ad.button_url || ad.button_text) && (
                    <Link href={ad.button_url || "#"} className="shrink-0 h-12 px-8 flex items-center justify-center bg-white text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors">
                      {ad.button_text || "Learn More"}
                    </Link>
                  )}
                </div>
              </div>
            ))}
            
            {/* Horizontal Pagination Dots */}
            {sidebarAds.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                {sidebarAds.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentSidebarSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSidebarSlide ? "w-6 bg-emerald-400" : "w-1.5 bg-white/30 hover:bg-white/50"}`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* ── 4. TOP TRENDING COLLECTIONS ── */}
          <section>
            <div className="mb-8 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Top Collections</h2>
              <p className="text-sm text-stone-400 mt-1">Most read hubs this week.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              {topCollections.length > 0 ? topCollections.map((comm, index) => (
                <Link href={`/${comm.slug}`} key={comm.id} className="flex items-center gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-colors">
                  <div className="text-2xl font-black text-stone-700 w-8 text-center">{index + 1}</div>
                  <div className="h-14 w-14 rounded-xl bg-stone-800 shrink-0 flex items-center justify-center overflow-hidden">
                    {comm.image && comm.image !== "/window.svg" ? (
                      <img src={comm.image} alt={comm.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-stone-600">{comm.name.substring(0,2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{comm.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-stone-400">
                      <span>👁️ {comm.total_views} Views</span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <button className="rounded-full bg-emerald-500/10 text-emerald-400 px-4 py-1.5 text-xs font-bold hover:bg-emerald-500 hover:text-black transition-colors">
                      Visit Hub
                    </button>
                  </div>
                </Link>
              )) : (
                <div className="py-12 text-center border border-white/10 border-dashed rounded-2xl text-stone-500">
                  No reading data available for this week.
                </div>
              )}
            </div>
          </section>

          {/* ── 4. TOP TRENDING STORIES ── */}
          <section>
            <div className="mb-8 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Top Stories</h2>
              <p className="text-sm text-stone-400 mt-1">Most read chapters this week.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              {topStories.length > 0 ? topStories.map((story, index) => (
                <Link href={`/${story.slug}`} key={story.id} className="flex items-center gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-colors">
                  <div className="text-2xl font-black text-stone-700 w-8 text-center">{index + 1}</div>
                  <div className="h-14 w-14 rounded-xl bg-stone-800 shrink-0 flex items-center justify-center overflow-hidden">
                    {story.image && story.image !== "/window.svg" ? (
                      <img src={story.image} alt={story.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-stone-600">{story.name.substring(0,2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white line-clamp-1">{story.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-stone-400">
                      <span>👁️ {story.total_views} Views</span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <button className="rounded-full bg-emerald-500/10 text-emerald-400 px-4 py-1.5 text-xs font-bold hover:bg-emerald-500 hover:text-black transition-colors">
                      Read Story
                    </button>
                  </div>
                </Link>
              )) : (
                <div className="py-12 px-4 text-center border border-white/10 border-dashed rounded-2xl text-stone-500 text-sm">
                  No reading data available for this week.
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </main>
  );
}
