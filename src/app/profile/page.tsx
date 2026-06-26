"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

// Mock NFT type for the demo
type WalletNFT = {
  id: string;
  name: string;
  image: string;
  collection: string;
  isPublic: boolean;
};

const MOCK_NFTS: WalletNFT[] = [
  { id: "1", name: "IslandDAO Citizen #42", collection: "IslandDAO", image: "https://arweave.net/qN-QzX9nN08R_19d5zN0n2_46960r331g3718v8v_8", isPublic: true },
  { id: "2", name: "Monke #3456", collection: "MonkeDAO", image: "https://arweave.net/1", isPublic: false },
  { id: "3", name: "Mad Lads #1122", collection: "Mad Lads", image: "", isPublic: false },
  { id: "4", name: "Tensorian #99", collection: "Tensorians", image: "", isPublic: false },
  { id: "5", name: "DeGod #881", collection: "DeGods", image: "", isPublic: false },
  { id: "6", name: "Claynosaurz #555", collection: "Claynosaurz", image: "", isPublic: false },
  { id: "7", name: "Galactic Gecko #77", collection: "Galactic Geckos", image: "", isPublic: false },
  { id: "8", name: "Famous Fox #12", collection: "Famous Fox Federation", image: "", isPublic: false },
  { id: "9", name: "SMB #102", collection: "Solana Monkey Business", image: "", isPublic: false },
  { id: "10", name: "Lode #404", collection: "Lode", image: "", isPublic: false },
];

export default function ProfilePage() {
  const { connected, publicKey } = useWallet();
  
  // Profile State
  const [username, setUsername] = useState("CryptoCollector99");
  const [twitter, setTwitter] = useState("@CryptoCollector");
  const [telegram, setTelegram] = useState("t.me/CryptoCollector");
  const [isEditing, setIsEditing] = useState(false);

  // NFT Showcase State
  const [nfts, setNfts] = useState<WalletNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingShowcase, setIsEditingShowcase] = useState(false);

  // Simulate loading NFTs when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      setIsLoading(true);
      // Simulate API call to fetch wallet NFTs
      setTimeout(() => {
        setNfts(MOCK_NFTS);
        setIsLoading(false);
      }, 1500);
    } else {
      setNfts([]);
    }
  }, [connected, publicKey]);

  const togglePublicStatus = (id: string) => {
    setNfts(current => 
      current.map(nft => 
        nft.id === id ? { ...nft, isPublic: !nft.isPublic } : nft
      )
    );
  };

  const saveProfile = () => {
    setIsEditing(false);
    // Here you would save to Supabase
    alert("Profile saved successfully!");
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/user/${username}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Profile link copied to clipboard!");
    });
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-stone-50 font-sans pb-20">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        
        {/* ── Header ── */}
        <header className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-normal text-white sm:text-5xl">
              <span className="text-emerald-400">My Profile</span>
            </h1>
            <p className="mt-4 max-w-2xl text-stone-400">
              Manage your public identity and choose which NFTs from your wallet to showcase on your public community page.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 hover:border-white/20 w-full sm:w-auto justify-center"
            >
              <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Profile
            </button>
            <Link 
              href={`/user/${username}`}
              className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/20 w-full sm:w-auto justify-center"
            >
              View Public Profile
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </header>

        {/* ── Mock Data Warning ── */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <svg className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-bold text-amber-400">Demo Mode Active</h3>
            <p className="text-sm text-amber-200/80 mt-1">
              This page is currently using mock data to demonstrate the UI. Connecting your wallet will load simulated NFTs instead of scanning the real blockchain.
            </p>
          </div>
        </div>

        {/* ── Wallet Connection ── */}
        {!connected && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/20 bg-[#0c0c10] p-12 text-center">
            <h2 className="mb-4 text-xl font-bold text-white">Connect your wallet to manage your profile</h2>
            <WalletMultiButtonDynamic className="!h-12 !rounded-xl !bg-emerald-500 !px-8 !font-bold !text-neutral-950 hover:!bg-emerald-400" />
          </div>
        )}

        {connected && (
          <div className="flex flex-col gap-10">
            
            {/* ── Profile Info (Top) ── */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
              <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-white">Public Identity</h2>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Edit
                  </button>
                ) : (
                  <button onClick={saveProfile} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-400 transition-colors">Save Changes</button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">Username</label>
                  {isEditing ? (
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                  ) : (
                    <p className="text-white font-medium text-lg">{username}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">X (Twitter)</label>
                  {isEditing ? (
                    <input type="text" value={twitter} onChange={e => setTwitter(e.target.value)} className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                  ) : (
                    <p className="text-emerald-400 font-medium">{twitter}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">Telegram</label>
                  {isEditing ? (
                    <input type="text" value={telegram} onChange={e => setTelegram(e.target.value)} className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                  ) : (
                    <p className="text-emerald-400 font-medium">{telegram}</p>
                  )}
                </div>
              </div>
              
              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                 <div>
                   <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1">Wallet Address</label>
                   <p className="font-mono text-sm text-stone-400 truncate">{publicKey?.toBase58()}</p>
                 </div>
              </div>
            </div>

            {/* ── NFT Showcase Manager (Bottom) ── */}
            <div>
              <div className="rounded-2xl border border-white/10 bg-[#0c0c10] p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">NFT Showcase</h2>
                    <p className="text-sm text-stone-400 mt-1">Curate the NFTs visible on your public profile.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 rounded-lg bg-stone-900 px-3 py-1.5 border border-white/5">
                      <span className="text-xs font-bold text-stone-400">PUBLIC:</span>
                      <span className="text-emerald-400 font-bold">
                        {nfts.filter(n => n.isPublic).length} <span className="text-stone-500 font-medium text-xs">/ {nfts.length}</span>
                      </span>
                    </div>
                    {!isEditingShowcase ? (
                      <button 
                        onClick={() => setIsEditingShowcase(true)}
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-white/10"
                      >
                        Edit Showcase
                      </button>
                    ) : (
                      <button 
                        onClick={() => setIsEditingShowcase(false)}
                        className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-bold text-black transition hover:bg-emerald-400"
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-stone-500">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mb-4"></div>
                    <p>Scanning wallet for NFTs...</p>
                  </div>
                ) : nfts.length === 0 ? (
                  <div className="text-center py-20 text-stone-500">
                    <p>No NFTs found in this wallet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {nfts.map((nft) => {
                      const isSelected = nft.isPublic;
                      return (
                        <div 
                          key={nft.id} 
                          onClick={() => isEditingShowcase && togglePublicStatus(nft.id)}
                          className={`group relative overflow-hidden rounded-2xl border-2 transition-all ${
                            isEditingShowcase ? "cursor-pointer" : ""
                          } ${
                            isSelected 
                              ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                              : "border-white/5 bg-[#050505] opacity-50 grayscale hover:opacity-100 hover:grayscale-0"
                          }`}
                        >
                          {/* Selection Badge */}
                          {isSelected && (
                            <div className="absolute top-3 right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-md">
                              <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}

                          {/* Hover Overlay in Edit Mode */}
                          {isEditingShowcase && !isSelected && (
                            <div className="absolute inset-0 z-10 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <div className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm border border-white/20">
                                 <span className="text-xs font-bold text-white tracking-widest uppercase">Select</span>
                               </div>
                            </div>
                          )}

                          {/* Image Placeholder */}
                          <div className="aspect-square w-full bg-stone-900 relative">
                             <div className="absolute inset-0 flex items-center justify-center text-stone-700 font-bold">
                               {nft.collection.substring(0, 3).toUpperCase()}
                             </div>
                          </div>
                          
                          {/* NFT Info */}
                          <div className={`p-4 ${isSelected ? "bg-emerald-500/5" : ""}`}>
                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1 truncate">{nft.collection}</p>
                            <p className="text-sm font-bold text-white truncate">{nft.name}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </section>
    </main>
  );
}
