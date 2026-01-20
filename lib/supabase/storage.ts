"use client";

import { supabase } from "./client";

const BUCKET_NAME = "product-images";

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

/**
 * Upload a file to Supabase Storage
 */
export const uploadImage = async (
  file: File,
  path: string,
): Promise<string> => {
  return uploadImageToBucket(BUCKET_NAME, file, path);
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
