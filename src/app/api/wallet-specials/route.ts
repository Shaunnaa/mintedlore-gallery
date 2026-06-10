import { NextResponse } from "next/server";
import { checkWalletForSpecialNfts } from "@/services/helius";

export const dynamic = "force-dynamic";

type WalletSpecialsRequest = {
  walletAddress?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as WalletSpecialsRequest;
  const walletAddress = body.walletAddress?.trim();

  if (!walletAddress || !isLikelySolanaAddress(walletAddress)) {
    return NextResponse.json(
      {
        data: null,
        error: "Please enter a valid Solana wallet address.",
      },
      {
        status: 400,
      },
    );
  }

  const result = await checkWalletForSpecialNfts(walletAddress);

  if (result.error) {
    return NextResponse.json(
      {
        data: null,
        error: result.error,
      },
      {
        status: 502,
      },
    );
  }

  return NextResponse.json({
    data: result.data,
    error: null,
  });
}

function isLikelySolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}
