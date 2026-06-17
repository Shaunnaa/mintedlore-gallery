import Image from "next/image";
import type { Community } from "@/lib/communities";
import type { MagicEdenListing, MagicEdenStats } from "@/services/magicEden";
import { OwnedBadge } from "@/components/wallet/OwnedBadge";

export function Timeline2View({
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
  const isTypeB = community.collectionType === "type_b";
  const displayListings = isTypeB && community.themeSettings?.assetIds?.length
    ? community.themeSettings.assetIds.map(id => listings.find(l => l.tokenMint === id)).filter(Boolean) as MagicEdenListing[]
    : listings;

  return (
    <div className="mx-auto max-w-3xl py-12">

      {/* Story Content */}
      <article className="mx-auto mt-12 max-w-2xl">
        <header className="mb-10 border-b border-white/10 pb-10 text-center">
          <h1 className="text-4xl font-extrabold text-white md:text-5xl lg:text-6xl">
            {community.name}
          </h1>
          <p className="mt-6 text-lg text-stone-400">{community.description}</p>
        </header>

        <div className="space-y-16 text-lg leading-relaxed text-stone-300">
          {displayListings.map((listing, i) => {
            const desc = community.themeSettings?.assetDescriptions?.[listing.tokenMint] || `A highly sought-after artifact from the ${community.name} collection.`;
            return (
              <div key={listing.tokenMint} className="flex flex-col gap-6">
                <h2 className="text-3xl font-bold text-white transition-colors hover:text-emerald-300">{listing.name}</h2>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/50 shadow-xl transition-all duration-500 hover:border-emerald-500/40 hover:shadow-emerald-900/20">
                  {listing.image && (
                    <Image src={listing.image} alt={listing.name} fill className="object-cover transition-transform duration-700 hover:scale-105" unoptimized />
                  )}
                  {ownedMints.includes(listing.tokenMint) && (
                    <div className="absolute right-4 top-4">
                      <OwnedBadge />
                    </div>
                  )}
                </div>
                <div className="rounded-r-xl border-l-4 border-emerald-500 bg-emerald-500/5 py-6 pl-6 pr-4 italic text-emerald-100 shadow-inner">
                  {desc}
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <span className="text-xs uppercase tracking-widest text-emerald-400">Current Offering: {(listing.priceLamports / 1e9).toFixed(2)} SOL</span>
                  <a href={`https://magiceden.io/item-details/${listing.tokenMint}`} target="_blank" rel="noreferrer" className="rounded-full bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-widest text-stone-300 transition hover:bg-white/10 hover:text-white">
                    View on Magic Eden →
                  </a>
                </div>
              </div>
            );
          })}
          
          {displayListings.length === 0 && (
            <p className="text-center text-sm text-stone-500 py-10">No items in this collection yet.</p>
          )}
        </div>
      </article>
    </div>
  );
}
