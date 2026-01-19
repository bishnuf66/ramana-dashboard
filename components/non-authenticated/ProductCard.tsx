"use client";

import React, { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import SingleProductModal from "./SingleProductModal";
import Image from "next/image";

interface ProductProps {
  product: {
    id: number | string;
    image: string;
    price: number;
    rating: number;
    title: string;
    description?: string;
    discountPrice?: number;
  };
}

const ProductCard: React.FC<ProductProps> = ({ product }) => {
  const { addToCart, cart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleFavorite = (product: any) => {
    toggleFavorite({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      rating: product.rating,
      category: "",
      addedAt: new Date().toISOString(),
    });
  };

  return (
    <>
      <div
        className="border p-3 rounded shadow-lg cursor-pointer bg-white transition transform hover:scale-105"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Image container */}
        <div className="bg-green-200 p-6 md:p-8 relative flex justify-center items-center">
          <Image
            src={product.image}
            alt={product.title}
            width={112}
            height={112}
            className="w-20 h-20 md:w-28 md:h-28 object-cover rounded-md"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFavorite(product);
            }}
            className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md"
          >
            <Heart
              className={`h-5 w-5 ${isFavorite(product.id) ? "fill-red-500" : ""}`}
            />
          </button>
        </div>

        {/* Product details */}
        <div className="p-2 text-center">
          <h2 className="text-md md:text-lg font-semibold">{product.title}</h2>
          <span className="text-xs text-gray-500">1 kg</span>
        </div>

        {/* Ratings */}
        <p className="text-yellow-500 text-sm md:text-md text-center">
          {"★".repeat(Math.floor(product.rating))}
          {"☆".repeat(5 - Math.floor(product.rating))}
        </p>

        {/* Price & Add to Cart */}
        <div className="flex flex-col md:flex-row justify-between items-center px-2">
          <div className="flex flex-col md:flex-row items-center">
            <p className="text-gray-800 font-bold text-sm md:text-lg">
              ${product.discountPrice ?? product.price}
            </p>
            {product.discountPrice && (
              <p className="text-gray-400 text-xs md:text-sm line-through ml-2">
                ${product.price.toFixed(2)}
              </p>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart({ ...product, quantity: 1 });
            }}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white rounded px-3 py-1 mt-2 md:mt-0"
          >
            <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 mr-1" />
            <span className="text-xs md:text-sm">Add</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <SingleProductModal
          product={product}
          onClose={() => setIsModalOpen(false)}
          addToCart={addToCart}
        />
      )}
    </>
  );
};

export default ProductCard;
