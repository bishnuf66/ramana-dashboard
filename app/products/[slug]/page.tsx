"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, ShoppingCart, Star, Truck, Shield, RefreshCw, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getProductBySlug, getSimilarProducts } from "../../../utils/dummyData";
import { useCart } from "../../../components/context/CartContext";
import ProductCard from "../../../components/products/ProductCard";

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const product = getProductBySlug(params.slug as string);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Product Not Found
                    </h1>
                    <Link href="/products" className="text-green-500 hover:text-green-600">
                        Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    const similarProducts = getSimilarProducts(product);
    const discountPercentage = product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    const handleAddToCart = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.discountPrice || product.price,
            image: product.mainImage,
            quantity: quantity
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Products
                </motion.button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Product Images */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        {/* Main Image */}
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                            <Image
                                src={product.images[selectedImageIndex]}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                            {discountPercentage > 0 && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    -{discountPercentage}% OFF
                                </div>
                            )}
                            {!product.inStock && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <span className="text-white text-xl font-bold">Out of Stock</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Images */}
                        <div className="flex gap-2 overflow-x-auto">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${selectedImageIndex === index
                                            ? "border-green-500"
                                            : "border-gray-200 dark:border-gray-700"
                                        }`}
                                >
                                    <Image
                                        src={image}
                                        alt={`${product.name} ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* Category & Title */}
                        <div>
                            <Link
                                href={`/products?category=${product.category.slug}`}
                                className="text-green-600 dark:text-green-400 font-medium hover:underline"
                            >
                                {product.category.name}
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {product.name}
                            </h1>
                        </div>

                        {/* Rating & Reviews */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.floor(product.rating)
                                                ? "text-yellow-400 fill-current"
                                                : "text-gray-300 dark:text-gray-600"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-gray-600 dark:text-gray-400">
                                {product.rating} ({product.reviewCount} reviews)
                            </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-4">
                            {product.discountPrice ? (
                                <>
                                    <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        NPR {product.discountPrice.toLocaleString()}
                                    </span>
                                    <span className="text-xl text-gray-500 line-through">
                                        NPR {product.price.toLocaleString()}
                                    </span>
                                    <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-sm font-medium">
                                        Save NPR {(product.price - product.discountPrice).toLocaleString()}
                                    </span>
                                </>
                            ) : (
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                    NPR {product.price.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Description
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Features */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                Features
                            </h3>
                            <ul className="space-y-2">
                                {product.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Quantity:
                                </label>
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    >
                                        -
                                    </button>
                                    <span className="px-4 py-2 text-gray-900 dark:text-white border-x border-gray-300 dark:border-gray-600">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {product.stockQuantity} available
                                </span>
                            </div>

                            <div className="flex gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAddToCart}
                                    disabled={!product.inStock}
                                    className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-semibold"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Add to Cart
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                            {product.dimensions && (
                                <div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dimensions:</span>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.dimensions}</p>
                                </div>
                            )}
                            {product.weight && (
                                <div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Weight:</span>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.weight}</p>
                                </div>
                            )}
                        </div>

                        {/* Care Instructions */}
                        {product.careInstructions && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                                    Care Instructions
                                </h4>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    {product.careInstructions}
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Service Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
                >
                    {[
                        { icon: Truck, title: "Free Delivery", desc: "Orders above NPR 2000" },
                        { icon: Shield, title: "Quality Guarantee", desc: "Fresh flowers guaranteed" },
                        { icon: RefreshCw, title: "Easy Returns", desc: "7-day return policy" },
                        { icon: MessageCircle, title: "24/7 Support", desc: "WhatsApp & Viber support" }
                    ].map((feature, index) => (
                        <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                            <feature.icon className="w-8 h-8 text-green-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                            Similar Products
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarProducts.map((similarProduct) => (
                                <ProductCard key={similarProduct.id} product={similarProduct} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}