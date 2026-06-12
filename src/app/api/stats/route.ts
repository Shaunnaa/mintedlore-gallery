import { NextRequest, NextResponse } from "next/server";
import { fetchCollectionStats } from "@/services/magicEden";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const symbol = request.nextUrl.searchParams.get("symbol");
    
    if (!symbol) {
      return NextResponse.json({ error: "Missing collection symbol" }, { status: 400 });
    }

    const result = await fetchCollectionStats(symbol);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ stats: result.data }, { status: 200 });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// touch