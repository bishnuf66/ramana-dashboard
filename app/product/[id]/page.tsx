"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import ReviewSystem from "@/components/reviews/ReviewSystem";

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Mock product data
  const product = {
    id: productId,
    name: "Premium Rose Bouquet",
    price: 89.99,
    originalPrice: 119.99,
    description:
      "A stunning arrangement of fresh, premium roses perfect for any special occasion. Each bouquet is handcrafted with love and attention to detail.",
    images: [
      "/api/placeholder/600/600",
      "/api/placeholder/600/600",
      "/api/placeholder/600/600",
      "/api/placeholder/600/600",
    ],
    category: "flowers",
    inStock: true,
    stock: 15,
    rating: 4.8,
    reviews: 127,
    features: [
      "Fresh, premium roses",
      "Hand-arranged by experts",
      "Available in multiple colors",
      "Same-day delivery available",
      "Includes complimentary vase",
    ],
  };

  const handleAddToCart = () => {
    // Add to cart logic
    console.log(`Added ${quantity} of ${product.name} to cart`);
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.originalPrice && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100,
                  )}
                  % OFF
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === index
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
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {product.rating}
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  ({product.reviews} reviews)
                </span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {product.description}
              </p>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {product.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    {feature}
                  </div>
                ))}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                {product.inStock ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      In Stock ({product.stock} available)
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      Out of Stock
                    </span>
                  </>
                )}
              </div>

              {/* Quantity and Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Quantity:
                  </label>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-gray-900 dark:text-white font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>

                  <button
                    onClick={handleToggleWishlist}
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    />
                  </button>

                  <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <Truck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Free Delivery
                  </div>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Secure Payment
                  </div>
                </div>
                <div className="text-center">
                  <RefreshCw className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Easy Returns
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ReviewSystem
            productId={product.id}
            productName={product.name}
            averageRating={product.rating}
            totalReviews={product.reviews}
          />
        </motion.div>
      </div>
    </div>
  );
}
