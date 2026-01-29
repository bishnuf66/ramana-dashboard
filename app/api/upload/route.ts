import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!bucket) {
      return NextResponse.json({ error: "No bucket provided" }, { status: 400 });
    }

    console.log("Uploading via API:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      bucket,
    });

    // Generate unique filename
    const fileName = `${bucket}-${Date.now()}-${file.name}`;

    // Upload using service role
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("File uploaded successfully:", data);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    console.log("Public URL generated:", publicUrl);

    return NextResponse.json({
      success: true,
      publicUrl,
      fileName,
      path: data.path,
    });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { imageUrl, bucket } = await request.json();

    if (!imageUrl || !bucket) {
      return NextResponse.json(
        { error: "Image URL and bucket are required" },
        { status: 400 }
      );
    }

    console.log("Deleting via API:", { imageUrl, bucket });

    // Extract path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/");
    const pathIndex = pathParts.indexOf(bucket);

    if (pathIndex === -1) {
      console.log("Skipping deletion - not a Supabase Storage URL:", imageUrl);
      return NextResponse.json({ success: true });
    }

    const filePath = pathParts.slice(pathIndex + 1).join("/");

    // Delete using service role
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Storage delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("File deleted successfully:", filePath);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
