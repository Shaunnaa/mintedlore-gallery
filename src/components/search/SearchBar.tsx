import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchItem {
  name: string;
  slug: string;
  type: string;
}

interface SearchBarProps {
  /** Placeholder text for the input */
  placeholder?: string;
  /** Array of filter categories (e.g., ['All', 'Communities', 'Games']) */
  filterOptions?: string[];
  /** Items to search through */
  items: SearchItem[];
  /** Optional callback when an item is selected */
  onSelect?: (item: SearchItem) => void;
  /** Optional custom className for the container */
  className?: string;
}

export default function SearchBar({
  placeholder = "Search...",
  filterOptions = ["All"],
  items,
  onSelect,
  className = "",
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [activeFilter, setActiveFilter] = useState(filterOptions[0] ?? "All");
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filtered = searchQuery.trim().length > 0
    ? items.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (activeFilter === "All" || c.type === activeFilter)
      )
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: SearchItem) => {
    if (onSelect) {
      onSelect(item);
    } else {
      router.push(`/${item.slug}`);
    }
    setShowResults(false);
    setSearchQuery("");
  };

  return (
    <div className={`${className}`}>
      {/* Inner relative wrapper so the dropdown anchors to the search bar */}
      <div className="relative" ref={searchRef}>
        <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/10 px-5 py-4 shadow-2xl shadow-black/50 backdrop-blur-xl focus-within:border-emerald-500/50 focus-within:bg-white/[0.06] transition-all">
          {/* Search Icon */}
          <svg className="h-5 w-5 shrink-0 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-white placeholder:text-stone-600 focus:outline-none text-base"
          />
          {/* Filter Pills */}
          <div className="hidden md:flex items-center gap-2">
            {filterOptions.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors
                  ${activeFilter === f ? "bg-emerald-500 text-white border-emerald-500" : "border-white/10 text-stone-400 hover:border-emerald-500/50 hover:text-emerald-400"}`}
              >
                {f}
              </button>
            ))}
          </div>
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setShowResults(false); }} className="text-stone-600 hover:text-white transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {showResults && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-neutral-900 border border-white/10 shadow-2xl shadow-black overflow-hidden z-50">
            <p className="px-5 pt-4 pb-2 text-xs font-bold uppercase tracking-widest text-stone-600">Results</p>
            {filtered.map((c) => (
              <button
                key={c.slug}
                onClick={() => handleSelect(c)}
                className="flex w-full items-center gap-4 px-5 py-3 hover:bg-white/5 transition-colors text-left"
              >
                <div className="h-9 w-9 rounded-lg bg-stone-800 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-stone-500">{c.name.substring(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{c.name}</p>
                  <p className="text-xs text-stone-500">{c.type}</p>
                </div>
                <svg className="ml-auto h-4 w-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
        {showResults && searchQuery.trim().length > 0 && filtered.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-neutral-900 border border-white/10 shadow-2xl shadow-black p-6 text-center z-50">
            <p className="text-stone-500 text-sm">No results for <span className="text-white font-semibold">"{searchQuery}"</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
