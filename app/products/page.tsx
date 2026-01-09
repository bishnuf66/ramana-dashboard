"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Grid, List, SortAsc, SortDesc } from "lucide-react";
import { products, categories } from "../../utils/dummyData";
import { Product, ProductFilters, ProductSort } from "../../types/product";
import ProductCard from "../../components/products/ProductCard";
import ProductFiltersPanel from "../../components/products/ProductFiltersPanel";

export default function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<ProductFilters>({});
    const [sort, setSort] = useState<ProductSort>({ field: 'name', direction: 'asc' });
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = products.filter(product => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    product.name.toLowerCase().includes(query) ||
                    product.description.toLowerCase().includes(query) ||
                    product.tags.some(tag => tag.toLowerCase().includes(query));
                if (!matchesSearch) return false;
            }

            // Category filter
            if (filters.category && product.category.slug !== filters.category) {
                return false;
            }

            // Price range filter
            if (filters.priceRange) {
                const [min, max] = filters.priceRange;
                const price = product.discountPrice || product.price;
                if (price < min || price > max) return false;
            }

            // Stock filter
            if (filters.inStock !== undefined && product.inStock !== filters.inStock) {
                return false;
            }

            // Rating filter
            if (filters.rating && product.rating < filters.rating) {
                return false;
            }

            return true;
        });

        // Sort products
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sort.field) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'price':
                    aValue = a.discountPrice || a.price;
                    bValue = b.discountPrice || b.price;
                    break;
                case 'rating':
                    aValue = a.rating;
                    bValue = b.rating;
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
                default:
                    return 0;
            }

            if (sort.direction === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return filtered;
    }, [searchQuery, filters, sort]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Our Beautiful Bouquets
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                        Discover handcrafted arrangements made with love by Ramana
                    </p>
                </motion.div>

                {/* Search and Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8"
                >
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search bouquets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4">
                            {/* Sort */}
                            <select
                                value={`${sort.field}-${sort.direction}`}
                                onChange={(e) => {
                                    const [field, direction] = e.target.value.split('-') as [ProductSort['field'], ProductSort['direction']];
                                    setSort({ field, direction });
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="name-asc">Name A-Z</option>
                                <option value="name-desc">Name Z-A</option>
                                <option value="price-asc">Price Low-High</option>
                                <option value="price-desc">Price High-Low</option>
                                <option value="rating-desc">Highest Rated</option>
                                <option value="createdAt-desc">Newest First</option>
                            </select>

                            {/* View Mode */}
                            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Filters Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <Filter className="w-5 h-5" />
                                Filters
                            </button>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        Showing {filteredAndSortedProducts.length} of {products.length} products
                    </div>
                </motion.div>

                <div className="flex gap-8">
                    {/* Filters Sidebar */}
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="w-80 flex-shrink-0"
                        >
                            <ProductFiltersPanel
                                filters={filters}
                                onFiltersChange={setFilters}
                                categories={categories}
                            />
                        </motion.div>
                    )}

                    {/* Products Grid/List */}
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className={
                                viewMode === 'grid'
                                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    : "space-y-6"
                            }
                        >
                            {filteredAndSortedProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <ProductCard product={product} viewMode={viewMode} />
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* No Results */}
                        {filteredAndSortedProducts.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12"
                            >
                                <div className="text-gray-400 dark:text-gray-500 mb-4">
                                    <Search className="w-16 h-16 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">No products found</h3>
                                    <p>Try adjusting your search or filters</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}