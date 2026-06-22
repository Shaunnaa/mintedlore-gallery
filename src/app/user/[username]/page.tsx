import Link from "next/link";
import { notFound } from "next/navigation";

// Mock public NFTs (Filtered to only show the ones toggled to "PUBLIC")
const PUBLIC_NFTS = [
  {
    id: "1",
    name: "IslandDAO Citizen #42",
    collection: "IslandDAO",
    image: "https://arweave.net/qN-QzX9nN08R_19d5zN0n2_46960r331g3718v8v_8",
  },
];

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // In a real app, you would fetch the user's profile from Supabase here
  // If the user doesn't exist, call notFound()
  if (!username) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#050505] text-stone-50 font-sans pb-20">
      {/* ── Banner ── */}
      <div className="h-48 w-full bg-gradient-to-r from-emerald-900/40 via-stone-900 to-black relative">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
      </div>

      <section className="mx-auto flex w-full max-w-5xl flex-col px-5 sm:px-8 lg:px-10 relative -mt-16">
        
        {/* ── Profile Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div className="flex items-end gap-6">
            {/* Avatar */}
            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-[#050505] bg-stone-800 shadow-2xl">
               <div className="h-full w-full bg-gradient-to-br from-emerald-700 to-stone-900 flex items-center justify-center text-4xl">
                 🦖
               </div>
            </div>
            
            {/* Identity */}
            <div className="mb-2">
              <h1 className="text-4xl font-bold text-white tracking-tight">{username}</h1>
              <div className="flex items-center gap-4 mt-3">
                <a href="#" className="flex items-center gap-2 text-sm font-medium text-stone-400 hover:text-emerald-400 transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.04H5.078z" /></svg>
                  @CryptoCollector
                </a>
                <a href="#" className="flex items-center gap-2 text-sm font-medium text-stone-400 hover:text-emerald-400 transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                  t.me/CryptoCollector
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 min-w-[140px] justify-end">
               <div className="text-right">
                 <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Collected</p>
                 <p className="text-xl font-bold text-emerald-400">{PUBLIC_NFTS.length} <span className="text-sm text-stone-400">NFTs</span></p>
               </div>
            </div>
          </div>
        </div>

        {/* ── Mock Data Warning ── */}
        <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <svg className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-bold text-amber-400">Demo Mode Active</h3>
            <p className="text-sm text-amber-200/80 mt-1">
              This public profile is currently displaying mock data. In production, this gallery is populated directly from the user's connected Solana wallet.
            </p>
          </div>
        </div>

        {/* ── Public NFT Showcase ── */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Showcase</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {PUBLIC_NFTS.map((nft) => (
              <div key={nft.id} className="group rounded-2xl border border-white/10 bg-[#0c0c10] overflow-hidden hover:border-emerald-500/50 transition-colors shadow-xl">
                {/* Image Placeholder */}
                <div className="aspect-square w-full bg-stone-900 relative">
                   <div className="absolute inset-0 flex items-center justify-center text-stone-700 font-bold">
                     {nft.collection.substring(0, 3).toUpperCase()}
                   </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1 truncate">{nft.collection}</p>
                  <p className="text-sm font-bold text-white truncate">{nft.name}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </section>
    </main>
  );
}
