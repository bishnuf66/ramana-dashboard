"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Package,
  AlertCircle,
} from "lucide-react";
import DeleteModal from "@/components/ui/DeleteModal";
import ProductViewModal from "./ProductViewModal";
import Pagination from "@/components/ui/Pagination";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import SearchFilterSort from "@/components/ui/SearchFilterSort";
import type { Database } from "@/types/database.types";
import {
  useProducts,
  useProductsCount,
  useDeleteProduct,
} from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import axiosInstance from "@/lib/axios";
import { Category, Product } from "@/app/dashboard/page";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];

const ProductsPage = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<DbProduct | null>(
    null,
  );
  const [showViewModal, setShowViewModal] = useState(false);
  const [productToView, setProductToView] = useState<DbProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "in_stock" | "out_of_stock"
  >("all");
  const [sortBy, setSortBy] = useState<"created_at" | "name" | "price">(
    "created_at",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // TanStack Query hooks
  const { data: products = [], isLoading } = useProducts({
    search: searchTerm,
    category: selectedCategory,
    status: selectedStatus,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: itemsPerPage,
  });

  const { data: total = 0 } = useProductsCount({
    search: searchTerm,
    category: selectedCategory,
    status: selectedStatus,
  });

  const { data: categoriesList = [] } = useCategories();
  const deleteProductMutation = useDeleteProduct();

  // Check if any filters are applied
  const hasFilters: boolean =
    !!searchTerm ||
    selectedCategory !== "all" ||
    selectedStatus !== "all" ||
    sortBy !== "created_at" ||
    sortOrder !== "desc" ||
    itemsPerPage !== 10 ||
    currentPage !== 1;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value as "all" | "in_stock" | "out_of_stock");
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split("-");
    setSortBy(sort as any);
    setSortOrder(order as "asc" | "desc");
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSortBy("created_at");
    setSortOrder("desc");
    setItemsPerPage(10);
    setCurrentPage(1);
  };

  const handleDeleteProduct = (product: DbProduct) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleViewProduct = (product: DbProduct) => {
    setProductToView(product);
    setShowViewModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete || isDeleting) return;

    setIsDeleting(true);

    try {
      // Delete product images from storage
      const imagesToDelete = [];

      console.log("Starting image deletion for product:", productToDelete.id);

      // Add cover image
      if (productToDelete.cover_image) {
        imagesToDelete.push(productToDelete.cover_image);
        console.log("Found cover image:", productToDelete.cover_image);
      }

      // Add gallery images - handle both string and object formats
      if (productToDelete.gallery_images) {
        console.log(
          "Processing gallery images:",
          productToDelete.gallery_images,
        );

        if (Array.isArray(productToDelete.gallery_images)) {
          productToDelete.gallery_images.forEach((img: any) => {
            if (typeof img === "string") {
              imagesToDelete.push(img);
              console.log("Added gallery image (string format):", img);
            } else if (img && img.url) {
              imagesToDelete.push(img.url);
              console.log("Added gallery image (object format):", img.url);
            } else if (
              img &&
              typeof img === "object" &&
              Object.keys(img).length > 0
            ) {
              // Handle nested objects - check for common image properties
              if (img.url) {
                imagesToDelete.push(img.url);
                console.log("Added gallery image (nested object):", img.url);
              } else if (img.image) {
                imagesToDelete.push(img.image);
                console.log("Added gallery image (image property):", img.image);
              } else if (img.src) {
                imagesToDelete.push(img.src);
                console.log("Added gallery image (src property):", img.src);
              }
            }
          });
        } else if (typeof productToDelete.gallery_images === "string") {
          // Handle JSON string format
          try {
            const parsed = JSON.parse(productToDelete.gallery_images);
            if (Array.isArray(parsed)) {
              parsed.forEach((img: any) => {
                if (typeof img === "string") {
                  imagesToDelete.push(img);
                  console.log("Added gallery image (parsed string):", img);
                } else if (img && img.url) {
                  imagesToDelete.push(img.url);
                  console.log("Added gallery image (parsed object):", img.url);
                }
              });
            }
          } catch (e) {
            console.warn("Failed to parse gallery_images JSON:", e);
          }
        }
      }

      console.log("Total images to delete:", imagesToDelete.length);

      // Delete images from storage
      let deletedCount = 0;
      for (const imageUrl of imagesToDelete) {
        if (imageUrl && imageUrl.includes("supabase")) {
          // Extract the full path from the URL
          // URL format: https://[project].supabase.co/storage/v1/object/public/product-images/path/to/file.jpg
          const url = new URL(imageUrl);
          const pathParts = url.pathname.split("/");
          const pathIndex = pathParts.indexOf("product-images");

          if (pathIndex === -1) {
            console.log(
              "Skipping deletion - not a Supabase Storage URL:",
              imageUrl,
            );
            continue;
          }

          const filePath = pathParts.slice(pathIndex + 1).join("/");
          console.log("Attempting to delete file:", filePath);

          if (filePath) {
            try {
              // Use API route for deletion with service role key
              const response = await axiosInstance.delete("/api/upload", {
                data: {
                  imageUrl,
                  bucket: "product-images",
                },
              });

              console.log("Successfully deleted image via API:", filePath);
              deletedCount++;
            } catch (deleteError: any) {
              console.error("Exception during image deletion:", deleteError);
              if (deleteError.response) {
                console.error("API response error:", deleteError.response.data);
              }
            }
          }
        } else {
          console.log("Skipping non-supabase image:", imageUrl);
        }
      }

      console.log(
        `Deleted ${deletedCount} out of ${imagesToDelete.length} images`,
      );

      // Delete product using mutation
      deleteProductMutation.mutate(productToDelete.id, {
        onSuccess: () => {
          setShowDeleteModal(false);
          setProductToDelete(null);
          setIsDeleting(false);
        },
        onError: (error) => {
          console.error("Delete mutation error:", error);
          setIsDeleting(false);
        },
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to delete product: " + errorMessage);
      setIsDeleting(false);
    }
  };

  const getStatusColor = (stock: number) => {
    if (stock > 10)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (stock > 0)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categoriesList.find(
      (cat: Category) => cat.id === categoryId,
    );
    return category ? category.name : categoryId;
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your product catalog
          </p>
        </div>
        <Link href="/products/new?section=products">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </motion.button>
        </Link>
      </div>

      {/* Filters using SearchFilterSort */}
      <SearchFilterSort
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        status={selectedStatus}
        onStatusChange={handleStatusChange}
        sortBy={`${sortBy}-${sortOrder}`}
        onSortChange={handleSortChange}
        showStatusFilter={true}
        showClearAll={hasFilters}
        onClearAll={handleClearAll}
        statusOptions={[
          { value: "all", label: "All Status" },
          { value: "in_stock", label: "In Stock" },
          { value: "out_of_stock", label: "Out of Stock" },
        ]}
        sortOptions={[
          { value: "created_at-desc", label: "Newest First" },
          { value: "created_at-asc", label: "Oldest First" },
          { value: "name-asc", label: "Name A-Z" },
          { value: "name-desc", label: "Name Z-A" },
          { value: "price-asc", label: "Price: Low to High" },
          { value: "price-desc", label: "Price: High to Low" },
        ]}
        placeholder="Search products by title, description, or SKU..."
        statusLabel="Stock Status"
      />

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {isLoading ? (
          "Loading..."
        ) : (
          <>
            Showing {products.length} of {total} products
          </>
        )}
      </div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((product: Product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden mr-4">
                        {product.cover_image ? (
                          <Image
                            src={product.cover_image}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {product.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {product.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {product.slug || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Package className="w-3 h-3" />
                      {getCategoryName(product.category_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      NPR{" "}
                      {(
                        product.discount_price || product.price
                      ).toLocaleString()}
                      {product.discount_price && (
                        <div className="text-xs text-gray-500 line-through">
                          NPR {product.price.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        product.stock || 0,
                      )}`}
                    >
                      {product.stock || 0} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.is_featured ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <span className="text-yellow-500">★</span>
                        Featured
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        product.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/products/${product.id}/edit?section=products`}
                      >
                        <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {products.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={total}
              showItemsPerPageSelector={true}
            />
          </div>
        )}

        {products.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ||
              selectedCategory !== "all" ||
              selectedStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first product"}
            </p>
            <Link href="/products/new?section=products">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </Link>
          </div>
        )}
      </motion.div>

      {/* Product View Modal */}
      <ProductViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        product={productToView}
        categoriesList={categoriesList}
        onDelete={(productId) => {
          // Handle deletion from view modal
          const product = products.find((p: Product) => p.id === productId);
          if (product) {
            handleDeleteProduct(product);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isDeleting) {
            setShowDeleteModal(false);
            setProductToDelete(null);
          }
        }}
        onConfirm={confirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete"
        itemName={productToDelete?.title || ""}
        itemsToDelete={[
          "Product from catalog",
          "Cover image and gallery images",
          "All customer reviews",
          "Related order items",
          "Discount associations",
        ]}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProductsPage;
