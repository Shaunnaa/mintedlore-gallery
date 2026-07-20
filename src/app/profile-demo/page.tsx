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

export default function ProfileDemoPage() {
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
    alert("Profile saved successfully!");
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/u/${username}`;
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
              <span className="text-emerald-400">My Profile</span> <span className="text-stone-500 text-2xl font-normal">(Demo)</span>
            </h1>
            <p className="mt-4 max-w-2xl text-stone-400">
              This is the demo version of the profile page using mock data.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 hover:border-white/20 w-full sm:w-auto justify-center"
            >
              Share Profile
            </button>
            <Link 
              href={`/u/${username}`}
              className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/20 w-full sm:w-auto justify-center"
            >
              View Public Profile
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
              This page uses mock data to demonstrate the UI. The real profile is at <Link href="/profile" className="underline text-amber-300">/profile</Link>.
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
            {/* ── Profile Info ── */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
              <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-white">Public Identity</h2>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300">
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
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none" />
                  ) : (
                    <p className="text-white font-medium text-lg">{username}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">X (Twitter)</label>
                  {isEditing ? (
                    <input type="text" value={twitter} onChange={e => setTwitter(e.target.value)} className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none" />
                  ) : (
                    <p className="text-emerald-400 font-medium">{twitter}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">Telegram</label>
                  {isEditing ? (
                    <input type="text" value={telegram} onChange={e => setTelegram(e.target.value)} className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none" />
                  ) : (
                    <p className="text-emerald-400 font-medium">{telegram}</p>
                  )}
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-white/10">
                <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1">Wallet Address</label>
                <p className="font-mono text-sm text-stone-400 truncate">{publicKey?.toBase58()}</p>
              </div>
            </div>

            {/* ── NFT Showcase ── */}
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
                    <button onClick={() => setIsEditingShowcase(true)} className="rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-white/10">Edit Showcase</button>
                  ) : (
                    <button onClick={() => setIsEditingShowcase(false)} className="rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-bold text-black transition hover:bg-emerald-400">Save</button>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-stone-500">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mb-4"></div>
                  <p>Scanning wallet for NFTs...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {nfts.map((nft) => (
                    <div 
                      key={nft.id} 
                      onClick={() => isEditingShowcase && togglePublicStatus(nft.id)}
                      className={`group relative overflow-hidden rounded-2xl border-2 transition-all ${isEditingShowcase ? "cursor-pointer" : ""} ${nft.isPublic ? "border-emerald-500" : "border-white/5 bg-[#050505] opacity-50 grayscale hover:opacity-100 hover:grayscale-0"}`}
                    >
                      {nft.isPublic && (
                        <div className="absolute top-3 right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                          <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="aspect-square w-full bg-stone-900 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-stone-700 font-bold">
                          {nft.collection.substring(0, 3).toUpperCase()}
                        </div>
                      </div>
                      <div className={`p-4 ${nft.isPublic ? "bg-emerald-500/5" : ""}`}>
                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1 truncate">{nft.collection}</p>
                        <p className="text-sm font-bold text-white truncate">{nft.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
