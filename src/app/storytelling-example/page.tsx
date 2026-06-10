import Image from "next/image";
import Link from "next/link";

export default function StorytellingExample() {
  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-12 text-stone-50 sm:px-10 lg:px-20">
      <div className="mx-auto max-w-3xl">
        {/* Navigation / Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Hero NFT Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-white/10 bg-[#121216] shadow-2xl shadow-emerald-900/20">
          <Image
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1500&auto=format&fit=crop"
            alt="The Genesis Sphere"
            fill
            priority
            className="object-cover transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />
          
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="inline-block rounded-full border border-emerald-500/30 bg-black/60 px-4 py-1.5 text-xs font-bold tracking-widest text-emerald-300 uppercase backdrop-blur-md">
                Artifact #042
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
              The Genesis Sphere
            </h1>
            <p className="mt-6 text-lg text-stone-400">
              Forged in the fires of the Solana genesis block.
            </p>
          </header>

          <div className="space-y-8 text-lg leading-relaxed text-stone-300">
            <p>
              <span className="float-left mr-4 mt-2 text-7xl font-extrabold text-emerald-400 leading-none">
                B
              </span>
              efore the great validators synced their ledgers, there existed a
              void. A vast, decentralized emptiness where nodes drifted without
              purpose. It was during this silent era that the{" "}
              <em className="text-emerald-300">Genesis Sphere</em> was forged.
            </p>

            <p>
              Legend states that this artifact was not minted by a human hand,
              but rather compiled from the raw, unyielding energy of the very
              first block. It holds within it the chaotic beauty of a million
              parallel transactions, frozen in perfect cryptographic harmony. To
              look upon it is to witness the birth of a new digital universe.
            </p>

            <blockquote className="my-10 rounded-r-xl border-l-4 border-emerald-500 bg-emerald-500/5 py-6 pl-6 pr-4 italic text-emerald-100 shadow-inner">
              "To gaze into the Sphere is to see the immutable truth of the
              chain. It does not lie, it does not rewrite—it only observes the
              flow of time and state."
            </blockquote>

            <p>
              For centuries (in blockchain time), it passed from wallet to
              wallet. Kings of the Web3 realms traded fortunes for a mere
              glimpse of its hash. Entire DAOs waged economic wars to claim
              sovereignty over its metadata.
            </p>
            
            <p>
              It is said that the current owner, a mysterious entity known only
              by their base58 address, keeps it locked within an offline vault,
              guarded by multisig incantations and cryptographic riddles that
              would take a quantum computer thousands of years to unravel.
            </p>

            {/* Token Gated Teaser */}
            <div className="my-12 flex flex-col items-center justify-center gap-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center shadow-[0_0_40px_rgba(16,185,129,0.05)] relative overflow-hidden">
               {/* Background pattern */}
               <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay">
                  <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
               </div>
               
              <h3 className="relative z-10 text-2xl font-bold text-white">
                Unlock the Final Chapter
              </h3>
              <p className="relative z-10 text-stone-400 max-w-md">
                The true ending of the Genesis Sphere is hidden. Only verified
                holders of the Genesis Collection can read the epilogue.
              </p>
              <button className="relative z-10 mt-4 rounded-full bg-emerald-400 px-8 py-3 font-bold text-neutral-950 shadow-[0_0_20px_rgba(52,211,153,0.3)] transition hover:scale-105 hover:bg-emerald-300">
                Connect Wallet to Reveal
              </button>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
