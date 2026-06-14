import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase client (service role — bypasses RLS) ──────────────────────────
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

export async function POST(request: Request) {
  try {
    const {
      ownerWallet,
      name,
      slug,
      description,
      collectionType,       // "type_a" | "type_b"
      collectionAddress,    // ME symbol for type_a; same parent symbol for type_b
      parentCommunityId,    // null for type_a
      preferredView,
      vipThreshold,
      selectedMints,        // string[] for type_b, [] for type_a
    } = await request.json();

    // ── Validation ────────────────────────────────────────────────────────────
    if (!ownerWallet || !name || !slug || !collectionType || !collectionAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (collectionType === "type_b" && (!selectedMints || selectedMints.length === 0)) {
      return NextResponse.json({ error: "Type B requires at least one NFT selected" }, { status: 400 });
    }
    if (collectionType === "type_b" && !parentCommunityId) {
      return NextResponse.json({ error: "Type B requires a parent community" }, { status: 400 });
    }

    const supabase = getSupabase();

    // ── Duplicate slug check ──────────────────────────────────────────────────
    const { data: existing } = await supabase
      .from("communities")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: `Slug "${slug}" is already taken` }, { status: 409 });
    }

    // ── Insert community ──────────────────────────────────────────────────────
    const { data: community, error: insertError } = await supabase
      .from("communities")
      .insert({
        owner_wallet: ownerWallet,
        name,
        slug,
        description: description ?? "",
        collection_type: collectionType === "type_game" ? "type_a" : collectionType,
        collection_address: collectionAddress,
        parent_community_id: parentCommunityId || null,
        preferred_view: preferredView ?? "timeline1",
        vip_threshold: vipThreshold ?? 1,
      })
      .select()
      .single();

    if (insertError) {
      // Catch the unique constraint on type_a collection_address
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "A Type A community for this Magic Eden collection already exists." },
          { status: 409 }
        );
      }
      throw insertError;
    }

    // ── For Type B: save selected mints to community_nfts ────────────────────
    if (collectionType === "type_b" && selectedMints.length > 0) {
      const rows = (selectedMints as string[]).map((mint) => ({
        community_id: community.id,
        mint_address: mint,
      }));

      const { error: nftError } = await supabase.from("community_nfts").insert(rows);
      if (nftError) throw nftError;
    }

    return NextResponse.json({ success: true, community }, { status: 201 });
  } catch (err: unknown) {
    console.error("[/api/community/create]", err);
    const message = err instanceof Error ? err.message : (err as any)?.message || JSON.stringify(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
