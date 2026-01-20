"use client";

import { supabase } from "./client";
import { createAdminClient } from "./server";

const BUCKET_NAME = "product-images";

// Client-side upload (for regular users)
export const uploadImageToBucket = async (
  bucket: string,
  file: File,
  path: string,
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
};

// Service role upload (for admin operations)
export const uploadImageToBucketAdmin = async (
  bucket: string,
  file: File,
  path: string,
): Promise<string> => {
  console.log("Starting admin upload to bucket:", bucket, "path:", path);

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log(
    "Environment check - URL:",
    !!supabaseUrl,
    "Service Key:",
    !!serviceRoleKey,
  );

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing environment variables");
    throw new Error("Missing Supabase environment variables");
  }

  const supabaseAdmin = await createAdminClient();

  console.log("Created admin client, attempting upload...");

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  console.log("Upload result:", { data, error });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);

  console.log("Generated public URL:", publicUrl);
  return publicUrl;
};

/**
 * Upload a file to Supabase Storage
 */
export const uploadImage = async (
  file: File,
  path: string,
  bucket: string = BUCKET_NAME,
): Promise<string> => {
  return uploadImageToBucket(bucket, file, path);
};

/**
 * Delete an image from Supabase Storage
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) return;

  try {
    // Extract path from URL
    // Supabase Storage URLs look like: https://[project].supabase.co/storage/v1/object/public/product-images/path/to/file.jpg
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/");
    const pathIndex = pathParts.indexOf(BUCKET_NAME);

    if (pathIndex === -1) {
      // If it's not a Supabase Storage URL, skip deletion
      console.log("Skipping deletion - not a Supabase Storage URL:", imageUrl);
      return;
    }

    const filePath = pathParts.slice(pathIndex + 1).join("/");

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Failed to delete image:", error);
      // Don't throw - allow operation to continue even if deletion fails
    }
  } catch (error) {
    console.error("Error parsing image URL:", error);
    // Don't throw - allow operation to continue
  }
};

/**
 * Delete multiple images
 */
export const deleteImages = async (imageUrls: string[]): Promise<void> => {
  await Promise.all(imageUrls.map((url) => deleteImage(url)));
};

/**
 * Generate a unique file path for product images
 */
export const generateImagePath = (
  productId: string,
  fileName: string,
  type: "cover" | "gallery" = "cover",
): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `products/${productId}/${type}-${timestamp}-${sanitizedFileName}`;
};

export const generateBlogImagePath = (
  blogId: string,
  fileName: string,
  type: "cover" | "inline" = "inline",
): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `blogs/${blogId}/${type}-${timestamp}-${sanitizedFileName}`;
};
