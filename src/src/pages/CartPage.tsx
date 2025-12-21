import React, { useState } from "react";
import { Trash } from "lucide-react";
import { useCart } from "../context/CartContext";
import Image from "next/image";
import { toast } from "react-toastify";

const CartPage: React.FC = () => {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCart();

  const [sortBy, setSortBy] = useState<"name" | "price" | "quantity">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Function to sort cart items based on selected criteria and order
  const handleSort = (
    criteria: "name" | "price" | "quantity",
    order: "asc" | "desc"
  ) => {
    setSortBy(criteria);
    setSortOrder(order);
  };

  // Sort cart based on selected option and order
  const sortedCart = [...cart].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === "price") {
      comparison = a.price - b.price;
    } else if (sortBy === "quantity") {
      comparison = a.quantity - b.quantity;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleCheckout = () => {
    toast.info("Please login to checkout");
  };

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            {/* Sorting Dropdown */}
            <div className="mb-4 flex justify-end">
              <label className="font-semibold mr-2">Sort by:</label>
              <select
                onChange={(e) => {
                  const [criteria, order] = e.target.value.split("-");
                  handleSort(
                    criteria as "name" | "price" | "quantity",
                    order as "asc" | "desc"
                  );
                }}
                value={`${sortBy}-${sortOrder}`}
                className="border p-2 rounded"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="quantity-asc">Quantity (Low to High)</option>
                <option value="quantity-desc">Quantity (High to Low)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {sortedCart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border p-4 rounded shadow"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover"
                    />
                    <div className="flex-1 ml-4">
                      <h2 className="font-bold">{item.title}</h2>
                      <p>${item.price.toFixed(2)}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => increaseQuantity(item.id)}
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Total Price and Clear Cart Button */}
            <div className="mt-6 flex justify-between items-center border-t pt-4">
              <p className="text-lg font-bold">
                Total ({getTotalItems()} items): ${getTotalPrice().toFixed(2)}
              </p>
              <button
                onClick={clearCart}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
      <button
        onClick={handleCheckout}
        className="px-4 py-2 bg-green-500 text-white rounded my-4"
      >
        Checkout
      </button>
    </>
  );
};

export default CartPage;
