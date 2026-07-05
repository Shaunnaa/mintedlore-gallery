import { NextRequest, NextResponse } from "next/server";

// GET /api/nfts?wallet=<wallet_address>
// Fetches all NFTs owned by a wallet using Helius DAS API
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "Missing wallet" }, { status: 400 });

  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Helius API key not configured" }, { status: 500 });

  try {
    const response = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "mintedlore-nft-fetch",
          method: "getAssetsByOwner",
          params: {
            ownerAddress: wallet,
            page: 1,
            limit: 100,
            displayOptions: {
              showFungible: false,
              showNativeBalance: false,
              showCollectionMetadata: true,
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const assets = data.result?.items || [];

    // Map to a clean, simple format for our UI
    const nfts = assets
      .filter((asset: any) => {
        // Only include NFTs with images (filter out empty/broken ones)
        return asset.content?.links?.image || asset.content?.files?.[0]?.uri;
      })
      .map((asset: any) => ({
        id: asset.id,
        name: asset.content?.metadata?.name || "Unknown NFT",
        image:
          asset.content?.links?.image ||
          asset.content?.files?.[0]?.uri ||
          null,
        collection:
          asset.grouping?.find((g: any) => g.group_key === "collection")
            ?.collection_metadata?.name ||
          asset.content?.metadata?.collection?.name ||
          "Unknown Collection",
        collectionId:
          asset.grouping?.find((g: any) => g.group_key === "collection")
            ?.group_value || null,
      }));

    return NextResponse.json({ nfts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
