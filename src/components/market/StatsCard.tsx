"use client";

import { useCurrencyConverter, type Currency } from "@/hooks/useCurrencyConverter";

type StatsCardProps = {
  floorPrice?: number;
  totalVolume?: number;
  listedCount?: number;
  error?: string | null;
};

export function StatsCard({ floorPrice, totalVolume, listedCount, error }: StatsCardProps) {
  const { selectedCurrency, setSelectedCurrency, formatValue } = useCurrencyConverter();

  return (
    <section className="border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
            Collection stats
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Market Pulse
          </h2>
          
          {/* Currency Toggle */}
          <div className="mt-4 flex gap-1 rounded-lg bg-black/40 p-1 w-max border border-white/5">
            {(["SOL", "USD", "THB"] as Currency[]).map((cur) => (
              <button
                key={cur}
                onClick={() => setSelectedCurrency(cur)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-md ${
                  selectedCurrency === cur
                    ? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                    : "text-stone-500 hover:text-stone-300 hover:bg-white/5"
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <p className="max-w-xl break-words border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm leading-6 text-red-100">
            {error}
          </p>
        ) : (
          <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-3 mt-4 sm:mt-0">
            <div className="border border-white/10 bg-[#101014] px-6 py-4 flex flex-col justify-center">
              <p className="text-sm text-stone-400">Listed Items</p>
              <p className="mt-2 text-3xl font-semibold text-white transition-all duration-300">
                {listedCount ? listedCount.toLocaleString() : "0"}
              </p>
            </div>
            <div className="border border-white/10 bg-[#101014] px-6 py-4 flex flex-col justify-center">
              <p className="text-sm text-stone-400">Floor Price</p>
              <p className="mt-2 text-3xl font-semibold text-white transition-all duration-300">
                {formatValue(floorPrice)}
              </p>
            </div>
            <div className="border border-white/10 bg-[#101014] px-6 py-4 flex flex-col justify-center">
              <p className="text-sm text-stone-400">Total Volume</p>
              <p className="mt-2 text-3xl font-semibold text-white transition-all duration-300">
                {formatValue(totalVolume)}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
