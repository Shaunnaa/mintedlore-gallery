"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { StampCard } from "./StampCard";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export function WalletChecker({
  collectionAddress,
  communitySlug,
  vipThreshold,
}: {
  collectionAddress: string;
  communitySlug: string;
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
          communitySlug,
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
  }, [connected, publicKey, collectionAddress, communitySlug]);

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
          You don&apos;t own any art from this collection yet.
        </p>
      </div>
    );
  }

  if (count < vipThreshold) {
    return <StampCard count={count} threshold={vipThreshold} />;
  }

  return <StampCard count={count} threshold={vipThreshold} isGranted />;
}
