import { ListingGallery } from "@/components/market/ListingGallery";
import { StatsCard } from "@/components/market/StatsCard";
import type { Community } from "@/lib/communities";
import type { MagicEdenListing, MagicEdenStats } from "@/services/magicEden";
import { LISTINGS_PAGE_SIZE } from "@/services/magicEden";

type GalleryViewProps = {
  community: Community;
  stats: MagicEdenStats | null;
  listings: MagicEdenListing[];
  statsError?: string | null;
  listingsError?: string | null;
  ownedMints?: string[];
};

export function GalleryView({
  community,
  stats,
  listings,
  statsError,
  listingsError,
  ownedMints = [],
}: GalleryViewProps) {
  return (
    <div className="flex flex-col gap-8">
      {(stats || statsError) && (
        <StatsCard
          floorPrice={stats?.floorPrice}
          totalVolume={stats?.volumeAll}
          listedCount={stats?.listedCount}
          error={statsError}
        />
      )}

      <ListingGallery
        listings={listings}
        collectionSymbol={community.collectionAddress}
        totalCount={stats?.listedCount ?? listings.length}
        pageSize={LISTINGS_PAGE_SIZE}
        error={listingsError}
        ownedMints={ownedMints}
      />
    </div>
  );
}
