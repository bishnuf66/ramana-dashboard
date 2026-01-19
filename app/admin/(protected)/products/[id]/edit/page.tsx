"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";
import { toast } from "react-toastify";
import AdminLayout from "../../../../../../components/admin/AdminLayout";

type DbProduct = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  cover_image: string;
  gallery_images: (string | { url: string; title?: string })[] | null;
  rating: number;
  category: string | null;
  stock: number;
};

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        toast.error("Product not found");
        router.push("/admin/products");
        return;
      }

      setProduct(data as DbProduct);
      setLoading(false);
    };

    load();
  }, [params.id, router]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-lg text-gray-900 dark:text-white">
            Loading product...
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Product
            </h1>
            <button
              onClick={() => router.push("/admin/products")}
              className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
            >
              Back to Products
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Title</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {product.title}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Price</div>
                <div className="text-gray-900 dark:text-white">
                  NPR {(product.discount_price || product.price).toLocaleString()}
                  {product.discount_price && (
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 line-through">
                      NPR {product.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Stock</div>
                <div className="text-gray-900 dark:text-white">{product.stock} units</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Category</div>
                <div className="text-gray-900 dark:text-white">
                  {product.category || "—"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Rating</div>
                <div className="text-gray-900 dark:text-white">{product.rating}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Description</div>
                <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {product.description || "—"}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <Image
                  src={product.cover_image}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              {product.gallery_images && product.gallery_images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {product.gallery_images.map((entry, i) => {
                    const url = typeof entry === "string" ? entry : entry.url;
                    const title = typeof entry === "string" ? "" : entry.title || "";
                    return (
                      <div
                        key={i}
                        className="relative w-full h-28 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700"
                      >
                        <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover" />
                        {title ? (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
                            {title}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-4 text-sm text-gray-600 dark:text-gray-300">
            Editing is not wired up yet. To change this product, update it directly in Supabase or extend this page to add form fields and call `supabase.from("products").update(...)`.
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
