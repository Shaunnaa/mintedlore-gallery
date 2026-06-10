import { NextResponse } from "next/server";

const HELIUS_RPC_URL = "https://mainnet.helius-rpc.com";

export async function POST(request: Request) {
  try {
    const { walletAddress, collectionAddress } = await request.json();

    if (!walletAddress || !collectionAddress) {
      return NextResponse.json(
        { error: "walletAddress and collectionAddress are required" },
        { status: 400 }
      );
    }

    if (collectionAddress === "demo1_collection") {
      return NextResponse.json({ count: 10 });
    }

    if (collectionAddress === "demo2_collection") {
      return NextResponse.json({ count: 5 });
    }

    const apiKey = process.env.HELIUS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing HELIUS_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const response = await fetch(`${HELIUS_RPC_URL}/?api-key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "check-wallet",
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
      return NextResponse.json(
        { error: `Helius returned ${response.status}: ${message}` },
        { status: 500 }
      );
    }

    const payload = await response.json();

    if (payload.error) {
      return NextResponse.json(
        { error: payload.error.message || "Unknown error" },
        { status: 500 }
      );
    }

    const items = payload.result?.items || [];

    // Filter matching collection address
    const matchingItems = items.filter((asset: any) => {
      const groupings = asset.grouping || [];
      return groupings.some(
        (group: any) =>
          group.group_key === "collection" &&
          group.group_value === collectionAddress
      );
    });

    const ownedMints = matchingItems.map((asset: any) => asset.id);

    return NextResponse.json({ count: matchingItems.length, ownedMints });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
