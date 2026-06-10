import Image from "next/image";
import Link from "next/link";

const STORY_CHAPTERS = [
  {
    id: "genesis",
    title: "INIT: GENESIS_BLOCK",
    nftImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    nftName: "Artifact_001",
    date: "SLOT_0000000",
    hash: "sig_8f2A9b4c...Tx9q",
    text: "It began before the first validator came online. The Genesis Mint was not a transaction, but an explosion of cryptographic energy. This singular artifact was the seed from which the entire ledger grew. Its metadata is etched permanently into the bedrock of the chain.",
  },
  {
    id: "fork",
    title: "EVENT: GREAT_FORK",
    nftImage:
      "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=1000&auto=format&fit=crop",
    nftName: "Artifact_042",
    date: "SLOT_1204892",
    hash: "sig_3c4F1a9b...Vv2m",
    text: "As the network expanded, fractures appeared. A disagreement in consensus protocol led to The Great Fork. During the chaos, Artifact #042 was split into two parallel realities. We only hold the surviving remnant. Its colors reflect the data that was lost in the split.",
  },
  {
    id: "lost",
    title: "STATUS: WALLET_FROZEN",
    nftImage:
      "https://images.unsplash.com/photo-1633422544265-d227b6131497?q=80&w=1000&auto=format&fit=crop",
    nftName: "Vault_Core",
    date: "SLOT_3509121",
    hash: "sig_0x000000...Null",
    text: "For centuries, the vault remained sealed. The private keys were lost in a devastating hardware crash. The artifact sat dormant, observing millions of transactions pass by, unreachable by any human hand. It became a myth, a ghost sitting in a dead wallet.",
  },
  {
    id: "recovery",
    title: "ACTION: METADATA_RESCUE",
    nftImage:
      "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?q=80&w=1000&auto=format&fit=crop",
    nftName: "Artifact_899",
    date: "SLOT_8004562",
    hash: "sig_7g9K2m4p...Rx1z",
    text: "A decentralized collective of scavengers finally decoded the recovery phrase. The artifact was freed, its metadata forever altered by the rescue operation. It now stands as a symbol of resilience on the chain.",
  },
];

export default function StorytellingTimeline() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] px-5 py-12 text-stone-50 sm:px-10 lg:px-20">
      {/* Blockchain Tech Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-600/10 blur-[120px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Navigation */}
        <div className="mb-12">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
          >
            <span className="opacity-0 transition-opacity group-hover:opacity-100">
              &gt;
            </span>
            [ RETURN_TO_HOME ]
          </Link>
        </div>

        {/* Page Header */}
        <header className="mb-24 text-center">
          <div className="inline-flex items-center justify-center gap-3 rounded-none border border-emerald-500/30 bg-emerald-500/5 px-4 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
              Chain Connection Established
            </span>
          </div>
          <h1 className="mt-8 font-mono text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
            THE_ARTIFACT_LEDGER
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-400">
            Parse the immutable blocks of our history. Scroll down to decrypt
            the metadata and witness the chain of events that shaped the
            network.
          </p>
        </header>

        {/* Tech Timeline Structure */}
        <section className="relative w-full py-10">
          {/* Glowing Dashed Spine */}
          <div className="absolute bottom-0 left-6 top-0 w-px border-l-2 border-dashed border-emerald-500/30 md:left-1/2 md:-ml-[1px]" />
          
          {/* Laser beam effect moving down the spine */}
          <div className="absolute left-6 top-0 h-32 w-[2px] bg-gradient-to-b from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#34d399] md:left-1/2 md:-ml-[1px]" />

          <div className="flex flex-col gap-28">
            {STORY_CHAPTERS.map((chapter, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={chapter.id}
                  className={`relative flex flex-col md:flex-row md:items-center ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Tech Node (Replacing the dot) */}
                  <div className="absolute left-6 top-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm bg-[#050505] md:left-1/2 md:top-1/2 z-10 border border-emerald-500/30">
                    <div className="h-4 w-4 rotate-45 border border-emerald-400 bg-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.6)]" />
                  </div>

                  {/* Empty half for desktop alternating layout */}
                  <div className="hidden md:block md:w-1/2" />

                  {/* Content Container */}
                  <div
                    className={`ml-16 md:ml-0 md:w-1/2 ${
                      isEven ? "md:pr-20" : "md:pl-20"
                    }`}
                  >
                    {/* Glassmorphic HUD Card */}
                    <div className="group relative rounded-none border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-emerald-500/50 hover:bg-emerald-950/20 sm:p-8">
                      {/* HUD Corner Accents */}
                      <div className="absolute -left-[1px] -top-[1px] h-4 w-4 border-l-2 border-t-2 border-emerald-400 transition-all duration-500 group-hover:h-8 group-hover:w-8" />
                      <div className="absolute -bottom-[1px] -right-[1px] h-4 w-4 border-b-2 border-r-2 border-emerald-400 transition-all duration-500 group-hover:h-8 group-hover:w-8" />

                      {/* Top Bar Data */}
                      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                        <span className="font-mono text-sm font-bold tracking-widest text-emerald-400">
                          &gt; {chapter.title}
                        </span>
                        <div className="flex flex-col items-end text-right">
                          <time className="font-mono text-xs font-semibold text-stone-300">
                            {chapter.date}
                          </time>
                          <span className="font-mono text-[10px] text-stone-500">
                            TX: {chapter.hash}
                          </span>
                        </div>
                      </div>

                      {/* NFT Hologram Image */}
                      <div className="relative mb-6 aspect-video w-full overflow-hidden border border-emerald-500/20 bg-neutral-900">
                        {/* Scanline overlay */}
                        <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
                        
                        <Image
                          src={chapter.nftImage}
                          alt={chapter.nftName}
                          fill
                          className="object-cover opacity-80 mix-blend-screen transition-all duration-1000 group-hover:scale-105 group-hover:opacity-100 group-hover:mix-blend-normal"
                        />
                        
                        <div className="absolute bottom-3 left-3 z-20 border border-emerald-500/40 bg-black/80 px-3 py-1 font-mono text-xs font-medium text-emerald-300 backdrop-blur-md">
                          [ {chapter.nftName} ]
                        </div>
                      </div>

                      {/* Story Text */}
                      <p className="font-mono text-sm leading-relaxed text-stone-300">
                        {chapter.text}
                      </p>

                      {/* Terminal Interactive Button */}
                      <div className="mt-8 border-t border-white/10 pt-6">
                        <button className="flex w-full items-center justify-center gap-2 border border-emerald-500/30 bg-black/50 px-6 py-3 font-mono text-sm font-bold text-emerald-400 transition hover:bg-emerald-400 hover:text-black">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          EXECUTE_BUY_TRANSACTION
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer Teaser */}
        <div className="mt-32 border-t border-emerald-500/20 pt-10 text-center font-mono">
          <p className="text-emerald-500/50">
            [ AWAITING_NEXT_BLOCK ]...
          </p>
        </div>
      </div>
    </main>
  );
}
