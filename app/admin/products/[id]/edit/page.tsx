"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  uploadImage,
  deleteImage,
  generateImagePath,
} from "@/lib/supabase/storage";
import { Upload, X, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [currentCoverImage, setCurrentCoverImage] = useState<string>("");

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [currentGalleryImages, setCurrentGalleryImages] = useState<string[]>(
    []
  );
  const [removedGalleryImages, setRemovedGalleryImages] = useState<string[]>(
    []
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    discount_price: "",
    rating: "5",
    category: "flowers" as "flowers" | "accessories" | "fruits",
    stock: "",
  });

  const fetchProduct = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title,
          description: data.description || "",
          price: data.price.toString(),
          discount_price: data.discount_price?.toString() || "",
          rating: data.rating.toString(),
          category: data.category,
          stock: data.stock.toString(),
        });

        setCurrentCoverImage(data.cover_image || "");
        setCoverImagePreview(data.cover_image || "");
        setCurrentGalleryImages(data.gallery_images || []);
        setGalleryPreviews(data.gallery_images || []);
      }
    } catch (error: any) {
      toast.error("Failed to fetch product: " + error.message);
      router.push("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  }, [productId, router]);

  useEffect(() => {
    fetchProduct();
  }, [productId, fetchProduct]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    setGalleryFiles([...galleryFiles, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const imageToRemove = currentGalleryImages[index];
      setRemovedGalleryImages([...removedGalleryImages, imageToRemove]);
      setCurrentGalleryImages(
        currentGalleryImages.filter((_, i) => i !== index)
      );
      setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
    } else {
      const newIndex = index - currentGalleryImages.length;
      setGalleryFiles(galleryFiles.filter((_, i) => i !== newIndex));
      setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setUploading(true);

    try {
      let coverImageUrl = currentCoverImage;

      // Upload new cover image if changed
      if (coverImageFile) {
        // Delete old cover image
        if (currentCoverImage) {
          await deleteImage(currentCoverImage).catch(console.error);
        }

        const coverImagePath = generateImagePath(
          productId,
          coverImageFile.name,
          "cover"
        );
        coverImageUrl = await uploadImage(coverImageFile, coverImagePath);
      }

      // Delete removed gallery images
      for (const imageUrl of removedGalleryImages) {
        await deleteImage(imageUrl).catch(console.error);
      }

      // Upload new gallery images
      const newGalleryUrls: string[] = [];
      for (let i = 0; i < galleryFiles.length; i++) {
        const galleryPath = generateImagePath(
          productId,
          galleryFiles[i].name,
          "gallery"
        );
        const galleryUrl = await uploadImage(galleryFiles[i], galleryPath);
        newGalleryUrls.push(galleryUrl);
      }

      // Combine existing and new gallery images
      const allGalleryImages = [...currentGalleryImages, ...newGalleryUrls];

      setUploading(false);

      // Update product
      const { error } = await supabase
        .from("products")
        .update({
          title: formData.title,
          description: formData.description || null,
          price: parseFloat(formData.price),
          discount_price: formData.discount_price
            ? parseFloat(formData.discount_price)
            : null,
          cover_image: coverImageUrl,
          gallery_images: allGalleryImages.length > 0 ? allGalleryImages : null,
          rating: parseFloat(formData.rating),
          category: formData.category,
          stock: parseInt(formData.stock) || 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);

      if (error) throw error;

      toast.success("Product updated successfully!");
      router.push("/admin/dashboard");
    } catch (error: any) {
      setUploading(false);
      toast.error("Failed to update product: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="flowers">Flowers</option>
                  <option value="accessories">Accessories</option>
                  <option value="fruits">Fruits</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discount_price}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_price: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  {coverImagePreview ? (
                    <div className="relative inline-block">
                      <Image
                        src={coverImagePreview}
                        alt="Cover preview"
                        width={192}
                        height={192}
                        className="h-48 w-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImageFile(null);
                          setCoverImagePreview(currentCoverImage);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleCoverImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gallery Images
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center w-full">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                      <span>Upload files</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImagesChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB each
                  </p>

                  {galleryPreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={preview}
                            alt={`Gallery ${index + 1}`}
                            width={96}
                            height={96}
                            className="h-24 w-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeGalleryImage(
                                index,
                                index < currentGalleryImages.length
                              )
                            }
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Product description..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving || uploading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading
                  ? "Uploading images..."
                  : saving
                  ? "Saving..."
                  : "Update Product"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
