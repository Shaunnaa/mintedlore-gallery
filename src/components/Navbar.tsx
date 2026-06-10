"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import WalletMultiButton to prevent hydration errors during SSR
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/10 bg-[#121216]/80 px-5 backdrop-blur-md sm:px-8 lg:px-10">
      <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
        {/* Simple elegant logo */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
          <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-wider text-white">
          EchoSpace<span className="text-emerald-400">gallery</span>
        </span>
      </Link>

      <div className="flex items-center">
        {/* The standard MultiButton automatically handles Phantom & Solflare, and displays the app icon and wallet ID */}
        <WalletMultiButtonDynamic className="!h-11 !rounded-full !border !border-emerald-400/20 !bg-emerald-400/10 !px-6 !text-sm !font-semibold !text-emerald-300 transition-all hover:!bg-emerald-400 hover:!text-neutral-950" />
      </div>
    </nav>
  );
}
