export type SpecialNft = {
  id: string;
  name: string;
  image: string | null;
};

export type WalletSpecialsResult = {
  walletAddress: string;
  collectionAddress: string;
  qualifies: boolean;
  count: number;
  nfts: SpecialNft[];
};

type HeliusAsset = {
  id: string;
  grouping?: {
    group_key?: string;
    group_value?: string;
  }[];
  content?: {
    links?: {
      image?: string;
    };
    metadata?: {
      name?: string;
    };
  };
};

type HeliusAssetsByOwnerResponse = {
  result?: {
    items?: HeliusAsset[];
  };
  error?: {
    message?: string;
  };
};

type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

const HELIUS_RPC_URL = "https://mainnet.helius-rpc.com";
const DEFAULT_SPECIAL_COLLECTION_ADDRESS =
  "J1S9H3QjnRtBbvGutZ2KjK14pM2xH1Ld5T8eF8n4g1rA";

export async function checkWalletForSpecialNfts(
  walletAddress: string,
): Promise<ApiResult<WalletSpecialsResult>> {
  const apiKey = process.env.HELIUS_API_KEY;
  const collectionAddress =
    process.env.SPECIAL_COLLECTION_ADDRESS ?? DEFAULT_SPECIAL_COLLECTION_ADDRESS;

  if (!apiKey) {
    return {
      data: null,
      error: "Missing HELIUS_API_KEY in .env.local.",
    };
  }

  try {
    const response = await fetch(`${HELIUS_RPC_URL}/?api-key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "wallet-specials",
        method: "getAssetsByOwner",
        params: {
          ownerAddress: walletAddress,
          page: 1,
          limit: 1000,
          displayOptions: {
            showCollectionMetadata: true,
          },
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await response.text();

      return {
        data: null,
        error: `Helius returned ${response.status}: ${message}`,
      };
    }

    const payload = (await response.json()) as HeliusAssetsByOwnerResponse;

    if (payload.error) {
      return {
        data: null,
        error: payload.error.message ?? "Helius returned an unknown error.",
      };
    }

    const matchingNfts = (payload.result?.items ?? [])
      .filter((asset) => isFromCollection(asset, collectionAddress))
      .map((asset) => ({
        id: asset.id,
        name: asset.content?.metadata?.name ?? "Unnamed NFT",
        image: asset.content?.links?.image ?? null,
      }));

    return {
      data: {
        walletAddress,
        collectionAddress,
        qualifies: matchingNfts.length > 0,
        count: matchingNfts.length,
        nfts: matchingNfts,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Unable to check wallet NFTs with Helius.",
    };
  }
}

function isFromCollection(
  asset: HeliusAsset,
  collectionAddress: string,
): boolean {
  return (
    asset.grouping?.some(
      (group) =>
        group.group_key === "collection" &&
        group.group_value === collectionAddress,
    ) ?? false
  );
}
