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

  const result = await fetchActiveListings(offset, limit, symbol);

  if (result.error) {
    return NextResponse.json(
      {
        listings: [],
        error: result.error,
      },
      {
        status: 502,
      },
    );
  }

  return NextResponse.json({
    listings: result.data ?? [],
    error: null,
  });
}
