import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address || address.length < 30) {
    return NextResponse.json({ error: "Invalid collection address" }, { status: 400 });
  }

  const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
  if (!HELIUS_API_KEY) {
    return NextResponse.json({ error: "Missing HELIUS_API_KEY" }, { status: 500 });
  }

  try {
    // 1. Fetch 1 asset from the collection using Metaplex DAS API
    const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    
    const dasResponse = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "my-id",
        method: "getAssetsByGroup",
        params: {
          groupKey: "collection",
          groupValue: address,
          page: 1,
          limit: 1,
        },
      }),
    });

    const dasData = await dasResponse.json();
    if (dasData.error || !dasData.result || !dasData.result.items || dasData.result.items.length === 0) {
      return NextResponse.json({ error: "No assets found in this collection" }, { status: 404 });
    }

    const mintAddress = dasData.result.items[0].id;

    // 2. Fetch the token details from Magic Eden using the mint address
    const meResponse = await fetch(`https://api-mainnet.magiceden.dev/v2/tokens/${mintAddress}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json",
      },
    });

    if (!meResponse.ok) {
      return NextResponse.json({ error: "Token not found on Magic Eden" }, { status: 404 });
    }

    const meData = await meResponse.json();
    
    // 3. Extract the collection symbol
    const collectionSymbol = meData.collection;

    if (!collectionSymbol) {
      return NextResponse.json({ error: "Magic Eden symbol not found for this token" }, { status: 404 });
    }

    return NextResponse.json({ symbol: collectionSymbol }, { status: 200 });

  } catch (error: any) {
    console.error("[reverse-lookup]", error);
    return NextResponse.json({ error: error.message || "Failed to perform reverse lookup" }, { status: 500 });
  }
}
