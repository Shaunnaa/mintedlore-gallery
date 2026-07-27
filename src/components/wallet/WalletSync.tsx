"use client";

import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export default function WalletSync() {
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!publicKey) return;

    const walletAddress = publicKey.toBase58();
    
    // Check session storage to avoid spamming the API on every re-render/page load
    const syncKey = `synced_${walletAddress}`;
    if (sessionStorage.getItem(syncKey)) return;

    fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet_address: walletAddress }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          sessionStorage.setItem(syncKey, "true");
        }
      })
      .catch((err) => console.error("Failed to sync wallet:", err));
  }, [publicKey]);

  return null; // This is an invisible background component
}
