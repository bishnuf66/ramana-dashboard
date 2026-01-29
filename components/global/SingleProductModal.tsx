"use client";

import React, { useState } from "react";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";
import Image from "next/image";

interface ProductModalProps {
  product: {
    id: number | string;
    image: string;
    price: number;
    rating: number;
    title: string;
    description?: string;
  };
  onClose: () => void;
  addToCart: (product: any) => void;
}

const SingleProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  addToCart,
}) => {
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 text-black">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        {/* Close Button */}
        <button className="absolute top-2 right-2" onClick={onClose}>
          <X className="h-6 w-6 text-gray-700 hover:text-red-500 transition" />
        </button>

        {/* Product Image */}
        <Image
          src={product.image}
          alt={product.title}
          width={400}
          height={240}
          className="w-full h-60 object-cover rounded-md"
        />

        {/* Product Title, Price & Rating */}
        <h2 className="text-xl font-bold mt-4">{product.title}</h2>
        <p className="text-gray-600 text-lg">
          NPR {product.price.toLocaleString()}
        </p>
        <p className="text-yellow-500 text-lg">
          {"★".repeat(Math.floor(product.rating))}{" "}
          {"☆".repeat(5 - Math.floor(product.rating))}
        </p>

        {/* Product Description */}
        {product.description && (
          <p className="text-gray-700 mt-2">{product.description}</p>
        )}

        {/* Quantity Selector */}
        <div className="flex items-center mt-4 space-x-4">
          <button
            onClick={decreaseQuantity}
            className="bg-gray-200 p-2 rounded hover:bg-gray-300 transition"
          >
            <Minus className="h-5 w-5 text-gray-700" />
          </button>
          <span className="text-lg font-semibold">{quantity}</span>
          <button
            onClick={increaseQuantity}
            className="bg-gray-200 p-2 rounded hover:bg-gray-300 transition"
          >
            <Plus className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded shadow-md flex items-center justify-center transition"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default SingleProductModal;
