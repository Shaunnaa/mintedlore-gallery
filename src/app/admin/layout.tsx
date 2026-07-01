"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Groups & Communities", href: "/admin" },
  { label: "Hero Banners & Ads", href: "/admin/ads" },
  { label: "User Roles & Access", href: "/admin/users" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { connected, publicKey } = useWallet();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!connected || !publicKey) {
      setIsAdmin(false);
      return;
    }
    fetch(`/api/admin/check?wallet=${publicKey.toBase58()}`)
      .then(r => r.json())
      .then(data => setIsAdmin(data.isAdmin))
      .catch(() => setIsAdmin(false));
  }, [connected, publicKey]);

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-5 text-stone-50">
        <section className="max-w-xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">404</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Community Not Found</h1>
          <p className="mt-3 text-sm leading-6 text-stone-400">This community hub does not exist yet.</p>
          <Link
            href="/"
            className="mt-6 inline-flex h-11 items-center justify-center border border-emerald-300/50 bg-emerald-300 px-5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
          >
            Back to Platform
          </Link>
        </section>
      </main>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-neutral-950 text-stone-50">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-white/10 bg-[#101014] p-6 md:block">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Admin Panel</span>
        </div>
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-4 py-3 text-left text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "text-stone-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Page Content */}
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
