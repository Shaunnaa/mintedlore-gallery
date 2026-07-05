"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import imageCompression from "browser-image-compression";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

type PublicProfile = {
  public_profile_id: number;
  wallet_address: string;
  username: string;
  profile_image: string | null;
  cover_image: string | null;
  twitter_handle: string | null;
  telegram_handle: string | null;
  public_nfts: any[];
};

type PageState = "loading" | "no_wallet" | "no_profile" | "has_profile";

export default function ProfilePage() {
  const { connected, publicKey } = useWallet();
  const [pageState, setPageState] = useState<PageState>("no_wallet");
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showWallet, setShowWallet] = useState(false);

  // Form state for creating a new profile
  const [newUsername, setNewUsername] = useState("");
  const [newTwitter, setNewTwitter] = useState("");
  const [newTelegram, setNewTelegram] = useState("");
  const [usernameError, setUsernameError] = useState("");

  // File input refs for click-to-upload
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // NFT Showcase state
  type WalletNFT = { id: string; name: string; image: string | null; collection: string; collectionId: string | null; };
  const [walletNfts, setWalletNfts] = useState<WalletNFT[]>([]);
  const [selectedNftIds, setSelectedNftIds] = useState<Set<string>>(new Set());
  const [isEditingShowcase, setIsEditingShowcase] = useState(false);
  const [nftsLoading, setNftsLoading] = useState(false);
  const [nftError, setNftError] = useState("");
  const [savingShowcase, setSavingShowcase] = useState(false);

  // Fetch profile from Supabase when wallet connects
  useEffect(() => {
    if (!connected || !publicKey) {
      setPageState("no_wallet");
      setProfile(null);
      return;
    }

    const walletAddress = publicKey.toBase58();
    setPageState("loading");

    fetch(`/api/profile?wallet=${walletAddress}`)
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          setProfile(data.profile);
          // Pre-select any NFTs already saved to the profile
          const savedIds = new Set<string>((data.profile.public_nfts || []).map((n: any) => n.id));
          setSelectedNftIds(savedIds);
          setPageState("has_profile");
          // Fetch wallet NFTs from Helius
          setNftsLoading(true);
          fetch(`/api/nfts?wallet=${walletAddress}`)
            .then(r => r.json())
            .then(d => { setWalletNfts(d.nfts || []); setNftsLoading(false); })
            .catch(() => { setNftError("Failed to load NFTs."); setNftsLoading(false); });
        } else {
          setPageState("no_profile");
        }
      })
      .catch(() => setPageState("no_profile"));
  }, [connected, publicKey]);

  // ── Image Upload Handler (with auto-compression) ──
  const handleImageUpload = async (
    file: File,
    type: "profile_image" | "cover_image"
  ) => {
    if (!publicKey || !profile) return;

    const isAvatar = type === "profile_image";
    if (isAvatar) setUploadingAvatar(true);
    else setUploadingCover(true);

    try {
      // Auto-compress before upload — user can pick any size, we shrink it!
      const compressionOptions = {
        maxSizeMB: 0.3,          // Max 300KB after compression
        maxWidthOrHeight: isAvatar ? 400 : 1200, // Avatar: 400px, Cover: 1200px
        useWebWorker: true,      // Runs in background, doesn't freeze the page
        fileType: "image/webp",  // Convert to WebP for best compression
      };

      const compressedFile = await imageCompression(file, compressionOptions);

      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("type", type);
      formData.append("wallet", publicKey.toBase58());

      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setProfile(prev => prev ? { ...prev, [type]: data.url } : prev);
      }
    } finally {
      if (isAvatar) setUploadingAvatar(false);
      else setUploadingCover(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!publicKey) return;
    if (!newUsername.trim()) { setUsernameError("Username is required."); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      setUsernameError("Only letters, numbers, and underscores allowed.");
      return;
    }

    setIsSaving(true);
    setUsernameError("");

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet_address: publicKey.toBase58(),
        username: newUsername.trim().toLowerCase(),
        twitter_handle: newTwitter.trim() || null,
        telegram_handle: newTelegram.trim() || null,
      }),
    });

    const data = await res.json();
    setIsSaving(false);

    if (data.error) setUsernameError(data.error);
    else { setProfile(data.profile); setPageState("has_profile"); }
  };

  const handleSaveProfile = async () => {
    if (!profile || !publicKey) return;
    setIsSaving(true);
    setSaveError("");

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet_address: publicKey.toBase58(),
        username: profile.username,
        twitter_handle: profile.twitter_handle,
        telegram_handle: profile.telegram_handle,
      }),
    });

    const data = await res.json();
    setIsSaving(false);

    if (data.error) setSaveError(data.error);
    else { setProfile(data.profile); setIsEditing(false); }
  };

  const handleSaveShowcase = async () => {
    if (!publicKey) return;
    setSavingShowcase(true);
    // Build the array of selected NFT objects to save
    const selectedNfts = walletNfts.filter(n => selectedNftIds.has(n.id));
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet_address: publicKey.toBase58(),
        public_nfts: selectedNfts,
      }),
    });
    setSavingShowcase(false);
    setIsEditingShowcase(false);
  };

  const toggleNft = (id: string) => {
    setSelectedNftIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // ── NO WALLET ──
  if (pageState === "no_wallet") {
    return (
      <main className="min-h-screen bg-neutral-950 text-stone-50 font-sans flex items-center justify-center px-5">
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-4xl">👤</div>
          <h1 className="text-3xl font-bold text-white">Your Public Profile</h1>
          <p className="text-stone-400">Connect your Solana wallet to access your profile.</p>
          <WalletMultiButtonDynamic className="!h-12 !rounded-xl !bg-emerald-500 !px-8 !font-bold !text-neutral-950 hover:!bg-emerald-400" />
        </div>
      </main>
    );
  }

  // ── LOADING ──
  if (pageState === "loading") {
    return (
      <main className="min-h-screen bg-neutral-950 text-stone-50 font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
          <p className="text-stone-400">Checking your profile...</p>
        </div>
      </main>
    );
  }

  // ── NO PROFILE → CREATE ──
  if (pageState === "no_profile") {
    return (
      <main className="min-h-screen bg-neutral-950 text-stone-50 font-sans flex items-center justify-center px-5">
        <div className="w-full max-w-lg">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl mx-auto mb-4">✨</div>
              <h1 className="text-2xl font-bold text-white mb-2">Create Your Public Profile</h1>
              <p className="text-stone-400 text-sm">
                Wallet <span className="font-mono text-emerald-400">{publicKey && shortenAddress(publicKey.toBase58())}</span> doesn't have a profile yet.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Username <span className="text-red-400">*</span></label>
                <input type="text" value={newUsername} onChange={e => { setNewUsername(e.target.value); setUsernameError(""); }}
                  placeholder="e.g. sol_explorer"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-stone-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
                {usernameError && <p className="text-red-400 text-xs mt-2">{usernameError}</p>}
                <p className="text-stone-600 text-xs mt-2">Your public URL: mintedlore.com/u/{newUsername || "username"}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">X (Twitter)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold">@</span>
                  <input type="text" value={newTwitter} onChange={e => setNewTwitter(e.target.value)} placeholder="yourhandle"
                    className="w-full rounded-xl border border-white/10 bg-black/50 pl-8 pr-4 py-3 text-white placeholder-stone-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Telegram</label>
                <input type="text" value={newTelegram} onChange={e => setNewTelegram(e.target.value)} placeholder="@yourtelegram"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-stone-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>

              <button onClick={handleCreateProfile} disabled={isSaving}
                className="w-full h-12 rounded-xl bg-emerald-500 font-bold text-black hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>Creating...</> : "Create Profile"}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── HAS PROFILE ──
  return (
    <main className="min-h-screen bg-neutral-950 text-stone-50 font-sans pb-20">

      {/* Hidden file inputs */}
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, "profile_image"); }}
      />
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, "cover_image"); }}
      />

      {/* ── Cover Image (click to change) ── */}
      <div
        onClick={() => coverInputRef.current?.click()}
        className="relative w-full h-48 sm:h-64 bg-gradient-to-br from-emerald-900/40 via-stone-900 to-neutral-950 overflow-hidden cursor-pointer group"
      >
        {profile?.cover_image ? (
          <img src={profile.cover_image} alt="Cover" className="w-full h-full object-cover" />
        ) : null}
        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          {uploadingCover ? (
            <div className="flex flex-col items-center gap-2 opacity-100">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span className="text-white text-sm font-bold">Uploading...</span>
            </div>
          ) : (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2">
              <div className="bg-black/60 rounded-xl px-4 py-2 flex items-center gap-2 backdrop-blur-sm border border-white/20">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-white text-sm font-bold">Change Cover Photo</span>
              </div>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* ── Avatar + Name Row ── */}
        <div className="relative -mt-14 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-5">
            {/* Avatar (click to change) */}
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="relative h-28 w-28 rounded-2xl bg-stone-800 border-4 border-neutral-950 overflow-hidden shrink-0 flex items-center justify-center text-3xl font-black text-stone-600 cursor-pointer group"
            >
              {profile?.profile_image ? (
                <img src={profile.profile_image} alt={profile?.username} className="w-full h-full object-cover" />
              ) : (
                <span>{profile?.username?.substring(0, 2).toUpperCase()}</span>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                {uploadingAvatar ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent opacity-100"></div>
                ) : (
                  <svg className="h-7 w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>
            </div>

            <div className="pb-2">
              <h1 className="text-3xl font-bold text-white">@{profile?.username}</h1>
              {/* Social handles */}
              <div className="flex items-center gap-4 mt-2">
                {profile?.twitter_handle && (
                  <span className="flex items-center gap-1 text-sm text-stone-400">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.733-8.835L1.254 2.25H8.08l4.713 5.767zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    {profile.twitter_handle}
                  </span>
                )}
                {profile?.telegram_handle && (
                  <span className="flex items-center gap-1 text-sm text-stone-400">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    {profile.telegram_handle}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pb-2">
            <Link href={`/u/${profile?.username}`} target="_blank"
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              View Public Page →
            </Link>
          </div>
        </div>

        {/* ── Profile Info Form ── */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-white">Public Identity</h2>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-emerald-400 hover:text-emerald-300">Edit</button>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => { setIsEditing(false); setSaveError(""); }} className="text-sm font-bold text-stone-400 hover:text-white">Cancel</button>
                <button onClick={handleSaveProfile} disabled={isSaving}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-400 transition disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {saveError && <p className="text-red-400 text-sm mb-4">{saveError}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">Username</label>
              {isEditing ? (
                <input type="text" value={profile?.username || ""} onChange={e => profile && setProfile({ ...profile, username: e.target.value })}
                  className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              ) : <p className="text-white font-medium text-lg">@{profile?.username}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">X (Twitter)</label>
              {isEditing ? (
                <input type="text" value={profile?.twitter_handle || ""} onChange={e => profile && setProfile({ ...profile, twitter_handle: e.target.value })}
                  className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              ) : <p className="text-emerald-400 font-medium">{profile?.twitter_handle || <span className="text-stone-600 italic text-sm">Not set</span>}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">Telegram</label>
              {isEditing ? (
                <input type="text" value={profile?.telegram_handle || ""} onChange={e => profile && setProfile({ ...profile, telegram_handle: e.target.value })}
                  className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              ) : <p className="text-emerald-400 font-medium">{profile?.telegram_handle || <span className="text-stone-600 italic text-sm">Not set</span>}</p>}
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-white/10">
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">Wallet Address</label>
            <div className="flex items-center gap-3">
              <p className="font-mono text-sm text-stone-400 tracking-widest">
                {showWallet ? publicKey?.toBase58() : "•".repeat(44)}
              </p>
              <button
                onClick={() => setShowWallet(prev => !prev)}
                className="shrink-0 text-stone-500 hover:text-stone-300 transition-colors"
                title={showWallet ? "Hide wallet address" : "Reveal wallet address"}
              >
                {showWallet ? (
                  // Eye-off icon
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  // Eye icon
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── NFT Showcase ── */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">NFT Showcase</h2>
              <p className="text-sm text-stone-400 mt-1">
                Select which NFTs appear on your public profile.
                {walletNfts.length > 0 && <span className="ml-2 text-emerald-400 font-bold">{selectedNftIds.size} / {walletNfts.length} selected</span>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!isEditingShowcase ? (
                <button
                  onClick={() => setIsEditingShowcase(true)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Edit Showcase
                </button>
              ) : (
                <>
                  <button onClick={() => setIsEditingShowcase(false)} className="text-sm font-bold text-stone-400 hover:text-white">Cancel</button>
                  <button
                    onClick={handleSaveShowcase}
                    disabled={savingShowcase}
                    className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-400 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingShowcase ? <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />Saving...</> : "Save Showcase"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Loading */}
          {nftsLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-500">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
              <p className="text-sm">Scanning wallet for NFTs...</p>
            </div>
          )}

          {/* Error */}
          {!nftsLoading && nftError && (
            <div className="py-12 text-center text-red-400 text-sm">{nftError}</div>
          )}

          {/* Empty wallet */}
          {!nftsLoading && !nftError && walletNfts.length === 0 && (
            <div className="py-16 text-center text-stone-500">
              <p className="text-3xl mb-3">👻</p>
              <p className="font-bold text-stone-400 mb-1">No NFTs found</p>
              <p className="text-sm">This wallet doesn't hold any NFTs yet.</p>
            </div>
          )}

          {/* NFT Grid */}
          {!nftsLoading && walletNfts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {walletNfts.map((nft) => {
                const isSelected = selectedNftIds.has(nft.id);
                return (
                  <div
                    key={nft.id}
                    onClick={() => isEditingShowcase && toggleNft(nft.id)}
                    className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                      isEditingShowcase ? "cursor-pointer" : ""
                    } ${
                      isSelected
                        ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                        : isEditingShowcase
                        ? "border-white/5 opacity-60 hover:opacity-100 hover:border-white/20"
                        : "border-white/5"
                    }`}
                  >
                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                        <svg className="h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}

                    {/* Hover overlay in edit mode */}
                    {isEditingShowcase && !isSelected && (
                      <div className="absolute inset-0 z-10 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs font-bold text-white bg-white/10 rounded-full px-3 py-1 border border-white/20 backdrop-blur-sm">Select</span>
                      </div>
                    )}

                    {/* NFT Image */}
                    <div className="aspect-square w-full bg-stone-900 overflow-hidden">
                      {nft.image ? (
                        <img
                          src={nft.image}
                          alt={nft.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-700 font-black text-lg">
                          {nft.collection.substring(0, 3).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* NFT Info */}
                    <div className={`p-3 ${isSelected ? "bg-emerald-500/5" : "bg-[#0d0d10]"}`}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-0.5 truncate">{nft.collection}</p>
                      <p className="text-xs font-bold text-white truncate">{nft.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
