export type DasAsset = {
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
  ownership?: {
    owner?: string;
  };
};

const HELIUS_RPC_URL = "https://mainnet.helius-rpc.com";

// ─── Fetch entire collection via Metaplex DAS ──────────────────────────────────

export async function getCollectionAssets(collectionAddress: string, limit = 100, page = 1) {
  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey) return { data: [], error: "Missing HELIUS_API_KEY" };

  try {
    const response = await fetch(`${HELIUS_RPC_URL}/?api-key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "collection-assets",
        method: "getAssetsByGroup",
        params: {
          groupKey: "collection",
          groupValue: collectionAddress,
          page: page,
          limit: limit,
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return { data: [], error: `RPC error: ${response.status}` };
    }

    const payload = await response.json();
    if (payload.error) {
      return { data: [], error: payload.error.message };
    }

    const items = (payload.result?.items ?? []).map((asset: DasAsset) => ({
      tokenMint: asset.id,
      name: asset.content?.metadata?.name ?? "Unnamed NFT",
      image: asset.content?.links?.image ?? null,
      sellerAddress: asset.ownership?.owner ?? "Unknown",
      sellerName: "Owner",
      priceLamports: 0, // DAS doesn't have floor prices
    }));

    return { data: items, error: null };
  } catch (err) {
    return { data: [], error: String(err) };
  }
}
