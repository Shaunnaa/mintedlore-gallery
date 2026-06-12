"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export function HolderBadge({
  collectionAddress,
  communitySlug,
  vipThreshold,
}: {
  collectionAddress: string;
  communitySlug: string;
  vipThreshold: number;
}) {
  const { connected, publicKey } = useWallet();
  const [isVIP, setIsVIP] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      fetch("/api/check-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          collectionAddress,
          communitySlug,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.count === "number") {
            setIsVIP(data.count >= vipThreshold);
          }
        })
        .catch((err) => console.error(err));
    } else {
      setIsVIP(false);
    }
  }, [connected, publicKey, collectionAddress, communitySlug, vipThreshold]);

  if (!isVIP) return null;

  return (
    <span
      className="ml-4 inline-flex translate-y-[-4px] animate-pulse items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-500/20 px-3 py-1 text-sm font-bold tracking-widest text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.4)] backdrop-blur-md"
      title="Verified Collection Holder"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      VERIFIED HOLDER
    </span>
  );
}
