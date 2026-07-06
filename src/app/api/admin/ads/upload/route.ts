import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// POST /api/admin/ads/upload
// Accepts: multipart/form-data with file
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Missing file." }, { status: 400 });
    }

    const supabase = getSupabase();

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Build a unique file path: ads/{timestamp}_{filename}
    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    // Sanitize filename to avoid weird characters in URL
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
    const filePath = `ads/${timestamp}_${safeName}`;

    // Upload to Supabase Storage (using the existing public-profiles bucket for convenience)
    const { error: uploadError } = await supabase.storage
      .from("public-profiles")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("public-profiles")
      .getPublicUrl(filePath);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed." }, { status: 500 });
  }
}
