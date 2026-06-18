import Image from "next/image";
import type { Community } from "@/lib/communities";
import type { MagicEdenListing, MagicEdenStats } from "@/services/magicEden";
import { OwnedBadge } from "@/components/wallet/OwnedBadge";

export function Timeline3View({
  community,
  stats,
  listings,
  ownedMints = [],
}: {
  community: Community;
  stats: MagicEdenStats | null;
  listings: MagicEdenListing[];
  ownedMints?: string[];
}) {
  // Use theme settings if they exist, otherwise fallback to defaults.
  const theme = community.themeSettings || {
    primaryColor: "#34d399",
    backgroundColor: "#050505",
    borderStyle: "rounded-none"
  };

  const isTypeB = community.collectionType === "type_b";
  const displayListings = isTypeB && community.themeSettings?.assetIds?.length
    ? community.themeSettings.assetIds.map(id => listings.find(l => l.tokenMint === id)).filter(Boolean) as MagicEdenListing[]
    : listings;

  return (
    <div 
      className={`relative w-full py-10 font-mono bg-brand-bg`}
      style={{
        '--brand': theme.primaryColor,
        '--brand-dark': theme.primaryColor, // using primary for both for now
        '--brand-bg': theme.backgroundColor
      } as React.CSSProperties}
    >
      {/* Central Tech Spine */}
      <div className="absolute bottom-0 left-6 top-0 w-px border-l-2 border-dashed border-brand/30 md:left-1/2 md:-ml-[1px]" />
      <div className="absolute left-6 top-0 h-32 w-[2px] bg-gradient-to-b from-transparent via-brand to-transparent shadow-[0_0_10px_var(--brand)] md:left-1/2 md:-ml-[1px]" />

      <div className="flex flex-col gap-8 md:gap-0">
        {displayListings.map((listing, index) => {
          const isEven = index % 2 === 0;
          const isOwned = ownedMints.includes(listing.tokenMint);

          return (
            <div
              key={listing.tokenMint}
              className={`relative flex flex-col md:flex-row md:items-center ${
                isEven ? "md:flex-row-reverse" : ""
              } ${index > 0 ? "md:-mt-60" : ""}`}
            >
              {/* Tech Node */}
              <div className="absolute z-10 left-6 top-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm border border-brand-dark/30 bg-brand-bg md:left-1/2 md:top-1/2">
                <div className="h-4 w-4 rotate-45 border border-brand bg-brand/20 shadow-[0_0_15px_var(--brand)]" />
              </div>

              {/* Empty half */}
              <div className="hidden md:block md:w-1/2" />

              {/* Content Container */}
              <div
                className={`ml-16 md:ml-0 md:w-1/2 ${
                  isEven ? "md:pr-20" : "md:pl-20"
                }`}
              >
                {/* HUD Card */}
                <div className={`group relative ${theme.borderStyle} border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-brand/50 hover:bg-brand-dark/10 sm:p-8`}>
                  <div className="absolute -left-[1px] -top-[1px] h-4 w-4 border-l-2 border-t-2 border-brand transition-all duration-500 group-hover:h-8 group-hover:w-8" />
                  <div className="absolute -bottom-[1px] -right-[1px] h-4 w-4 border-b-2 border-r-2 border-brand transition-all duration-500 group-hover:h-8 group-hover:w-8" />

                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <span className="font-mono text-sm font-bold tracking-widest text-brand">
                      &gt; {listing.name}
                    </span>
                    <div className="flex flex-col items-end text-right">

                      {listing.priceLamports > 0 && (
                        <span className="font-mono text-xs font-semibold text-stone-300">
                          {listing.priceLamports / 1e9} SOL
                        </span>
                      )}
                    </div>
                  </div>

                  {isOwned && (
                    <div className="mb-4">
                      <OwnedBadge />
                    </div>
                  )}
                  <div className="relative mb-6 mx-auto aspect-square w-3/5 overflow-hidden">

                    {listing.image && (
                      <Image
                        src={listing.image}
                        alt={listing.name}
                        fill
                        className="object-contain opacity-80 mix-blend-screen transition-all duration-1000 group-hover:scale-105 group-hover:opacity-100 group-hover:mix-blend-normal"
                      />
                    )}

                  </div>

                  <p className="font-mono text-sm leading-relaxed text-stone-300">
                    {community.themeSettings?.assetDescriptions?.[listing.tokenMint] || (
                      <>
                        A highly sought-after asset from the {community.name}{" "}
                        collection. This premium listing was placed on the open
                        market by {listing.sellerName}.
                      </>
                    )}
                  </p>

                  <div className="mt-8 border-t border-white/10 pt-6">
                    <a
                      href={`https://magiceden.io/item-details/${listing.tokenMint}`}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex w-full items-center justify-center gap-2 border border-brand-dark/30 bg-black/50 px-6 py-3 font-mono text-sm font-bold text-brand transition hover:bg-brand hover:text-black ${theme.borderStyle}`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                      {listing.priceLamports > 0 ? "BUY_ON_MAGIC_EDEN" : "VIEW_ON_MAGIC_EDEN"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {displayListings.length === 0 && (
          <p className="py-10 text-center font-mono text-sm text-stone-500">
            [ NO_ACTIVE_LISTINGS_FOUND ]
          </p>
        )}
      </div>
    </div>
  );
}
