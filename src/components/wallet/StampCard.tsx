"use client";

type StampCardProps = {
  count: number;       // how many the user holds
  threshold: number;   // total stamps needed (from vipThreshold)
  isGranted?: boolean;
};

export function StampCard({ count, threshold, isGranted = false }: StampCardProps) {
  const stamps = Array.from({ length: threshold }, (_, i) => i < count);

  return (
    <div
      className={`
        relative w-full overflow-hidden rounded-2xl border p-6 text-center transition-all duration-700
        ${isGranted
          ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.15)]"
          : "border-amber-500/30 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.05)]"
        }
      `}
    >
      {/* Decorative top stripe */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${isGranted ? "bg-gradient-to-r from-emerald-500 via-emerald-300 to-emerald-500" : "bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600"}`} />

      {/* Title */}
      <h3 className={`mb-1 text-xs font-black uppercase tracking-[0.25em] ${isGranted ? "text-emerald-400" : "text-amber-400"}`}>
        {isGranted ? "✦ VIP Access Granted" : "VIP Stamp Card"}
      </h3>
      <p className="mb-6 text-sm text-stone-400">
        {isGranted
          ? `You hold all ${threshold} required NFTs. Full access unlocked.`
          : `Collect ${threshold - count} more NFT${threshold - count !== 1 ? "s" : ""} to unlock VIP access.`
        }
      </p>

      {/* Stamp Grid */}
      <div
        className="mx-auto flex flex-wrap items-center justify-center gap-3"
        style={{ maxWidth: `${Math.min(threshold, 6) * 68}px` }}
      >
        {stamps.map((stamped, i) => (
          <div
            key={i}
            className={`
              relative flex h-14 w-14 items-center justify-center rounded-xl border-2
              transition-all duration-500
              ${stamped
                ? isGranted
                  ? "border-emerald-400/60 bg-emerald-400/20 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                  : "border-amber-400/60 bg-amber-400/15 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                : "border-dashed border-white/15 bg-white/[0.02]"
              }
            `}
          >
            {stamped ? (
              /* Stamped — glowing checkmark */
              <svg
                className={`h-7 w-7 ${isGranted ? "text-emerald-300" : "text-amber-300"}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              /* Empty slot */
              <span className="text-lg font-black text-white/10">{i + 1}</span>
            )}

            {/* Slot label */}
            <span className={`absolute -bottom-5 text-[9px] font-bold uppercase tracking-widest ${stamped ? (isGranted ? "text-emerald-500" : "text-amber-600") : "text-stone-700"}`}>
              #{i + 1}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom count */}
      <p className={`mt-10 text-2xl font-black ${isGranted ? "text-emerald-300" : "text-amber-300"}`}>
        {count} <span className={`text-sm font-semibold ${isGranted ? "text-emerald-600" : "text-amber-700"}`}>/ {threshold}</span>
      </p>
      <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest">NFTs Collected</p>

      {isGranted && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-black/40 px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
            Secret Story Unlocked
          </p>
        </div>
      )}
    </div>
  );
}
