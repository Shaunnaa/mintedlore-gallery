"use client";

import { ListingCard } from "@/components/ListingCard";
import type { MagicEdenListing } from "@/services/magicEden";
import { useEffect, useState } from "react";

type ListingGalleryProps = {
  listings: MagicEdenListing[];
  collectionSymbol: string;
  totalCount: number;
  pageSize: number;
  error?: string | null;
  ownedMints?: string[];
};

type ListingsResponse = {
  listings?: MagicEdenListing[];
  error?: string | null;
};

export function ListingGallery({
  listings,
  collectionSymbol,
  totalCount,
  pageSize,
  error,
  ownedMints = [],
}: ListingGalleryProps) {
  const [visibleListings, setVisibleListings] = useState(listings);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const displayTotal = Math.max(totalCount, visibleListings.length);
  const hasMore = visibleListings.length < displayTotal;

  useEffect(() => {
    setVisibleListings(listings);
    setLoadError(null);
  }, [listings, collectionSymbol]);

  async function loadMoreListings() {
    setIsLoading(true);
    setLoadError(null);

    try {
      const listingsUrl = new URL("/api/listings", window.location.origin);
      listingsUrl.searchParams.set("symbol", collectionSymbol);
      listingsUrl.searchParams.set("offset", String(visibleListings.length));
      listingsUrl.searchParams.set("limit", String(pageSize));

      const response = await fetch(listingsUrl, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });
      const contentType = response.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json")
        ? ((await response.json()) as ListingsResponse)
        : ({
            error: await response.text(),
          } satisfies ListingsResponse);

      if (!response.ok || data.error) {
        setLoadError(
          data.error ??
            `Unable to load more listings. Request failed with ${response.status}.`,
        );
        return;
      }

      const nextListings = data.listings ?? [];

      if (nextListings.length === 0) {
        setLoadError(
          "Magic Eden did not return more listings for this page. Try again in a moment.",
        );
        return;
      }

      setVisibleListings((currentListings) =>
        [...currentListings, ...nextListings].filter(
          (listing, index, allListings) =>
            allListings.findIndex(
              (candidate) => candidate.tokenMint === listing.tokenMint,
            ) === index,
        ),
      );
    } catch (loadMoreError) {
      setLoadError(
        loadMoreError instanceof Error
          ? `Unable to reach the listings API: ${loadMoreError.message}`
          : "Unable to load more listings.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (error) {
    return (
      <section className="border border-red-400/30 bg-red-950/20 px-5 py-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-300">
          Listings error
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Active listings could not be loaded.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl break-words text-sm leading-6 text-red-100">
          {error}
        </p>
      </section>
    );
  }

  if (visibleListings.length === 0) {
    return (
      <section className="border border-dashed border-white/15 bg-white/[0.03] px-5 py-16 text-center">
        <h2 className="text-2xl font-semibold text-white">
          No active listings found.
        </h2>
        <p className="mt-3 text-sm text-stone-400">
          Magic Eden returned an empty listing set for this collection.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-16 flex flex-col items-center text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
          Curated Collection
        </p>
        <h2 className="mt-3 font-serif text-4xl font-light tracking-wide text-white">
          The Gallery Exhibition
        </h2>
        <p className="mt-4 text-sm text-stone-500">
          Showing {visibleListings.length} of {displayTotal} pieces currently on display
        </p>
      </div>

      <div className="grid grid-cols-1 gap-16 px-4 sm:grid-cols-2 md:gap-24 xl:grid-cols-3">
        {visibleListings.map((listing) => {
          const isOwned = ownedMints.includes(listing.tokenMint);
          return (
            <ListingCard key={listing.tokenMint} listing={listing} isOwned={isOwned} />
          );
        })}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="text-sm text-stone-400 sm:hidden">
          Showing {visibleListings.length} / {displayTotal} NFTs
        </p>

        {loadError ? (
          <p className="max-w-2xl break-words border border-red-400/30 bg-red-950/30 px-4 py-3 text-center text-sm leading-6 text-red-100">
            {loadError}
          </p>
        ) : null}

        {hasMore ? (
          <button
            type="button"
            onClick={loadMoreListings}
            disabled={isLoading}
            className="h-12 border border-cyan-300/50 bg-cyan-300 px-6 text-sm font-semibold text-stone-950 transition hover:bg-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-stone-400"
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        ) : (
          <p className="text-sm text-stone-500">All listings are loaded.</p>
        )}
      </div>
    </section>
  );
}
