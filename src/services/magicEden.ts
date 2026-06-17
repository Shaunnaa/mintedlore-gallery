export type MagicEdenStats = {
  floorPrice?: number;
  listedCount?: number;
  avgPrice24hr?: number;
  volumeAll?: number;
};

export type MagicEdenListing = {
  tokenMint: string;
  name: string;
  image: string | null;
  sellerAddress: string;
  sellerName: string;
  priceLamports: number;
};

type MagicEdenListingResponse = {
  tokenMint?: string;
  seller?: string;
  sellerDisplayName?: string;
  sellerName?: string;
  sellerUsername?: string;
  sellerProfile?: {
    displayName?: string;
    name?: string;
    username?: string;
  };
  price?: number;
  priceInfo?: {
    solPrice?: {
      rawAmount?: string;
    };
  };
  token?: {
    name?: string;
    image?: string;
  };
  extra?: {
    img?: string;
  };
};

export type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

const MAGIC_EDEN_BASE_URL = "https://api-mainnet.magiceden.dev/v2";
const DEFAULT_COLLECTION_SYMBOL = "mad_lads";
export const LISTINGS_PAGE_SIZE = 12;

async function fetchMagicEden<T>(endpoint: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${MAGIC_EDEN_BASE_URL}${endpoint}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
      next: {
        revalidate: 60,
      },
    });

    if (!response.ok) {
      const message = await response.text();

      return {
        data: null,
        error: `Magic Eden returned ${response.status}: ${message}`,
      };
    }

    return {
      data: (await response.json()) as T,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Unable to fetch data from Magic Eden.",
    };
  }
}

export async function fetchCollectionStats(
  collectionSymbol = DEFAULT_COLLECTION_SYMBOL,
): Promise<ApiResult<MagicEdenStats>> {
  return fetchMagicEden<MagicEdenStats>(
    `/collections/${collectionSymbol}/stats`,
  );
}

export async function fetchActiveListings(
  offset = 0,
  limit = LISTINGS_PAGE_SIZE,
  collectionSymbol = DEFAULT_COLLECTION_SYMBOL,
): Promise<ApiResult<MagicEdenListing[]>> {
  const result = await fetchMagicEden<MagicEdenListingResponse[]>(
    `/collections/${collectionSymbol}/listings?offset=${offset}&limit=${limit}`,
  );

  if (result.error) {
    return {
      data: null,
      error: result.error,
    };
  }

  return {
    data: (result.data ?? [])
      .filter((listing) => listing.tokenMint)
      .map((listing) => ({
        tokenMint: listing.tokenMint!,
        name: listing.token?.name ?? "Unnamed NFT",
        image: listing.extra?.img ?? listing.token?.image ?? null,
        sellerAddress: listing.seller ?? "Unknown seller",
        sellerName: getSellerName(listing),
        priceLamports: getListingPriceLamports(listing),
      })),
    error: null,
  };
}

export async function fetchTokensByMints(
  mints: string[]
): Promise<ApiResult<MagicEdenListing[]>> {
  try {
    // Fetch all mints in parallel
    const promises = mints.map(mint => fetchMagicEden<Record<string, unknown>>(`/tokens/${mint}`));
    const results = await Promise.all(promises);

    const data: MagicEdenListing[] = [];
    
    for (const res of results) {
      if (!res.error && res.data) {
        const token = res.data;
        data.push({
          tokenMint: token.mintAddress,
          name: token.name ?? "Unnamed NFT",
          image: token.image ?? null,
          sellerAddress: token.owner ?? "Unknown seller",
          sellerName: "Owner", // Token API doesn't return full seller profile unless listed
          priceLamports: token.listPrice ?? 0, // 0 if not currently listed
        });
      }
    }

    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Failed to fetch specific tokens" 
    };
  }
}

function getSellerName(listing: MagicEdenListingResponse): string {
  return (
    listing.sellerDisplayName ??
    listing.sellerName ??
    listing.sellerUsername ??
    listing.sellerProfile?.displayName ??
    listing.sellerProfile?.name ??
    listing.sellerProfile?.username ??
    "Name unavailable"
  );
}

function getListingPriceLamports(listing: MagicEdenListingResponse): number {
  const rawAmount = listing.priceInfo?.solPrice?.rawAmount;

  if (rawAmount) {
    const lamports = Number(rawAmount);

    if (Number.isFinite(lamports)) {
      return lamports;
    }
  }

  if (typeof listing.price === "number" && Number.isFinite(listing.price)) {
    return listing.price * 1_000_000_000;
  }

  return 0;
}
