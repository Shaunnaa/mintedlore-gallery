import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const revalidate = 60; // Revalidate every 60 seconds

type Props = {
  params: { username: string };
};

export async function generateMetadata({ params }: Props) {
  const { username } = params;
  return {
    title: `@${username} — MintedLore`,
    description: `View the public profile of ${username} on MintedLore.`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = params;
  const supabase = getSupabase();

  // Fetch the profile by username
  const { data: profile, error } = await supabase
    .from("public_profile")
    .select("*")
    .eq("username", username.toLowerCase())
    .single();

  // If no profile found, show 404
  if (error || !profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-stone-50 font-sans pb-20">

      {/* ── Cover Image ── */}
      <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-emerald-900/40 via-stone-900 to-neutral-950 relative overflow-hidden">
        {profile.cover_image && (
          <img
            src={profile.cover_image}
            alt="Cover"
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* ── Profile Header ── */}
        <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row sm:items-end gap-5">
          {/* Avatar */}
          <div className="h-28 w-28 rounded-2xl bg-stone-800 border-4 border-neutral-950 overflow-hidden shrink-0 flex items-center justify-center text-3xl font-black text-stone-600">
            {profile.profile_image ? (
              <img src={profile.profile_image} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              profile.username.substring(0, 2).toUpperCase()
            )}
          </div>

          {/* Name & Handles */}
          <div className="flex-1 pb-2">
            <h1 className="text-3xl font-bold text-white">@{profile.username}</h1>
            <div className="flex items-center gap-5 mt-3">
              {/* X / Twitter — always visible */}
              {profile.twitter_handle ? (
                <a
                  href={`https://twitter.com/${profile.twitter_handle.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-stone-300 hover:text-white transition-colors"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.733-8.835L1.254 2.25H8.08l4.713 5.767zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  {profile.twitter_handle}
                </a>
              ) : (
                <span className="flex items-center gap-1.5 text-sm text-stone-600">
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.733-8.835L1.254 2.25H8.08l4.713 5.767zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  —
                </span>
              )}

              {/* Telegram — always visible */}
              {profile.telegram_handle ? (
                <a
                  href={`https://t.me/${profile.telegram_handle.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-stone-300 hover:text-white transition-colors"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  {profile.telegram_handle}
                </a>
              ) : (
                <span className="flex items-center gap-1.5 text-sm text-stone-600">
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  —
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── NFT Showcase ── */}
        {profile.public_nfts && profile.public_nfts.length > 0 ? (
          <section className="mb-12">
            <div className="mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">NFT Showcase</h2>
              <p className="text-sm text-stone-400 mt-1">Hand-picked NFTs from this collector's wallet.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {profile.public_nfts.map((nft: any, i: number) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                  <div className="aspect-square bg-stone-900 flex items-center justify-center text-stone-700 font-bold">
                    {nft.image ? (
                      <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                    ) : (
                      nft.collection?.substring(0, 3).toUpperCase() || "NFT"
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-0.5 truncate">{nft.collection}</p>
                    <p className="text-sm font-bold text-white truncate">{nft.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="mb-12">
            <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-stone-600">
              <p className="text-2xl mb-2">🖼️</p>
              <p className="text-sm">No NFTs showcased yet.</p>
            </div>
          </section>
        )}

        {/* ── Back to Platform ── */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-emerald-400 transition-colors"
          >
            ← Back to MintedLore
          </Link>
        </div>

      </div>
    </main>
  );
}
