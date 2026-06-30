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
      meSymbol,             // Optional Magic Eden symbol
      assetDescriptions,    // Record<string, string> for type_b descriptions
      image,                // Optional default cover image
    } = await request.json();

    // ── Validation ────────────────────────────────────────────────────────────
    if (!ownerWallet || !name || !slug || !collectionType || !collectionAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const isGameStory = collectionType === "type_b" && collectionAddress === "star_atlas";
    if (collectionType === "type_b" && !isGameStory && (!selectedMints || selectedMints.length === 0)) {
      return NextResponse.json({ error: "Type B requires at least one NFT selected" }, { status: 400 });
    }
    if (collectionType === "type_b" && !parentCommunityId) {
      return NextResponse.json({ error: "Type B requires a parent community" }, { status: 400 });
    }

    const supabase = getSupabase();

    // ── Duplicate slug check ──────────────────────────────────────────────────
    const { data: existingCollection } = await supabase.from("collection").select("collection_id").eq("slug", slug).maybeSingle();
    const { data: existingStory } = await supabase.from("stories").select("stories_id").eq("slug", slug).maybeSingle();

    if (existingCollection || existingStory) {
      return NextResponse.json({ error: `Slug "${slug}" is already taken` }, { status: 409 });
    }

    let finalImage = image;
    if (!finalImage && meSymbol) {
      try {
        const meRes = await fetch(`https://api-mainnet.magiceden.dev/v2/collections/${meSymbol}`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
          }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData && meData.image) finalImage = meData.image;
        }
      } catch (err) {
        console.error("Failed to fetch ME collection image", err);
      }
    }

    // ── Insert community ──────────────────────────────────────────────────────
    let community;
    let insertError;

    if (collectionType === "type_b") {
      const res = await supabase
        .from("stories")
        .insert({
          wallet_address: ownerWallet,
          name,
          slug,
          description: description ?? "",
          image: finalImage || null,
          collection_id: parentCommunityId,
          collection_address: collectionAddress,
          preferred_view: preferredView ?? "timeline1",
          vip_threshold: vipThreshold ?? 1,
          theme_settings: {
            ...(meSymbol ? { magicEdenSymbol: meSymbol } : {}),
            ...(selectedMints ? { assetIds: selectedMints } : {}),
            ...(assetDescriptions ? { assetDescriptions } : {})
          },
        })
        .select()
        .single();
      community = res.data;
      insertError = res.error;
    } else {
      const res = await supabase
        .from("collection")
        .insert({
          wallet_address: ownerWallet,
          name,
          slug,
          description: description ?? "",
          image: finalImage || null,
          category: collectionType === "type_game" ? "game" : "nft",
          collection_address: collectionAddress,
          preferred_view: preferredView ?? "timeline1",
          vip_threshold: vipThreshold ?? 1,
          theme_settings: {
            ...(meSymbol ? { magicEdenSymbol: meSymbol } : {}),
          },
        })
        .select()
        .single();
      community = res.data;
      insertError = res.error;
    }

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "A community for this collection already exists." },
          { status: 409 }
        );
      }
      throw insertError;
    }

    // ── For Type B: save selected mints to stories_selection ────────────────────
    if (collectionType === "type_b" && selectedMints.length > 0) {
      const rows = (selectedMints as string[]).map((mint) => ({
        stories_id: community.stories_id,
        collection_id: parentCommunityId,
        mint_address: mint,
      }));

      const { error: nftError } = await supabase.from("stories_selection").insert(rows);
      if (nftError) throw nftError;
    }

    return NextResponse.json({ success: true, community }, { status: 201 });
  } catch (err: unknown) {
    console.error("[/api/community/create]", err);
    const message = err instanceof Error ? err.message : (err as any)?.message || JSON.stringify(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
