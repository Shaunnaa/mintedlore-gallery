import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { collectionAddress, walletAddress } = await request.json();

    if (!collectionAddress || !walletAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Default to false and no name if we can't verify
    const result = { name: "", isCreator: false };

    // Magic Eden Game override check
    if (collectionAddress === "star_atlas") {
      result.name = "Star Atlas";
      result.isCreator = true; // Games are handled via specialized roles
      return NextResponse.json(result);
    }

    const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
    if (!HELIUS_API_KEY) {
      return NextResponse.json({ error: "Missing HELIUS_API_KEY" }, { status: 500 });
    }

    const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    
    // Fetch 1 asset from the collection to read its metadata and authorities
    const dasResponse = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "verify-collection",
        method: "getAssetsByGroup",
        params: {
          groupKey: "collection",
          groupValue: collectionAddress,
          page: 1,
          limit: 1,
        },
      }),
    });

    const dasData = await dasResponse.json();
    
    if (dasData.error || !dasData.result || !dasData.result.items || dasData.result.items.length === 0) {
      // Could not find any assets using groupKey "collection".
      // We can't verify them, so they are not the creator.
      return NextResponse.json(result);
    }

    const asset = dasData.result.items[0];

    // Try to get the name from the asset's collection metadata, or fallback to the asset's own name prefix
    const assetName = asset.content?.metadata?.name || "";
    // If the asset name is "Mad Lads #1234", try to extract "Mad Lads"
    const hashIndex = assetName.indexOf("#");
    if (hashIndex > 0) {
      result.name = assetName.substring(0, hashIndex).trim();
    } else {
      result.name = assetName;
    }

    // Check if the walletAddress is an authority or creator
    let isCreator = false;

    // Check authorities array
    if (asset.authorities && Array.isArray(asset.authorities)) {
      for (const auth of asset.authorities) {
        if (auth.address === walletAddress) {
          isCreator = true;
          break;
        }
      }
    }

    // Check creators array
    if (!isCreator && asset.creators && Array.isArray(asset.creators)) {
      for (const creator of asset.creators) {
        if (creator.address === walletAddress) {
          isCreator = true;
          break;
        }
      }
    }

    result.isCreator = isCreator;

    return NextResponse.json(result);

  } catch (err: unknown) {
    console.error("[/api/collection/verify]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
