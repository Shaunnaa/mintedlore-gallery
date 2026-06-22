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

// Mock data
const MOCK_NFTS: WalletNFT[] = [
  { id: "1", name: "IslandDAO Citizen #42", collection: "IslandDAO", image: "https://arweave.net/qN-QzX9nN08R_19d5zN0n2_46960r331g3718v8v_8", isPublic: true },
  { id: "2", name: "Monke #3456", collection: "MonkeDAO", image: "https://arweave.net/1", isPublic: false },
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
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* ── Profile Info Sidebar ── */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">Public Identity</h2>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="text-sm text-emerald-400 hover:text-emerald-300">Edit</button>
                  ) : (
                    <button onClick={saveProfile} className="text-sm font-bold text-emerald-400 hover:text-emerald-300">Save</button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1">Username</label>
                    {isEditing ? (
                      <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none" />
                    ) : (
                      <p className="text-white font-medium">{username}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1">X (Twitter)</label>
                    {isEditing ? (
                      <input type="text" value={twitter} onChange={e => setTwitter(e.target.value)} className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none" />
                    ) : (
                      <p className="text-emerald-400">{twitter}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1">Telegram</label>
                    {isEditing ? (
                      <input type="text" value={telegram} onChange={e => setTelegram(e.target.value)} className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none" />
                    ) : (
                      <p className="text-emerald-400">{telegram}</p>
                    )}
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-white/10">
                     <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1">Wallet Address</label>
                     <p className="font-mono text-xs text-stone-400 truncate">{publicKey?.toBase58()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── NFT Showcase Manager ── */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-white/10 bg-[#0c0c10] p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">NFT Showcase</h2>
                    <p className="text-sm text-stone-400 mt-1">Select which NFTs are visible on your public profile.</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-stone-900 px-3 py-1.5 border border-white/5">
                    <span className="text-xs font-bold text-stone-400">PUBLIC:</span>
                    <span className="text-emerald-400 font-bold">{nfts.filter(n => n.isPublic).length}</span>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {nfts.map((nft) => (
                      <div 
                        key={nft.id} 
                        className={`group relative flex items-center gap-4 rounded-xl border p-3 transition-all ${
                          nft.isPublic 
                            ? "border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                            : "border-white/5 bg-white/[0.02]"
                        }`}
                      >
                        {/* NFT Image */}
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-800">
                          {/* Fallback styling since mock images might break */}
                          <div className="h-full w-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center text-xs text-stone-500">NFT</div>
                        </div>

                        {/* NFT Info */}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-bold text-white">{nft.name}</p>
                          <p className="truncate text-xs text-stone-500">{nft.collection}</p>
                        </div>

                        {/* Toggle Button */}
                        <button
                          onClick={() => togglePublicStatus(nft.id)}
                          className={`flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors ${
                            nft.isPublic ? "bg-emerald-500" : "bg-stone-700"
                          }`}
                        >
                          <div 
                            className={`h-6 w-6 rounded-full bg-white transition-transform ${
                              nft.isPublic ? "translate-x-6" : "translate-x-0"
                            }`} 
                          />
                        </button>
                      </div>
                    ))}
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
