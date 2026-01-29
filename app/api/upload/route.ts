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
    const folder = formData.get("folder") as string;
    const fileName = formData.get("fileName") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!bucket) {
      return NextResponse.json(
        { error: "No bucket provided" },
        { status: 400 },
      );
    }

    console.log("Uploading via API:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      bucket,
      folder,
      customFileName: fileName,
    });

    // Generate file path
    let filePath: string;

    if (folder && fileName) {
      // Custom folder and filename (for products)
      filePath = `${folder}/${fileName}`;
    } else if (folder) {
      // Folder with timestamped filename
      const timestampedName = `${Date.now()}-${file.name}`;
      filePath = `${folder}/${timestampedName}`;
    } else {
      // Default behavior (backward compatibility)
      filePath = `${bucket}-${Date.now()}-${file.name}`;
    }

    // Upload using service role
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // Allow overwriting for product updates
      });

    if (error) {
      console.error("Storage upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("File uploaded successfully:", data);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    console.log("Public URL generated:", publicUrl);

    return NextResponse.json({
      success: true,
      publicUrl,
      filePath,
      fileName: data.path,
    });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { imageUrl, bucket, folder } = await request.json();

    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket is required" },
        { status: 400 },
      );
    }

    console.log("Deleting via API:", { imageUrl, bucket, folder });

    if (folder) {
      // Delete entire folder (for product deletion)
      console.log("Deleting entire folder:", folder);

      // List all files in the folder
      const { data: files, error: listError } = await supabase.storage
        .from(bucket)
        .list(folder);

      if (listError) {
        console.error("Error listing folder files:", listError);
        return NextResponse.json({ error: listError.message }, { status: 500 });
      }

      if (files && files.length > 0) {
        // Delete all files in the folder
        const filePaths = files.map((file) => `${folder}/${file.name}`);
        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove(filePaths);

        if (deleteError) {
          console.error("Error deleting folder files:", deleteError);
          return NextResponse.json(
            { error: deleteError.message },
            { status: 500 },
          );
        }

        console.log(`Deleted ${files.length} files from folder:`, folder);
      } else {
        console.log("Folder is empty or doesn't exist:", folder);
      }

      return NextResponse.json({
        success: true,
        message: `Deleted folder ${folder} with ${files?.length || 0} files`,
      });
    } else if (imageUrl) {
      // Delete single file (existing behavior)
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split("/");
      const pathIndex = pathParts.indexOf(bucket);

      if (pathIndex === -1) {
        console.log(
          "Skipping deletion - not a Supabase Storage URL:",
          imageUrl,
        );
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
    } else {
      return NextResponse.json(
        { error: "Either imageUrl or folder must be provided" },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error("Delete API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
