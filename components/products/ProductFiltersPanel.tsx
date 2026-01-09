"use client";

import { motion } from "framer-motion";
import { X, Star } from "lucide-react";
import { Category, ProductFilters } from "../../types/product";

interface ProductFiltersPanelProps {
    filters: ProductFilters;
    onFiltersChange: (filters: ProductFilters) => void;
    categories: Category[];
}

export default function ProductFiltersPanel({
    filters,
    onFiltersChange,
    categories
}: ProductFiltersPanelProps) {

    const updateFilter = (key: keyof ProductFilters, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value
        });
    };

    const clearFilters = () => {
        onFiltersChange({});
    };

    const hasActiveFilters = Object.keys(filters).length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-red-500 hover:text-red-600 transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Categories */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Category
                </h4>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="category"
                            checked={!filters.category}
                            onChange={() => updateFilter('category', undefined)}
                            className="mr-2 text-green-500 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">All Categories</span>
                    </label>
                    {categories.map((category) => (
                        <label key={category.id} className="flex items-center">
                            <input
                                type="radio"
                                name="category"
                                checked={filters.category === category.slug}
                                onChange={() => updateFilter('category', category.slug)}
                                className="mr-2 text-green-500 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {category.name} ({category.productCount})
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Price Range (NPR)
                </h4>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="priceRange"
                            checked={!filters.priceRange}
                            onChange={() => updateFilter('priceRange', undefined)}
                            className="mr-2 text-green-500 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Any Price</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="priceRange"
                            checked={filters.priceRange?.[0] === 0 && filters.priceRange?.[1] === 3000}
                            onChange={() => updateFilter('priceRange', [0, 3000])}
                            className="mr-2 text-green-500 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Under NPR 3,000</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="priceRange"
                            checked={filters.priceRange?.[0] === 3000 && filters.priceRange?.[1] === 5000}
                            onChange={() => updateFilter('priceRange', [3000, 5000])}
                            className="mr-2 text-green-500 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">NPR 3,000 - 5,000</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="priceRange"
                            checked={filters.priceRange?.[0] === 5000 && filters.priceRange?.[1] === Infinity}
                            onChange={() => updateFilter('priceRange', [5000, Infinity])}
                            className="mr-2 text-green-500 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Above NPR 5,000</span>
                    </label>
                </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Minimum Rating
                </h4>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="rating"
                            checked={!filters.rating}
                            onChange={() => updateFilter('rating', undefined)}
                            className="mr-2 text-green-500 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Any Rating</span>
                    </label>
                    {[4, 4.5, 5].map((rating) => (
                        <label key={rating} className="flex items-center">
                            <input
                                type="radio"
                                name="rating"
                                checked={filters.rating === rating}
                                onChange={() => updateFilter('rating', rating)}
                                className="mr-2 text-green-500 focus:ring-green-500"
                            />
                            <div className="flex items-center gap-1">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3 h-3 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                                    {rating}+ Stars
                                </span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Availability */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Availability
                </h4>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={filters.inStock === true}
                            onChange={(e) => updateFilter('inStock', e.target.checked ? true : undefined)}
                            className="mr-2 text-green-500 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">In Stock Only</span>
                    </label>
                </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Active Filters
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {filters.category && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                                {categories.find(c => c.slug === filters.category)?.name}
                                <button
                                    onClick={() => updateFilter('category', undefined)}
                                    className="hover:text-green-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {filters.priceRange && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                                NPR {filters.priceRange[0].toLocaleString()} - {filters.priceRange[1] === Infinity ? '∞' : filters.priceRange[1].toLocaleString()}
                                <button
                                    onClick={() => updateFilter('priceRange', undefined)}
                                    className="hover:text-blue-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {filters.rating && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                                {filters.rating}+ Stars
                                <button
                                    onClick={() => updateFilter('rating', undefined)}
                                    className="hover:text-yellow-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {filters.inStock && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                                In Stock
                                <button
                                    onClick={() => updateFilter('inStock', undefined)}
                                    className="hover:text-purple-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}