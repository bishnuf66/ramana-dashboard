"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import MDEditor from "@uiw/react-md-editor";
import { generateSlug } from "@/lib/utils";
import { useCreateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/app/dashboard/page";

export default function NewProductPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryTitles, setGalleryTitles] = useState<string[]>([]);

  // Use TanStack Query hooks
  const createProductMutation = useCreateProduct();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const loading = createProductMutation.isPending;

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    discount_price: "",
    category_id: "",
    stock: "",
    is_featured: false,
    is_active: true,
    weight_gram: "",
    height_cm: "",
    width_cm: "",
    length_cm: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, trimmedTag],
      });
    }
    setTagInput("");
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    } else if (
      e.key === "Backspace" &&
      tagInput === "" &&
      formData.tags.length > 0
    ) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(formData.tags.length - 1);
    }
  };

  const handleTagInputBlur = () => {
    if (tagInput.trim()) {
      addTag(tagInput);
    }
  };

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
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    setGalleryFiles([...galleryFiles, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews((prev) => [...prev, reader.result as string]);
        setGalleryTitles((prev) => [...prev, file.name]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(galleryFiles.filter((_, i) => i !== index));
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
    setGalleryTitles(galleryTitles.filter((_, i) => i !== index));
  };

  const uploadImage = async (
    file: File,
    bucket: string = "product-images",
  ): Promise<string | null> => {
    try {
      console.log(
        "Starting image upload via API for:",
        file.name,
        "to bucket:",
        bucket,
      );

      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API upload error:", errorData);
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      console.log("File uploaded successfully via API:", data);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image via API:", error);
      throw error; // Re-throw to stop form submission
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImageFile) {
      toast.error("Please upload a cover image");
      return;
    }

    setUploading(true);

    try {
      console.log("Starting product creation...");

      // Generate product ID first
      const productId = crypto.randomUUID();
      console.log("Generated product ID:", productId);

      // Upload cover image
      console.log("Uploading cover image...");
      const coverImageUrl = await uploadImage(coverImageFile);
      if (!coverImageUrl) {
        throw new Error("Failed to upload cover image");
      }
      console.log("Cover image uploaded successfully:", coverImageUrl);

      // Upload gallery images
      const galleryUrls: string[] = [];
      console.log(`Processing ${galleryFiles.length} gallery images...`);

      for (let i = 0; i < galleryFiles.length; i++) {
        try {
          console.log(
            `Uploading gallery image ${i + 1}/${galleryFiles.length}...`,
          );
          const galleryUrl = await uploadImage(galleryFiles[i]);
          if (!galleryUrl) {
            throw new Error(`Gallery image ${i + 1} upload returned null`);
          }
          galleryUrls.push(galleryUrl);
          console.log(
            `Gallery image ${i + 1} uploaded successfully:`,
            galleryUrl,
          );
        } catch (galleryError: any) {
          console.error(
            `Failed to upload gallery image ${i + 1}:`,
            galleryError,
          );
          throw new Error(
            `Failed to upload gallery image ${i + 1}: ${galleryError.message}`,
          );
        }
      }

      console.log("All images uploaded, creating product...");

      // Create product using TanStack Query mutation
      const productData = {
        id: productId,
        title: formData.title,
        slug: formData.slug,
        description: formData.description || null,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price
          ? parseFloat(formData.discount_price)
          : null,
        cover_image: coverImageUrl,
        gallery_images: galleryUrls.length > 0 ? galleryUrls : null,
        category_id: formData.category_id || null,
        stock: parseInt(formData.stock) || 0,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        weight_gram: formData.weight_gram
          ? parseInt(formData.weight_gram)
          : null,
        height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
        width_cm: formData.width_cm ? parseInt(formData.width_cm) : null,
        length_cm: formData.length_cm ? parseInt(formData.length_cm) : null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await createProductMutation.mutateAsync(productData);

      router.push("/dashboard?section=products");
    } catch (error: any) {
      console.error("Error creating product:", error);
      console.error("Form data:", formData);
      console.error("Cover image file:", coverImageFile);
      console.error("Gallery files:", galleryFiles);

      // More specific error handling
      if (
        error.message?.includes("storage") ||
        error.message?.includes("upload")
      ) {
        toast.error("Error uploading images. Please try again.");
      } else if (error.message?.includes("database")) {
        toast.error("Error saving product to database. Please try again.");
      } else {
        toast.error(error.message || "Failed to create product");
      }
    } finally {
      console.log("Setting uploading state to false");
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Product
          </h1>
          <button
            onClick={() => router.push("/dashboard?section=products")}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setFormData({
                    ...formData,
                    title: newTitle,
                    slug: generateSlug(newTitle),
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                placeholder="Auto-generated from title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category_id: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a category</option>
                {categories.map((category: Category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Discount Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.discount_price}
                onChange={(e) =>
                  setFormData({ ...formData, discount_price: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Stock *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[48px]">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={handleTagInputBlur}
                    placeholder={
                      formData.tags.length === 0
                        ? "Add a tag and press Enter..."
                        : "Add another tag..."
                    }
                    className="flex-1 min-w-[120px] px-2 py-1 border-none outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Press Enter to add a tag, click X to remove. Tags help
                  organize your products.
                </p>
              </div>
            </div>

            {/* Dimensions Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Dimensions (Optional)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Weight (grams)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.weight_gram}
                    onChange={(e) =>
                      setFormData({ ...formData, weight_gram: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.height_cm}
                    onChange={(e) =>
                      setFormData({ ...formData, height_cm: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Width (cm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.width_cm}
                    onChange={(e) =>
                      setFormData({ ...formData, width_cm: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Length (cm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.length_cm}
                    onChange={(e) =>
                      setFormData({ ...formData, length_cm: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 15"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData({ ...formData, is_featured: e.target.checked })
                }
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
              <label
                htmlFor="is_featured"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-200"
              >
                Featured Product
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
              <label
                htmlFor="is_active"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-200"
              >
                Active Product
              </label>
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Cover Image *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg bg-white dark:bg-gray-900">
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
                        setCoverImagePreview("");
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-300">
                      <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleCoverImageChange}
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Gallery Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Gallery Images (Optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg bg-white dark:bg-gray-900">
              <div className="space-y-1 text-center w-full">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-300 justify-center">
                  <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
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
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB each
                </p>

                {galleryPreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {galleryPreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative flex gap-3 items-start"
                      >
                        <div className="relative h-24 w-24 rounded-lg overflow-hidden">
                          <Image
                            src={preview}
                            alt={`Gallery ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={galleryTitles[index] || ""}
                            onChange={(e) => {
                              const next = [...galleryTitles];
                              next[index] = e.target.value;
                              setGalleryTitles(next);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            placeholder="Title / caption"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Description
            </label>
            <div className="dark:text-white">
              <MDEditor
                value={formData.description || ""}
                onChange={(value) => {
                  setFormData({ ...formData, description: value || "" });
                }}
                height={200}
                preview="edit"
                hideToolbar={false}
                visibleDragbar={false}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading
                ? "Uploading images..."
                : loading
                  ? "Creating..."
                  : "Create Product"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard?section=products")}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
