import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// POST /api/profile/upload
// Accepts: multipart/form-data with file, type (profile_image|cover_image), wallet
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;
    const wallet = formData.get("wallet") as string | null;

    if (!file || !type || !wallet) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Validate type
    if (!["profile_image", "cover_image"].includes(type)) {
      return NextResponse.json({ error: "Invalid image type." }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5MB." }, { status: 400 });
    }

    const supabase = getSupabase();

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Build a unique file path: profiles/{wallet}/{type}.{ext}
    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `profiles/${wallet}/${type}.${ext}`;

    // Upload to Supabase Storage (bucket: "public-profiles")
    const { error: uploadError } = await supabase.storage
      .from("public-profiles")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true, // Overwrite if exists
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("public-profiles")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Save the URL back to the profile in the database
    const { error: updateError } = await supabase
      .from("public_profile")
      .update({ [type]: publicUrl })
      .eq("wallet_address", wallet);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed." }, { status: 500 });
  }
}
