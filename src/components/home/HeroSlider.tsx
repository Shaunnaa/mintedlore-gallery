"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroSlider({ slides }: { slides: any[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    if (isPaused) return; // Stop the timer if the user is hovering
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [slides?.length, isPaused]);

  if (!slides || slides.length === 0) return null;

  const slide = slides[currentSlide];

  return (
    <div className="relative group max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 mt-4 sm:mt-8">
      <section 
        className="relative w-full rounded-3xl overflow-hidden bg-neutral-950 border border-white/20 pt-10 sm:pt-16 h-[400px] flex items-center"
        onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 0.98, x: 10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 1.02, x: -10 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full flex items-center pt-10 sm:pt-16"
        >
          {/* Background Image & Overlay */}
          {slide.image_url && (
            <div className="absolute inset-0 z-0">
              <Image 
                src={slide.image_url} 
                alt={slide.title || "Hero Background"}
                fill 
                className="object-cover object-right opacity-90 group-hover:opacity-100 transition-opacity duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/30 to-transparent"></div>
            </div>
          )}

          <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pb-16 pl-20 sm:pl-28">
            <div>
              {(slide.tag || slide.badge_text) && (
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 mb-6 backdrop-blur-md">
                  <span className="flex h-2 w-2 rounded-full bg-white animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-200">{slide.tag || slide.badge_text}</span>
                </div>
              )}
              
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 max-w-3xl">
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
        </motion.div>
      </AnimatePresence>

      {/* Carousel Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((_, index) => (
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
      )}
    </section>

      {/* Navigation Arrows (Moved Outside Box) */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-0 sm:left-2 lg:-left-[3px] top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/20 transition opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5 pr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-0 sm:right-2 lg:-right-[3px] top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/20 transition opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5 pl-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}
    </div>
  );
}
