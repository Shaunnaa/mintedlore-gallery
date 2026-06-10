"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export function WalletChecker({
  collectionAddress,
  vipThreshold,
}: {
  collectionAddress: string;
  vipThreshold: number;
}) {
  const { publicKey, connected } = useWallet();
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      setLoading(true);
      fetch("/api/check-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          collectionAddress,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.count === "number") {
            setCount(data.count);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setCount(null);
    }
  }, [connected, publicKey, collectionAddress]);

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center shadow-2xl">
        <p className="mb-5 text-stone-300">
          Connect wallet to check your VIP status.
        </p>
        <WalletMultiButtonDynamic className="!h-11 !rounded-full !border !border-emerald-400/20 !bg-emerald-400/10 !px-6 !text-sm !font-semibold !text-emerald-300 transition-all hover:!bg-emerald-400 hover:!text-neutral-950" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center shadow-2xl">
        <span className="relative mr-4 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
        </span>
        <p className="animate-pulse text-stone-300 font-medium">Checking VIP status...</p>
      </div>
    );
  }

  if (count === 0 || count === null) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center shadow-2xl">
        <p className="text-stone-300">
          You don't own any art from this collection yet.
        </p>
      </div>
    );
  }

  if (count < vipThreshold) {
    const progressPercentage = Math.min(Math.round((count / vipThreshold) * 100), 100);
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center shadow-2xl">
        <h3 className="mb-2 text-xl font-bold text-amber-400">
          VIP Access Locked
        </h3>
        <p className="mb-6 text-stone-300">
          You currently hold <strong className="text-white">{count}</strong> out of <strong className="text-white">{vipThreshold}</strong> required NFTs.
        </p>
        
        {/* Progress Bar */}
        <div className="w-full max-w-sm h-3 rounded-full bg-black/60 border border-white/10 overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-amber-500/80">
          Collect {vipThreshold - count} more to unlock secret story
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/50 bg-emerald-500/10 p-8 text-center shadow-[0_0_40px_rgba(16,185,129,0.15)] transition-all">
      <h3 className="mb-2 text-2xl font-bold text-emerald-400">
        🎉 VIP Access Granted!
      </h3>
      <p className="text-lg text-emerald-100/90">
        You own <span className="font-bold text-emerald-300">{count}</span>{" "}
        piece(s).
      </p>
      <div className="mt-5 inline-block rounded-lg border border-emerald-500/30 bg-black/40 px-4 py-2">
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-300">
          Secret Story Unlocked
        </p>
      </div>
    </div>
  );
}
