"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function OwnerDashboard() {
  const { connected, publicKey } = useWallet();
  const [hasGroup, setHasGroup] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    collectionAddress: "",
    preferredView: "timeline3",
    vipThreshold: 1,
    description: "",
    themeSettings: {
      primaryColor: "#34d399",
      backgroundColor: "#050505",
      borderStyle: "rounded-none",
    }
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev) => {
      const next = { ...prev, name: newName };
      if (!isSlugEdited) {
        // Auto-generate slug (lowercase, replace spaces/special chars with underscores)
        next.slug = newName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/(^_|_$)/g, "");
      }
      return next;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugEdited(true);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setHasGroup(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!connected) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-[#050505] px-5 text-center text-white">
        {/* Background Grid */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute left-1/2 top-0 z-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-600/10 blur-[120px]"></div>
        
        <div className="relative z-10 flex w-full max-w-md flex-col items-center rounded-3xl border border-white/10 bg-black/40 p-10 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
            <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Creator Portal</h1>
          <p className="mt-4 text-stone-400">
            Connect your wallet to authenticate and manage your decentralized NFT community.
          </p>
          <div className="mt-8">
            <WalletMultiButtonDynamic className="!h-12 !rounded-full !border !border-emerald-400/20 !bg-emerald-400/10 !px-8 !text-base !font-bold !text-emerald-300 transition-all hover:!bg-emerald-400 hover:!text-neutral-950" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-[#050505] text-stone-50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Sidebar */}
      <aside className="relative z-10 hidden w-72 border-r border-white/10 bg-[#101014]/80 backdrop-blur-md p-6 lg:block">
        <div className="mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Creator Dashboard
          </span>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500" />
            <div className="flex flex-col">
              <span className="text-xs text-stone-400">Connected Wallet</span>
              <span className="font-mono text-sm font-bold text-white">
                {publicKey?.toBase58().substring(0, 4)}...{publicKey?.toBase58().substring(40)}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <button className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-left text-sm font-semibold text-emerald-300 transition-colors">
            My Community
          </button>
          <button className="rounded-lg px-4 py-3 text-left text-sm font-medium text-stone-500 cursor-not-allowed">
            VIP Analytics (Soon)
          </button>
          <button className="rounded-lg px-4 py-3 text-left text-sm font-medium text-stone-500 cursor-not-allowed">
            Magic Eden Sync (Soon)
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto p-6 md:p-10">
        <div className="mx-auto max-w-3xl">
          <header className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {hasGroup ? "Manage Your Community" : "Launch Your Community"}
              </h1>
              <p className="mt-2 text-sm text-stone-400">
                Configure your unique group page, set VIP requirements, and choose your timeline template.
              </p>
            </div>
          </header>

          <form onSubmit={handleSave} className="flex flex-col gap-8 rounded-3xl border border-white/10 bg-[#121216]/80 p-8 shadow-2xl backdrop-blur-xl">
            {/* Success Message */}
            {saved && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-300">
                ✅ Community settings saved successfully to local state!
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-stone-400">
                  Community Name
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  placeholder="e.g. Solana Guild"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-stone-400">
                  Custom URL Slug
                </label>
                <div className="flex">
                  <span className="flex items-center rounded-l-xl border border-r-0 border-white/10 bg-white/5 px-3 text-sm text-stone-500">
                    /
                  </span>
                  <input
                    required
                    value={formData.slug}
                    onChange={handleSlugChange}
                    className="w-full rounded-r-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    placeholder="solana_guild"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-stone-400">
                Magic Eden Collection Symbol
              </label>
              <input
                required
                value={formData.collectionAddress}
                onChange={(e) => setFormData({ ...formData, collectionAddress: e.target.value })}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                placeholder="e.g. famous_fox_federation"
              />
              <p className="text-xs text-stone-500">This connects your page to live market data and verifies VIP ownership.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-stone-400">
                  Page Template View
                </label>
                <select
                  value={formData.preferredView}
                  onChange={(e) => setFormData({ ...formData, preferredView: e.target.value })}
                  className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                >
                  <option value="timeline1">Timeline 1 (Standard)</option>
                  <option value="timeline2">Timeline 2 (Story Article)</option>
                  <option value="timeline3">Timeline 3 (Cyberpunk HUD)</option>
                  <option value="gallery">Gallery (Grid Market)</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-stone-400">
                  NFTs Required for VIP Access
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.vipThreshold}
                  onChange={(e) => setFormData({ ...formData, vipThreshold: parseInt(e.target.value) || 1 })}
                  className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-stone-400">
                Community Description & Lore
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                placeholder="Share the story of your collection..."
              />
            </div>

            {/* Theme Settings Section */}
            <div className="mt-4 border-t border-white/10 pt-8">
               <h3 className="mb-6 font-bold text-white text-xl">Appearance Theme</h3>
               <div className="grid gap-6 sm:grid-cols-3">
                  <div className="flex flex-col gap-2">
                     <label className="text-sm font-semibold text-stone-400">Primary Brand Color</label>
                     <input
                        type="color"
                        value={formData.themeSettings.primaryColor}
                        onChange={(e) => setFormData({...formData, themeSettings: {...formData.themeSettings, primaryColor: e.target.value}})}
                        className="h-12 w-full cursor-pointer rounded-xl border border-white/10 bg-black/40 px-2 py-1"
                     />
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-sm font-semibold text-stone-400">Background Color</label>
                     <input
                        type="color"
                        value={formData.themeSettings.backgroundColor}
                        onChange={(e) => setFormData({...formData, themeSettings: {...formData.themeSettings, backgroundColor: e.target.value}})}
                        className="h-12 w-full cursor-pointer rounded-xl border border-white/10 bg-black/40 px-2 py-1"
                     />
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-sm font-semibold text-stone-400">Border Sharpness</label>
                     <select
                        value={formData.themeSettings.borderStyle}
                        onChange={(e) => setFormData({...formData, themeSettings: {...formData.themeSettings, borderStyle: e.target.value}})}
                        className="h-12 rounded-xl border border-white/10 bg-black/40 px-4 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                     >
                        <option value="rounded-none">Sharp Corners (Cyberpunk)</option>
                        <option value="rounded-xl">Soft Curves (Modern)</option>
                        <option value="rounded-3xl">Pill Smooth (Friendly)</option>
                     </select>
                  </div>
               </div>
            </div>

            <div className="mt-4 flex justify-end border-t border-white/10 pt-8">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-full bg-emerald-400 px-8 py-3 text-sm font-bold text-neutral-950 transition hover:bg-emerald-300 hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]"
              >
                {hasGroup ? "Update Community" : "Launch Community"}
              </button>
            </div>
          </form>
          
          {hasGroup && (
             <div className="mt-8 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                <div>
                   <h3 className="font-bold text-white">Your page is live!</h3>
                   <p className="text-sm text-stone-400">Visit your custom URL to see your community.</p>
                </div>
                <Link href={`/${formData.slug}`} className="rounded-xl bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
                   Visit Page
                </Link>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
