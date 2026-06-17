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

  const heroListing = displayListings[0]; // Using the first listing as the hero

  const description = community.themeSettings?.assetDescriptions?.[heroListing?.tokenMint || ""] || community.description;

  return (
    <div className="mx-auto max-w-3xl py-12">
      {heroListing && ownedMints.includes(heroListing.tokenMint) ? (
        <div className="mb-4 flex justify-end">
          <OwnedBadge />
        </div>
      ) : null}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-white/10 bg-[#121216] shadow-2xl shadow-emerald-900/20">
        <Image
          src={
            heroListing?.image ??
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1500&auto=format&fit=crop"
          }
          alt={heroListing?.name ?? "The Genesis Sphere"}
          fill
          priority
          className="object-cover transition-transform duration-1000 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />

        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div>
            <span className="inline-block rounded-full border border-emerald-500/30 bg-black/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-300 backdrop-blur-md">
              {heroListing?.name ?? "Artifact #042"}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
              Legendary
            </span>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <article className="mx-auto mt-12 max-w-2xl">
        <header className="mb-10 border-b border-white/10 pb-10 text-center">
          <h1 className="text-4xl font-extrabold text-white md:text-5xl lg:text-6xl">
            {community.name}
          </h1>
          <p className="mt-6 text-lg text-stone-400">{description}</p>
        </header>

        <div className="space-y-8 text-lg leading-relaxed text-stone-300">
          <p>
            <span className="float-left mr-4 mt-2 text-7xl font-extrabold leading-none text-emerald-400">
              B
            </span>
            efore the great validators synced their ledgers, there existed a
            void. A vast, decentralized emptiness where nodes drifted without
            purpose. It was during this silent era that the{" "}
            <em className="text-emerald-300">Genesis Sphere</em> was forged.
          </p>

          <p>
            Legend states that this artifact was not minted by a human hand, but
            rather compiled from the raw, unyielding energy of the very first
            block. It holds within it the chaotic beauty of a million parallel
            transactions, frozen in perfect cryptographic harmony. To look upon
            it is to witness the birth of a new digital universe.
          </p>

          <blockquote className="my-10 rounded-r-xl border-l-4 border-emerald-500 bg-emerald-500/5 py-6 pl-6 pr-4 italic text-emerald-100 shadow-inner">
            &quot;To gaze into the Sphere is to see the immutable truth of the chain.
            It does not lie, it does not rewrite—it only observes the flow of
            time and state.&quot;
          </blockquote>

          <p>
            For centuries (in blockchain time), it passed from wallet to wallet.
            Kings of the Web3 realms traded fortunes for a mere glimpse of its
            hash. Entire DAOs waged economic wars to claim sovereignty over its
            metadata.
          </p>

          <p>
            It is said that the current owner, a mysterious entity known only by
            their base58 address, keeps it locked within an offline vault,
            guarded by multisig incantations and cryptographic riddles that would
            take a quantum computer thousands of years to unravel.
          </p>
        </div>
      </article>
    </div>
  );
}
