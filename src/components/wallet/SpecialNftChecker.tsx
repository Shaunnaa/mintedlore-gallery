"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import { useEffect, useState } from "react";

type SpecialNft = {
  id: string;
  name: string;
  image: string | null;
};

type WalletSpecialsResult = {
  walletAddress: string;
  collectionAddress: string;
  qualifies: boolean;
  count: number;
  nfts: SpecialNft[];
};

type WalletSpecialsResponse = {
  data: WalletSpecialsResult | null;
  error: string | null;
};

export function SpecialNftChecker() {
  const { publicKey, connected } = useWallet();
  const [walletAddress, setWalletAddress] = useState("");
  const [result, setResult] = useState<WalletSpecialsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (publicKey) {
      setWalletAddress(publicKey.toBase58());
      setResult(null);
      setError(null);
    }
  }, [publicKey]);

  async function checkWallet(addressToCheck = walletAddress) {
    setIsChecking(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/wallet-specials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          walletAddress: addressToCheck,
        }),
      });
      const payload = (await response.json()) as WalletSpecialsResponse;

      if (!response.ok || payload.error) {
        setError(payload.error ?? "Unable to check this wallet.");
        return;
      }

      setResult(payload.data);
    } catch (walletError) {
      setError(
        walletError instanceof Error
          ? walletError.message
          : "Unable to check this wallet.",
      );
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <section className="border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
            Special NFT access
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            Check Wallet Eligibility
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">
            Connect Phantom or Solflare, then check whether the wallet holds an
            NFT from the special collection configured in Helius.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="wallet-connect-wrap">
            <WalletMultiButton />
          </div>
          <input
            value={walletAddress}
            onChange={(event) => setWalletAddress(event.target.value)}
            placeholder="Solana wallet address"
            className="h-12 border border-white/10 bg-[#101014] px-4 font-mono text-sm text-white outline-none transition placeholder:text-stone-600 focus:border-cyan-300/60"
          />
          {connected ? (
            <p className="text-xs text-cyan-200">
              Connected wallet loaded. You can check this wallet or paste a
              different address.
            </p>
          ) : (
            <p className="text-xs text-stone-500">
              No wallet connected yet. Manual wallet address input still works.
            </p>
          )}
          <button
            type="button"
            onClick={() => checkWallet()}
            disabled={isChecking}
            className="h-12 border border-cyan-300/50 bg-cyan-300 px-5 text-sm font-semibold text-stone-950 transition hover:bg-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-stone-400"
          >
            {isChecking ? "Checking..." : "Check Special NFT"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-5 break-words border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm leading-6 text-red-100">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-6 border border-white/10 bg-[#101014] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-stone-400">Eligibility result</p>
              <p
                className={
                  result.qualifies
                    ? "mt-1 text-2xl font-semibold text-cyan-200"
                    : "mt-1 text-2xl font-semibold text-stone-200"
                }
              >
                {result.qualifies
                  ? "Special access unlocked"
                  : "No special NFT found"}
              </p>
            </div>
            <div className="border border-white/10 px-4 py-3 text-right">
              <p className="text-sm text-stone-400">Matching NFTs</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {result.count}
              </p>
            </div>
          </div>

          {result.nfts.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {result.nfts.slice(0, 4).map((nft) => (
                <div key={nft.id} className="border border-white/10 bg-white/[0.03]">
                  <div className="aspect-square bg-stone-900">
                    {nft.image ? (
                      <Image
                        src={nft.image}
                        alt={nft.name}
                        width={320}
                        height={320}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-3 text-center text-xs text-stone-500">
                        Image unavailable
                      </div>
                    )}
                  </div>
                  <p className="truncate p-3 text-sm font-medium text-white">
                    {nft.name}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
