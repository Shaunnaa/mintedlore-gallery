"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSidebarSlide}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center w-full h-full"
        >
          {/* Background Image with horizontal gradient fade */}
          {ads[currentSidebarSlide]?.image_url && (
            <div className="absolute inset-0 z-0">
              <img src={ads[currentSidebarSlide].image_url} alt={ads[currentSidebarSlide].title} className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-700 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            </div>
          )}
          
          <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between px-8 sm:px-12 lg:px-20 gap-6">
            <div className="text-center md:text-left max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-2 block">
                {ads[currentSidebarSlide]?.badge_text || "Sponsored"}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                {ads[currentSidebarSlide]?.title}
              </h2>
              <p className="text-sm md:text-base text-stone-400 line-clamp-2">
                {ads[currentSidebarSlide]?.description}
              </p>
            </div>
            
            {ads[currentSidebarSlide]?.button_text && (
              <div className="shrink-0">
                <Link 
                  href={ads[currentSidebarSlide]?.button_url || "#"} 
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 text-sm font-bold transition-all hover:scale-105"
                >
                  {ads[currentSidebarSlide].button_text}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
</section>
  );
}
