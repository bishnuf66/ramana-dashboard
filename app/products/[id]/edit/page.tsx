"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Upload, X, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import MDEditor from "@uiw/react-md-editor";
import { generateSlug } from "@/lib/utils";
import { Database } from "@/types/database.types";
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Image states
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryTitles, setGalleryTitles] = useState<string[]>([]);
  const [removedGalleryImages, setRemovedGalleryImages] = useState<string[]>(
    [],
  );
  const [categories, setCategories] = useState<Category[]>([]);

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

  const deleteImage = async (
    imageUrl: string,
    bucket: string = "product-images",
  ): Promise<void> => {
    if (!imageUrl) return;

    try {
      console.log("Deleting image via API:", imageUrl, "from bucket:", bucket);

      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          bucket,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API delete error:", errorData);
        // Don't throw - allow operation to continue even if deletion fails
      } else {
        console.log("Image deleted successfully via API:", imageUrl);
      }
    } catch (error) {
      console.error("Error deleting image via API:", error);
      // Don't throw - allow operation to continue
    }
  };

  const deleteImages = async (imageUrls: string[]): Promise<void> => {
    await Promise.all(imageUrls.map((url) => deleteImage(url)));
  };

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

  useEffect(() => {
    const loadData = async () => {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await (
        supabase as any
      )
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (categoriesError) {
        console.error("Failed to fetch categories:", categoriesError);
      } else {
        setCategories(categoriesData || []);
      }

      // Fetch product with category
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories(id, name, slug, picture)
        `,
        )
        .eq("id", params.id)
        .single();

      if (error) {
        toast.error("Product not found");
        router.push("/dashboard?section=products");
        return;
      }

      const productData = data as Product;
      setProduct(productData);

      // Set form data
      setFormData({
        title: productData.title,
        slug: productData.slug || "",
        description: productData.description || "",
        price: productData.price.toString(),
        discount_price: productData.discount_price?.toString() || "",
        category_id: productData.category_id || "",
        stock: productData.stock?.toString() || "0",
        is_featured: productData.is_featured || false,
        is_active:
          productData.is_active !== undefined ? productData.is_active : true,
        weight_gram: productData.weight_gram?.toString() || "",
        height_cm: productData.height_cm?.toString() || "",
        width_cm: productData.width_cm?.toString() || "",
        length_cm: productData.length_cm?.toString() || "",
        tags: (productData.tags as string[]) || [],
      });

      // Set gallery images
      if (
        productData.gallery_images &&
        Array.isArray(productData.gallery_images)
      ) {
        setGalleryTitles(
          productData.gallery_images.map((img: any) => img.title || ""),
        );
      }

      setLoading(false);
    };

    loadData();
  }, [params.id, router]);

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

  const removeGalleryImage = (index: number, isExisting: boolean = false) => {
    if (
      isExisting &&
      product?.gallery_images &&
      Array.isArray(product.gallery_images)
    ) {
      // Mark existing image for removal
      const imageToRemove = (product.gallery_images as any)[index];
      if (imageToRemove && imageToRemove.url) {
        setRemovedGalleryImages([...removedGalleryImages, imageToRemove.url]);
      }
    } else {
      // Remove new image
      setGalleryFiles(galleryFiles.filter((_, i) => i !== index));
      setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
      setGalleryTitles(galleryTitles.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSaving(true);
    setUploading(true);

    try {
      let newCoverImageUrl = product.cover_image;
      const imagesToDelete: string[] = [];

      // Upload new cover image if provided
      if (coverImageFile) {
        console.log("New cover image detected, marking old one for deletion");
        // Mark old cover image for deletion
        if (product.cover_image) {
          imagesToDelete.push(product.cover_image);
          console.log(
            "Marked old cover image for deletion:",
            product.cover_image,
          );
        }

        console.log("Uploading new cover image...");
        newCoverImageUrl = await uploadImage(coverImageFile);
        if (!newCoverImageUrl) {
          throw new Error("Failed to upload new cover image");
        }
        console.log("New cover image uploaded successfully:", newCoverImageUrl);
      }

      // Upload new gallery images
      const newGalleryUrls: { url: string; title: string }[] = [];
      console.log("Processing", galleryFiles.length, "new gallery images");

      for (let i = 0; i < galleryFiles.length; i++) {
        console.log(`Uploading gallery image ${i + 1}...`);
        const galleryUrl = await uploadImage(galleryFiles[i]);
        if (!galleryUrl) {
          throw new Error(`Failed to upload gallery image ${i + 1}`);
        }
        newGalleryUrls.push({
          url: galleryUrl,
          title: galleryTitles[i] || "",
        });
        console.log(`Gallery image ${i + 1} uploaded successfully`);
      }

      // Combine existing gallery images (minus removed ones) with new ones
      let finalGalleryImages: { url: string; title: string }[] = [];

      // Start with existing images if they exist and are an array
      if (product.gallery_images && Array.isArray(product.gallery_images)) {
        const existingImages = product.gallery_images as any[];
        finalGalleryImages = existingImages.filter(
          (img: any) => !removedGalleryImages.includes(img.url),
        );
        console.log("Kept existing gallery images:", finalGalleryImages.length);
      }

      // Add new images
      finalGalleryImages = [...finalGalleryImages, ...newGalleryUrls];
      console.log("Final gallery images count:", finalGalleryImages.length);

      // Delete removed images from storage
      const allImagesToDelete = [...removedGalleryImages, ...imagesToDelete];
      console.log("Total images to delete:", allImagesToDelete.length);
      console.log("Images to delete:", allImagesToDelete);

      if (allImagesToDelete.length > 0) {
        try {
          await deleteImages(allImagesToDelete);
          console.log("Successfully deleted images from storage");
        } catch (deleteError) {
          console.error("Failed to delete images from storage:", deleteError);
          toast.warning(
            "Warning: Some images could not be deleted from storage",
          );
        }
      }

      setUploading(false);

      console.log("Updating product in database...");
      // Update product
      const { error } = await (supabase as any)
        .from("products")
        .update({
          title: formData.title,
          slug: formData.slug,
          description: formData.description || null,
          price: parseFloat(formData.price),
          discount_price: formData.discount_price
            ? parseFloat(formData.discount_price)
            : null,
          cover_image: newCoverImageUrl,
          gallery_images:
            finalGalleryImages.length > 0 ? finalGalleryImages : null,
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
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Product updated successfully!");
      toast.success("Product updated successfully!");
      router.push("/dashboard?section=products");
    } catch (error: any) {
      console.error("Error updating product:", error);
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
        toast.error(error.message || "Failed to update product");
      }
    } finally {
      console.log("Setting loading states to false");
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-xl text-gray-900 dark:text-white">
          Loading product...
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Product
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
                value={formData.slug || ""}
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
                {categories.map((category) => (
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
              Cover Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg bg-white dark:bg-gray-900">
              <div className="space-y-1 text-center">
                {coverImagePreview || product.cover_image ? (
                  <div className="relative inline-block">
                    <Image
                      src={coverImagePreview || product.cover_image || ""}
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
              Gallery Images
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

                {/* Existing Gallery Images */}
                {product.gallery_images &&
                  Array.isArray(product.gallery_images) &&
                  product.gallery_images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Current Gallery Images:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.gallery_images &&
                          Array.isArray(product.gallery_images) &&
                          (product.gallery_images as any[]).map(
                            (image: any, index: number) => (
                              <div
                                key={index}
                                className="relative flex gap-3 items-start"
                              >
                                <div className="relative h-24 w-24 rounded-lg overflow-hidden">
                                  <Image
                                    src={image.url || ""}
                                    alt={`Gallery ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={image.title}
                                    onChange={(e) => {
                                      if (
                                        product.gallery_images &&
                                        Array.isArray(product.gallery_images)
                                      ) {
                                        const updatedGallery = [
                                          ...(product.gallery_images as any[]),
                                        ];
                                        updatedGallery[index] = {
                                          ...image,
                                          title: e.target.value,
                                        };
                                        setProduct({
                                          ...product,
                                          gallery_images: updatedGallery,
                                        });
                                      }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                    placeholder="Title / caption"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeGalleryImage(index, true)
                                    }
                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ),
                          )}
                      </div>
                    </div>
                  )}

                {/* New Gallery Images */}
                {galleryPreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      New Gallery Images:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              onClick={() => removeGalleryImage(index, false)}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
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
                Press Enter to add a tag, click X to remove. Tags help organize
                your products.
              </p>
            </div>
          </div>

          {/* Description */}
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
              disabled={saving || uploading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading
                ? "Uploading images..."
                : saving
                  ? "Updating..."
                  : "Update Product"}
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
