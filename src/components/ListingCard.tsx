import Image from "next/image";
import type { MagicEdenListing } from "@/services/magicEden";
import { useCurrencyConverter } from "@/hooks/useCurrencyConverter";
import { OwnedBadge } from "@/components/OwnedBadge";

type ListingCardProps = {
  listing: MagicEdenListing;
  isOwned?: boolean;
};

function truncateAddress(address: string): string {
  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function ListingCard({ listing, isOwned }: ListingCardProps) {
  const { formatValue } = useCurrencyConverter();
  const marketplaceUrl = `https://magiceden.io/item-details/${listing.tokenMint}`;

  return (
    <article className="group flex flex-col items-center">
      {/* The Art Piece with Museum Lighting effect */}
      <div className="relative mb-8 w-full max-w-[320px]">
        {/* Subtle wall light glow behind the frame */}
        <div className="absolute -inset-4 z-0 rounded-[2rem] bg-white/5 opacity-0 blur-2xl transition duration-700 group-hover:opacity-100" />
        
        {/* The Frame */}
        <div className="relative z-10 overflow-hidden bg-[#050505] p-3 pb-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 transition duration-700 group-hover:-translate-y-2 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] group-hover:ring-white/20 sm:p-4 sm:pb-16">
          <div className="relative aspect-square w-full overflow-hidden bg-neutral-900 shadow-inner">
            {listing.image ? (
              <Image
                src={listing.image}
                alt={listing.name}
                width={640}
                height={640}
                unoptimized
                className="h-full w-full object-cover transition duration-1000 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-stone-500">
                No image
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Museum Placard */}
      <div className="flex w-full max-w-[320px] flex-col items-center border-t border-white/10 pt-6 text-center transition duration-500 group-hover:border-white/30">
        {isOwned && (
          <div className="mb-4">
            <OwnedBadge />
          </div>
        )}
        <h3 className="font-serif text-2xl tracking-wide text-white/90 transition-colors group-hover:text-white">
          {listing.name}
        </h3>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-500">
          Curated by {truncateAddress(listing.sellerAddress)}
        </p>
        
        <div className="mt-6 flex h-[40px] flex-col items-center justify-center overflow-hidden relative w-full">
          {/* Price (Visible by default, slides up on hover) */}
          <p className="absolute font-mono text-sm font-medium text-stone-400 transition-all duration-500 group-hover:-translate-y-10 group-hover:opacity-0">
            Valued at {formatValue(listing.priceLamports)}
          </p>
          
          {/* Buy Button (Hidden by default, slides up on hover) */}
          <a
            href={marketplaceUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute translate-y-10 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 text-xs font-semibold uppercase tracking-widest text-emerald-400 hover:text-emerald-300"
          >
            Acquire Piece →
          </a>
        </div>
      </div>
    </article>
  );
}
