import { NextResponse } from "next/server";
import {
  fetchActiveListings,
  LISTINGS_PAGE_SIZE,
} from "@/services/magicEden";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") ?? undefined;
  const offsetParam = Number(searchParams.get("offset") ?? 0);
  const limitParam = Number(searchParams.get("limit") ?? LISTINGS_PAGE_SIZE);
  const offset = Number.isFinite(offsetParam) && offsetParam > 0 ? offsetParam : 0;
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(limitParam, 100)
      : LISTINGS_PAGE_SIZE;

  let data = [];
  let error = null;

  // If the symbol is a Solana address, use DAS API pagination
  if (symbol && symbol.length > 30) {
    const page = Math.floor(offset / limit) + 1;
    // @ts-ignore
    const { getCollectionAssets } = await import("@/services/metaplex");
    const result = await getCollectionAssets(symbol, limit, page);
    data = result.data;
    error = result.error;
  } else {
    const result = await fetchActiveListings(offset, limit, symbol);
    data = result.data;
    error = result.error;
  }

  if (error) {
    return NextResponse.json(
      {
        listings: [],
        error: error,
      },
      {
        status: 502,
      },
    );
  }

  return NextResponse.json({
    listings: data ?? [],
    error: null,
  });
}
