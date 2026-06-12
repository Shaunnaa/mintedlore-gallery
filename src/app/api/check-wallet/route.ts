import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const HELIUS_RPC_URL = "https://mainnet.helius-rpc.com";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: Request) {
  try {
    const { walletAddress, collectionAddress, communitySlug } = await request.json();

    if (!walletAddress || !collectionAddress) {
      return NextResponse.json(
        { error: "walletAddress and collectionAddress are required" },
        { status: 400 }
      );
    }

    // ── Demo overrides ────────────────────────────────────────────────────────
    if (collectionAddress === "demo1_collection") return NextResponse.json({ count: 10, ownedMints: [] });
    if (collectionAddress === "demo2_collection") return NextResponse.json({ count: 5, ownedMints: [] });

    const apiKey = process.env.HELIUS_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing HELIUS_API_KEY" }, { status: 500 });

    // ── Fetch all NFTs owned by wallet from Helius ────────────────────────────
    const heliusRes = await fetch(`${HELIUS_RPC_URL}/?api-key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "check-wallet",
        method: "getAssetsByOwner",
        params: {
          ownerAddress: walletAddress,
          page: 1,
          limit: 1000,
          displayOptions: { showCollectionMetadata: true },
        },
      }),
      cache: "no-store",
    });

    if (!heliusRes.ok) {
      return NextResponse.json({ error: `Helius error ${heliusRes.status}` }, { status: 500 });
    }

    const payload = await heliusRes.json();
    if (payload.error) return NextResponse.json({ error: payload.error.message }, { status: 500 });

    const items: { id: string; grouping?: { group_key: string; group_value: string }[] }[] =
      payload.result?.items ?? [];
    const allWalletMints = items.map(a => a.id);

    // ── TYPE B: check against community_nfts table ────────────────────────────
    if (communitySlug) {
      const supabase = getSupabase();
      if (supabase) {
        const { data: community } = await supabase
          .from("communities")
          .select("id, collection_type")
          .eq("slug", communitySlug)
          .single();

        if (community?.collection_type === "type_b") {
          const { data: communityNfts } = await supabase
            .from("community_nfts")
            .select("mint_address")
            .eq("community_id", community.id);

          const allowedMints = new Set(
            (communityNfts ?? []).map((n: { mint_address: string }) => n.mint_address)
          );
          const ownedMints = allWalletMints.filter(m => allowedMints.has(m));
          return NextResponse.json({ count: ownedMints.length, ownedMints });
        }
      }
    }

    // ── TYPE A: filter by Magic Eden collection address ───────────────────────
    const matchingItems = items.filter(asset =>
      (asset.grouping ?? []).some(
        g => g.group_key === "collection" && g.group_value === collectionAddress
      )
    );
    const ownedMints = matchingItems.map(a => a.id);
    return NextResponse.json({ count: matchingItems.length, ownedMints });

  } catch (error) {
    console.error("[/api/check-wallet]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
