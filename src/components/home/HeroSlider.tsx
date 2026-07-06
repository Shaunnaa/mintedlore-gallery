"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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
    <section 
      className="relative w-full overflow-hidden bg-neutral-950 pt-20 sm:pt-24 min-h-[500px] flex items-center group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image & Overlay */}
      {slide.image_url && (
        <div className="absolute inset-0 z-0">
          <Image 
            src={slide.image_url} 
            alt={slide.title || "Hero Background"}
            fill 
            className="object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-700 mix-blend-overlay" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-transparent to-transparent"></div>
        </div>
      )}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-5 sm:left-8 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-black/20 border border-white/10 text-white hover:bg-black/50 transition backdrop-blur-sm opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5 pr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-black/20 border border-white/10 text-white hover:bg-black/50 transition backdrop-blur-sm opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5 pl-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}

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
  );
}
