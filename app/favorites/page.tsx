"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Search } from "lucide-react";
import { useFavorites } from "@/components/context/FavoritesContext";
import { motion } from "framer-motion";

export default function FavoritesPage() {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "addedDate">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filter favorites based on search query
  const filteredFavorites = favorites.filter((favorite) =>
    favorite.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Sort favorites based on selected criteria
  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === "price") {
      comparison = a.price - b.price;
    } else if (sortBy === "addedDate") {
      comparison =
        new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            My Favorites
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your favorite bouquets and arrangements
          </p>
        </div>

        {/* Search and Sort */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex-1">
            <label className="font-semibold mr-2">Sort by:</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [criteria, order] = e.target.value.split("-");
                setSortBy(criteria as "name" | "price" | "addedDate");
                setSortOrder(order as "asc" | "desc");
              }}
              className="border p-2 rounded-lg"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="addedDate-asc">Date (Oldest to Newest)</option>
              <option value="addedDate-desc">Date (Newest to Oldest)</option>
            </select>
          </div>
        </div>

        {/* Favorites Grid */}
        {sortedFavorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Favorites Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start adding your favorite bouquets by clicking the heart icon on
              product pages.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedFavorites.map((favorite) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={favorite.image}
                      alt={favorite.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {favorite.title}
                      </h3>
                      <button
                        onClick={() => removeFromFavorites(favorite.id)}
                        className="text-red-500 hover:text-red-600 p-2 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      ${favorite.price.toFixed(2)} • {favorite.category} • Added{" "}
                      {favorite.addedAt}
                    </div>

                    <div className="mt-4 flex items-center space-x-4">
                      <Link
                        href={`/products/${favorite.id}`}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Clear All Button */}
        {favorites.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={clearFavorites}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear All Favorites
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
