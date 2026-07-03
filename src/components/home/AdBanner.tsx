"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdBanner({ ads }: { ads: any[] }) {
  const [currentSidebarSlide, setCurrentSidebarSlide] = useState(0);

  useEffect(() => {
    if (!ads || ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSidebarSlide((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [ads?.length]);

  if (!ads || ads.length === 0) return null;

  return (
    <section className="mb-16 w-full h-[200px] sm:h-[250px] rounded-3xl bg-gradient-to-r from-stone-900 to-black border border-white/10 overflow-hidden relative group flex items-center justify-center">
      {ads.map((ad, idx) => (
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
      {ads.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
          {ads.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentSidebarSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSidebarSlide ? "w-6 bg-emerald-400" : "w-1.5 bg-white/30 hover:bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
