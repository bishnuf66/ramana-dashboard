"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  uploadImage,
  generateImagePath,
  deleteImages,
} from "@/lib/supabase/storage";
import { Upload, X, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import MDEditor from "@uiw/react-md-editor";
import { generateSlug } from "@/lib/utils";
import { Database } from "@/types/database.types";
type Category = Database["public"]["Tables"]["categories"]["Row"];

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  cover_image: string;
  gallery_images: { url: string; title: string }[] | null;
  rating: number;
  category_id: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    picture?: string | null;
  } | null;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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
  });

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
        router.push("/dashboard");
        return;
      }

      const productData = data as Product;
      setProduct(productData);

      // Set form data
      setFormData({
        title: productData.title,
        slug: productData.slug,
        description: productData.description || "",
        price: productData.price.toString(),
        discount_price: productData.discount_price?.toString() || "",
        category_id: productData.category_id || "",
        stock: productData.stock.toString(),
        is_featured: productData.is_featured || false,
        is_active:
          productData.is_active !== undefined ? productData.is_active : true,
      });

      // Set gallery images
      if (productData.gallery_images) {
        setGalleryTitles(productData.gallery_images.map((img) => img.title));
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
    if (isExisting && product?.gallery_images) {
      // Mark existing image for removal
      const imageToRemove = product.gallery_images[index];
      setRemovedGalleryImages([...removedGalleryImages, imageToRemove.url]);
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
        // Mark old cover image for deletion
        imagesToDelete.push(product.cover_image);

        const coverImagePath = generateImagePath(
          product.id,
          coverImageFile.name,
          "cover",
        );
        newCoverImageUrl = await uploadImage(coverImageFile, coverImagePath);
      }

      // Upload new gallery images
      const newGalleryUrls: { url: string; title: string }[] = [];
      for (let i = 0; i < galleryFiles.length; i++) {
        const galleryPath = generateImagePath(
          product.id,
          galleryFiles[i].name,
          "gallery",
        );
        const galleryUrl = await uploadImage(galleryFiles[i], galleryPath);
        newGalleryUrls.push({
          url: galleryUrl,
          title: galleryTitles[i] || "",
        });
      }

      // Combine existing gallery images (minus removed ones) with new ones
      let finalGalleryImages = product.gallery_images || [];
      if (removedGalleryImages.length > 0) {
        finalGalleryImages = finalGalleryImages.filter(
          (img) => !removedGalleryImages.includes(img.url),
        );
      }
      finalGalleryImages = [...finalGalleryImages, ...newGalleryUrls];

      // Delete removed images from storage
      const allImagesToDelete = [...removedGalleryImages, ...imagesToDelete];
      if (allImagesToDelete.length > 0) {
        deleteImages(allImagesToDelete).catch(console.error);
      }

      setUploading(false);

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
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      if (error) throw error;

      toast.success("Product updated successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      setUploading(false);
      toast.error("Failed to update product: " + error.message);
    } finally {
      setSaving(false);
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
            onClick={() => router.back()}
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
                      src={coverImagePreview || product.cover_image}
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
                  product.gallery_images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Current Gallery Images:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.gallery_images.map((image, index) => (
                          <div
                            key={index}
                            className="relative flex gap-3 items-start"
                          >
                            <div className="relative h-24 w-24 rounded-lg overflow-hidden">
                              <Image
                                src={image.url}
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
                                  const updatedGallery = [
                                    ...(product.gallery_images || []),
                                  ];
                                  updatedGallery[index] = {
                                    ...image,
                                    title: e.target.value,
                                  };
                                  setProduct({
                                    ...product,
                                    gallery_images: updatedGallery,
                                  });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                placeholder="Title / caption"
                              />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(index, true)}
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
              onClick={() => router.back()}
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
